-- Migration: 20260629000010_launch_platform.sql
-- Live Operations, Balances, Support Tickets, Observability & Analytics, Seasons, Quests, Achievements, API Keys

-- 1. Live Operations & Balancing
CREATE TABLE IF NOT EXISTS live_ops_config (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  emergency_shutdown boolean DEFAULT false,
  maintenance_mode boolean DEFAULT false,
  resource_multiplier numeric(4,2) DEFAULT 1.00,
  xp_multiplier numeric(4,2) DEFAULT 1.00,
  drop_rate_multiplier numeric(4,2) DEFAULT 1.00,
  tax_limit_multiplier numeric(4,2) DEFAULT 1.00,
  active_season_id integer,
  updated_at timestamp with time zone DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS global_buffs_debuffs (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  type text NOT NULL, -- 'buff', 'debuff'
  multiplier numeric(4,2) NOT NULL,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_restarts (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  restart_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  performed_by text
);

-- 2. Moderation & Reports
CREATE TABLE IF NOT EXISTS moderation_actions (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'warn', 'mute', 'temp_ban', 'perm_ban'
  reason text NOT NULL,
  ends_at timestamp with time zone,
  moderator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appeal_status text DEFAULT 'none', -- 'none', 'pending', 'approved', 'rejected'
  appeal_notes text,
  created_at timestamp with time zone DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS player_reports (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'spam', 'harassment', 'exploit', 'botting', 'other'
  details text NOT NULL,
  status text DEFAULT 'open', -- 'open', 'investigating', 'resolved'
  moderator_notes text,
  created_at timestamp with time zone DEFAULT clock_timestamp()
);

-- 3. Customer Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'bug', 'appeal', 'payment', 'recovery', 'exploit', 'gameplay'
  subject text NOT NULL,
  details text NOT NULL,
  status text DEFAULT 'open', -- 'open', 'escalated', 'closed'
  priority text DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ticket_id integer REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_internal_note boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT clock_timestamp()
);

-- 4. Observability & Performance Metrics
CREATE TABLE IF NOT EXISTS system_metrics_hourly (
  timestamp timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  dimensions_json jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS daily_active_users (
  date date PRIMARY KEY,
  dau integer DEFAULT 0,
  mau integer DEFAULT 0,
  retention_rate numeric(5,2) DEFAULT 0.00,
  average_playtime_minutes numeric DEFAULT 0.00
);

-- 5. Quests
CREATE TABLE IF NOT EXISTS quests (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'tutorial', 'daily', 'weekly', 'seasonal', 'story'
  rewards_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  requirements_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS player_quests (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id integer REFERENCES quests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active', -- 'active', 'completed'
  progress_json jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT clock_timestamp(),
  PRIMARY KEY (profile_id, quest_id)
);

-- 6. Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'combat', 'economy', 'politics', 'industry', 'guilds'
  points integer DEFAULT 10,
  requirements_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS player_achievements (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id integer REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT clock_timestamp(),
  PRIMARY KEY (profile_id, achievement_id)
);

-- 7. Seasons & Leaderboards
CREATE TABLE IF NOT EXISTS seasons (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  number integer NOT NULL,
  title text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  reward_cosmetic_template_id integer,
  status text NOT NULL DEFAULT 'active' -- 'active', 'concluded'
);

CREATE TABLE IF NOT EXISTS season_leaderboard (
  season_id integer REFERENCES seasons(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  rank integer,
  PRIMARY KEY (season_id, profile_id)
);

-- 8. Feature Flags & Dev API Keys
CREATE TABLE IF NOT EXISTS feature_flags (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 100,
  rules_json jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS developer_keys (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  api_key_hash text NOT NULL,
  label text,
  rate_limit_per_min integer DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT clock_timestamp()
);

-- Enable RLS on all tables
ALTER TABLE live_ops_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_buffs_debuffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_restarts ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_active_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_keys ENABLE ROW LEVEL SECURITY;

-- Standard select policies (read-all)
CREATE POLICY read_all_live_ops ON live_ops_config FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_buffs ON global_buffs_debuffs FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_restarts ON scheduled_restarts FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_quests ON quests FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_achievements ON achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_seasons ON seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_leaderboard ON season_leaderboard FOR SELECT TO authenticated USING (true);
CREATE POLICY read_all_feature_flags ON feature_flags FOR SELECT TO authenticated USING (true);

-- User-scoped read/write policies
CREATE POLICY read_own_moderation ON moderation_actions FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY read_own_tickets ON support_tickets FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY write_own_tickets ON support_tickets FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY read_own_replies ON ticket_replies FOR SELECT TO authenticated USING (
  sender_id = auth.uid() OR ticket_id IN (SELECT id FROM support_tickets WHERE profile_id = auth.uid())
);
CREATE POLICY write_own_replies ON ticket_replies FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY read_own_quests ON player_quests FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY write_own_quests ON player_quests FOR ALL TO authenticated USING (profile_id = auth.uid());
CREATE POLICY read_own_achievements ON player_achievements FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY write_own_achievements ON player_achievements FOR ALL TO authenticated USING (profile_id = auth.uid());
CREATE POLICY read_own_dev_keys ON developer_keys FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY write_own_dev_keys ON developer_keys FOR ALL TO authenticated USING (profile_id = auth.uid());

-- Seed Initial Data
INSERT INTO live_ops_config (emergency_shutdown, xp_multiplier, drop_rate_multiplier) VALUES (false, 1.00, 1.00);

INSERT INTO seasons (number, title, start_date, end_date, reward_cosmetic_template_id, status)
VALUES (1, 'Age of Rebirth', clock_timestamp(), clock_timestamp() + interval '30 days', 99, 'active');

INSERT INTO quests (title, description, category, rewards_json, requirements_json)
VALUES 
('Tutorial: First Steps', 'Gather 5 iron ore and explore the local region maps.', 'tutorial', '{"currency": 100, "xp": 20}'::jsonb, '{"gather_iron": 5}'::jsonb),
('Daily: Production Drive', 'Craft any tool template in your regional factory hub.', 'daily', '{"currency": 250, "xp": 50}'::jsonb, '{"craft_item": 1}'::jsonb);

INSERT INTO achievements (name, description, category, points, requirements_json)
VALUES 
('First Harvest', 'Perform a successful manual resource gather action.', 'economy', 10, '{"gathers": 1}'::jsonb),
('Gladiator Elite', 'Defeat 5 PvE creature spawns or enemy armies.', 'combat', 20, '{"wins": 5}'::jsonb);

INSERT INTO feature_flags (key, name, description, is_enabled, rollout_percentage)
VALUES 
('experimental_combat', 'Enable active dodge and combat system rules.', 'Enable active dodge and combat system rules.', false, 0),
('marketplace_v2', 'Enable automated limit orders on exchange listings.', 'Enable automated limit orders on exchange listings.', true, 100);
