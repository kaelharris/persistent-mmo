-- ==========================================
-- PHASE 2: DETERMINISTIC SIMULATION KERNEL
-- ==========================================

-- 1. Simulation ticks table - durable, versioned tick ledger
CREATE TABLE IF NOT EXISTS public.simulation_ticks (
    tick_id BIGSERIAL PRIMARY KEY,
    world_id TEXT NOT NULL DEFAULT 'default',
    ruleset_version TEXT NOT NULL DEFAULT 'v1',
    seed BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'failed', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 2. Commands table - idempotent command ledger
CREATE TABLE IF NOT EXISTS public.commands (
    command_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT NOT NULL UNIQUE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    command_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'skipped')),
    applied_tick_id BIGINT REFERENCES public.simulation_ticks(tick_id),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE
);

-- 3. Outbox events table - reliable event projection feed
CREATE TABLE IF NOT EXISTS public.outbox_events (
    event_id BIGSERIAL PRIMARY KEY,
    tick_id BIGINT NOT NULL REFERENCES public.simulation_ticks(tick_id),
    seq BIGINT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on new tables
ALTER TABLE public.simulation_ticks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;

-- Read policies (all authenticated users can read simulation state)
CREATE POLICY "Simulation ticks readable by everyone" ON public.simulation_ticks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Commands readable by everyone" ON public.commands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Outbox events readable by everyone" ON public.outbox_events FOR SELECT TO authenticated USING (true);

-- Write policies (system/service role only for ticks and outbox; actors can create their own commands)
CREATE POLICY "Simulation ticks modifiable by system" ON public.simulation_ticks FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Outbox events modifiable by system" ON public.outbox_events FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Actors can create own commands" ON public.commands FOR INSERT WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "Actors can read own commands" ON public.commands FOR SELECT USING (auth.uid() = actor_id OR auth.uid() IS NULL);

-- 5. Indexes for common access patterns
CREATE INDEX idx_simulation_ticks_world_status ON public.simulation_ticks(world_id, status);
CREATE INDEX idx_commands_actor_status ON public.commands(actor_id, status);
CREATE INDEX idx_commands_idempotency_key ON public.commands(idempotency_key);
CREATE INDEX idx_outbox_events_tick_seq ON public.outbox_events(tick_id, seq);
CREATE INDEX idx_outbox_events_unpublished ON public.outbox_events(published) WHERE published = false;

-- 6. Seed initial world and tick
INSERT INTO public.simulation_ticks (world_id, ruleset_version, seed, status, started_at, ended_at)
VALUES ('default', 'v1', 1730755200, 'applied', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. Enhanced travel_to_region RPC - validates against region_edges graph
CREATE OR REPLACE FUNCTION public.travel_to_region(target_region_id INT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    current_user_id UUID;
    profile_rec RECORD;
    current_region RECORD;
    target_region RECORD;
    stat_rec RECORD;
    curr_energy INT;
    ticks INT;
    elapsed_secs NUMERIC;
    is_same_country BOOLEAN;
    energy_cost INT;
    ticket_rec RECORD;
    edge_rec RECORD;
    command_id UUID;
BEGIN
    -- 1. Authentication Check
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Unauthenticated player session.');
    END IF;

    -- 2. Load profile and regions
    SELECT * INTO profile_rec FROM public.profiles WHERE id = current_user_id;
    IF profile_rec.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Character data not found.');
    END IF;

    SELECT * INTO target_region FROM public.regions WHERE id = target_region_id;
    IF target_region.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Target region does not exist.');
    END IF;

    IF profile_rec.current_region_id = target_region_id THEN
        RETURN json_build_object('success', false, 'error', 'You are already in this region.');
    END IF;

    SELECT * INTO current_region FROM public.regions WHERE id = profile_rec.current_region_id;
    IF current_region.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Current region not found.');
    END IF;

    -- 3. Validate travel edge exists in region_edges graph
    SELECT * INTO edge_rec FROM public.region_edges
    WHERE from_region_id = profile_rec.current_region_id
      AND to_region_id = target_region_id
      AND is_reciprocal = true;

    IF edge_rec.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No valid travel route exists between these regions.',
            'from_region', current_region.id,
            'to_region', target_region.id
        );
    END IF;

    is_same_country := current_region.country_id = target_region.country_id;
    SELECT CASE WHEN is_same_country THEN travel_domestic ELSE travel_international END INTO energy_cost FROM public.action_costs;

    -- 4. Lock Player Stats Row for Concurrency Prevention
    SELECT * INTO stat_rec FROM public.player_stats WHERE profile_id = current_user_id FOR UPDATE;
    IF stat_rec.profile_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Stats profile not found.');
    END IF;

    -- 5. Sync Offline Energy ticks (5 EP per 6 minutes, same as rpc_gather_resource)
    elapsed_secs := EXTRACT(EPOCH FROM (NOW() - stat_rec.updated_at));
    ticks := FLOOR(elapsed_secs / 360);
    curr_energy := stat_rec.energy;

    IF ticks > 0 AND curr_energy < 100 THEN
        curr_energy := LEAST(100, curr_energy + (ticks * 5));
        INSERT INTO public.energy_history (profile_id, change_amount, reason)
        VALUES (current_user_id, curr_energy - stat_rec.energy, 'offline_regen');
    END IF;

    -- 6. Energy Cost Validation
    IF curr_energy < energy_cost THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient energy.',
            'required', energy_cost,
            'current', curr_energy
        );
    END IF;

    -- 7. Cross-country travel consumes one Travel Ticket
    IF NOT is_same_country THEN
        SELECT * INTO ticket_rec FROM public.inventories
        WHERE owner_id = current_user_id
          AND item_template_id = 3
          AND quantity > 0
        ORDER BY quality ASC
        LIMIT 1
        FOR UPDATE;

        IF ticket_rec.id IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Changing countries requires 1 Travel Ticket.');
        END IF;

        UPDATE public.inventories
        SET quantity = quantity - 1, updated_at = NOW()
        WHERE id = ticket_rec.id;
    END IF;

    -- 8. Deduct energy, move player, write logs
    UPDATE public.player_stats
    SET energy = curr_energy - energy_cost, updated_at = NOW()
    WHERE profile_id = current_user_id;

    INSERT INTO public.energy_history (profile_id, change_amount, reason)
    VALUES (current_user_id, -energy_cost, 'travel_' || target_region.name);

    UPDATE public.profiles
    SET current_region_id = target_region_id, updated_at = NOW()
    WHERE id = current_user_id;

    INSERT INTO public.audit_logs (profile_id, action, metadata)
    VALUES (current_user_id, 'region.travel', jsonb_build_object(
        'from', current_region.name,
        'to', target_region.name,
        'from_region_id', current_region.id,
        'to_region_id', target_region.id,
        'energy_cost', energy_cost,
        'ticket_used', NOT is_same_country,
        'edge_cost', edge_rec.cost,
        'edge_mode', edge_rec.mode
    ));

    RETURN json_build_object(
        'success', true,
        'error', NULL,
        'from_region', current_region.name,
        'to_region', target_region.name,
        'energy_remaining', curr_energy - energy_cost,
        'energy_cost', energy_cost,
        'edge_mode', edge_rec.mode,
        'edge_cost_value', edge_rec.cost,
        'ticket_used', NOT is_same_country
    );
END;
$$;

-- 8. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.travel_to_region(INT) TO authenticated;
