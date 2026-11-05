export interface Country {
  id: number;
  name: string;
  gold_reserve: number;
  local_currency_reserve: number;
  vat_rate: number;
  import_tax_rate: number;
  income_tax_rate: number;
  created_at: string;
}

export interface Region {
  id: number;
  name: string;
  country_id: number;
  climate: string;
  population: number;
  production_bonus: number;
  travel_cost: number;
  travel_cooldown: number;
  created_at: string;
}

export interface Resource {
  id: number;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'raw' | 'refined' | 'special';
  weight: number;
  base_value: number;
  stack_limit: number;
  enabled: boolean;
  created_at: string;
}

export interface ExperienceThreshold {
  level: number;
  required_experience: number;
}

export interface ResourceSpawn {
  region_id: number;
  resource_id: number;
  spawn_weight: number;
  energy_cost: number;
  production_time: number;
  experience_reward: number;
}

export interface PlayerResource {
  profile_id: string;
  resource_id: number;
  quantity: number;
}

export interface EnergyHistory {
  id: string;
  profile_id: string;
  change_amount: number;
  reason: string;
  created_at: string;
}

export interface GatherLog {
  id: string;
  profile_id: string;
  region_id: number;
  resource_id: number;
  quantity_gathered: number;
  energy_spent: number;
  experience_earned: number;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string | null;
  citizenship_country_id: number;
  current_region_id: number;
  role: 'super_admin' | 'game_master' | 'moderator' | 'support' | 'player';
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  profile_id: string;
  level: number;
  experience: number; // bigint representation in JS/TS
  energy: number; // 0 to 100
  strength: number;
  work_skill: number;
  health: number;
  max_health: number;
  defense: number;
  speed: number;
  crit_chance: number;
  evasion: number;
  xp_pve: number;
  level_pve: number;
  pvp_rating: number;
  kills: number;
  deaths: number;
  damage_dealt: number;
  damage_taken: number;
  healing_done: number;
  last_work_at?: string | null;
  last_train_at?: string | null;
  updated_at: string;
}

export interface Currencies {
  profile_id: string;
  gold: number;
  local_currency_balance: number;
  updated_at: string;
}

export interface Settings {
  profile_id: string;
  theme: 'dark' | 'light';
  language: string;
  email_notifications: boolean;
  sound_effects: boolean;
  updated_at: string;
}

export interface ItemTemplate {
  id: number;
  category_id: number;
  name: string;
  description: string;
  type?: string; // weapon, armor, food, ticket, blueprint, consumable, etc.
  base_value: number;
  weight: number;
  max_durability: number;
  rarity: string;
  attributes?: Record<string, number>;
}

export interface InventoryItem {
  id: string;
  owner_id: string;
  item_template_id: number;
  quantity: number;
  quality: number; // 1 to 7
  item_instance_id?: string | null;
  instance?: ItemInstance | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  owner_id: string;
  region_id: number;
  item_template_id: number;
  vault_balance: number;
  created_at: string;
}

export interface JobOffer {
  id: string;
  company_id: string;
  company_name: string;
  wage: number;
  vacancies: number;
  created_at: string;
}

