-- Combat resolves and saves once; replay is a read of the saved result.
ALTER TABLE public.enemy_templates ADD COLUMN energy_cost INT NOT NULL DEFAULT 10 CHECK (energy_cost >= 0);

CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE private.combat_results (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  combat_id UUID NOT NULL,
  result JSONB NOT NULL,
  PRIMARY KEY (profile_id, combat_id)
);
ALTER TABLE private.combat_results ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.combat_results FROM PUBLIC, anon, authenticated;

DROP FUNCTION public.rpc_execute_pve_battle(INT);

CREATE OR REPLACE FUNCTION private.resolve_pve_battle(
  p_enemy_template_id INT,
  p_combat_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_id UUID;
  caller_stats RECORD;
  enemy_stats RECORD;
  equip_row public.equipment%ROWTYPE;
  loot_row RECORD;
  
  p_dmg INT;
  e_dmg INT;
  p_hp INT;
  e_hp INT;
  round_idx INT := 1;
  p_initiative BOOLEAN;
  
  -- Combat calculation variables
  p_atk INT := 10;
  p_def INT := 5;
  p_spd INT := 10;
  
  is_crit BOOLEAN;
  dmg_dealt INT;
  
  loot_gained JSONB := '[]'::jsonb;
  xp_won INT;
  gold_won NUMERIC(20, 2);
  battle_id UUID;
  rounds_json JSONB := '[]'::jsonb;
  qty INT;
  inst_id UUID;
  saved_result JSONB;
  result_payload JSONB;
  reward_xp INT := 0;
  reward_gold NUMERIC := 0;
  next_level INT;
  next_exp BIGINT;
BEGIN
  -- 1. Authenticate user
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized player session.');
  END IF;

  -- 2. Load stats & check energy/health
  SELECT * INTO caller_stats FROM public.player_stats WHERE profile_id = caller_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Stats profile not found.');
  END IF;

  IF p_combat_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Combat ID required.');
  END IF;
  SELECT result INTO saved_result FROM private.combat_results WHERE profile_id = caller_id AND combat_id = p_combat_id;
  IF FOUND THEN
    IF (saved_result->>'enemyTemplateId')::int <> p_enemy_template_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'Combat ID already used for another enemy.');
    END IF;
    RETURN jsonb_build_object('success', true, 'result', saved_result, 'error', null);
  END IF;
  SELECT * INTO enemy_stats FROM public.enemy_templates WHERE id = p_enemy_template_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Enemy template not found.');
  END IF;
  IF caller_stats.energy < enemy_stats.energy_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient energy. Fights require ' || enemy_stats.energy_cost || ' EP.');
  END IF;

  IF caller_stats.health <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'You are currently knocked out. Eat Bread or use Medicine to heal.');
  END IF;

  -- 3. Load Enemy Template parameters
  SELECT * INTO enemy_stats FROM public.enemy_templates WHERE id = p_enemy_template_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Enemy template not found.');
  END IF;

  p_def := caller_stats.defense;
  p_spd := caller_stats.speed;

  -- 4. Calculate Player Combat modifiers based on equipment durability
  SELECT * INTO equip_row FROM public.equipment WHERE profile_id = caller_id;
  IF FOUND THEN
    -- Weapon Attack bonus
    IF equip_row.weapon_id IS NOT NULL THEN
      SELECT COALESCE(ta.value, 0)::int INTO p_dmg 
      FROM public.inventories i
      JOIN public.item_template_attributes ta ON ta.template_id = i.item_template_id
      JOIN public.item_attributes a ON a.id = ta.attribute_id
      LEFT JOIN public.item_instances inst ON inst.id = i.item_instance_id
      WHERE i.owner_id = caller_id AND i.quantity > 0 AND i.id = equip_row.weapon_id AND a.name = 'attack' AND (inst.id IS NULL OR inst.current_durability > 0);
      
      IF p_dmg IS NOT NULL THEN
        p_atk := p_atk + p_dmg;
      END IF;
    END IF;

    -- Chest Armor Defense bonus
    IF equip_row.chest_id IS NOT NULL THEN
      SELECT COALESCE(ta.value, 0)::int INTO p_dmg 
      FROM public.inventories i
      JOIN public.item_template_attributes ta ON ta.template_id = i.item_template_id
      JOIN public.item_attributes a ON a.id = ta.attribute_id
      LEFT JOIN public.item_instances inst ON inst.id = i.item_instance_id
      WHERE i.owner_id = caller_id AND i.quantity > 0 AND i.id = equip_row.chest_id AND a.name = 'defense' AND (inst.id IS NULL OR inst.current_durability > 0);
      
      IF p_dmg IS NOT NULL THEN
        p_def := p_def + p_dmg;
      END IF;
    END IF;

    -- Helm Armor Defense bonus
    IF equip_row.helmet_id IS NOT NULL THEN
      SELECT COALESCE(ta.value, 0)::int INTO p_dmg 
      FROM public.inventories i
      JOIN public.item_template_attributes ta ON ta.template_id = i.item_template_id
      JOIN public.item_attributes a ON a.id = ta.attribute_id
      LEFT JOIN public.item_instances inst ON inst.id = i.item_instance_id
      WHERE i.owner_id = caller_id AND i.quantity > 0 AND i.id = equip_row.helmet_id AND a.name = 'defense' AND (inst.id IS NULL OR inst.current_durability > 0);
      
      IF p_dmg IS NOT NULL THEN
        p_def := p_def + p_dmg;
      END IF;
    END IF;
  END IF;

  -- Add base strength modifier
  p_atk := p_atk + floor(caller_stats.strength * 1.5)::int;
  
  -- Initiatives speed checking
  p_initiative := (p_spd >= enemy_stats.speed);

  p_hp := caller_stats.health;
  e_hp := enemy_stats.health;

  -- 5. Turn Simulation Loops
  WHILE p_hp > 0 AND e_hp > 0 AND round_idx <= 20 LOOP
    -- Player Turn
    IF p_initiative THEN
      -- Hit/Crit roll
      is_crit := ((random() * 100) <= caller_stats.crit_chance);
      dmg_dealt := greatest(1, p_atk - enemy_stats.defense);
      IF is_crit THEN
        dmg_dealt := dmg_dealt * 2;
      END IF;
      
      e_hp := greatest(0, e_hp - dmg_dealt);
      rounds_json := rounds_json || jsonb_build_object(
        'turn', round_idx,
        'actor', 'player',
        'isCrit', is_crit,
        'playerHpRemaining', p_hp,
        'enemyHpRemaining', e_hp,
        'action', CASE WHEN is_crit THEN 'critical' ELSE 'hit' END,
        'damage', dmg_dealt
      );
      
      IF e_hp <= 0 THEN
        EXIT;
      END IF;
    END IF;

    -- Enemy Turn
    is_crit := ((random() * 100) <= 5.00); -- 5% base enemy crit chance
    dmg_dealt := greatest(1, enemy_stats.attack - p_def);
    IF is_crit THEN
      dmg_dealt := dmg_dealt * 2;
    END IF;

    p_hp := greatest(0, p_hp - dmg_dealt);
    rounds_json := rounds_json || jsonb_build_object(
      'turn', round_idx,
      'actor', 'enemy',
      'isCrit', is_crit,
      'playerHpRemaining', p_hp,
      'enemyHpRemaining', e_hp,
      'action', CASE WHEN is_crit THEN 'critical' ELSE 'hit' END,
      'damage', dmg_dealt
    );

    IF p_hp <= 0 THEN
      EXIT;
    END IF;

    -- Player Turn (if enemy had initiative)
    IF NOT p_initiative THEN
      is_crit := ((random() * 100) <= caller_stats.crit_chance);
      dmg_dealt := greatest(1, p_atk - enemy_stats.defense);
      IF is_crit THEN
        dmg_dealt := dmg_dealt * 2;
      END IF;
      
      e_hp := greatest(0, e_hp - dmg_dealt);
      rounds_json := rounds_json || jsonb_build_object(
        'turn', round_idx,
        'actor', 'player',
        'isCrit', is_crit,
        'playerHpRemaining', p_hp,
        'enemyHpRemaining', e_hp,
        'action', CASE WHEN is_crit THEN 'critical' ELSE 'hit' END,
        'damage', dmg_dealt
      );
    END IF;

    round_idx := round_idx + 1;
  END LOOP;

  -- 6. Battle Outcome processing
  -- Deduct Energy cost
  UPDATE public.player_stats 
  SET energy = energy - enemy_stats.energy_cost,
      health = p_hp,
      damage_dealt = damage_dealt + (enemy_stats.health - e_hp),
      damage_taken = damage_taken + (caller_stats.health - p_hp)
  WHERE profile_id = caller_id;

  IF e_hp <= 0 THEN
    -- VICTORY
    xp_won := enemy_stats.xp_reward;
    gold_won := enemy_stats.currency_reward;

    -- Update Currency balances
    UPDATE public.currencies SET gold = gold + gold_won WHERE profile_id = caller_id;

    -- Update statistics & level checks
    UPDATE public.player_stats 
    SET xp_pve = xp_pve + xp_won,
        kills = kills + 1
    WHERE profile_id = caller_id;

    reward_xp := xp_won;
    reward_gold := gold_won;

    -- Inflict Durability loss on equipped gears (reduces by 5 points)
    IF equip_row.weapon_id IS NOT NULL THEN
      UPDATE public.item_instances 
      SET current_durability = greatest(0, current_durability - 5)
      WHERE id = (SELECT item_instance_id FROM public.inventories WHERE id = equip_row.weapon_id);
    END IF;

    IF equip_row.chest_id IS NOT NULL THEN
      UPDATE public.item_instances 
      SET current_durability = greatest(0, current_durability - 5)
      WHERE id = (SELECT item_instance_id FROM public.inventories WHERE id = equip_row.chest_id);
    END IF;

    -- Roll loot drops from tables
    FOR loot_row IN SELECT * FROM public.enemy_loot_tables WHERE enemy_template_id = p_enemy_template_id LOOP
      IF (random() * 100) <= loot_row.chance_percent THEN
        qty := floor(loot_row.min_qty + random() * (loot_row.max_qty - loot_row.min_qty + 1))::int;
        IF loot_row.resource_id IS NOT NULL THEN
          -- Award resource stack
          INSERT INTO public.player_resources (profile_id, resource_id, quantity)
          VALUES (caller_id, loot_row.resource_id, qty)
          ON CONFLICT (profile_id, resource_id) DO UPDATE 
          SET quantity = public.player_resources.quantity + qty;
          
          loot_gained := loot_gained || jsonb_build_object(
            'type', 'resource',
            'id', loot_row.resource_id,
            'quantity', qty,
            'name', (SELECT name FROM public.resources WHERE id = loot_row.resource_id)
          );
        ELSIF loot_row.item_template_id IS NOT NULL THEN
          -- Award item instance
          INSERT INTO public.item_instances (template_id, current_durability, max_durability, quality)
          VALUES (loot_row.item_template_id, 100, 100, 1)
          RETURNING id INTO inst_id;

          INSERT INTO public.inventories (owner_id, item_template_id, item_instance_id, quantity)
          VALUES (caller_id, loot_row.item_template_id, inst_id, qty)
          ON CONFLICT (owner_id, item_template_id, quality) DO UPDATE SET quantity = public.inventories.quantity + EXCLUDED.quantity;
          
          loot_gained := loot_gained || jsonb_build_object(
            'type', 'item',
            'id', loot_row.item_template_id,
            'quantity', qty,
            'name', (SELECT name FROM public.item_templates WHERE id = loot_row.item_template_id)
          );
        END IF;
      END IF;
    END LOOP;

  ELSE
    -- DEFEAT
    UPDATE public.player_stats 
    SET deaths = deaths + 1,
        health = p_hp
    WHERE profile_id = caller_id;

  END IF;

  next_level := caller_stats.level;
  next_exp := caller_stats.experience + reward_xp;
  WHILE next_exp >= floor(power(next_level::numeric, 2.2) * 120) LOOP
    next_exp := next_exp - floor(power(next_level::numeric, 2.2) * 120);
    next_level := next_level + 1;
  END LOOP;
  UPDATE public.player_stats SET level = next_level, experience = next_exp, updated_at = now() WHERE profile_id = caller_id;
  result_payload := jsonb_build_object(
    'combatId', p_combat_id, 'enemyTemplateId', p_enemy_template_id,
    'outcome', CASE WHEN e_hp <= 0 THEN 'victory' ELSE 'defeat' END,
    'initialPlayerHp', caller_stats.health, 'initialEnemyHp', enemy_stats.health,
    'log', rounds_json, 'rewards', jsonb_build_object('loot', loot_gained, 'xp', reward_xp, 'gold', reward_gold),
    'updatedPlayerState', jsonb_build_object(
      'stats', (SELECT to_jsonb(s) FROM public.player_stats s WHERE profile_id = caller_id),
      'currencies', (SELECT to_jsonb(c) FROM public.currencies c WHERE profile_id = caller_id)));
  IF result_payload #> '{updatedPlayerState,currencies}' = 'null'::jsonb THEN
    RAISE EXCEPTION 'Currency wallet not found';
  END IF;
  INSERT INTO private.combat_results(profile_id, combat_id, result) VALUES (caller_id, p_combat_id, result_payload);
  RETURN jsonb_build_object('success', true, 'result', result_payload, 'error', null);
