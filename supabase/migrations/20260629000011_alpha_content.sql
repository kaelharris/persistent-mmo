-- Migration: 20260629000011_alpha_content.sql
-- Seed complete Closed Alpha content: regions, companies, items, recipes, enemies, achievements, quests, events, newspapers, invites

-- 1. Invite Codes Table
CREATE TABLE IF NOT EXISTS public.closed_alpha_invites (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  invite_code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  used_by_email text,
  created_at timestamp with time zone DEFAULT clock_timestamp()
);

ALTER TABLE public.closed_alpha_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_alpha_invites ON public.closed_alpha_invites FOR SELECT USING (true);
CREATE POLICY write_alpha_invites ON public.closed_alpha_invites FOR ALL USING (true);

-- Insert 50 alpha invite codes
INSERT INTO public.closed_alpha_invites (invite_code)
SELECT 'AEGIS-ALPHA-' || lpad(i::text, 2, '0')
FROM generate_series(1, 50) i
ON CONFLICT (invite_code) DO NOTHING;

-- 2. Seed 20 new regions (IDs 11 to 30) making a total of 30 regions
INSERT INTO public.regions (id, name, country_id, climate, population, production_bonus, travel_cost, travel_cooldown)
SELECT 
  i,
  CASE (i % 3)
    WHEN 0 THEN 'Frosty Vale ' || i
    WHEN 1 THEN 'Golden Meadows ' || i
    ELSE 'Shadow Peak ' || i
  END,
  (i % 3) + 1,
  CASE (i % 3)
    WHEN 0 THEN 'cold'
    WHEN 1 THEN 'lush'
    ELSE 'rocky'
  END,
  100 + (i * 10),
  1.0 + (i % 5) * 0.05,
  10 + (i % 10),
  60 + (i % 5) * 15
FROM generate_series(11, 30) i
ON CONFLICT (id) DO NOTHING;

-- Spawns raw resources in the new regions
INSERT INTO public.resource_spawn_tables (region_id, resource_id, spawn_weight, energy_cost, production_time, experience_reward)
SELECT 
  r.id,
  res.id,
  50 + (r.id % 5) * 10,
  5 + (res.id % 3),
  10 + (res.id % 2) * 5,
  10 + (res.id % 2) * 10
FROM public.regions r
CROSS JOIN (SELECT id FROM public.resources WHERE category = 'raw') res
WHERE r.id >= 11
ON CONFLICT DO NOTHING;

