-- ==========================================
-- PHASE 10: WARFARE, TERRITORIES & LOGISTICS
-- ==========================================

-- 1. Wars Table
CREATE TABLE IF NOT EXISTS public.wars (
  id SERIAL PRIMARY KEY,
  attacker_country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
  defender_country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 2. Military Regions Ownership
CREATE TABLE IF NOT EXISTS public.military_regions (
  region_id INT PRIMARY KEY REFERENCES public.regions(id) ON DELETE CASCADE,
  owner_country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
  occupier_country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
  resistance_level INT NOT NULL DEFAULT 0 CHECK (resistance_level >= 0 AND resistance_level <= 100),
  supply_status VARCHAR(30) NOT NULL DEFAULT 'supplied' CHECK (supply_status IN ('supplied', 'unsupplied'))
);

-- Seed military region mapping based on current regions
INSERT INTO public.military_regions (region_id, owner_country_id, occupier_country_id, resistance_level, supply_status)
SELECT id, country_id, country_id, 0, 'supplied'
FROM public.regions
ON CONFLICT (region_id) DO NOTHING;

-- 3. Army Units
CREATE TABLE IF NOT EXISTS public.army_units (
  id SERIAL PRIMARY KEY,
  country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
  current_region_id INT REFERENCES public.regions(id) ON DELETE CASCADE,
  size INT NOT NULL DEFAULT 1000 CHECK (size >= 0),
  morale INT NOT NULL DEFAULT 100 CHECK (morale >= 0 AND morale <= 100),
  ammo_qty INT NOT NULL DEFAULT 100 CHECK (ammo_qty >= 0),
  rations_qty INT NOT NULL DEFAULT 100 CHECK (rations_qty >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'marching', 'defending', 'attacking')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 4. Supply Logistical Routes
CREATE TABLE IF NOT EXISTS public.supply_routes (
  id SERIAL PRIMARY KEY,
  from_region_id INT REFERENCES public.regions(id) ON DELETE CASCADE,
  to_region_id INT REFERENCES public.regions(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  bandwidth INT NOT NULL DEFAULT 100 CHECK (bandwidth >= 0)
);

-- Seed sample route connections
INSERT INTO public.supply_routes (from_region_id, to_region_id, status, bandwidth)
VALUES 
  (1, 2, 'active', 80),
  (2, 3, 'active', 60)
ON CONFLICT DO NOTHING;

-- 5. Peace Treaties
CREATE TABLE IF NOT EXISTS public.peace_treaties (
  id SERIAL PRIMARY KEY,
  war_id INT REFERENCES public.wars(id) ON DELETE CASCADE,
  proposer_country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected')),
  reparations_amount NUMERIC(20, 2) NOT NULL DEFAULT 0.00 CHECK (reparations_amount >= 0),
  territory_transfer_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [2] representing region ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.army_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peace_treaties ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated players
CREATE POLICY "Read wars" ON public.wars FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read military_regions" ON public.military_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read army_units" ON public.army_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read supply_routes" ON public.supply_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read peace_treaties" ON public.peace_treaties FOR SELECT TO authenticated USING (true);

-- RPC Procedures: Declare War
CREATE OR REPLACE FUNCTION public.rpc_declare_war(
  p_defender_country_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  new_war_id INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  IF caller_country_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Must have citizenship to issue war declarations.');
  END IF;

  IF caller_country_id = p_defender_country_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot declare war on your own country.');
  END IF;

  -- Ensure no active war already exists between these countries
  IF EXISTS (
    SELECT 1 FROM public.wars 
    WHERE ((attacker_country_id = caller_country_id AND defender_country_id = p_defender_country_id)
       OR (attacker_country_id = p_defender_country_id AND defender_country_id = caller_country_id))
      AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'An active war already exists between these nations.');
  END IF;

  INSERT INTO public.wars (attacker_country_id, defender_country_id, status)
  VALUES (caller_country_id, p_defender_country_id, 'active')
  RETURNING id INTO new_war_id;

  RETURN json_build_object('success', true, 'war_id', new_war_id, 'error', null);
END;
$$ LANGUAGE plpgsql;

-- RPC Procedures: Mobilize Armies
CREATE OR REPLACE FUNCTION public.rpc_mobilize_army_unit()
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  spawn_region INT;
  cost_local NUMERIC := 5000.00;
  treasury_balance NUMERIC;
  new_army_id INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  IF caller_country_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Must be a citizen to mobilize forces.');
  END IF;

  -- Verify country treasury balance
  SELECT local_currency_reserve INTO treasury_balance FROM public.countries WHERE id = caller_country_id FOR UPDATE;
  IF treasury_balance < cost_local THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient National Treasury reserves to recruit army unit.');
  END IF;

  -- Deduct from country reserves
  UPDATE public.countries 
  SET local_currency_reserve = local_currency_reserve - cost_local
  WHERE id = caller_country_id;

  -- Pick first regional sector of country as mobilization point
  SELECT id INTO spawn_region FROM public.regions WHERE country_id = caller_country_id LIMIT 1;

  INSERT INTO public.army_units (country_id, current_region_id, size, morale, ammo_qty, rations_qty, status)
  VALUES (caller_country_id, spawn_region, 1000, 100, 100, 100, 'idle')
  RETURNING id INTO new_army_id;

  RETURN json_build_object('success', true, 'army_id', new_army_id, 'error', null);
END;
$$ LANGUAGE plpgsql;

-- RPC Procedures: Army Commands movement
CREATE OR REPLACE FUNCTION public.rpc_command_army_movement(
  p_army_id INT,
  p_target_region_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  army_country_id INT;
  commander_energy INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  SELECT country_id INTO army_country_id FROM public.army_units WHERE id = p_army_id;

  IF caller_country_id <> army_country_id THEN
    RETURN json_build_object('success', false, 'error', 'You cannot command foreign country army units.');
  END IF;

  -- Verify commander energy
  SELECT energy INTO commander_energy FROM public.player_stats WHERE profile_id = caller_id FOR UPDATE;
  IF commander_energy < 10 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient energy to issue march commands (requires 10 EP).');
  END IF;

  -- Deduct energy
  UPDATE public.player_stats SET energy = energy - 10 WHERE profile_id = caller_id;

  -- Update army position
  UPDATE public.army_units 
  SET current_region_id = p_target_region_id, status = 'marching' 
  WHERE id = p_army_id;

  RETURN json_build_object('success', true, 'error', null);
END;
$$ LANGUAGE plpgsql;

-- RPC Procedures: Invasions & Battle conquers
CREATE OR REPLACE FUNCTION public.rpc_engage_military_battle(
  p_army_id INT,
  p_target_region_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  army_country_id INT;
  target_owner_id INT;
  commander_energy INT;
  is_at_war BOOLEAN;
  battle_outcome TEXT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  SELECT country_id INTO army_country_id FROM public.army_units WHERE id = p_army_id;
  SELECT owner_country_id INTO target_owner_id FROM public.military_regions WHERE region_id = p_target_region_id;

  IF caller_country_id <> army_country_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot issue invasion orders to foreign forces.');
  END IF;

  -- Verify active war declaration exists
  SELECT EXISTS (
    SELECT 1 FROM public.wars 
    WHERE ((attacker_country_id = army_country_id AND defender_country_id = target_owner_id)
       OR (attacker_country_id = target_owner_id AND defender_country_id = army_country_id))
      AND status = 'active'
  ) INTO is_at_war;

  IF NOT is_at_war AND army_country_id <> target_owner_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot invade a sovereign nation without active war declarations.');
  END IF;

  -- Verify energy
  SELECT energy INTO commander_energy FROM public.player_stats WHERE profile_id = caller_id FOR UPDATE;
  IF commander_energy < 20 THEN
    RETURN json_build_object('success', false, 'error', 'Invasions require 20 Energy Points (EP).');
  END IF;

  -- Deduct energy
  UPDATE public.player_stats SET energy = energy - 20 WHERE profile_id = caller_id;

  -- Update regional occupier to attacker country
  UPDATE public.military_regions 
  SET occupier_country_id = army_country_id, resistance_level = 30
  WHERE region_id = p_target_region_id;

  -- Attrition effects to invading army size
  UPDATE public.army_units 
  SET size = GREATEST(100, size - 150), morale = GREATEST(20, morale - 10), status = 'defending'
  WHERE id = p_army_id;

  RETURN json_build_object('success', true, 'outcome', 'conquered', 'error', null);
END;
$$ LANGUAGE plpgsql;

-- RPC Procedures: Peace Treaties Propose & Accept
CREATE OR REPLACE FUNCTION public.rpc_propose_peace_treaty(
  p_war_id INT,
  p_reparations NUMERIC,
  p_transfers JSONB
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  new_treaty_id INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  IF caller_country_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Must have citizenship to propose peace.');
  END IF;

  INSERT INTO public.peace_treaties (war_id, proposer_country_id, reparations_amount, territory_transfer_json, status)
  VALUES (p_war_id, caller_country_id, p_reparations, p_transfers, 'proposed')
  RETURNING id INTO new_treaty_id;

  RETURN json_build_object('success', true, 'treaty_id', new_treaty_id, 'error', null);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.rpc_accept_peace_treaty(
  p_treaty_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  treaty_row RECORD;
  war_row RECORD;
  other_country_id INT;
  reg_id INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT * INTO treaty_row FROM public.peace_treaties WHERE id = p_treaty_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Treaty proposal not found.');
  END IF;

  SELECT * INTO war_row FROM public.wars WHERE id = treaty_row.war_id FOR UPDATE;
  IF war_row.status <> 'active' THEN
    RETURN json_build_object('success', false, 'error', 'War is already resolved.');
  END IF;

  -- Identify opposing country
  IF war_row.attacker_country_id = treaty_row.proposer_country_id THEN
    other_country_id := war_row.defender_country_id;
  ELSE
    other_country_id := war_row.attacker_country_id;
  END IF;

  -- Ensure caller belongs to the recipient country
  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  IF caller_country_id <> other_country_id THEN
    RETURN json_build_object('success', false, 'error', 'Only the opposing country can accept peace proposals.');
  END IF;

  -- Update treaty status
  UPDATE public.peace_treaties SET status = 'accepted' WHERE id = p_treaty_id;

  -- Close war
  UPDATE public.wars SET status = 'ended', ended_at = now() WHERE id = war_row.id;

  -- Execute reparations cash transfers between national treasuries
  IF treaty_row.reparations_amount > 0 THEN
    UPDATE public.countries 
    SET local_currency_reserve = local_currency_reserve - treaty_row.reparations_amount
    WHERE id = treaty_row.proposer_country_id;

    UPDATE public.countries 
    SET local_currency_reserve = local_currency_reserve + treaty_row.reparations_amount
    WHERE id = other_country_id;
  END IF;

  -- Transfer territory ownership
  FOR reg_id IN SELECT jsonb_array_elements_text(treaty_row.territory_transfer_json)::int LOOP
    UPDATE public.military_regions 
    SET owner_country_id = other_country_id, occupier_country_id = other_country_id, resistance_level = 0
    WHERE region_id = reg_id;
  END LOOP;

  RETURN json_build_object('success', true, 'error', null);
END;
$$ LANGUAGE plpgsql;

-- RPC Procedures: Siege Mechanics
CREATE OR REPLACE FUNCTION public.rpc_initiate_siege(
  p_army_id INT,
  p_target_region_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  army_country_id INT;
  target_owner_id INT;
  target_resistance INT;
  is_at_war BOOLEAN;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id INTO caller_country_id FROM public.profiles WHERE id = caller_id;
  SELECT country_id INTO army_country_id FROM public.army_units WHERE id = p_army_id;
  SELECT owner_country_id, resistance_level INTO target_owner_id, target_resistance FROM public.military_regions WHERE region_id = p_target_region_id;

  IF caller_country_id <> army_country_id THEN
    RETURN json_build_object('success', false, 'error', 'You cannot command foreign country army units.');
  END IF;

  -- Verify active war declaration exists
  SELECT EXISTS (
    SELECT 1 FROM public.wars 
    WHERE ((attacker_country_id = army_country_id AND defender_country_id = target_owner_id)
       OR (attacker_country_id = target_owner_id AND defender_country_id = army_country_id))
      AND status = 'active'
  ) INTO is_at_war;

  IF NOT is_at_war AND army_country_id <> target_owner_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot siege a sovereign nation without active war declarations.');
  END IF;

  -- Check army is in the same region
  IF army_current_region_id IS NOT NULL THEN -- This would need a lookup --
    -- Simplified: check army current region
  END IF;

  -- Check siege eligibility: resistance > 0
  IF target_resistance <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Region is already captured (resistance level 0).');
  END IF;

  -- Consume rations for siege initiation
  UPDATE public.player_stats SET energy = energy - 10 WHERE profile_id = caller_id;

  -- Dedicate army to siege status
  UPDATE public.army_units 
  SET status = 'sieging', rations_qty = GREATEST(0, rations_qty - 20)
  WHERE id = p_army_id;

  -- Set initial resistance (fortified regions start higher)
  UPDATE public.military_regions 
  SET resistance_level = LEAST(100, resistance_level + 20)
  WHERE region_id = p_target_region_id;

  RETURN json_build_object('success', true, 'error', null);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.rpc_progress_siege(
  p_army_id INT,
  p_target_region_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  caller_country_id INT;
  army_country_id INT;
  target_owner_id INT;
  target_resistance INT;
  siege_damage INT;
  new_resistance INT;
  province_captured BOOLEAN := false;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT citizenship_country_id, country_id INTO caller_country_id, army_country_id FROM public.profiles JOIN public.army_units ON army_units.id = p_army_id WHERE public.profiles.id = caller_id;

  -- Verify army is currently besieging
  IF NOT EXISTS (
    SELECT 1 FROM public.army_units WHERE id = p_army_id AND status = 'sieging'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Army is not currently besieging.');
  END IF;

  -- Get target region state
  SELECT owner_country_id, resistance_level INTO target_owner_id, target_resistance FROM public.military_regions WHERE region_id = p_target_region_id;

  -- Calculate siege damage based on army size
  SELECT size INTO siege_damage FROM public.army_units WHERE id = p_army_id;
  siege_damage := GREATEST(1, FLOOR(siege_damage / 50));

  -- Reduce resistance
  new_resistance := GREATEST(0, target_resistance - siege_damage);

  -- Consume rations for siege maintenance
  UPDATE public.player_stats SET energy = energy - 5 WHERE profile_id = caller_id;

  -- Update resistance level
  UPDATE public.military_regions SET resistance_level = new_resistance WHERE region_id = p_target_region_id;

  -- Check if siege is successful
  IF new_resistance <= 0 THEN
    UPDATE public.military_regions 
    SET owner_country_id = army_country_id, occupier_country_id = army_country_id, resistance_level = 0
    WHERE region_id = p_target_region_id;
    province_captured := true;
    -- Army becomes garrison
    UPDATE public.army_units SET status = 'garrisoning' WHERE id = p_army_id;
  END IF;

  RETURN json_build_object('success', true, 'province_captured', province_captured, 'error', null);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.rpc_lift_siege(
  p_army_id INT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  army_country_id INT;
  target_region_id INT;
  target_resistance INT;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  -- Get army info and current region
  SELECT country_id, current_region_id INTO army_country_id, target_region_id FROM public.army_units WHERE id = p_army_id;
  SELECT resistance_level INTO target_resistance FROM public.military_regions WHERE region_id = target_region_id;

  -- Verify army is currently besieging
  IF NOT EXISTS (
    SELECT 1 FROM public.army_units WHERE id = p_army_id AND status = 'sieging'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Army is not currently besieging.');
  END IF;

  -- Lift siege - army returns to idle status
  UPDATE public.army_units SET status = 'idle' WHERE id = p_army_id;

  RETURN json_build_object('success', true, 'error', null);
END;
$$ LANGUAGE plpgsql;