END;
$$ LANGUAGE plpgsql;



REVOKE ALL ON FUNCTION private.resolve_pve_battle(INT, UUID) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.resolve_pve_battle(INT, UUID) TO authenticated;

CREATE FUNCTION public.rpc_execute_pve_battle(p_enemy_template_id INT, p_combat_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT private.resolve_pve_battle(p_enemy_template_id, p_combat_id);
$$;
REVOKE ALL ON FUNCTION public.rpc_execute_pve_battle(INT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_execute_pve_battle(INT, UUID) TO authenticated;

-- One authoritative travel cost row, shared by UI reads and the travel RPC.
CREATE TABLE public.action_costs (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  travel_domestic INT NOT NULL CHECK (travel_domestic >= 0),
  travel_international INT NOT NULL CHECK (travel_international >= 0)
);
INSERT INTO public.action_costs VALUES (TRUE, 10, 20);
ALTER TABLE public.action_costs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.action_costs TO authenticated;
CREATE POLICY "Read action costs" ON public.action_costs FOR SELECT TO authenticated USING (TRUE);

-- TRAVEL RPC FUNCTION
-- Moves a player between regions. Rules mirror MockGameRepository.travelToRegion
-- and the map UI: 10 EP same-country, 20 EP + 1 Travel Ticket (item template 3)
-- when changing countries.

create or replace function public.travel_to_region(target_region_id int)
returns json
security definer set search_path = public
language plpgsql as $$
declare
  current_user_id uuid;
  profile_rec record;
  current_region record;
  target_region record;
  stat_rec record;
  curr_energy int;
  ticks int;
  elapsed_secs numeric;
  is_same_country boolean;
  energy_cost int;
  ticket_rec record;
begin
  -- 1. Authentication Check
  current_user_id := auth.uid();
  if current_user_id is null then
    return json_build_object('success', false, 'error', 'Unauthenticated player session.');
  end if;

  -- 2. Load profile and regions
  select * into profile_rec from public.profiles where id = current_user_id;
  if profile_rec.id is null then
    return json_build_object('success', false, 'error', 'Character data not found.');
  end if;

  select * into target_region from public.regions where id = target_region_id;
  if target_region.id is null then
    return json_build_object('success', false, 'error', 'Target region does not exist.');
  end if;

  if profile_rec.current_region_id = target_region_id then
    return json_build_object('success', false, 'error', 'You are already in this region.');
  end if;

  select * into current_region from public.regions where id = profile_rec.current_region_id;
  if current_region.id is null then
    return json_build_object('success', false, 'error', 'Current region not found.');
  end if;

  is_same_country := current_region.country_id = target_region.country_id;
  select case when is_same_country then travel_domestic else travel_international end into strict energy_cost from public.action_costs;

  -- 3. Lock Player Stats Row for Concurrency Prevention
  select * into stat_rec from public.player_stats where profile_id = current_user_id for update;
  if stat_rec.profile_id is null then
    return json_build_object('success', false, 'error', 'Stats profile not found.');
  end if;

  -- 4. Sync Offline Energy ticks (5 EP per 6 minutes, same as rpc_gather_resource)
  elapsed_secs := extract(epoch from (now() - stat_rec.updated_at));
  ticks := floor(elapsed_secs / 360);
  curr_energy := stat_rec.energy;

  if ticks > 0 and curr_energy < 100 then
    curr_energy := least(100, curr_energy + (ticks * 5));
    insert into public.energy_history (profile_id, change_amount, reason)
    values (current_user_id, curr_energy - stat_rec.energy, 'offline_regen');
  end if;

  -- 5. Energy Cost Validation
  if curr_energy < energy_cost then
    return json_build_object('success', false, 'error', 'Insufficient energy. Traveling requires ' || energy_cost || ' energy.');
  end if;

  -- 6. Cross-country travel consumes one Travel Ticket
  if not is_same_country then
    select * into ticket_rec from public.inventories
    where owner_id = current_user_id and item_template_id = 3 and quantity > 0
    order by quality asc
    limit 1
    for update;

    if ticket_rec.id is null then
      return json_build_object('success', false, 'error', 'Changing countries requires 1 Travel Ticket.');
    end if;

    update public.inventories
    set quantity = quantity - 1, updated_at = now()
    where id = ticket_rec.id;
  end if;

  -- 7. Deduct energy, move player, write logs
  update public.player_stats
  set energy = curr_energy - energy_cost, updated_at = now()
  where profile_id = current_user_id;

  insert into public.energy_history (profile_id, change_amount, reason)
  values (current_user_id, -energy_cost, 'travel_' || target_region.name);

  update public.profiles
  set current_region_id = target_region_id, updated_at = now()
  where id = current_user_id;

  insert into public.audit_logs (profile_id, action, metadata)
  values (current_user_id, 'region.travel', jsonb_build_object(
    'from', current_region.name,
    'to', target_region.name,
    'energy_cost', energy_cost,
    'ticket_used', not is_same_country
  ));

  return json_build_object('success', true, 'error', null);
end;
$$;