export interface Battle {
  id: string;
  region_id: number;
  region_name: string;
  attacker_country_id: number;
  defender_country_id: number;
  attacker_score: number;
  defender_score: number;
  status: 'active' | 'finished';
  end_time: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  profile_id?: string | null;
  action: string;
  metadata: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface CompanyTemplate {
  id: number;
  name: string;
  description: string;
  cost_gold: number;
  cost_local: number;
  is_raw_camp: boolean;
  output_resource_id: number;
  created_at: string;
}

export interface CompanyMember {
  company_id: string;
  profile_id: string;
  role: 'Owner' | 'Director' | 'Manager' | 'Employee' | 'Accountant';
  salary: number;
  shifts_worked_today: number;
  max_daily_shifts: number;
  created_at: string;
  username?: string;
}

export interface CompanyVault {
  company_id: string;
  gold: number;
  local_currency: number;
  updated_at: string;
}

export interface CompanyInventoryItem {
  company_id: string;
  resource_id: number;
  quantity: number;
}

export interface CompanyJob {
  id: string;
  company_id: string;
  region_id: number;
  salary: number;
  vacancies: number;
  enabled: boolean;
  created_at: string;
  company_name?: string;
}

export interface ProductionRecipe {
  id: number;
  name: string;
  description: string;
  output_resource_id: number;
  output_quantity: number;
  base_production_time: number;
  experience_reward: number;
  enabled: boolean;
  created_at: string;
}

export interface ProductionInput {
  recipe_id: number;
  resource_id: number;
  quantity: number;
}

export interface CompanyProductionQueue {
  id: string;
  company_id: string;
  recipe_id: number;
  quantity: number;
  quantity_completed: number;
  status: 'waiting' | 'running' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
}

export interface CompanyMachine {
  id: string;
  company_id: string;
  name: string;
  speed_modifier: number;
  efficiency_modifier: number;
  cost_modifier: number;
  maintenance_cost: number;
  created_at: string;
}

export interface CompanyLog {
  id: string;
  company_id: string;
  actor_id?: string | null;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
  actor_username?: string;
}

export interface MarketListing {
  id: string;
  seller_id: string;
  seller_company_id?: string | null;
  region_id?: number | null;
  asset_type: 'resource' | 'item';
  resource_id?: number | null;
  item_id?: string | null;
  quantity: number;
  price_per_unit: number;
  currency_type: 'local' | 'gold';
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
  seller_name?: string;
  seller_company_name?: string;
  resource_name?: string;
}

export interface MarketOrder {
  id: string;
  buyer_id: string;
  buyer_company_id?: string | null;
  region_id?: number | null;
  asset_type: 'resource' | 'item';
  resource_id?: number | null;
  item_template_id?: number | null;
  quantity: number;
  price_per_unit: number;
  currency_type: 'local' | 'gold';
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
  buyer_name?: string;
  buyer_company_name?: string;
  resource_name?: string;
}

export interface GovernmentTerm {
  country_id: number;
  term_number: number;
  president_id: string;
  started_at: string;
  ends_at: string;
}

export interface MarketTransaction {
  id: string;
  seller_id?: string | null;
  seller_company_id?: string | null;
  buyer_id?: string | null;
  buyer_company_id?: string | null;
  asset_type: 'resource' | 'item';
  resource_id?: number | null;
  item_template_id?: number | null;
  quantity: number;
  price_per_unit: number;
  currency_type: 'local' | 'gold';
  tax_collected: number;
  marketplace_fee: number;
  created_at: string;
  resource_name?: string;
  seller_name?: string;
  buyer_name?: string;
}

export interface MarketEscrow {
  id: string;
  profile_id?: string | null;
  company_id?: string | null;
  listing_id?: string | null;
  order_id?: string | null;
  escrow_type: 'resource' | 'item' | 'currency';
  resource_id?: number | null;
  item_id?: string | null;
  currency_type?: 'local' | 'gold' | null;
  amount: number;
  created_at: string;
}

export interface WatchlistItem {
  profile_id: string;
  asset_type: 'resource' | 'item';
  asset_id: number;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  profile_id: string;
  asset_type: 'resource' | 'item';
  asset_id: number;
  target_price: number;
  alert_condition: 'above' | 'below';
  is_triggered: boolean;
  created_at: string;
}

export interface MarketNotification {
  id: string;
  profile_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface MarketFee {
  id: number;
  name: string;
  rate: number;
  description: string;
}

export interface ItemCategory {
  id: number;
  name: string;
  description: string;
}

export interface ItemAttribute {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

export interface ItemInstance {
  id: string;
  template_id: number;
  quality: number;
  current_durability: number;
  max_durability: number;
  enchantment_level: number;
  sockets_json: any[];
  modifiers_json: any[];
  metadata: any;
  created_at: string;
}

export interface ItemRecipe {
  id: number;
  result_template_id: number;
  result_quantity: number;
  craft_time: number;
  energy_cost: number;
  required_level: number;
  experience_reward: number;
  failure_chance: number;
  is_blueprint_required: boolean;
  inputs?: ItemRecipeInput[];
}

export interface ItemRecipeInput {
  recipe_id: number;
  resource_id: number | null;
  item_template_id: number | null;
  quantity: number;
  resource_name?: string;
  item_name?: string;
}

export interface ItemBlueprint {
  profile_id: string;
  recipe_id: number;
  unlocked_at: string;
}

export interface ItemHistory {
  id: string;
  item_instance_id: string | null;
  item_template_id: number;
  profile_id: string;
  action: string;
  quantity: number;
  metadata: any;
  created_at: string;
}

export interface Equipment {
  profile_id: string;
  weapon_id: string | null;
  tool_id: string | null;
  helmet_id: string | null;
  chest_id: string | null;
  legs_id: string | null;
  boots_id: string | null;
  gloves_id: string | null;
  shield_id: string | null;
  ring_id: string | null;
  necklace_id: string | null;
  backpack_id: string | null;
  accessory_id: string | null;
  updated_at: string;
}

export interface RegionalEconomy {
  region_id: number;
  region_name?: string;
  population: number;
  employed: number;
  gdp: number;
  tax_reserves: number;
  updated_at: string;
}

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: string;
  region_id?: number | null;
  active: boolean;
  modifiers_json: Record<string, any>;
  duration_ticks: number;
  created_at: string;
}

export interface SimulationLog {
  id: string;
  tick_index: number;
  region_id?: number | null;
  metric_name: string;
  metric_value: number;
  created_at: string;
}

export interface NPCActivityLog {
  id: string;
  region_id?: number | null;
  actor_name: string;
  action: string;
  details: string;
  created_at: string;
}

export interface EnemyTemplate {
  id: number;
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  xp_reward: number;
  currency_reward: number;
  spawn_region_id?: number | null;
  difficulty: 'standard' | 'hard' | 'epic' | 'boss';
  ai_profile: string;
}

export interface EnemyLootRow {
  id: number;
  enemy_template_id: number;
  resource_id?: number | null;
  item_template_id?: number | null;
  chance_percent: number;
  min_qty: number;
  max_qty: number;
}

export interface CombatRoundLog {
  round: number;
  attacker: string;
  defender: string;
  action: 'hit' | 'miss' | 'critical' | 'dodge' | 'block';
  damage: number;
  defender_hp: number;
}

export interface CombatRewardItem {
  type: 'resource' | 'item';
  id: number;
  quantity: number;
  name: string;
}

export interface CombatRanking {
  profile_id: string;
  username: string;
  strength: number;
  level_pve: number;
  pvp_rating: number;
  kills: number;
  deaths: number;
}

export interface PoliticalParty {
  id: number;
  name: string;
  description: string;
  leader_id?: string | null;
  country_id: number;
  created_at: string;
  leader_name?: string;
  members_count?: number;
}

export interface Election {
  id: number;
  country_id: number;
  term_number: number;
  status: 'campaign' | 'voting' | 'completed';
  started_at: string;
  ends_at: string;
}

export interface Candidate {
  election_id: number;
  candidate_id: string;
  party_id?: number | null;
  votes_received: number;
  username?: string;
  party_name?: string;
}

export interface Bill {
  id: number;
  country_id: number;
  creator_id?: string | null;
  title: string;
  description: string;
  type: 'tax_change' | 'budget_transfer' | 'national_project';
  parameters_json: Record<string, any>;
  yes_votes: number;
  no_votes: number;
  status: 'voting' | 'passed' | 'rejected';
  ends_at: string;
  created_at: string;
  creator_name?: string;
}

export interface NationalProject {
  id: number;
  country_id: number;
  name: string;
  description: string;
  cost_local: number;
  progress_percent: number;
  bonuses_json: Record<string, any>;
  created_at: string;
}

export interface War {
  id: number;
  attacker_country_id: number;
  defender_country_id: number;
  status: 'active' | 'ended';
  started_at: string;
  ended_at?: string | null;
  attacker_name?: string;
  defender_name?: string;
}

export interface MilitaryRegion {
  region_id: number;
  owner_country_id: number;
  occupier_country_id: number;
  resistance_level: number;
  supply_status: 'supplied' | 'unsupplied';
  region_name?: string;
  owner_name?: string;
  occupier_name?: string;
}

export interface ArmyUnit {
  id: number;
  country_id: number;
  current_region_id: number;
  size: number;
  morale: number;
  ammo_qty: number;
  rations_qty: number;
  status: 'idle' | 'marching' | 'defending' | 'attacking' | 'sieging' | 'garrisoning';
  created_at: string;
  region_name?: string;
}

export interface SupplyRoute {
  id: number;
  from_region_id: number;
  to_region_id: number;
  status: 'active' | 'blocked';
  bandwidth: number;
  from_region_name?: string;
  to_region_name?: string;
}

export interface PeaceTreaty {
  id: number;
  war_id: number;
  proposer_country_id: number;
  status: 'proposed' | 'accepted' | 'rejected';
  reparations_amount: number;
  territory_transfer_json: number[];
  created_at: string;
  proposer_name?: string;
}

export interface Guild {
  id: number;
  name: string;
  tag: string;
  description?: string | null;
  leader_id?: string | null;
  treasury_local: number;
  treasury_gold: number;
  created_at: string;
  leader_name?: string;
  members_count?: number;
}

export interface GuildRole {
  id: number;
  guild_id: number;
  name: string;
  is_custom: boolean;
  rank_priority: number;
}

export interface GuildPermission {
  role_id: number;
  can_invite: boolean;
  can_kick: boolean;
  can_promote: boolean;
  can_withdraw_funds: boolean;
  can_manage_roles: boolean;
  can_post_announcements: boolean;
}

export interface GuildMember {
  guild_id: number;
  profile_id: string;
  role_id?: number | null;
  joined_at: string;
  username?: string;
  role_name?: string;
}

export interface GuildInventory {
  id: number;
  guild_id: number;
  item_template_id: number;
  quantity: number;
  item_name?: string;
}

export interface GuildApplication {
  id: number;
  guild_id: number;
  profile_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string | null;
  created_at: string;
  username?: string;
  guild_name?: string;
}

export interface GuildInvitation {
  id: number;
  guild_id: number;
  profile_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  guild_name?: string;
  username?: string;
}

export interface GuildWar {
  id: number;
  attacker_guild_id: number;
  defender_guild_id: number;
  status: 'active' | 'ended';
  started_at: string;
  ended_at?: string | null;
  attacker_name?: string;
  defender_name?: string;
}

export interface GuildAlliance {
  id: number;
  guild_id_1: number;
  guild_id_2: number;
  status: 'active' | 'dissolved';
  created_at: string;
  guild_1_name?: string;
  guild_2_name?: string;
}

export interface Coalition {
  id: number;
  name: string;
  description?: string | null;
  founder_guild_id?: number | null;
  created_at: string;
}

export interface CoalitionMember {
  coalition_id: number;
  guild_id: number;
  joined_at: string;
  guild_name?: string;
}

export interface Friendship {
  id: number;
  profile_id_1: string;
  profile_id_2: string;
  status: 'pending' | 'accepted';
  is_favorite: boolean;
  created_at: string;
  friend_name?: string;
  friend_id?: string;
}

export interface PlayerBlock {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  blocked_name?: string;
}

export interface ConversationThread {
  id: number;
  type: 'private' | 'group' | 'guild' | 'coalition' | 'country' | 'trade' | 'system';
  metadata_json: Record<string, any>;
  created_at: string;
  title?: string;
  last_message?: string;
  last_message_at?: string;
}

export interface ConversationParticipant {
  thread_id: number;
  profile_id: string;
  joined_at: string;
}

export interface DirectMessage {
  id: number;
  thread_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  read_by_json: string[];
  sender_name?: string;
}

export interface PlayerMail {
  id: number;
  sender_id?: string | null;
  recipient_id: string;
  subject: string;
  body: string;
  attached_currency: number;
  attached_gold: number;
  attached_item_template_id?: number | null;
  attached_item_qty: number;
  is_read: boolean;
  is_claimed: boolean;
  created_at: string;
  sender_name?: string;
  item_name?: string;
}

export interface PlayerReputation {
  profile_id: string;
  trading_rep: number;
  military_rep: number;
  political_rep: number;
  industrial_rep: number;
  community_rep: number;
  moderation_history: Record<string, any>[];
}

export interface PlayerTitle {
  id: number;
  profile_id: string;
  title: string;
  source: 'military' | 'politics' | 'industrial' | 'event' | 'custom';
  is_equipped: boolean;
  created_at: string;
}

export interface PlayerBadge {
  id: number;
  profile_id: string;
  badge_name: string;
  image_url?: string | null;
  created_at: string;
}

export interface Contract {
  id: number;
  creator_id: string;
  type: 'employment' | 'supply' | 'manufacturing' | 'military' | 'transportation' | 'government' | 'custom';
  terms_json: Record<string, any>;
  escrow_local: number;
  escrow_gold: number;
  deadline?: string | null;
  status: 'offered' | 'active' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  creator_name?: string;
  acceptor_id?: string | null;
  acceptor_name?: string | null;
}

export interface ContractOffer {
  id: number;
  contract_id: number;
  target_profile_id?: string | null;
  target_guild_id?: number | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface ContractExecution {
  id: number;
  contract_id: number;
  actor_id?: string | null;
  action_type: string;
  details?: string | null;
  created_at: string;
}

export interface RecruitmentPost {
  id: number;
  creator_id: string;
  target_type: 'guild' | 'company' | 'military' | 'politics' | 'volunteer';
  target_id?: number | null;
  title: string;
  description: string;
  requirements_json: Record<string, any>;
  created_at: string;
  creator_name?: string;
  target_name?: string;
}

export interface Newspaper {
  id: number;
  name: string;
  description?: string | null;
  owner_id?: string | null;
  created_at: string;
  owner_name?: string;
}

export interface Article {
  id: number;
  newspaper_id: number;
  author_id: string;
  title: string;
  content: string;
  category: 'news' | 'opinion' | 'government' | 'developer';
  ratings_score: number;
  created_at: string;
  author_name?: string;
  newspaper_name?: string;
}

export interface ArticleComment {
  id: number;
  article_id: number;
  commenter_id: string;
  comment: string;
  created_at: string;
  commenter_name?: string;
}

export interface Announcement {
  id: number;
  sender_type: 'system' | 'government' | 'guild' | 'coalition';
  sender_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  type: 'election' | 'war' | 'production' | 'guild' | 'developer' | 'seasonal' | 'maintenance' | 'personal';
  starts_at: string;
  ends_at?: string | null;
  created_at: string;
}

export interface CommunityLog {
  id: number;
  guild_id?: number | null;
  profile_id?: string | null;
  action: string;
  details?: string | null;
  created_at: string;
}

/*──────────────────────────── Phase 5: Dynasties, Kingdom Leadership, and Succession ────────────────────────────*/

export interface NobleHouse {
  id: number;
  name: string; // e.g. "House of York", "House of Wittelsbach", "House of Osman"
  culture: 'european' | 'middle_eastern' | 'asian' | 'steppe' | 'other';
  coat_of_arms?: string; // URL or heraldic description
  founded_at: string;
  motto?: string;
  is_extant: boolean; // whether the house still exists
}

export interface DynastyMember {
  id: number;
  profile_id: string;
  name: string;
  title: 'King' | 'Queen' | 'Heir' | ' Regent' | 'Lord' | 'Lady' | 'Councilor' | 'Knight';
  relationship: 'founder' | 'spouse' | 'child' | 'sibling' | 'cousin' | 'other';
  succession_order: number; // lower = higher priority
  is_alive: boolean;
  date_of_death?: string | null;
  date_of_birth?: string | null;
  notes?: string;
  dynasty_id: number; // references Dynasty.id
}

export interface Dynasty {
  id: number;
  name: string; // e.g. "House of York Dynasty"
  noble_house_id: number; // references NobleHouse.id
  founder_profile_id: string;
  founder_title: 'King' | 'Queen' | 'Sultan' | 'Shah' | 'Khagan';
  country_id: number; // ruling kingdom
  founded_at: string;
  capital_region_id: number;
  succession_law: 'hereditary' | 'elective' | 'appointed';
  is_active: boolean;
  member_count: number;
  total_prestige: number;
  members: DynastyMember[];
  historical_rulers: DynastyRulerRecord[];
}

export interface DynastyRulerRecord {
  rule_id: number;
  ruler_profile_id: string;
  title: 'King' | 'Queen' | 'Sultan' | 'Shah' | 'Khagan';
  ascended_at: string;
  abdicated_at?: string | null;
  deceased_at?: string | null;
  legitimacy: number; // 0-100, influences stability
  dynasty_prestige_gain: number; // prestige added during reign
  notes?: string;
}

export interface RulerLegitimacy {
  profile_id: string;
  legitimacy: number; // 0-100
  last_validated_at: string;
  legitimacy_reasons: 'heir_clear' | 'election_verified' | 'appointment_confirmed' | 'usurpation' | 'disputed';
  last_succession_event?: string | null;
}

export interface KingdomStability {
  country_id: number;
  stability: number; // 0-100, influences rebellion chance, tax efficiency, military effectiveness
  legitimacy_modifier: number; // derived from ruler legitimacy
  dynasty_prestige_modifier: number; // derived from dynasty prestige
  last_checked_at: string;
  notes?: string;
}

/*──────────────────────────── Phase 12 Launch & Live Ops structures ────────────────────────────*/

export interface LiveOpsConfig {
  id: number;
  emergency_shutdown: boolean;
  maintenance_mode: boolean;
  resource_multiplier: number;
  xp_multiplier: number;
  drop_rate_multiplier: number;
  tax_limit_multiplier: number;
  active_season_id?: number | null;
  updated_at: string;
}

export interface GlobalBuff {
  id: number;
  title: string;
  type: 'buff' | 'debuff';
  multiplier: number;
  starts_at: string;
  ends_at: string;
}

export interface ScheduledRestart {
  id: number;
  restart_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  performed_by?: string | null;
}

export interface ModerationAction {
  id: number;
  profile_id: string;
  action_type: 'warn' | 'mute' | 'temp_ban' | 'perm_ban';
  reason: string;
  ends_at?: string | null;
  moderator_id: string;
  appeal_status: 'none' | 'pending' | 'approved' | 'rejected';
  appeal_notes?: string | null;
  created_at: string;
  username?: string;
  moderator_name?: string;
}

export interface PlayerReport {
  id: number;
  reporter_id: string;
  reported_id: string;
  category: 'spam' | 'harassment' | 'exploit' | 'botting' | 'other';
  details: string;
  status: 'open' | 'investigating' | 'resolved';
  moderator_notes?: string | null;
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
}

export interface SupportTicket {
  id: number;
  profile_id: string;
  category: 'bug' | 'appeal' | 'payment' | 'account' | 'exploit' | 'gameplay';
  subject: string;
  details: string;
  status: 'open' | 'escalated' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  assigned_to?: string | null;
  created_at: string;
  username?: string;
}

export interface TicketReply {
  id: number;
  ticket_id: number;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  sender_name?: string;
}

export interface SystemMetric {
  timestamp: string;
  metric_name: string;
  metric_value: number;
  dimensions_json?: any;
}

export interface DailyActiveUser {
  date: string;
  dau: number;
  mau: number;
  retention_rate: number;
  average_playtime_minutes: number;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  category: 'tutorial' | 'daily' | 'weekly' | 'seasonal' | 'story';
  rewards_json: any;
  requirements_json: any;
  is_active: boolean;
}

export interface PlayerQuest {
  profile_id: string;
  quest_id: number;
  status: 'active' | 'completed';
  progress_json: any;
  updated_at: string;
  title?: string;
  description?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  category: 'combat' | 'economy' | 'politics' | 'industry' | 'guilds';
  points: number;
  requirements_json: any;
}

export interface PlayerAchievement {
  profile_id: string;
  achievement_id: number;
  unlocked_at: string;
  title?: string;
  description?: string;
  points?: number;
}

export interface Season {
  id: number;
  number: number;
  title: string;
  start_date: string;
  end_date: string;
  reward_cosmetic_template_id?: number | null;
  status: 'active' | 'concluded';
}

export interface SeasonLeaderboard {
  season_id: number;
  profile_id: string;
  score: number;
  rank?: number | null;
  username?: string;
}

export interface FeatureFlag {
  id: number;
  name: string;
  description?: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  rules_json?: any;
}

export interface DeveloperKey {
  id: number;
  profile_id: string;
  api_key_hash: string;
  label?: string | null;
  rate_limit_per_min: number;
  is_active: boolean;
  created_at: string;
}

/*──────────────────────────── Phase 2: Deterministic Simulation Kernel ────────────────────────────*/

export interface SimulationTick {
  tick_id: number;
  world_id: string;
  ruleset_version: string;
  seed: number;
  status: 'pending' | 'applied' | 'failed' | 'skipped';
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
}

export interface SimulationCommand {
  command_id: string;
  idempotency_key: string;
  actor_id: string;
  command_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'applied' | 'rejected' | 'skipped';
  applied_tick_id?: number | null;
  error_message?: string | null;
  created_at: string;
  applied_at?: string | null;
}

export interface OutboxEvent {
  event_id: number;
  tick_id: number;
  seq: number;
  event_type: string;
  payload: Record<string, any>;
  published: boolean;
  published_at?: string | null;
  created_at: string;
}

export interface SimulationRuleset {
  id: string;
  version: string;
  seed: number;
  energy_regen_per_tick: number;
  energy_regen_interval_seconds: number;
  tick_interval_seconds: number;
  travel_domestic_cost: number;
  travel_international_cost: number;
  max_energy: number;
  combat_health_cost: number;
  combat_energy_cost: number;
  production_points_per_tick: number;
  created_at: string;
}

export interface SimulationCommandInput {
  idempotency_key: string;
  command_type: string;
  payload: Record<string, any>;
}

export interface SimulationCommandResult {
  success: boolean;
  command_id?: string | null;
  applied_tick_id?: number | null;
  error?: string | null;
  events?: OutboxEvent[];
  newEnergy?: number | null;
  victory?: boolean | null;
}

/* Region types for the medieval map */
export interface RegionEdge {
  id: number;
  from_region_id: number;
  to_region_id: number;
  mode: 'land' | 'mountain_pass' | 'navigable_sea' | 'strait';
  cost: number;
  seasonal_restrictions: string[];
  is_reciprocal: boolean;
}

export interface RegionGeography {
  region_id: number;
  code?: string;
  terrain: 'plains' | 'forest' | 'mountain' | 'desert' | 'coastal' | 'marine' | 'volcanic' | 'island';
  climate: 'arid' | 'temperate' | 'mediterranean' | 'continental' | 'marine' | 'tropical';
  culture: string;
  development: number;
  capital: boolean;
  is_port: boolean;
  geometry_ref?: string | null;
  display_name_local?: string | null;
  created_at: string;
}