-- Adjust SERIAL sequence for regions
SELECT setval('public.regions_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.regions), 1), false);

-- 3. Seed 6 new company templates making a total of 20
INSERT INTO public.company_templates (id, name, description, cost_gold, cost_local, is_raw_camp, output_resource_id) VALUES
  (15, 'Brewery', 'Crafts fine beverages and energy drinks.', 0.00, 400.00, false, null),
  (16, 'Toolsmith', 'Crafts specialized pickaxes and gathering tools.', 2.00, 600.00, false, null),
  (17, 'Armory', 'Crafts shields and protective breastplates.', 5.00, 800.00, false, null),
  (18, 'Weaponsmith', 'Smelts high-grade iron swords and claymores.', 5.00, 900.00, false, null),
  (19, 'Fletcher', 'Bows and arrows manufacturing camp.', 1.00, 300.00, false, null),
  (20, 'Alchemist Lab', 'Brews potions that temporarily boost health.', 2.00, 500.00, false, null)
ON CONFLICT (id) DO NOTHING;

-- Adjust SERIAL sequence for company templates
SELECT setval('public.company_templates_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.company_templates), 1), false);

-- 4. Seed 400 Item Templates (IDs 10 to 409)
DO $$
DECLARE
  v_category INT;
  v_type TEXT;
  v_name TEXT;
  v_material TEXT;
  v_rarity TEXT;
  v_base_val INT;
  v_max_dur INT;
  v_id INT := 10;
BEGIN
  FOR m IN 1..8 LOOP -- 8 material tiers
    v_material := CASE m
      WHEN 1 THEN 'Bronze' WHEN 2 THEN 'Iron' WHEN 3 THEN 'Steel' WHEN 4 THEN 'Cobalt'
      WHEN 5 THEN 'Titanium' WHEN 6 THEN 'Mithril' WHEN 7 THEN 'Orichalcum' ELSE 'Obsidian'
    END;

    FOR t IN 1..7 LOOP -- 7 gear types
      v_type := CASE t
        WHEN 1 THEN 'weapon' WHEN 2 THEN 'shield' WHEN 3 THEN 'helmet'
        WHEN 4 THEN 'armor' WHEN 5 THEN 'boots' WHEN 6 THEN 'tool' ELSE 'food'
      END;

      v_category := CASE t
        WHEN 1 THEN 6 WHEN 2 THEN 8 WHEN 3 THEN 9 WHEN 4 THEN 7 WHEN 5 THEN 10 WHEN 6 THEN 13 ELSE 3
      END;

      FOR r IN 1..5 LOOP -- 5 rarities
        v_rarity := CASE r
          WHEN 1 THEN 'common' WHEN 2 THEN 'uncommon' WHEN 3 THEN 'rare' WHEN 4 THEN 'epic' ELSE 'legendary'
        END;

        v_name := v_material || ' ' || CASE t
          WHEN 1 THEN 'Sword' WHEN 2 THEN 'Shield' WHEN 3 THEN 'Helmet'
          WHEN 4 THEN 'Chestplate' WHEN 5 THEN 'Boots' WHEN 6 THEN 'Pickaxe' ELSE 'Ration'
        END;

        IF r > 1 THEN
          v_name := v_name || ' (' || UPPER(v_rarity) || ')';
        END IF;

        v_base_val := (m * 20) + (r * 15) + (t * 5);
        v_max_dur := CASE WHEN v_type IN ('food') THEN 0 ELSE (100 + m * 20 + r * 10) END;

        INSERT INTO public.item_templates (id, category_id, name, description, type, base_value, weight, max_durability, rarity, attributes)
        VALUES (
          v_id,
          v_category,
          v_name,
          'A reliable ' || LOWER(v_material) || ' ' || v_type || ' of ' || v_rarity || ' quality.',
          v_type,
          v_base_val,
          0.5 + (t * 0.4),
          v_max_dur,
          v_rarity,
          json_build_object(
            CASE t
              WHEN 1 THEN 'attack' WHEN 2 THEN 'defense' WHEN 3 THEN 'defense'
              WHEN 4 THEN 'defense' WHEN 5 THEN 'speed' WHEN 6 THEN 'mining_bonus' ELSE 'energy_restore'
            END,
            (m * 10) + (r * 5)
          )
        ) ON CONFLICT (id) DO NOTHING;

        v_id := v_id + 1;
        EXIT WHEN v_id >= 410;
      END LOOP;
      EXIT WHEN v_id >= 410;
    END LOOP;
    EXIT WHEN v_id >= 410;
  END LOOP;
END $$;

-- Adjust SERIAL sequence for item templates
SELECT setval('public.item_templates_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.item_templates), 1), false);

-- 5. Seed 150 Crafting Recipes (IDs 10 to 159)
DO $$
DECLARE
  v_rec_id INT := 10;
  v_temp_id INT;
BEGIN
  FOR v_temp_id IN 10..159 LOOP
    INSERT INTO public.item_recipes (id, result_template_id, result_quantity, craft_time, energy_cost, required_level, experience_reward, failure_chance, is_blueprint_required)
    VALUES (
      v_rec_id,
      v_temp_id,
      1,
      5 + (v_temp_id % 5) * 2,
      5 + (v_temp_id % 3) * 2,
      1 + (v_temp_id % 10),
      10 + (v_temp_id % 5) * 5,
      0.0000,
      (v_temp_id % 10 = 0)
    ) ON CONFLICT (id) DO NOTHING;

    -- Add default ingredients: 5 Wood (res 1) + 5 Iron Ore (res 3)
    INSERT INTO public.item_recipe_inputs (recipe_id, resource_id, item_template_id, quantity)
    VALUES 
      (v_rec_id, 1, null, 5),
      (v_rec_id, 3, null, 5)
    ON CONFLICT DO NOTHING;

    v_rec_id := v_rec_id + 1;
  END LOOP;
END $$;

-- Adjust SERIAL sequence for item recipes
SELECT setval('public.item_recipes_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.item_recipes), 1), false);

-- 6. Seed 80 Enemy Templates (IDs 6 to 85)
DO $$
DECLARE
  v_name TEXT;
  v_diff TEXT;
  v_reg INT;
BEGIN
  FOR i IN 6..85 LOOP
    v_name := CASE (i % 6)
      WHEN 0 THEN 'Savage Boar ' || i
      WHEN 1 THEN 'Mountain Troll ' || i
      WHEN 2 THEN 'Undead Knight ' || i
      WHEN 3 THEN 'Desert Basilisk ' || i
      WHEN 4 THEN 'Wild Wyvern ' || i
      ELSE 'Dungeon Orc ' || i
    END;

    v_diff := CASE (i % 10)
      WHEN 0 THEN 'boss'
      WHEN 1 THEN 'hard'
      WHEN 2 THEN 'hard'
      ELSE 'standard'
    END;

    v_reg := (i % 10) + 1;

    INSERT INTO public.enemy_templates (id, name, health, attack, defense, speed, xp_reward, currency_reward, spawn_region_id, difficulty)
    VALUES (
      i,
      v_name,
      50 + (i * 5),
      8 + (i * 0.8),
      3 + (i * 0.4),
      5 + (i % 10),
      15 + (i * 2),
      5.00 + (i * 0.50),
      v_reg,
      v_diff
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Adjust SERIAL sequence for enemy templates
SELECT setval('public.enemy_templates_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.enemy_templates), 1), false);

-- 7. Seed 200 Achievements (IDs 3 to 202)
DO $$
DECLARE
  v_cat TEXT;
  v_title TEXT;
BEGIN
  FOR i IN 3..202 LOOP
    v_cat := CASE (i % 5)
      WHEN 0 THEN 'combat'
      WHEN 1 THEN 'economy'
      WHEN 2 THEN 'politics'
      WHEN 3 THEN 'industry'
      ELSE 'guilds'
    END;

    v_title := CASE v_cat
      WHEN 'combat' THEN 'Slayer Milestone ' || i
      WHEN 'economy' THEN 'Merchant Tycoon ' || i
      WHEN 'politics' THEN 'Senator Prestige ' || i
      WHEN 'industry' THEN 'Architect Tier ' || i
      ELSE 'Guild Alliance Level ' || i
    END;

    INSERT INTO public.achievements (id, name, description, category, points, requirements_json)
    VALUES (
      i,
      v_title,
      'Achieve milestone level or actions volume count of ' || (i * 5) || ' under ' || v_cat || '.',
      v_cat,
      10 + (i % 5) * 5,
      json_build_object('milestone_value', i * 5)
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Adjust SERIAL sequence for achievements
SELECT setval('public.achievements_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.achievements), 1), false);

-- 8. Seed 100 Quests (IDs 3 to 102)
DO $$
DECLARE
  v_cat TEXT;
  v_title TEXT;
BEGIN
  FOR i IN 3..102 LOOP
    v_cat := CASE (i % 5)
      WHEN 0 THEN 'tutorial'
      WHEN 1 THEN 'daily'
      WHEN 2 THEN 'weekly'
      WHEN 3 THEN 'seasonal'
      ELSE 'story'
    END;

    v_title := CASE v_cat
      WHEN 'tutorial' THEN 'Onboarding Path ' || i
      WHEN 'daily' THEN 'Daily Grind ' || i
      WHEN 'weekly' THEN 'Weekly Initiative ' || i
      WHEN 'seasonal' THEN 'Seasonal Chapter ' || i
      ELSE 'Kingdom Storyline ' || i
    END;

    INSERT INTO public.quests (title, description, category, rewards_json, requirements_json)
    VALUES (
      v_title,
      'Fulfill the structural requirements of quest ' || i || ' for raw materials or combat victory.',
      v_cat,
      json_build_object('currency', 50 + i * 5, 'xp', 10 + i * 2),
      json_build_object('action_count', i)
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Adjust SERIAL sequence for quests
SELECT setval('public.quests_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.quests), 1), false);

-- 9. Seed 45 Events (25 World Events, 10 Political, 10 Seasonal)
INSERT INTO public.world_events (name, description, type, region_id, active, modifiers_json, duration_ticks)
SELECT 
  'Economic Event ' || i,
  'A major regional event affecting gathering and production times.',
  CASE (i % 4)
    WHEN 0 THEN 'drought'
    WHEN 1 THEN 'mining_boom'
    WHEN 2 THEN 'strike'
    ELSE 'crisis'
  END,
  (i % 10) + 1,
  true,
  '{"production_bonus_multiplier": 1.15}'::jsonb,
  24
FROM generate_series(1, 25) i;

INSERT INTO public.world_events (name, description, type, region_id, active, modifiers_json, duration_ticks)
SELECT 
  'Political Event ' || i,
  'National council policy updates or taxation adjustments.',
  'political',
  (i % 10) + 1,
  true,
  '{"tax_rate_modifier": -2.00}'::jsonb,
  48
FROM generate_series(1, 10) i;

INSERT INTO public.world_events (name, description, type, region_id, active, modifiers_json, duration_ticks)
SELECT 
  'Seasonal Event ' || i,
  'A seasonal cosmetic festival or winter frost shift.',
  'seasonal',
  (i % 10) + 1,
  true,
  '{"cosmetic_bonus": true}'::jsonb,
  72
FROM generate_series(1, 10) i;

-- 10. Seed 50 Newspaper templates
INSERT INTO public.newspapers (id, name, description, owner_id)
SELECT 
  i,
  'Aegis Tribune Edition ' || i,
  'Daily chronicles detailing faction activities, economic indexes, and war status reports.',
  null
FROM generate_series(1, 50) i
ON CONFLICT (id) DO NOTHING;

-- Adjust SERIAL sequence for newspapers
SELECT setval('public.newspapers_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.newspapers), 1), false);
