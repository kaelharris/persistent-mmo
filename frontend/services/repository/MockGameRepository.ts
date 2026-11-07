import { IGameRepository } from './IGameRepository';
import {
  Profile,
  PlayerStats,
  Currencies,
  Region,
  Country,
  InventoryItem,
  ItemTemplate,
  Company,
  JobOffer,
  Battle,
  AuditLog,
  Resource,
  ResourceSpawn,
  PlayerResource,
  EnergyHistory,
  GatherLog,
  ExperienceThreshold,
  CompanyTemplate,
  RegionEdge,
  CompanyMember,
  CompanyVault,
  CompanyInventoryItem,
  CompanyJob,
  ProductionRecipe,
  ProductionInput,
  CompanyProductionQueue,
  CompanyMachine,
  CompanyLog,
  MarketListing,
  MarketOrder,
  MarketTransaction,
  MarketNotification,
  WatchlistItem,
  PriceAlert,
  MarketEscrow,
  ItemRecipe,
  ItemBlueprint,
  ItemHistory,
  Equipment,
  ItemInstance,
  RegionalEconomy,
  WorldEvent,
  SimulationLog,
  NPCActivityLog,
  EnemyTemplate,
  CombatRoundLog,
  CombatRewardItem,
  CombatRanking,
  PoliticalParty,
  Election,
  Candidate,
  Bill,
  NationalProject,
  GovernmentTerm,
  War,
  MilitaryRegion,
  ArmyUnit,
  SupplyRoute,
  PeaceTreaty,
  Guild,
  GuildRole,
  GuildPermission,
  GuildMember,
  GuildInventory,
  GuildApplication,
  GuildInvitation,
  GuildWar,
  GuildAlliance,
  Coalition,
  CoalitionMember,
  Friendship,
  PlayerBlock,
  ConversationThread,
  ConversationParticipant,
  DirectMessage,
  PlayerMail,
  PlayerReputation,
  PlayerTitle,
  PlayerBadge,
  Contract,
  ContractOffer,
  ContractExecution,
  RecruitmentPost,
  Newspaper,
  Article,
  ArticleComment,
  Announcement,
  CalendarEvent,
  CommunityLog,
  LiveOpsConfig,
  GlobalBuff,
  ScheduledRestart,
  ModerationAction,
  PlayerReport,
  SupportTicket,
  TicketReply,
  SystemMetric,
  DailyActiveUser,
  Quest,
  PlayerQuest,
  Achievement,
  PlayerAchievement,
  Season,
  SeasonLeaderboard,
  FeatureFlag,
  DeveloperKey,
  NobleHouse,
  Dynasty,
  DynastyMember,
  RulerLegitimacy,
  KingdomStability,
  PlayerCharacter,
  ProfessionId,
  MilitaryBattleReport,
} from '../../types/entities';

// Default static lists
const DEFAULT_COUNTRIES: Country[] = [
  { id: 1, name: 'Taifa of Qurtuba', gold_reserve: 5000.0, local_currency_reserve: 500000.0, vat_rate: 10.0, import_tax_rate: 10.0, income_tax_rate: 10.0, created_at: new Date().toISOString() },
  { id: 2, name: 'Taifa of Ishbiliya', gold_reserve: 8000.0, local_currency_reserve: 800000.0, vat_rate: 12.0, import_tax_rate: 15.0, income_tax_rate: 8.0, created_at: new Date().toISOString() },
  { id: 3, name: 'Taifa of Gharnata', gold_reserve: 4000.0, local_currency_reserve: 400000.0, vat_rate: 8.0, import_tax_rate: 8.0, income_tax_rate: 12.0, created_at: new Date().toISOString() },
  { id: 4, name: 'Taifa of Tulaytula', gold_reserve: 4500.0, local_currency_reserve: 450000.0, vat_rate: 9.0, import_tax_rate: 10.0, income_tax_rate: 10.0, created_at: new Date().toISOString() },
  { id: 5, name: 'Taifa of Saragusta', gold_reserve: 6000.0, local_currency_reserve: 600000.0, vat_rate: 11.0, import_tax_rate: 12.0, income_tax_rate: 9.0, created_at: new Date().toISOString() },
  { id: 6, name: 'Taifa of Balansiya', gold_reserve: 5500.0, local_currency_reserve: 550000.0, vat_rate: 10.0, import_tax_rate: 11.0, income_tax_rate: 10.0, created_at: new Date().toISOString() },
  { id: 7, name: 'Taifa of Almiriya', gold_reserve: 4800.0, local_currency_reserve: 480000.0, vat_rate: 9.5, import_tax_rate: 10.0, income_tax_rate: 10.0, created_at: new Date().toISOString() },
  { id: 8, name: 'Kingdom of León', gold_reserve: 7000.0, local_currency_reserve: 700000.0, vat_rate: 10.0, import_tax_rate: 12.0, income_tax_rate: 10.0, created_at: new Date().toISOString() },
  { id: 9, name: 'Kingdom of Navarre', gold_reserve: 5200.0, local_currency_reserve: 520000.0, vat_rate: 9.0, import_tax_rate: 10.0, income_tax_rate: 9.0, created_at: new Date().toISOString() },
  { id: 10, name: 'County of Barcelona', gold_reserve: 6500.0, local_currency_reserve: 650000.0, vat_rate: 11.5, import_tax_rate: 14.0, income_tax_rate: 10.0, created_at: new Date().toISOString() },
];

let DEFAULT_REGIONS: Region[] = [
  { id: 1, name: 'Qurtuba', country_id: 1, climate: 'temperate', population: 1200, production_bonus: 1.00, travel_cost: 10, travel_cooldown: 60, created_at: new Date().toISOString() },
  { id: 2, name: 'Jayyan', country_id: 1, climate: 'temperate', population: 300, production_bonus: 1.20, travel_cost: 10, travel_cooldown: 60, created_at: new Date().toISOString() },
  { id: 3, name: 'Tulaytula', country_id: 1, climate: 'rocky', population: 150, production_bonus: 1.15, travel_cost: 12, travel_cooldown: 90, created_at: new Date().toISOString() },
  { id: 4, name: 'Qadiz', country_id: 2, climate: 'marine', population: 50, production_bonus: 1.05, travel_cost: 15, travel_cooldown: 120, created_at: new Date().toISOString() },
  { id: 5, name: 'Saragusta', country_id: 2, climate: 'cold', population: 850, production_bonus: 1.10, travel_cost: 10, travel_cooldown: 60, created_at: new Date().toISOString() },
  { id: 6, name: 'Ishbiliya', country_id: 2, climate: 'coastal', population: 400, production_bonus: 1.00, travel_cost: 12, travel_cooldown: 90, created_at: new Date().toISOString() },
  { id: 7, name: 'Sierra Nevada', country_id: 3, climate: 'volcanic', population: 120, production_bonus: 1.35, travel_cost: 18, travel_cooldown: 180, created_at: new Date().toISOString() },
  { id: 8, name: 'Gharnata', country_id: 3, climate: 'lush', population: 700, production_bonus: 1.25, travel_cost: 10, travel_cooldown: 60, created_at: new Date().toISOString() },
  { id: 9, name: 'Almiriya', country_id: 3, climate: 'arid', population: 180, production_bonus: 1.10, travel_cost: 14, travel_cooldown: 100, created_at: new Date().toISOString() },
  { id: 10, name: 'Balansiya', country_id: 3, climate: 'forest', population: 280, production_bonus: 1.15, travel_cost: 11, travel_cooldown: 75, created_at: new Date().toISOString() },
];

let DEFAULT_ITEM_TEMPLATES: ItemTemplate[] = [
  { id: 1, category_id: 3, name: 'Wheat Bread', description: 'Crispy oven-baked loaf. Restores 10 energy.', type: 'food', base_value: 5, weight: 0.10, max_durability: 0, rarity: 'common', attributes: { 'energy_restore': 10 } },
  { id: 2, category_id: 6, name: 'Iron Sword', description: 'Standard-issue military sword.', type: 'weapon', base_value: 50, weight: 2.50, max_durability: 100, rarity: 'common', attributes: { 'attack': 20 } },
  { id: 3, category_id: 16, name: 'Travel Ticket', description: 'Genesis Airlines inter-country single-use pass.', type: 'ticket', base_value: 20, weight: 0.01, max_durability: 0, rarity: 'common' },
  { id: 4, category_id: 9, name: 'Iron Plate Helm', description: 'Heavy iron defense crown.', type: 'helmet', base_value: 35, weight: 1.80, max_durability: 120, rarity: 'common', attributes: { 'defense': 8 } },
  { id: 5, category_id: 7, name: 'Iron Plate Chest', description: 'Full body protective iron coating.', type: 'armor', base_value: 90, weight: 5.00, max_durability: 150, rarity: 'common', attributes: { 'defense': 25 } },
  { id: 6, category_id: 10, name: 'Leather Boots', description: 'Soft leather speed shoes.', type: 'boots', base_value: 25, weight: 0.90, max_durability: 80, rarity: 'common', attributes: { 'speed': 0.05 } },
  { id: 7, category_id: 13, name: 'Steel Pickaxe', description: 'Advanced mining pick improving harvest speeds.', type: 'tool', base_value: 60, weight: 3.00, max_durability: 200, rarity: 'uncommon', attributes: { 'mining_bonus': 0.15 } },
];

const DEFAULT_BATTLES: Battle[] = [
  {
    id: 'b-1',
    region_id: 7,
    region_name: 'Rust Coast',
    attacker_country_id: 1,
    defender_country_id: 2,
    attacker_score: 120500,
    defender_score: 145000,
    status: 'active',
    end_time: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

// Phase 2 Resources list (Extended with Phase 4 Refined resources)
const DEFAULT_RESOURCES: Resource[] = [
  { id: 1, name: 'Wood', icon: 'Trees', description: 'Raw timber harvested from forestry areas.', rarity: 'common', category: 'raw', weight: 0.20, base_value: 1.5, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Stone', icon: 'Gem', description: 'Sturdy rock mined from quarries.', rarity: 'common', category: 'raw', weight: 0.50, base_value: 1.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Iron Ore', icon: 'Hammer', description: 'Dense reddish rock containing unrefined iron.', rarity: 'common', category: 'raw', weight: 0.80, base_value: 4.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 4, name: 'Coal', icon: 'Flame', description: 'Fossil fuels used to smelt ores.', rarity: 'common', category: 'raw', weight: 0.40, base_value: 2.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 5, name: 'Grain', icon: 'Wheat', description: 'Grown fields processed into food supplies.', rarity: 'common', category: 'raw', weight: 0.15, base_value: 1.2, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 6, name: 'Fish', icon: 'Fish', description: 'Freshwater catch for dietary needs.', rarity: 'common', category: 'raw', weight: 0.25, base_value: 2.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 7, name: 'Water', icon: 'Droplet', description: 'Filtered liquid resource.', rarity: 'common', category: 'raw', weight: 0.10, base_value: 0.5, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 8, name: 'Oil', icon: 'Container', description: 'Unrefined petroleum pumped from reserves.', rarity: 'uncommon', category: 'raw', weight: 0.60, base_value: 8.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 9, name: 'Copper', icon: 'Hammer', description: 'Soft metal ore for wiring and alloys.', rarity: 'common', category: 'raw', weight: 0.50, base_value: 3.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 10, name: 'Cotton', icon: 'Scissors', description: 'Plant fibers gathered for textile looms.', rarity: 'common', category: 'raw', weight: 0.10, base_value: 1.8, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  // Phase 4 Refined Resources
  { id: 11, name: 'Steel', icon: 'Hammer', description: 'High-strength refined alloy for weapons and structures.', rarity: 'uncommon', category: 'refined', weight: 1.00, base_value: 15.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 12, name: 'Fabric', icon: 'Scissors', description: 'Woven textiles used to manufacture apparel.', rarity: 'common', category: 'refined', weight: 0.20, base_value: 10.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 13, name: 'Fuel', icon: 'Container', description: 'Distilled liquid hydrocarbon to power generators.', rarity: 'uncommon', category: 'refined', weight: 0.50, base_value: 12.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
  { id: 14, name: 'Bread', icon: 'Wheat', description: 'Baked wheat loaf which restores energy.', rarity: 'common', category: 'refined', weight: 0.15, base_value: 5.0, stack_limit: 999, enabled: true, created_at: new Date().toISOString() },
];

let DEFAULT_RESOURCE_SPAWNS: ResourceSpawn[] = [
  { region_id: 2, resource_id: 1, spawn_weight: 1.20, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 2, resource_id: 7, spawn_weight: 1.00, energy_cost: 5, production_time: 2, experience_reward: 5 },
  { region_id: 2, resource_id: 5, spawn_weight: 0.80, energy_cost: 12, production_time: 5, experience_reward: 12 },
  { region_id: 3, resource_id: 2, spawn_weight: 1.30, energy_cost: 12, production_time: 5, experience_reward: 12 },
  { region_id: 3, resource_id: 9, spawn_weight: 0.90, energy_cost: 15, production_time: 6, experience_reward: 15 },
  { region_id: 3, resource_id: 4, spawn_weight: 1.00, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 4, resource_id: 6, spawn_weight: 1.50, energy_cost: 15, production_time: 6, experience_reward: 15 },
  { region_id: 4, resource_id: 7, spawn_weight: 1.10, energy_cost: 5, production_time: 2, experience_reward: 5 },
  { region_id: 5, resource_id: 3, spawn_weight: 1.40, energy_cost: 15, production_time: 6, experience_reward: 15 },
  { region_id: 5, resource_id: 4, spawn_weight: 1.10, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 6, resource_id: 6, spawn_weight: 1.10, energy_cost: 12, production_time: 5, experience_reward: 12 },
  { region_id: 6, resource_id: 2, spawn_weight: 1.00, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 7, resource_id: 9, spawn_weight: 1.20, energy_cost: 15, production_time: 6, experience_reward: 15 },
  { region_id: 7, resource_id: 3, spawn_weight: 1.10, energy_cost: 18, production_time: 7, experience_reward: 18 },
  { region_id: 7, resource_id: 2, spawn_weight: 0.80, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 8, resource_id: 5, spawn_weight: 1.40, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 8, resource_id: 10, spawn_weight: 1.20, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 8, resource_id: 7, spawn_weight: 0.90, energy_cost: 5, production_time: 2, experience_reward: 5 },
  { region_id: 9, resource_id: 8, spawn_weight: 1.30, energy_cost: 20, production_time: 8, experience_reward: 25 },
  { region_id: 9, resource_id: 4, spawn_weight: 0.90, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 10, resource_id: 1, spawn_weight: 1.30, energy_cost: 10, production_time: 4, experience_reward: 10 },
  { region_id: 10, resource_id: 6, spawn_weight: 0.90, energy_cost: 12, production_time: 5, experience_reward: 12 },
  { region_id: 10, resource_id: 10, spawn_weight: 0.80, energy_cost: 10, production_time: 4, experience_reward: 10 }
];

const DEFAULT_EXP_THRESHOLDS: ExperienceThreshold[] = Array.from({ length: 100 }, (_, i) => {
  const lvl = i + 1;
  return { level: lvl, required_experience: lvl * lvl * 100 };
});

// Phase 4 Static Corporate seeds
let DEFAULT_COMPANY_TEMPLATES: CompanyTemplate[] = [
  { id: 1, name: 'Wood Camp', description: 'Harvests logs from nearby forestry areas.', cost_gold: 0.00, cost_local: 100.00, is_raw_camp: true, output_resource_id: 1, created_at: new Date().toISOString() },
  { id: 2, name: 'Stone Quarry', description: 'Extracts stone blocks from rock walls.', cost_gold: 0.00, cost_local: 100.00, is_raw_camp: true, output_resource_id: 2, created_at: new Date().toISOString() },
  { id: 3, name: 'Iron Mine', description: 'Digs deep tunnels to harvest unrefined iron ore.', cost_gold: 0.00, cost_local: 150.00, is_raw_camp: true, output_resource_id: 3, created_at: new Date().toISOString() },
  { id: 4, name: 'Coal Mine', description: 'Extracts carbon veins to fire smelters.', cost_gold: 0.00, cost_local: 150.00, is_raw_camp: true, output_resource_id: 4, created_at: new Date().toISOString() },
  { id: 5, name: 'Grain Farm', description: 'Grows organic wheat grain stocks.', cost_gold: 0.00, cost_local: 100.00, is_raw_camp: true, output_resource_id: 5, created_at: new Date().toISOString() },
  { id: 6, name: 'Fishing Company', description: 'Nets freshwater catches in marine blocks.', cost_gold: 0.00, cost_local: 120.00, is_raw_camp: true, output_resource_id: 6, created_at: new Date().toISOString() },
  { id: 7, name: 'Water Plant', description: 'Purifies raw water stocks.', cost_gold: 0.00, cost_local: 80.00, is_raw_camp: true, output_resource_id: 7, created_at: new Date().toISOString() },
  { id: 8, name: 'Oil Refinery', description: 'Pumps crude oil from deposits.', cost_gold: 0.00, cost_local: 250.00, is_raw_camp: true, output_resource_id: 8, created_at: new Date().toISOString() },
  { id: 9, name: 'Copper Mine', description: 'Harvests copper ore chunks.', cost_gold: 0.00, cost_local: 150.00, is_raw_camp: true, output_resource_id: 9, created_at: new Date().toISOString() },
  { id: 10, name: 'Textile Mill', description: 'Harvests plant cotton fibers.', cost_gold: 0.00, cost_local: 120.00, is_raw_camp: true, output_resource_id: 10, created_at: new Date().toISOString() },
  { id: 11, name: 'Steel Factory', description: 'Smelts iron ore and coal into structural steel plates.', cost_gold: 1.00, cost_local: 500.00, is_raw_camp: false, output_resource_id: 11, created_at: new Date().toISOString() },
  { id: 12, name: 'Textile Factory', description: 'Weaves cotton and water into commercial fabric bolts.', cost_gold: 0.00, cost_local: 350.00, is_raw_camp: false, output_resource_id: 12, created_at: new Date().toISOString() },
  { id: 13, name: 'Fuel Distillery', description: 'Refines petroleum and coal into fuel cylinders.', cost_gold: 1.00, cost_local: 450.00, is_raw_camp: false, output_resource_id: 13, created_at: new Date().toISOString() },
  { id: 14, name: 'Bakery', description: 'Bakes bread loaves using grain, water, and coal.', cost_gold: 0.00, cost_local: 300.00, is_raw_camp: false, output_resource_id: 14, created_at: new Date().toISOString() },
];

// Generate Phase 13 closed alpha mock content programmatically
function generateClosedAlphaMockContent() {
  // Generate 20 new regions (11 to 30)
  for (let i = 11; i <= 30; i++) {
    const climate = i % 3 === 0 ? 'cold' : i % 3 === 1 ? 'lush' : 'rocky';
    const name = i % 3 === 0 ? `Frosty Vale ${i}` : i % 3 === 1 ? `Golden Meadows ${i}` : `Shadow Peak ${i}`;
    DEFAULT_REGIONS.push({
      id: i,
      name,
      country_id: (i % 3) + 1,
      climate,
      population: 100 + i * 10,
      production_bonus: 1.0 + (i % 5) * 0.05,
      travel_cost: 10 + (i % 10),
      travel_cooldown: 60 + (i % 5) * 15,
      created_at: new Date().toISOString()
    });

    // Spawn raw resources in this region
    for (let resId = 1; resId <= 10; resId++) {
      DEFAULT_RESOURCE_SPAWNS.push({
        region_id: i,
        resource_id: resId,
        spawn_weight: 50 + (i % 5) * 10,
        energy_cost: 5 + (resId % 3),
        production_time: 10 + (resId % 2) * 5,
        experience_reward: 10 + (resId % 2) * 10
      });
    }
  }

  // Generate 6 company templates (15 to 20)
  const extraComps = [
    { id: 15, name: 'Brewery', description: 'Crafts fine beverages.', cost_gold: 0, cost_local: 400, is_raw_camp: false, output_resource_id: null },
    { id: 16, name: 'Toolsmith', description: 'Crafts pickaxes.', cost_gold: 2, cost_local: 600, is_raw_camp: false, output_resource_id: null },
    { id: 17, name: 'Armory', description: 'Crafts shields.', cost_gold: 5, cost_local: 800, is_raw_camp: false, output_resource_id: null },
    { id: 18, name: 'Weaponsmith', description: 'Smelts swords.', cost_gold: 5, cost_local: 900, is_raw_camp: false, output_resource_id: null },
    { id: 19, name: 'Fletcher', description: 'Bows.', cost_gold: 1, cost_local: 300, is_raw_camp: false, output_resource_id: null },
    { id: 20, name: 'Alchemist Lab', description: 'Brews potions.', cost_gold: 2, cost_local: 500, is_raw_camp: false, output_resource_id: null }
  ];
  for (const ec of extraComps) {
    DEFAULT_COMPANY_TEMPLATES.push({
      ...ec,
      created_at: new Date().toISOString()
    } as any);
  }

  // Generate 400 item templates (IDs 10 to 409)
  let itemId = 10;
  const materials = ['Bronze', 'Iron', 'Steel', 'Cobalt', 'Titanium', 'Mithril', 'Orichalcum', 'Obsidian'];
  const types = ['weapon', 'shield', 'helmet', 'armor', 'boots', 'tool', 'food'];
  const categories = [6, 8, 9, 7, 10, 13, 3];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  for (const mat of materials) {
    for (let t = 0; t < types.length; t++) {
      const type = types[t];
      const category = categories[t];

      for (const rarity of rarities) {
        if (itemId >= 410) break;

        const baseName = type === 'weapon' ? 'Sword' : type === 'shield' ? 'Shield' : type === 'helmet' ? 'Helmet' : type === 'armor' ? 'Chestplate' : type === 'boots' ? 'Boots' : type === 'tool' ? 'Pickaxe' : 'Ration';
        const name = `${mat} ${baseName}${rarity !== 'common' ? ` (${rarity.toUpperCase()})` : ''}`;
        const baseValue = (materials.indexOf(mat) + 1) * 20 + (rarities.indexOf(rarity) + 1) * 15 + (t + 1) * 5;
        const maxDurability = type === 'food' ? 0 : 100 + (materials.indexOf(mat) + 1) * 20 + (rarities.indexOf(rarity) + 1) * 10;

        DEFAULT_ITEM_TEMPLATES.push({
          id: itemId,
          category_id: category,
          name,
          description: `A reliable ${mat.toLowerCase()} ${type} of ${rarity} quality.`,
          type: type as any,
          base_value: baseValue,
          weight: 0.5 + (t + 1) * 0.4,
          max_durability: maxDurability,
          rarity: rarity as any,
          attributes: {
            [type === 'weapon' ? 'attack' : type === 'boots' ? 'speed' : type === 'tool' ? 'mining_bonus' : type === 'food' ? 'energy_restore' : 'defense']: (materials.indexOf(mat) + 1) * 10 + (rarities.indexOf(rarity) + 1) * 5
          }
        });
        itemId++;
      }
      if (itemId >= 410) break;
    }
    if (itemId >= 410) break;
  }
}
generateClosedAlphaMockContent();

const DEFAULT_PRODUCTION_RECIPES: ProductionRecipe[] = [
  { id: 1, name: 'Bake Bread', description: 'Bakes raw grain, water, and coal into standard wheat bread loaves.', output_resource_id: 14, output_quantity: 1, base_production_time: 5, experience_reward: 15, enabled: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Smelt Steel', description: 'Smelts raw iron ore with coal fuel into carbon steel rods.', output_resource_id: 11, output_quantity: 1, base_production_time: 8, experience_reward: 25, enabled: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Weave Fabric', description: 'Spins cotton crop fibers and water on looms into fabric bolts.', output_resource_id: 12, output_quantity: 1, base_production_time: 5, experience_reward: 12, enabled: true, created_at: new Date().toISOString() },
  { id: 4, name: 'Distill Fuel', description: 'Distills raw oil reserves with coal into refined fuels.', output_resource_id: 13, output_quantity: 1, base_production_time: 10, experience_reward: 30, enabled: true, created_at: new Date().toISOString() },
];

const DEFAULT_PRODUCTION_INPUTS: ProductionInput[] = [
  { recipe_id: 1, resource_id: 5, quantity: 2 }, // Bread needs 2 Grain
  { recipe_id: 1, resource_id: 7, quantity: 1 }, // Bread needs 1 Water
  { recipe_id: 1, resource_id: 4, quantity: 1 }, // Bread needs 1 Coal
  
  { recipe_id: 2, resource_id: 3, quantity: 2 }, // Steel needs 2 Iron Ore
  { recipe_id: 2, resource_id: 4, quantity: 1 }, // Steel needs 1 Coal
  
  { recipe_id: 3, resource_id: 10, quantity: 3 }, // Fabric needs 3 Cotton
  { recipe_id: 3, resource_id: 7, quantity: 1 },  // Fabric needs 1 Water
  
  { recipe_id: 4, resource_id: 8, quantity: 2 }, // Fuel needs 2 Oil
  { recipe_id: 4, resource_id: 4, quantity: 1 },  // Fuel needs 1 Coal
];


export class MockGameRepository implements IGameRepository {
  
  // Storage Helpers
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  public setStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getSessionUserId(): string {
    if (typeof window === 'undefined') return 'player_1';
    try { return localStorage.getItem('mmo_auth_session') || 'player_1'; } catch { return 'player_1'; }
  }

  private npcName(id: string): string | undefined {
    const map: Record<string, string> = {
      npc_miller: 'Miller Tom',
      npc_smith: 'Smith Bruna',
      npc_fisher: 'Fisher Elian',
      npc_miner: 'Miner Katal',
      npc_carver: 'Carver Simone',
      npc_herbalist: 'Herbalist Ana',
    };
    return map[id];
  }

  // Lifecycle & Initializer
  private ensureInitialized(userId: string) {
    if (typeof window === 'undefined') return;
    
    // Profiles
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    if (!profiles[userId]) {
      const users = this.getStorageItem<any[]>('mmo_auth_users', []);
      const user = users.find((u) => u.id === userId);
      const username = user ? user.username : 'player_' + userId.substring(0, 5);

      profiles[userId] = {
        id: userId,
        username,
        citizenship_country_id: 1,
        current_region_id: 1, // Start in Genesis Capital
        role: 'player',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.setStorageItem('mmo_profiles', profiles);
    }

    // Region edges graph for strategic movement — connected graph across the ten core provinces
    const regionEdges = this.getStorageItem<RegionEdge[]>('mmo_region_edges', []);
    if (regionEdges.length < 15) {
      this.setStorageItem('mmo_region_edges', [
        { id: 1, from_region_id: 1, to_region_id: 2, mode: 'land', cost: 10, seasonal_restrictions: [], is_reciprocal: true },
        { id: 2, from_region_id: 2, to_region_id: 3, mode: 'land', cost: 14, seasonal_restrictions: [], is_reciprocal: true },
        { id: 3, from_region_id: 1, to_region_id: 6, mode: 'land', cost: 12, seasonal_restrictions: [], is_reciprocal: true },
        { id: 4, from_region_id: 6, to_region_id: 4, mode: 'land', cost: 12, seasonal_restrictions: [], is_reciprocal: true },
        { id: 5, from_region_id: 1, to_region_id: 8, mode: 'land', cost: 14, seasonal_restrictions: [], is_reciprocal: true },
        { id: 6, from_region_id: 8, to_region_id: 7, mode: 'mountain_pass', cost: 12, seasonal_restrictions: ['winter'], is_reciprocal: true },
        { id: 7, from_region_id: 8, to_region_id: 9, mode: 'land', cost: 12, seasonal_restrictions: [], is_reciprocal: true },
        { id: 8, from_region_id: 9, to_region_id: 10, mode: 'land', cost: 14, seasonal_restrictions: [], is_reciprocal: true },
        { id: 9, from_region_id: 10, to_region_id: 5, mode: 'land', cost: 16, seasonal_restrictions: [], is_reciprocal: true },
        { id: 10, from_region_id: 5, to_region_id: 3, mode: 'land', cost: 15, seasonal_restrictions: [], is_reciprocal: true },
        { id: 11, from_region_id: 2, to_region_id: 8, mode: 'land', cost: 13, seasonal_restrictions: [], is_reciprocal: true },
        { id: 12, from_region_id: 2, to_region_id: 6, mode: 'land', cost: 14, seasonal_restrictions: [], is_reciprocal: true },
        { id: 13, from_region_id: 3, to_region_id: 5, mode: 'mountain_pass', cost: 17, seasonal_restrictions: ['winter'], is_reciprocal: true },
        { id: 14, from_region_id: 4, to_region_id: 9, mode: 'navigable_sea', cost: 20, seasonal_restrictions: [], is_reciprocal: true },
        { id: 15, from_region_id: 6, to_region_id: 8, mode: 'land', cost: 16, seasonal_restrictions: [], is_reciprocal: true },
        { id: 16, from_region_id: 1, to_region_id: 3, mode: 'land', cost: 16, seasonal_restrictions: [], is_reciprocal: true },
      ]);
    }

    // Stats
    const stats = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    if (!stats[userId]) {
      stats[userId] = {
        profile_id: userId,
        level: 1,
        experience: 0,
        energy: 100,
        strength: 1.0,
        work_skill: 1.0,
        health: 100,
        max_health: 100,
        defense: 10,
        speed: 10,
        crit_chance: 5.0,
        evasion: 5.0,
        xp_pve: 0,
        level_pve: 1,
        pvp_rating: 1000,
        kills: 0,
        deaths: 0,
        damage_dealt: 0,
        damage_taken: 0,
        healing_done: 0,
        last_work_at: null,
        last_train_at: null,
        updated_at: new Date().toISOString(),
      };
      this.setStorageItem('mmo_player_stats', stats);
    }

    // Currencies
    const currencies = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    if (!currencies[userId]) {
      currencies[userId] = {
        profile_id: userId,
        gold: 10.0,
        local_currency_balance: 1000.0, // Seed extra local currency to enable company creation testing easily!
        updated_at: new Date().toISOString(),
      };
      this.setStorageItem('mmo_currencies', currencies);
    }

    // Inventories (Legacy)
    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const hasItems = inventories.some((item) => item.owner_id === userId);
    if (!hasItems) {
      const initialItems: InventoryItem[] = [
        { id: 'inv-' + Math.random().toString(36).substring(2, 9), owner_id: userId, item_template_id: 1, quantity: 3, quality: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'inv-' + Math.random().toString(36).substring(2, 9), owner_id: userId, item_template_id: 2, quantity: 1, quality: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'inv-' + Math.random().toString(36).substring(2, 9), owner_id: userId, item_template_id: 3, quantity: 2, quality: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      this.setStorageItem('mmo_inventories', [...inventories, ...initialItems]);
    }

    // Phase 2 Player Resources (Inventory)
    const playerResources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    const hasResources = playerResources.some((item) => item.profile_id === userId);
    if (!hasResources) {
      const initialResources: PlayerResource[] = [
        { profile_id: userId, resource_id: 1, quantity: 10 },
        { profile_id: userId, resource_id: 2, quantity: 10 },
        { profile_id: userId, resource_id: 5, quantity: 10 }, // Seed some grains too
        { profile_id: userId, resource_id: 7, quantity: 10 }, // Seed some water too
        { profile_id: userId, resource_id: 4, quantity: 10 }, // Seed some coal too
        { profile_id: userId, resource_id: 3, quantity: 5 }, // Starting iron for 1031
        { profile_id: userId, resource_id: 6, quantity: 5 }, // Starting fish
      ];
      this.setStorageItem('mmo_player_resources', [...playerResources, ...initialResources]);
    } else {
      // Backfill iron/fish for saves created before 1031 (without altering test-critical quantities)
      const missing: PlayerResource[] = [];
      if (!playerResources.some((r) => r.profile_id === userId && r.resource_id === 3)) missing.push({ profile_id: userId, resource_id: 3, quantity: 5 });
      if (!playerResources.some((r) => r.profile_id === userId && r.resource_id === 6)) missing.push({ profile_id: userId, resource_id: 6, quantity: 5 });
      if (missing.length) this.setStorageItem('mmo_player_resources', [...playerResources, ...missing]);
    }

    // --- Phase 6.5 seeds: dynasty, military provinces, NPC market depth ---
    // Dynasty (seeded once per user; linked to the session user)
    const dynSeed = this.getStorageItem<Dynasty[]>('mmo_dynasties', []);
    if (!dynSeed.some((d) => d.founder_profile_id === userId)) {
      const dynasty: Dynasty = {
        id: 101,
        name: 'House of Aegis',
        noble_house_id: 1,
        founder_profile_id: userId,
        founder_title: 'King',
        country_id: 1,
        founded_at: '1031-01-01T00:00:00.000Z',
        capital_region_id: 1,
        succession_law: 'hereditary',
        is_active: true,
        member_count: 3,
        total_prestige: 120,
        members: [],
        historical_rulers: [
          { rule_id: 1, ruler_profile_id: userId, title: 'King', ascended_at: '1031-01-01T00:00:00.000Z', legitimacy: 86, dynasty_prestige_gain: 120, notes: 'Founder and first sovereign in 1031.' },
        ] as any,
      };
      const membersSeed = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
      if (!membersSeed.some((m) => m.dynasty_id === 101 && m.profile_id === userId)) {
        const profilesNow = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
        const founderName = profilesNow[userId]?.username || 'Founder';
        membersSeed.push(
          { id: 101, profile_id: userId, name: founderName, title: 'King', relationship: 'founder', succession_order: 1, is_alive: true, dynasty_id: 101 },
          { id: 102, profile_id: 'npc_heir_01', name: 'Princess Isabel', title: 'Heir', relationship: 'child', succession_order: 2, is_alive: true, dynasty_id: 101 },
          { id: 103, profile_id: 'npc_heir_02', name: 'Prince Corvin', title: 'Heir', relationship: 'child', succession_order: 3, is_alive: true, dynasty_id: 101 },
        );
        this.setStorageItem('mmo_dynasty_members', membersSeed);
      }
      this.setStorageItem('mmo_dynasties', [...dynSeed, dynasty]);
      // Legitimacy + stability
      const leg = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {});
      if (!leg[userId]) {
        leg[userId] = { profile_id: userId, legitimacy: 86, last_validated_at: new Date().toISOString(), legitimacy_reasons: 'heir_clear', last_succession_event: 'dynasty_established' };
        this.setStorageItem('mmo_ruler_legitimacy', leg);
      }
      const stab = this.getStorageItem<KingdomStability[]>('mmo_kingdom_stability', []);
      if (!stab.some((s) => s.country_id === 1)) {
        stab.push({ country_id: 1, stability: 78, legitimacy_modifier: 6, dynasty_prestige_modifier: 4, last_checked_at: new Date().toISOString(), notes: 'Hereditary succession with a clear heir.' });
        this.setStorageItem('mmo_kingdom_stability', stab);
      }
    }

    // Military provinces — coherent names from DEFAULT_REGIONS, 10 core provinces
    const milRegs = this.getStorageItem<MilitaryRegion[]>('mmo_military_regions', []);
    if (milRegs.length < 10) {
      const seeded: MilitaryRegion[] = DEFAULT_REGIONS.slice(0, 10).map((r) => ({
        region_id: r.id,
        owner_country_id: r.country_id,
        occupier_country_id: r.country_id,
        resistance_level: r.id === 5 ? 70 : r.country_id === 2 ? 60 : r.country_id === 3 ? 55 : 40,
        supply_status: 'supplied',
        region_name: r.name,
        owner_name: r.country_id === 1 ? 'Taifa of Qurtuba' : r.country_id === 2 ? 'Taifa of Ishbiliya' : 'Taifa of Gharnata',
        occupier_name: r.country_id === 1 ? 'Taifa of Qurtuba' : r.country_id === 2 ? 'Taifa of Ishbiliya' : 'Taifa of Gharnata',
      }));
      this.setStorageItem('mmo_military_regions', seeded);
    } else {
      // Controlled migration: reconcile legacy owners with new geography (keep player captures)
      let changed = false;
      for (const row of milRegs) {
        const fresh = DEFAULT_REGIONS.slice(0, 10).find((r) => r.id === row.region_id);
        if (!fresh) continue;
        if (row.resistance_level <= 0 && row.owner_country_id !== fresh.country_id) continue; // player capture
        if (row.owner_country_id !== fresh.country_id || row.region_name !== fresh.name) {
          row.owner_country_id = fresh.country_id;
          row.region_name = fresh.name;
          row.owner_name = fresh.country_id === 1 ? 'Taifa of Qurtuba' : fresh.country_id === 2 ? 'Taifa of Ishbiliya' : 'Taifa of Gharnata';
          if (row.occupier_country_id !== 1) row.occupier_name = row.owner_name;
          changed = true;
        }
      }
      if (changed) this.setStorageItem('mmo_military_regions', milRegs);
    }

    // NPC market depth: listings to buy and orders to sell into — only for real sessions (not isolated unit tests)
    const _sid = (() => { try { return typeof window !== 'undefined' ? localStorage.getItem('mmo_auth_session') : null; } catch { return null; } })();
    const _isRealSession = !!_sid && _sid === userId;
    const npcListings = this.getStorageItem<MarketListing[]>('mmo_market_listings', []);
    if (_isRealSession && !npcListings.some((l) => String(l.seller_id).startsWith('npc_'))) {
      const now = new Date().toISOString();
      const seeds: MarketListing[] = [
        { id: 'npc-lst-1', seller_id: 'npc_miller', seller_company_id: null, region_id: 8, asset_type: 'resource', resource_id: 5, quantity: 60, price_per_unit: 1.6, currency_type: 'local', status: 'active', created_at: now, updated_at: now, seller_name: 'Miller Tom', resource_name: 'Grain' },
        { id: 'npc-lst-2', seller_id: 'npc_smith', seller_company_id: null, region_id: 5, asset_type: 'resource', resource_id: 11, quantity: 12, price_per_unit: 17.5, currency_type: 'local', status: 'active', created_at: now, updated_at: now, seller_name: 'Smith Bruna', resource_name: 'Steel' },
        { id: 'npc-lst-3', seller_id: 'npc_fisher', seller_company_id: null, region_id: 4, asset_type: 'resource', resource_id: 6, quantity: 40, price_per_unit: 2.4, currency_type: 'local', status: 'active', created_at: now, updated_at: now, seller_name: 'Fisher Elian', resource_name: 'Fish' },
        { id: 'npc-lst-4', seller_id: 'npc_miner', seller_company_id: null, region_id: 3, asset_type: 'resource', resource_id: 3, quantity: 35, price_per_unit: 4.8, currency_type: 'local', status: 'active', created_at: now, updated_at: now, seller_name: 'Miner Katal', resource_name: 'Iron Ore' },
        { id: 'npc-lst-5', seller_id: 'npc_carver', seller_company_id: null, region_id: 2, asset_type: 'resource', resource_id: 1, quantity: 80, price_per_unit: 1.8, currency_type: 'local', status: 'active', created_at: now, updated_at: now, seller_name: 'Carver Simone', resource_name: 'Wood' },
        { id: 'npc-lst-6', seller_id: 'npc_herbalist', seller_company_id: null, region_id: 10, asset_type: 'resource', resource_id: 1, quantity: 25, price_per_unit: 2.0, currency_type: 'local', status: 'active', created_at: now, updated_at: now, seller_name: 'Herbalist Ana', resource_name: 'Wood' },
      ];
      this.setStorageItem('mmo_market_listings', [...npcListings, ...seeds]);
    }
    const npcOrders = this.getStorageItem<MarketOrder[]>('mmo_market_orders', []);
    if (_isRealSession && !npcOrders.some((o) => String(o.buyer_id).startsWith('npc_'))) {
      const now = new Date().toISOString();
      const oSeeds: MarketOrder[] = [
        { id: 'npc-ord-1', buyer_id: 'npc_smith', buyer_company_id: null, region_id: 5, asset_type: 'resource', resource_id: 3, quantity: 30, price_per_unit: 4.5, currency_type: 'local', status: 'active', created_at: now, updated_at: now, buyer_name: 'Smith Bruna', resource_name: 'Iron Ore' },
        { id: 'npc-ord-2', buyer_id: 'npc_miller', buyer_company_id: null, region_id: 8, asset_type: 'resource', resource_id: 14, quantity: 20, price_per_unit: 5.5, currency_type: 'local', status: 'active', created_at: now, updated_at: now, buyer_name: 'Miller Tom', resource_name: 'Bread' },
        { id: 'npc-ord-3', buyer_id: 'npc_fisher', buyer_company_id: null, region_id: 4, asset_type: 'resource', resource_id: 7, quantity: 45, price_per_unit: 0.6, currency_type: 'local', status: 'active', created_at: now, updated_at: now, buyer_name: 'Fisher Elian', resource_name: 'Water' },
        { id: 'npc-ord-4', buyer_id: 'npc_carver', buyer_company_id: null, region_id: 2, asset_type: 'resource', resource_id: 2, quantity: 50, price_per_unit: 1.2, currency_type: 'local', status: 'active', created_at: now, updated_at: now, buyer_name: 'Carver Simone', resource_name: 'Stone' },
        { id: 'npc-ord-5', buyer_id: 'npc_miller', buyer_company_id: null, region_id: 8, asset_type: 'item', resource_id: null, item_template_id: 1, quantity: 20, price_per_unit: 5.5, currency_type: 'local', status: 'active', created_at: now, updated_at: now, buyer_name: 'Miller Tom', resource_name: 'Wheat Bread' } as any,
      ];
      this.setStorageItem('mmo_market_orders', [...npcOrders, ...oSeeds]);
    }
    // Backfill for saves seeded before the item bid existed
    if (_isRealSession && !npcOrders.some((o) => (o as any).id === 'npc-ord-5')) {
      const now = new Date().toISOString();
      npcOrders.push({ id: 'npc-ord-5', buyer_id: 'npc_miller', buyer_company_id: null, region_id: 8, asset_type: 'item', resource_id: null, item_template_id: 1, quantity: 20, price_per_unit: 5.5, currency_type: 'local', status: 'active', created_at: now, updated_at: now, buyer_name: 'Miller Tom', resource_name: 'Wheat Bread' } as any);
      this.setStorageItem('mmo_market_orders', npcOrders);
    }

    // Battle report slot (deterministic, overwritten per engagement)
    const br = this.getStorageItem<any>('mmo_last_battle_report', null);
    if (br === null && !this.getStorageItem<string>('mmo_last_battle_report_init', '')) {
      this.setStorageItem('mmo_last_battle_report', null);
      this.setStorageItem('mmo_last_battle_report_init', '1');
    }

    // Quests
    const quests = this.getStorageItem<Quest[]>('mmo_quests', []);
    if (quests.length === 0) {
      const initialQuests: Quest[] = [
        { id: 1, title: 'The Roads of al-Andalus', description: 'Travel from Qurtuba to a neighbouring province (Jayyan, Tulaytula, Ishbiliya or Gharnata) along a marching road.', category: 'tutorial', rewards_json: { currency: 100, xp: 20 }, requirements_json: { travel: 1 }, is_active: true },
        { id: 2, title: 'Timber for the Walls', description: 'Gather 1 Wood in Jayyan (Sierra Morena march) for the settlement defences.', category: 'tutorial', rewards_json: { currency: 100, xp: 25 }, requirements_json: { gather_wood: 1 }, is_active: true },
        { id: 3, title: 'Bread for the Household', description: 'Craft 1 Wheat Bread in the workshop (2 Grain + 1 Water).', category: 'tutorial', rewards_json: { currency: 120, xp: 30 }, requirements_json: { craft_bread: 1 }, is_active: true },
        { id: 4, title: 'First Coin of the Coffer', description: 'Complete 1 sale in the Marketplace (Iron Ore or a crafted good).', category: 'tutorial', rewards_json: { currency: 150, xp: 40 }, requirements_json: { trade_sale: 1 }, is_active: true },
        { id: 5, title: 'Spears for the Taifa', description: 'Recruit 1 host in the Military (5 Grain, 2 Iron, 3 Fish), then issue a march order along a road.', category: 'daily', rewards_json: { currency: 250, xp: 50 }, requirements_json: { recruit_army: 1 }, is_active: true }
      ];

      for (let i = 6; i <= 102; i++) {
        const categories = ['tutorial', 'daily', 'weekly', 'seasonal', 'story'];
        const cat = categories[i % 5];
        const title = cat === 'tutorial' ? `Onboarding Path ${i}` : cat === 'daily' ? `Daily Grind ${i}` : cat === 'weekly' ? `Weekly Initiative ${i}` : cat === 'seasonal' ? `Seasonal Chapter ${i}` : `Kingdom Storyline ${i}`;
        initialQuests.push({
          id: i,
          title,
          description: `Fulfill the structural requirements of quest ${i} for raw materials or combat victory.`,
          category: cat as any,
          rewards_json: { currency: 50 + i * 5, xp: 10 + i * 2 },
          requirements_json: { action_count: i },
          is_active: true
        });
      }
      this.setStorageItem('mmo_quests', initialQuests);
    }

    // Achievements
    const achievements = this.getStorageItem<Achievement[]>('mmo_achievements', []);
    if (achievements.length === 0) {
      const initialAchievements: Achievement[] = [
        { id: 1, title: 'First Harvest', description: 'Perform a successful manual resource gather action.', category: 'economy', points: 10, requirements_json: { gathers: 1 } },
        { id: 2, title: 'Gladiator Elite', description: 'Defeat 5 PvE creature spawns or enemy armies.', category: 'combat', points: 20, requirements_json: { wins: 5 } }
      ];

      for (let i = 3; i <= 202; i++) {
        const categories = ['combat', 'economy', 'politics', 'industry', 'guilds'];
        const cat = categories[i % 5];
        const title = cat === 'combat' ? `Slayer Milestone ${i}` : cat === 'economy' ? `Merchant Tycoon ${i}` : cat === 'politics' ? `Senator Prestige ${i}` : cat === 'industry' ? `Architect Tier ${i}` : `Guild Alliance Level ${i}`;
        initialAchievements.push({
          id: i,
          title,
          description: `Achieve milestone level or actions volume count of ${i * 5} under ${cat}.`,
          category: cat as any,
          points: 10 + (i % 5) * 5,
          requirements_json: { milestone_value: i * 5 }
        });
      }
      this.setStorageItem('mmo_achievements', initialAchievements);
    }

    // Recipes
    const recipes = this.getStorageItem<ItemRecipe[]>('mmo_recipes', []);
    if (recipes.length === 0) {
      const initialRecipes: ItemRecipe[] = [
        {
          id: 1, result_template_id: 1, result_quantity: 1, craft_time: 4, energy_cost: 5, required_level: 1, experience_reward: 10, failure_chance: 0.0, is_blueprint_required: false,
          inputs: [
            { recipe_id: 1, resource_id: 5, item_template_id: null, quantity: 2 },
            { recipe_id: 1, resource_id: 7, item_template_id: null, quantity: 1 }
          ]
        },
        {
          id: 2, result_template_id: 2, result_quantity: 1, craft_time: 15, energy_cost: 15, required_level: 2, experience_reward: 35, failure_chance: 0.05, is_blueprint_required: true,
          inputs: [
            { recipe_id: 2, resource_id: 11, item_template_id: null, quantity: 5 },
            { recipe_id: 2, resource_id: 4, item_template_id: null, quantity: 1 }
          ]
        }
      ];

      for (let tempId = 10; tempId <= 159; tempId++) {
        const recId = tempId;
        initialRecipes.push({
          id: recId,
          result_template_id: tempId,
          result_quantity: 1,
          craft_time: 5 + (tempId % 5) * 2,
          energy_cost: 5 + (tempId % 3) * 2,
          required_level: 1 + (tempId % 10),
          experience_reward: 10 + (tempId % 5) * 5,
          failure_chance: 0.0000,
          is_blueprint_required: tempId % 10 === 0,
          inputs: [
            { recipe_id: recId, resource_id: 1, item_template_id: null, quantity: 5 },
            { recipe_id: recId, resource_id: 3, item_template_id: null, quantity: 5 }
          ]
        });
      }
      this.setStorageItem('mmo_recipes', initialRecipes);
    }

    // World Events
    const events = this.getStorageItem<WorldEvent[]>('mmo_world_events', []);
    if (events.length === 0) {
      const initialEvents: WorldEvent[] = [];
      for (let i = 1; i <= 25; i++) {
        const types = ['drought', 'mining_boom', 'strike', 'crisis'];
        initialEvents.push({
          id: 'ev-world-' + i,
          name: `Economic Event ${i}`,
          description: 'A major regional event affecting gathering and production times.',
          type: types[i % 4],
          region_id: (i % 10) + 1,
          active: true,
          modifiers_json: { production_bonus_multiplier: 1.15 },
          duration_ticks: 24,
          created_at: new Date().toISOString()
        });
      }
      for (let i = 1; i <= 10; i++) {
        initialEvents.push({
          id: 'ev-pol-' + i,
          name: `Political Event ${i}`,
          description: 'National council policy updates or taxation adjustments.',
          type: 'political',
          region_id: (i % 10) + 1,
          active: true,
          modifiers_json: { tax_rate_modifier: -2.00 },
          duration_ticks: 48,
          created_at: new Date().toISOString()
        });
      }
      for (let i = 1; i <= 10; i++) {
        initialEvents.push({
          id: 'ev-sea-' + i,
          name: `Seasonal Event ${i}`,
          description: 'A seasonal cosmetic festival or winter frost shift.',
          type: 'seasonal',
          region_id: (i % 10) + 1,
          active: true,
          modifiers_json: { cosmetic_bonus: true },
          duration_ticks: 72,
          created_at: new Date().toISOString()
        });
      }
      this.setStorageItem('mmo_world_events', initialEvents);
    }

    // Invite Codes
    const invites = this.getStorageItem<any[]>('mmo_closed_alpha_invites', []);
    if (invites.length === 0) {
      const initialInvites = [];
      for (let i = 1; i <= 50; i++) {
        initialInvites.push({
          id: i,
          invite_code: `AEGIS-ALPHA-${String(i).padStart(2, '0')}`,
          is_used: false,
          used_by_email: null,
          created_at: new Date().toISOString()
        });
      }
      this.setStorageItem('mmo_closed_alpha_invites', initialInvites);
    }
  }

  // Phase 2 Config Readers
  async getResources(): Promise<Resource[]> {
    return DEFAULT_RESOURCES;
  }

  async getResourceSpawns(): Promise<ResourceSpawn[]> {
    return DEFAULT_RESOURCE_SPAWNS;
  }

  async getPlayerResources(userId: string): Promise<PlayerResource[]> {
    this.ensureInitialized(userId);
    const list = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    return list.filter((item) => item.profile_id === userId);
  }

  async getEnergyHistory(userId: string): Promise<EnergyHistory[]> {
    this.ensureInitialized(userId);
    const list = this.getStorageItem<EnergyHistory[]>('mmo_energy_history', []);
    return list.filter((item) => item.profile_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  async getGatherLogs(userId: string): Promise<GatherLog[]> {
    this.ensureInitialized(userId);
    const list = this.getStorageItem<GatherLog[]>('mmo_gather_logs', []);
    return list.filter((item) => item.profile_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  async getExperienceThresholds(): Promise<ExperienceThreshold[]> {
    return DEFAULT_EXP_THRESHOLDS;
  }

  // Phase 4 Static Reader Implementations
  async getCompanyTemplates(): Promise<CompanyTemplate[]> {
    return DEFAULT_COMPANY_TEMPLATES;
  }

  async getProductionRecipes(): Promise<ProductionRecipe[]> {
    return DEFAULT_PRODUCTION_RECIPES;
  }

  async getProductionInputs(): Promise<ProductionInput[]> {
    return DEFAULT_PRODUCTION_INPUTS;
  }

  // Phase 4 State Readers
  async getMyCompanies(userId: string): Promise<Company[]> {
    this.ensureInitialized(userId);
    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const companies = this.getStorageItem<Company[]>('mmo_companies', []);
    
    // Filter companies where user is registered as Owner or Employee
    const targetCompIds = members
      .filter((m) => m.profile_id === userId)
      .map((m) => m.company_id);

    return companies.filter((c) => targetCompIds.includes(c.id));
  }

  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const filtered = members.filter((m) => m.company_id === companyId);
    
    // Fetch usernames to display
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    return filtered.map((m) => ({
      ...m,
      username: profiles[m.profile_id]?.username || 'Employee',
    }));
  }

  async getCompanyInventory(companyId: string): Promise<CompanyInventoryItem[]> {
    const inventory = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);
    return inventory.filter((item) => item.company_id === companyId && item.quantity > 0);
  }

  async getCompanyVault(companyId: string): Promise<CompanyVault | null> {
    const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
    return vaults[companyId] || null;
  }

  async getCompanyJobs(companyId?: string): Promise<CompanyJob[]> {
    const jobs = this.getStorageItem<CompanyJob[]>('mmo_company_jobs', []);
    const companies = this.getStorageItem<Company[]>('mmo_companies', []);

    let filtered = jobs.filter((j) => j.enabled && j.vacancies > 0);
    if (companyId) {
      filtered = filtered.filter((j) => j.company_id === companyId);
    }

    return filtered.map((j) => {
      const comp = companies.find((c) => c.id === j.company_id);
      return {
        ...j,
        company_name: comp?.name || 'Aegis Factory',
      };
    });
  }

  async getCompanyProductionQueue(companyId: string): Promise<CompanyProductionQueue[]> {
    const queues = this.getStorageItem<CompanyProductionQueue[]>('mmo_company_production_queues', []);
    return queues.filter((q) => q.company_id === companyId);
  }

  async getCompanyLogs(companyId: string): Promise<CompanyLog[]> {
    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    
    return logs
      .filter((l) => l.company_id === companyId)
      .map((l) => ({
        ...l,
        actor_username: l.actor_id ? (profiles[l.actor_id]?.username || 'Operator') : undefined,
      }))
      .sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  async getCompanyMachines(companyId: string): Promise<CompanyMachine[]> {
    const machines = this.getStorageItem<CompanyMachine[]>('mmo_company_machines', []);
    return machines.filter((m) => m.company_id === companyId);
  }

  // Phase 4 Transaction Mutators

  async createCompany(userId: string, name: string, regionId: number, templateId: number): Promise<{
    success: boolean;
    companyId: string | null;
    error: string | null;
  }> {
    this.ensureInitialized(userId);
    
    // Unique name validation
    const companies = this.getStorageItem<Company[]>('mmo_companies', []);
    const nameExists = companies.some((c) => c.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (nameExists) {
      return { success: false, companyId: null, error: 'A company with this name already exists.' };
    }

    const template = DEFAULT_COMPANY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return { success: false, companyId: null, error: 'Invalid company template.' };
    }

    // Deduct cost
    const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    const wallet = currenciesMap[userId];
    if (!wallet || wallet.gold < template.cost_gold || wallet.local_currency_balance < template.cost_local) {
      return { success: false, companyId: null, error: 'Insufficient funds in wallet to pay construction costs.' };
    }

    wallet.gold -= template.cost_gold;
    wallet.local_currency_balance -= template.cost_local;
    wallet.updated_at = new Date().toISOString();
    currenciesMap[userId] = wallet;
    this.setStorageItem('mmo_currencies', currenciesMap);

    // Save company
    const newId = 'comp-' + Math.random().toString(36).substring(2, 9);
    const newComp: Company = {
      id: newId,
      name,
      owner_id: userId,
      region_id: regionId,
      item_template_id: template.output_resource_id, // Legacy compatibility
      vault_balance: 0.00, // Legacy field
      created_at: new Date().toISOString(),
    };
    // Append template_id, lvl, exp properties for Phase 4 models
    (newComp as any).template_id = templateId;
    (newComp as any).level = 1;
    (newComp as any).experience = 0;

    companies.push(newComp);
    this.setStorageItem('mmo_companies', companies);

    // Create Vault record
    const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
    vaults[newId] = {
      company_id: newId,
      gold: 0.00,
      local_currency: 0.00,
      updated_at: new Date().toISOString(),
    };
    this.setStorageItem('mmo_company_vaults', vaults);

    // Register Founder as Owner member
    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    members.push({
      company_id: newId,
      profile_id: userId,
      role: 'Owner',
      salary: 0.00,
      shifts_worked_today: 0,
      max_daily_shifts: 999,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_members', members);

    // Create log entries
    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: newId,
      actor_id: userId,
      action: 'company.created',
      metadata: { cost_local: template.cost_local, cost_gold: template.cost_gold },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    this.addAuditLog(userId, 'company.create', {
      company_id: newId,
      company_name: name,
    });

    return { success: true, companyId: newId, error: null };
  }

  async vaultCashTransaction(userId: string, companyId: string, amount: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const member = members.find((m) => m.company_id === companyId && m.profile_id === userId);
    if (!member) {
      return { success: false, error: 'You are not a member of this company.' };
    }

    if (!['Owner', 'Director', 'Manager', 'Accountant'].includes(member.role)) {
      return { success: false, error: 'Insufficient permission to modify cash vaults.' };
    }

    const wallets = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
    
    const wallet = wallets[userId];
    const vault = vaults[companyId];

    if (!wallet || !vault) {
      return { success: false, error: 'Ledger record not found.' };
    }

    if (isDeposit) {
      if (wallet.local_currency_balance < amount) {
        return { success: false, error: 'Insufficient funds in personal wallet.' };
      }
      wallet.local_currency_balance -= amount;
      vault.local_currency += amount;
    } else {
      if (vault.local_currency < amount) {
        return { success: false, error: 'Insufficient funds in company cash vault.' };
      }
      vault.local_currency -= amount;
      wallet.local_currency_balance += amount;
    }

    wallet.updated_at = new Date().toISOString();
    vault.updated_at = new Date().toISOString();

    wallets[userId] = wallet;
    vaults[companyId] = vault;

    this.setStorageItem('mmo_currencies', wallets);
    this.setStorageItem('mmo_company_vaults', vaults);

    // Audit logs
    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: isDeposit ? 'vault.deposit_cash' : 'vault.withdraw_cash',
      metadata: { amount },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async vaultResourceTransaction(userId: string, companyId: string, resourceId: number, quantity: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const member = members.find((m) => m.company_id === companyId && m.profile_id === userId);
    if (!member) {
      return { success: false, error: 'You are not a member of this company.' };
    }

    if (!['Owner', 'Director', 'Manager'].includes(member.role)) {
      return { success: false, error: 'Insufficient permissions to shift physical stock.' };
    }

    const playerRes = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    const compRes = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);

    if (isDeposit) {
      // Find in player inventory
      const pIdx = playerRes.findIndex((item) => item.profile_id === userId && item.resource_id === resourceId);
      if (pIdx === -1 || playerRes[pIdx].quantity < quantity) {
        return { success: false, error: 'Insufficient resource quantity in cargo backpack.' };
      }

      playerRes[pIdx].quantity -= quantity;
      
      const cIdx = compRes.findIndex((item) => item.company_id === companyId && item.resource_id === resourceId);
      if (cIdx !== -1) {
        compRes[cIdx].quantity += quantity;
      } else {
        compRes.push({ company_id: companyId, resource_id: resourceId, quantity });
      }
    } else {
      // Find in company vault
      const cIdx = compRes.findIndex((item) => item.company_id === companyId && item.resource_id === resourceId);
      if (cIdx === -1 || compRes[cIdx].quantity < quantity) {
        return { success: false, error: 'Insufficient resource quantity in company vault.' };
      }

      compRes[cIdx].quantity -= quantity;

      const pIdx = playerRes.findIndex((item) => item.profile_id === userId && item.resource_id === resourceId);
      if (pIdx !== -1) {
        playerRes[pIdx].quantity += quantity;
      } else {
        playerRes.push({ profile_id: userId, resource_id: resourceId, quantity });
      }
    }

    this.setStorageItem('mmo_player_resources', playerRes);
    this.setStorageItem('mmo_company_inventory', compRes);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: isDeposit ? 'vault.deposit_resource' : 'vault.withdraw_resource',
      metadata: { resource_id: resourceId, quantity },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async postCompanyJob(userId: string, companyId: string, regionId: number, salary: number, vacancies: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const member = members.find((m) => m.company_id === companyId && m.profile_id === userId);
    if (!member || !['Owner', 'Director', 'Manager'].includes(member.role)) {
      return { success: false, error: 'Insufficient permissions to hire.' };
    }

    const jobs = this.getStorageItem<CompanyJob[]>('mmo_company_jobs', []);
    jobs.push({
      id: 'job-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      region_id: regionId,
      salary,
      vacancies,
      enabled: true,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_jobs', jobs);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: 'job.posted',
      metadata: { salary, vacancies },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async applyForJob(userId: string, jobId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    // Limit active employment to 1 company
    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const alreadyEmployed = members.some((m) => m.profile_id === userId);
    if (alreadyEmployed) {
      return { success: false, error: 'You are already employed by another company. Resign first!' };
    }

    const jobs = this.getStorageItem<CompanyJob[]>('mmo_company_jobs', []);
    const jobIdx = jobs.findIndex((j) => j.id === jobId && j.enabled && j.vacancies > 0);
    if (jobIdx === -1) {
      return { success: false, error: 'Job offer is no longer valid or filled.' };
    }

    const job = jobs[jobIdx];

    // Deduct vacancy
    jobs[jobIdx].vacancies -= 1;
    if (jobs[jobIdx].vacancies === 0) {
      jobs[jobIdx].enabled = false;
    }
    this.setStorageItem('mmo_company_jobs', jobs);

    // Add member
    members.push({
      company_id: job.company_id,
      profile_id: userId,
      role: 'Employee',
      salary: job.salary,
      shifts_worked_today: 0,
      max_daily_shifts: 5,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_members', members);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: job.company_id,
      actor_id: userId,
      action: 'employee.hired',
      metadata: { salary: job.salary },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async resignFromCompany(userId: string, companyId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const memberIdx = members.findIndex((m) => m.company_id === companyId && m.profile_id === userId);
    if (memberIdx === -1) {
      return { success: false, error: 'You are not employed by this company.' };
    }

    const member = members[memberIdx];
    if (member.role === 'Owner') {
      return { success: false, error: 'Owners cannot resign. Disband or transfer company ownership first.' };
    }

    members.splice(memberIdx, 1);
    this.setStorageItem('mmo_company_members', members);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: 'employee.resigned',
      metadata: {},
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async terminateEmployee(userId: string, companyId: string, employeeId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const executor = members.find((m) => m.company_id === companyId && m.profile_id === userId);
    if (!executor || !['Owner', 'Director', 'Manager'].includes(executor.role)) {
      return { success: false, error: 'Insufficient permission to fire staff.' };
    }

    const targetIdx = members.findIndex((m) => m.company_id === companyId && m.profile_id === employeeId);
    if (targetIdx === -1) {
      return { success: false, error: 'Employee not found.' };
    }

    const target = members[targetIdx];
    if (target.role === 'Owner') {
      return { success: false, error: 'Cannot terminate the owner.' };
    }

    members.splice(targetIdx, 1);
    this.setStorageItem('mmo_company_members', members);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: 'employee.terminated',
      metadata: { employee_id: employeeId },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async setEmployeeSalary(userId: string, companyId: string, employeeId: string, newSalary: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const executor = members.find((m) => m.company_id === companyId && m.profile_id === userId);
    if (!executor || !['Owner', 'Director', 'Manager'].includes(executor.role)) {
      return { success: false, error: 'Insufficient permission to set payroll details.' };
    }

    const targetIdx = members.findIndex((m) => m.company_id === companyId && m.profile_id === employeeId);
    if (targetIdx === -1) {
      return { success: false, error: 'Employee not found.' };
    }

    members[targetIdx].salary = newSalary;
    this.setStorageItem('mmo_company_members', members);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: 'employee.salary_changed',
      metadata: { employee_id: employeeId, new_salary: newSalary },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async queueProduction(userId: string, companyId: string, recipeId: number, quantity: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    this.ensureInitialized(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const member = members.find((m) => m.company_id === companyId && m.profile_id === userId);
    if (!member || !['Owner', 'Director', 'Manager'].includes(member.role)) {
      return { success: false, error: 'Insufficient permission to start queues.' };
    }

    const recipe = DEFAULT_PRODUCTION_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) {
      return { success: false, error: 'Recipe not found.' };
    }

    // Verify inputs in company storage
    const compRes = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);
    const inputs = DEFAULT_PRODUCTION_INPUTS.filter((inRow) => inRow.recipe_id === recipeId);

    for (const inRow of inputs) {
      const stock = compRes.find((item) => item.company_id === companyId && item.resource_id === inRow.resource_id);
      if (!stock || stock.quantity < (inRow.quantity * quantity)) {
        const itemDetails = DEFAULT_RESOURCES.find((r) => r.id === inRow.resource_id);
        return { success: false, error: `Insufficient inputs inside company vault. Needs ${(inRow.quantity * quantity)} units of ${itemDetails?.name || 'Raw Resource'}.` };
      }
    }

    // Lock and consume ingredients from company vault
    for (const inRow of inputs) {
      const idx = compRes.findIndex((item) => item.company_id === companyId && item.resource_id === inRow.resource_id);
      compRes[idx].quantity -= (inRow.quantity * quantity);
    }
    this.setStorageItem('mmo_company_inventory', compRes);

    // Queue order
    const queues = this.getStorageItem<CompanyProductionQueue[]>('mmo_company_production_queues', []);
    queues.push({
      id: 'q-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      recipe_id: recipeId,
      quantity,
      quantity_completed: 0,
      status: 'waiting',
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_production_queues', queues);

    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: 'production.queued',
      metadata: { recipe_id: recipeId, quantity },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    return { success: true, error: null };
  }

  async executeCompanyWorkShift(userId: string, companyId: string): Promise<{
    success: boolean;
    salaryEarned: number;
    expRewarded: number;
    leveledUp: boolean;
    newEnergy: number;
    error: string | null;
  }> {
    this.ensureInitialized(userId);
    await this.syncEnergyTicks(userId);

    const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
    const memberIdx = members.findIndex((m) => m.company_id === companyId && m.profile_id === userId);
    if (memberIdx === -1) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: 0, error: 'You are not employed by this company.' };
    }

    const member = members[memberIdx];
    if (member.shifts_worked_today >= member.max_daily_shifts) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: 0, error: 'Labor shifts limit reached for today.' };
    }

    // Verify Player energy
    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const stats = statsMap[userId];
    if (!stats || stats.energy < 10) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: stats ? stats.energy : 0, error: 'Insufficient personal energy. Shift requires 10 energy.' };
    }

    // Verify Vault cash
    const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
    const vault = vaults[companyId];
    if (!vault || vault.local_currency < member.salary) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: stats.energy, error: 'Company vault has insufficient cash reserves to pay your shift wage.' };
    }

    const companies = this.getStorageItem<Company[]>('mmo_companies', []);
    const compIdx = companies.findIndex((c) => c.id === companyId);
    if (compIdx === -1) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: stats.energy, error: 'Company not found.' };
    }

    const comp = companies[compIdx];
    const template = DEFAULT_COMPANY_TEMPLATES.find((t) => t.id === (comp as any).template_id);
    if (!template) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: stats.energy, error: 'Company template configuration not found.' };
    }

    let expRewarded = 10;
    const compRes = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);

    if (template.is_raw_camp) {
      // Raw extraction camp: gather raw resource
      const spawnWeight = 1.0;
      const qtyGathered = Math.floor(1 + stats.work_skill * 0.05 * spawnWeight);
      
      const rIdx = compRes.findIndex((item) => item.company_id === companyId && item.resource_id === template.output_resource_id);
      if (rIdx !== -1) {
        compRes[rIdx].quantity += qtyGathered;
      } else {
        compRes.push({ company_id: companyId, resource_id: template.output_resource_id, quantity: qtyGathered });
      }
    } else {
      // Refined factory: requires queue elements
      const queues = this.getStorageItem<CompanyProductionQueue[]>('mmo_company_production_queues', []);
      const qIdx = queues.findIndex((q) => q.company_id === companyId && ['waiting', 'running'].includes(q.status));
      if (qIdx === -1) {
        return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: stats.energy, error: 'Factory assembly line queue is empty. Queue recipes first!' };
      }

      queues[qIdx].status = 'running';

      const recipe = DEFAULT_PRODUCTION_RECIPES.find((r) => r.id === queues[qIdx].recipe_id);
      if (!recipe) {
        return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: stats.energy, error: 'Recipe details not found.' };
      }

      expRewarded = recipe.experience_reward;
      
      // Output refined items into vault storage
      const rIdx = compRes.findIndex((item) => item.company_id === companyId && item.resource_id === recipe.output_resource_id);
      if (rIdx !== -1) {
        compRes[rIdx].quantity += recipe.output_quantity;
      } else {
        compRes.push({ company_id: companyId, resource_id: recipe.output_resource_id, quantity: recipe.output_quantity });
      }

      // Progress queue
      queues[qIdx].quantity_completed += 1;
      if (queues[qIdx].quantity_completed >= queues[qIdx].quantity) {
        queues[qIdx].status = 'completed';
      }

      this.setStorageItem('mmo_company_production_queues', queues);
    }

    this.setStorageItem('mmo_company_inventory', compRes);

    // Pay shift salary
    vault.local_currency -= member.salary;
    vault.updated_at = new Date().toISOString();
    vaults[companyId] = vault;
    this.setStorageItem('mmo_company_vaults', vaults);

    const wallets = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    wallets[userId].local_currency_balance += member.salary;
    wallets[userId].updated_at = new Date().toISOString();
    this.setStorageItem('mmo_currencies', wallets);

    // Update worker shift limit
    members[memberIdx].shifts_worked_today += 1;
    this.setStorageItem('mmo_company_members', members);

    // Worker EP & exp adjustments
    stats.energy -= 10;
    stats.experience += expRewarded;
    stats.work_skill = Number((stats.work_skill + 0.1).toFixed(4));
    stats.updated_at = new Date().toISOString();
    
    // Level up checks
    let leveledUp = false;
    while (true) {
      const threshold = DEFAULT_EXP_THRESHOLDS.find((t) => t.level === stats.level);
      if (!threshold) break;
      if (stats.experience >= threshold.required_experience) {
        stats.experience -= threshold.required_experience;
        stats.level += 1;
        stats.energy = 100;
        leveledUp = true;
      } else {
        break;
      }
    }
    statsMap[userId] = stats;
    this.setStorageItem('mmo_player_stats', statsMap);

    // Level up company experience (lvl * lvl * 100)
    (comp as any).experience += expRewarded;
    while (true) {
      const needed = (comp as any).level * (comp as any).level * 100;
      if ((comp as any).experience >= needed) {
        (comp as any).experience -= needed;
        (comp as any).level += 1;
      } else {
        break;
      }
    }
    companies[compIdx] = comp;
    this.setStorageItem('mmo_companies', companies);

    // Logs
    const logs = this.getStorageItem<CompanyLog[]>('mmo_company_logs', []);
    logs.push({
      id: 'clog-' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      actor_id: userId,
      action: 'labor.shift_completed',
      metadata: { wage_paid: member.salary, experience_earned: expRewarded },
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_company_logs', logs);

    this.addAuditLog(userId, 'company.shift', {
      company_id: companyId,
      wage_earned: member.salary,
    });

    return {
      success: true,
      salaryEarned: member.salary,
      expRewarded,
      leveledUp,
      newEnergy: stats.energy,
      error: null,
    };
  }

  // Core GET Endpoints
  async getProfile(userId: string): Promise<Profile | null> {
    this.ensureInitialized(userId);
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    return profiles[userId] || null;
  }

  async getPlayerStats(userId: string): Promise<PlayerStats | null> {
    this.ensureInitialized(userId);
    await this.syncEnergyTicks(userId);
    const stats = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    return stats[userId] || null;
  }

  async getCurrencies(userId: string): Promise<Currencies | null> {
    this.ensureInitialized(userId);
    const currencies = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    return currencies[userId] || null;
  }

  async getRegions(): Promise<Region[]> {
    return DEFAULT_REGIONS;
  }

  async getCountries(): Promise<Country[]> {
    this.ensureInitialized(this.getSessionUserId());
    const rows = this.getStorageItem<Country[]>('mmo_countries', DEFAULT_COUNTRIES);
    // Controlled rename migration (keep currency/VAT contracts, update display names)
    for (const r of rows) {
      const fresh = DEFAULT_COUNTRIES.find((d) => d.id === r.id);
      if (fresh && r.name !== fresh.name) r.name = fresh.name;
    }
    this.setStorageItem('mmo_countries', rows);
    return rows;
  }

  async getInventory(userId: string): Promise<InventoryItem[]> {
    this.ensureInitialized(userId);
    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    return inventories.filter((item) => item.owner_id === userId && item.quantity > 0);
  }

  async getItemTemplates(): Promise<ItemTemplate[]> {
    return DEFAULT_ITEM_TEMPLATES;
  }

  async getCompanies(regionId?: number): Promise<Company[]> {
    const list = this.getStorageItem<Company[]>('mmo_companies', []);
    if (regionId) {
      return list.filter((c) => c.region_id === regionId);
    }
    return list;
  }

  async getJobOffers(): Promise<JobOffer[]> {
    const jobs = this.getStorageItem<CompanyJob[]>('mmo_company_jobs', []);
    const companies = this.getStorageItem<Company[]>('mmo_companies', []);
    
    // Mapped for backwards compatibility with JobOffer structure
    return jobs
      .filter((j) => j.enabled && j.vacancies > 0)
      .map((j) => {
        const comp = companies.find((c) => c.id === j.company_id);
        return {
          id: j.id,
          company_id: j.company_id,
          company_name: comp?.name || 'Aegis Plant',
          wage: j.salary,
          vacancies: j.vacancies,
          created_at: j.created_at,
        };
      });
  }

  async getActiveBattles(): Promise<Battle[]> {
    return this.getStorageItem<Battle[]>('mmo_battles', DEFAULT_BATTLES);
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    const logs = this.getStorageItem<AuditLog[]>('mmo_audit_logs', []);
    return logs.filter((log) => log.profile_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  // Mutator Actions
  private addAuditLog(userId: string, action: string, metadata: Record<string, any>): void {
    const logs = this.getStorageItem<AuditLog[]>('mmo_audit_logs', []);
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      profile_id: userId,
      action,
      metadata,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    logs.push(newLog);
    this.setStorageItem('mmo_audit_logs', logs);
  }

  // Energy Sync Recovery Calculation
  async syncEnergyTicks(userId: string): Promise<PlayerStats | null> {
    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const stats = statsMap[userId];
    if (!stats) return null;

    const lastUpdate = new Date(stats.updated_at).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - lastUpdate) / 1000;

    // Tick duration: 6 minutes (360 seconds)
    const tickInterval = 360;
    const ticks = Math.floor(elapsedSeconds / tickInterval);

    if (ticks > 0 && stats.energy < 100) {
      const energyGained = ticks * 5;
      const newEnergy = Math.min(100, stats.energy + energyGained);
      
      const updatedStats = {
        ...stats,
        energy: newEnergy,
        updated_at: new Date(lastUpdate + ticks * tickInterval * 1000).toISOString(),
      };

      statsMap[userId] = updatedStats;
      this.setStorageItem('mmo_player_stats', statsMap);

      // Write Energy Tick logs
      const energyHistory = this.getStorageItem<EnergyHistory[]>('mmo_energy_history', []);
      energyHistory.push({
        id: 'en-' + Math.random().toString(36).substring(2, 9),
        profile_id: userId,
        change_amount: newEnergy - stats.energy,
        reason: 'offline_regen',
        created_at: new Date().toISOString(),
      });
      this.setStorageItem('mmo_energy_history', energyHistory);

      return updatedStats;
    }

    return stats;
  }

  async travelToRegion(userId: string, targetRegionId: number): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    await this.syncEnergyTicks(userId);

    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const profile = profiles[userId];
    const stats = statsMap[userId];

    if (!profile || !stats) {
      return { success: false, error: 'Character data not found.' };
    }

    const targetRegion = DEFAULT_REGIONS.find((r) => r.id === targetRegionId);
    if (!targetRegion) {
      return { success: false, error: 'Target region does not exist.' };
    }

    if (profile.current_region_id === targetRegionId) {
      return { success: false, error: 'You are already in this region.' };
    }

    const currentRegion = DEFAULT_REGIONS.find((r) => r.id === profile.current_region_id);
    if (!currentRegion) {
      return { success: false, error: 'Current region not found.' };
    }

    const isSameCountry = currentRegion.country_id === targetRegion.country_id;
    const energyCost = isSameCountry ? 10 : 20;

    // Check Energy
    if (stats.energy < energyCost) {
      return { success: false, error: `Insufficient energy. Traveling requires ${energyCost} energy.` };
    }

    // Check Travel Tickets if changing countries
    if (!isSameCountry) {
      const inventory = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
      const ticketIndex = inventory.findIndex((item) => item.owner_id === userId && item.item_template_id === 3 && item.quantity > 0);
      
      if (ticketIndex === -1) {
        return { success: false, error: 'Changing countries requires 1 Travel Ticket.' };
      }

      inventory[ticketIndex].quantity -= 1;
      this.setStorageItem('mmo_inventories', inventory);
    }

    // Update coordinates and energy
    stats.energy -= energyCost;
    stats.updated_at = new Date().toISOString();
    profile.current_region_id = targetRegionId;
    profile.updated_at = new Date().toISOString();

    profiles[userId] = profile;
    statsMap[userId] = stats;

    this.setStorageItem('mmo_profiles', profiles);
    this.setStorageItem('mmo_player_stats', statsMap);

    this.addAuditLog(userId, 'region.travel', {
      from: currentRegion.name,
      to: targetRegion.name,
      energy_cost: energyCost,
      ticket_used: !isSameCountry,
    });

    return { success: true, error: null };
  }

  async workAtCompany(userId: string, companyId: string): Promise<{ success: boolean; earnedSalary: number; skillIncrease: number; expGained: number; error: string | null }> {
    // Backward compatibility wrapper for old labor actions
    const shift = await this.executeCompanyWorkShift(userId, companyId);
    return {
      success: shift.success,
      earnedSalary: shift.salaryEarned,
      skillIncrease: 0.1,
      expGained: shift.expRewarded,
      error: shift.error,
    };
  }

  async trainStrength(userId: string): Promise<{ success: boolean; strengthGained: number; expGained: number; energyRemaining: number; error: string | null }> {
    this.ensureInitialized(userId);
    await this.syncEnergyTicks(userId);

    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const stats = statsMap[userId];

    if (!stats) {
      return { success: false, strengthGained: 0, expGained: 0, energyRemaining: 0, error: 'Stats not found.' };
    }

    if (stats.energy < 10) {
      return { success: false, strengthGained: 0, expGained: 0, energyRemaining: stats.energy, error: 'Insufficient energy. Training requires 10 energy.' };
    }

    const strengthGained = 0.1;
    const expGained = 10;

    stats.energy -= 10;
    stats.experience += expGained;
    stats.strength = Number((stats.strength + strengthGained).toFixed(4));
    stats.last_train_at = new Date().toISOString();
    stats.updated_at = new Date().toISOString();

    // Level up check
    let leveledUp = false;
    while (true) {
      const threshold = DEFAULT_EXP_THRESHOLDS.find((t) => t.level === stats.level);
      if (!threshold) break;
      if (stats.experience >= threshold.required_experience) {
        stats.experience -= threshold.required_experience;
        stats.level += 1;
        stats.energy = 100;
        leveledUp = true;
      } else {
        break;
      }
    }

    statsMap[userId] = stats;
    this.setStorageItem('mmo_player_stats', statsMap);

    this.addAuditLog(userId, 'combat.train', {
      strength_gained: strengthGained,
      leveled_up: leveledUp,
    });

    return {
      success: true,
      strengthGained,
      expGained,
      energyRemaining: stats.energy,
      error: null,
    };
  }

  async fightInBattle(userId: string, battleId: string, sideCountryId: number): Promise<{ success: boolean; damageDealt: number; xpGained: number; energyRemaining: number; error: string | null }> {
    this.ensureInitialized(userId);
    await this.syncEnergyTicks(userId);

    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    
    const profile = profiles[userId];
    const stats = statsMap[userId];

    if (!profile || !stats) {
      return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: 0, error: 'Character data not found.' };
    }

    if (stats.energy < 10) {
      return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: stats.energy, error: 'Insufficient energy. Fighting requires 10 energy.' };
    }

    const battles = this.getStorageItem<Battle[]>('mmo_battles', DEFAULT_BATTLES);
    const battleIndex = battles.findIndex((b) => b.id === battleId);
    if (battleIndex === -1) {
      return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: stats.energy, error: 'Battle field not found.' };
    }

    const battle = battles[battleIndex];
    if (battle.status !== 'active') {
      return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: stats.energy, error: 'This battle has already concluded.' };
    }

    if (profile.current_region_id !== battle.region_id) {
      return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: stats.energy, error: 'You are not located in the region where this battle is occurring. Travel there first!' };
    }

    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const weaponIndex = inventories.findIndex((item) => item.owner_id === userId && item.item_template_id === 2 && item.quantity > 0);
    
    let weaponModifier = 1.0;
    if (weaponIndex !== -1) {
      const quality = inventories[weaponIndex].quality;
      weaponModifier = 1.0 + (quality * 0.2);
      inventories[weaponIndex].quantity -= 1;
      this.setStorageItem('mmo_inventories', inventories);
    }

    const baseDamage = 10;
    const strengthMultiplier = 1 + (stats.strength / 100);
    const damage = baseDamage * strengthMultiplier * weaponModifier;

    if (sideCountryId === battle.attacker_country_id) {
      battle.attacker_score += Math.round(damage);
    } else {
      battle.defender_score += Math.round(damage);
    }
    battles[battleIndex] = battle;
    this.setStorageItem('mmo_battles', battles);

    const xpGained = 2;
    stats.energy -= 10;
    stats.experience += xpGained;
    stats.updated_at = new Date().toISOString();

    let leveledUp = false;
    while (true) {
      const threshold = DEFAULT_EXP_THRESHOLDS.find((t) => t.level === stats.level);
      if (!threshold) break;
      if (stats.experience >= threshold.required_experience) {
        stats.experience -= threshold.required_experience;
        stats.level += 1;
        stats.energy = 100;
        leveledUp = true;
      } else {
        break;
      }
    }
    
    statsMap[userId] = stats;
    this.setStorageItem('mmo_player_stats', statsMap);

    this.addAuditLog(userId, 'combat.fight', {
      battle_id: battleId,
      damage_dealt: damage,
      weapon_used: weaponIndex !== -1,
      leveled_up: leveledUp,
    });

    return {
      success: true,
      damageDealt: Number(damage.toFixed(2)),
      xpGained,
      energyRemaining: stats.energy,
      error: null,
    };
  }

  async claimTestTicket(userId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const ticketIndex = inventories.findIndex((item) => item.owner_id === userId && item.item_template_id === 3);

    if (ticketIndex !== -1) {
      inventories[ticketIndex].quantity += 1;
    } else {
      inventories.push({
        id: 'inv-' + Math.random().toString(36).substring(2, 9),
        owner_id: userId,
        item_template_id: 3,
        quantity: 1,
        quality: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    this.setStorageItem('mmo_inventories', inventories);
    this.addAuditLog(userId, 'developer.claim_ticket', { ticket_claimed: 1 });
    return { success: true, error: null };
  }

  async gatherResource(userId: string, resourceId: number): Promise<{
    success: boolean;
    gatheredQuantity: number;
    energySpent: number;
    experienceGained: number;
    leveledUp: boolean;
    newLevel: number;
    newEnergy: number;
    error: string | null;
  }> {
    this.ensureInitialized(userId);
    await this.syncEnergyTicks(userId);

    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const profile = profiles[userId];
    const stats = statsMap[userId];

    if (!profile || !stats) {
      return { success: false, gatheredQuantity: 0, energySpent: 0, experienceGained: 0, leveledUp: false, newLevel: 0, newEnergy: 0, error: 'Character data not found.' };
    }

    const spawn = DEFAULT_RESOURCE_SPAWNS.find(
      (s) => s.region_id === profile.current_region_id && s.resource_id === resourceId
    );
    const resource = DEFAULT_RESOURCES.find((r) => r.id === resourceId);

    if (!spawn || !resource || !resource.enabled) {
      return { success: false, gatheredQuantity: 0, energySpent: 0, experienceGained: 0, leveledUp: false, newLevel: stats.level, newEnergy: stats.energy, error: 'This resource is not available in your current region.' };
    }

    if (stats.energy < spawn.energy_cost) {
      return { success: false, gatheredQuantity: 0, energySpent: 0, experienceGained: 0, leveledUp: false, newLevel: stats.level, newEnergy: stats.energy, error: `Insufficient energy. Gathering requires ${spawn.energy_cost} EP.` };
    }

    stats.energy -= spawn.energy_cost;
    
    const energyHistory = this.getStorageItem<EnergyHistory[]>('mmo_energy_history', []);
    energyHistory.push({
      id: 'en-' + Math.random().toString(36).substring(2, 9),
      profile_id: userId,
      change_amount: -spawn.energy_cost,
      reason: `gathering_${resource.name}`,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_energy_history', energyHistory);

    const activeRegion = DEFAULT_REGIONS.find((r) => r.id === profile.current_region_id);
    const prodBonus = activeRegion?.production_bonus || 1.00;
    const qtyGathered = Math.floor(1 + stats.work_skill * 0.05 * spawn.spawn_weight * prodBonus);

    const playerResources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    const resIndex = playerResources.findIndex((item) => item.profile_id === userId && item.resource_id === resourceId);
    if (resIndex !== -1) {
      playerResources[resIndex].quantity += qtyGathered;
    } else {
      playerResources.push({ profile_id: userId, resource_id: resourceId, quantity: qtyGathered });
    }
    this.setStorageItem('mmo_player_resources', playerResources);

    stats.experience += spawn.experience_reward;
    let leveledUp = false;
    
    while (true) {
      const threshold = DEFAULT_EXP_THRESHOLDS.find((t) => t.level === stats.level);
      if (!threshold) break;

      if (stats.experience >= threshold.required_experience) {
        stats.experience -= threshold.required_experience;
        stats.level += 1;
        stats.energy = 100;
        leveledUp = true;
      } else {
        break;
      }
    }

    stats.work_skill = Number((stats.work_skill + 0.1000).toFixed(4));
    stats.updated_at = new Date().toISOString();
    statsMap[userId] = stats;
    this.setStorageItem('mmo_player_stats', statsMap);

    const gatherLogs = this.getStorageItem<GatherLog[]>('mmo_gather_logs', []);
    gatherLogs.push({
      id: 'gat-' + Math.random().toString(36).substring(2, 9),
      profile_id: userId,
      region_id: profile.current_region_id,
      resource_id: resourceId,
      quantity_gathered: qtyGathered,
      energy_spent: spawn.energy_cost,
      experience_earned: spawn.experience_reward,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_gather_logs', gatherLogs);

    this.addAuditLog(userId, 'resource.gather', {
      resource_name: resource.name,
      quantity: qtyGathered,
      energy_spent: spawn.energy_cost,
      experience_earned: spawn.experience_reward,
      leveled_up: leveledUp,
    });

    return {
      success: true,
      gatheredQuantity: qtyGathered,
      energySpent: spawn.energy_cost,
      experienceGained: spawn.experience_reward,
      leveledUp,
      newLevel: stats.level,
      newEnergy: stats.energy,
      error: null,
    };
  }

  async claimDevFunding(userId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    const wallet = currenciesMap[userId];
    if (!wallet) {
      return { success: false, error: 'Wallet not initialized.' };
    }
    wallet.local_currency_balance += 1000.0;
    wallet.updated_at = new Date().toISOString();
    currenciesMap[userId] = wallet;
    this.setStorageItem('mmo_currencies', currenciesMap);
    this.addAuditLog(userId, 'developer.claim_funding', { funding_amount: 1000.0 });
    return { success: true, error: null };
  }

  async cheatResourcesAndCurrencies(userId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    
    // Set currencies
    const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    const wallet = currenciesMap[userId];
    if (wallet) {
      wallet.local_currency_balance = 10000.0;
      wallet.gold = 10000.0;
      wallet.updated_at = new Date().toISOString();
      currenciesMap[userId] = wallet;
      this.setStorageItem('mmo_currencies', currenciesMap);
    }

    // Set all resources to 10000
    const playerResources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    for (let rId = 1; rId <= 14; rId++) {
      const idx = playerResources.findIndex((item) => item.profile_id === userId && item.resource_id === rId);
      if (idx !== -1) {
        playerResources[idx].quantity = 10000;
      } else {
        playerResources.push({ profile_id: userId, resource_id: rId, quantity: 10000 });
      }
    }
    
    this.setStorageItem('mmo_player_resources', playerResources);
    this.addAuditLog(userId, 'developer.cheat_assets', { amount: 10000 });
    return { success: true, error: null };
  }

  async claimDevEnergy(userId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const stats = statsMap[userId];
    if (!stats) {
      return { success: false, error: 'Stats not found.' };
    }
    stats.energy = 100;
    stats.updated_at = new Date().toISOString();
    statsMap[userId] = stats;
    this.setStorageItem('mmo_player_stats', statsMap);

    const energyHistory = this.getStorageItem<EnergyHistory[]>('mmo_energy_history', []);
    energyHistory.push({
      id: 'en-' + Math.random().toString(36).substring(2, 9),
      profile_id: userId,
      change_amount: 100,
      reason: 'dev_cheat_restore',
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_energy_history', energyHistory);

    this.addAuditLog(userId, 'developer.claim_energy', { energy: 100 });
    return { success: true, error: null };
  }

  // Marketplace Getters
  async getMarketListings(): Promise<MarketListing[]> {
    this.ensureInitialized(this.getSessionUserId());
    const listings = this.getStorageItem<MarketListing[]>('mmo_market_listings', []);
    const active = listings.filter((l) => l.status === 'active');
    
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    const companies = this.getStorageItem<Company[]>('mmo_companies', []);
    
    return active.map((l) => {
      const sellerProfile = profiles[l.seller_id];
      const sellerCompany = l.seller_company_id ? companies.find((c) => c.id === l.seller_company_id) : null;
      const res = DEFAULT_RESOURCES.find((r) => r.id === l.resource_id);
      
      return {
        ...l,
        seller_name: sellerProfile?.username || this.npcName(l.seller_id) || l.seller_name || 'Unknown Seller',
        seller_company_name: sellerCompany?.name || undefined,
        resource_name: res?.name || l.resource_name || undefined,
      };
    });
  }

  async getMarketOrders(): Promise<MarketOrder[]> {
    this.ensureInitialized(this.getSessionUserId());
    const orders = this.getStorageItem<MarketOrder[]>('mmo_market_orders', []);
    const active = orders.filter((o) => o.status === 'active');
    
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    const companies = this.getStorageItem<Company[]>('mmo_companies', []);
    
    return active.map((o) => {
      const buyerProfile = profiles[o.buyer_id];
      const buyerCompany = o.buyer_company_id ? companies.find((c) => c.id === o.buyer_company_id) : null;
      const res = DEFAULT_RESOURCES.find((r) => r.id === o.resource_id);
      
      return {
        ...o,
        buyer_name: buyerProfile?.username || this.npcName(o.buyer_id) || o.buyer_name || 'Unknown Buyer',
        buyer_company_name: buyerCompany?.name || undefined,
        resource_name: res?.name || o.resource_name || undefined,
      };
    });
  }

  async getMarketHistory(): Promise<MarketTransaction[]> {
    const txs = this.getStorageItem<MarketTransaction[]>('mmo_market_transactions', []);
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    
    return txs.map((t) => {
      const sellerProfile = t.seller_id ? profiles[t.seller_id] : null;
      const buyerProfile = t.buyer_id ? profiles[t.buyer_id] : null;
      const res = DEFAULT_RESOURCES.find((r) => r.id === t.resource_id);
      
      return {
        ...t,
        resource_name: res?.name || undefined,
        seller_name: sellerProfile?.username || undefined,
        buyer_name: buyerProfile?.username || undefined,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getMarketNotifications(userId: string): Promise<MarketNotification[]> {
    this.ensureInitialized(userId);
    const notifications = this.getStorageItem<MarketNotification[]>('mmo_market_notifications', []);
    return notifications.filter((n) => n.profile_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const notifications = this.getStorageItem<MarketNotification[]>('mmo_market_notifications', []);
    const idx = notifications.findIndex((n) => n.id === notificationId && n.profile_id === userId);
    if (idx !== -1) {
      notifications[idx].read = true;
      this.setStorageItem('mmo_market_notifications', notifications);
    }
    return { success: true, error: null };
  }

  // Marketplace Actions
  async createMarketListing(
    userId: string,
    companyId: string | null,
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemId: string | null,
    quantity: number,
    pricePerUnit: number,
    currencyType: 'local' | 'gold'
  ): Promise<{ success: boolean; listingId: string | null; error: string | null }> {
    this.ensureInitialized(userId);

    if (quantity <= 0 || pricePerUnit <= 0) {
      return { success: false, listingId: null, error: 'Quantity and price must be positive.' };
    }

    let itemTemplateId: number | null = null;

    if (companyId === null) {
      if (assetType === 'resource') {
        const playerResources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
        const idx = playerResources.findIndex((item) => item.profile_id === userId && item.resource_id === resourceId);
        if (idx === -1 || playerResources[idx].quantity < quantity) {
          return { success: false, listingId: null, error: 'Insufficient resources in inventory.' };
        }
        playerResources[idx].quantity -= quantity;
        this.setStorageItem('mmo_player_resources', playerResources);
      } else {
        const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
        const idx = inventories.findIndex((item) => item.id === itemId && item.owner_id === userId);
        if (idx === -1) {
          return { success: false, listingId: null, error: 'Item not found in inventory.' };
        }
        itemTemplateId = inventories[idx].item_template_id;
        inventories[idx].owner_id = 'escrow';
        this.setStorageItem('mmo_inventories', inventories);
      }
    } else {
      const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
      const member = members.find((m) => m.company_id === companyId && m.profile_id === userId);
      if (!member || !['Owner', 'Director', 'Manager'].includes(member.role)) {
        return { success: false, listingId: null, error: 'Insufficient company permission.' };
      }

      if (assetType === 'resource') {
        const companyInv = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);
        const idx = companyInv.findIndex((item) => item.company_id === companyId && item.resource_id === resourceId);
        if (idx === -1 || companyInv[idx].quantity < quantity) {
          return { success: false, listingId: null, error: 'Insufficient resources in company vault.' };
        }
        companyInv[idx].quantity -= quantity;
        this.setStorageItem('mmo_company_inventory', companyInv);
      } else {
        return { success: false, listingId: null, error: 'Companies cannot list individual items yet.' };
      }
    }

    let listingRegionId = 1;
    if (companyId) {
      const companies = this.getStorageItem<Company[]>('mmo_companies', []);
      const company = companies.find((c) => c.id === companyId);
      if (company) listingRegionId = company.region_id;
    } else {
      const profiles = this.getStorageItem<any>('mmo_profiles', {});
      const profile = profiles[userId];
      if (profile && profile.current_region_id) listingRegionId = profile.current_region_id;
    }

    const listings = this.getStorageItem<MarketListing[]>('mmo_market_listings', []);
    const listingId = 'lst-' + Math.random().toString(36).substring(2, 9);
    const newListing: MarketListing = {
      id: listingId,
      seller_id: userId,
      seller_company_id: companyId,
      region_id: listingRegionId,
      asset_type: assetType,
      resource_id: resourceId,
      item_id: itemId,
      quantity,
      price_per_unit: pricePerUnit,
      currency_type: currencyType,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    listings.push(newListing);
    this.setStorageItem('mmo_market_listings', listings);

    const escrow = this.getStorageItem<MarketEscrow[]>('mmo_market_escrow', []);
    escrow.push({
      id: 'esc-' + Math.random().toString(36).substring(2, 9),
      profile_id: companyId ? null : userId,
      company_id: companyId,
      listing_id: listingId,
      escrow_type: assetType === 'resource' ? 'resource' : 'item',
      resource_id: resourceId || undefined,
      item_id: itemId || undefined,
      amount: quantity,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_market_escrow', escrow);

    this.addAuditLog(userId, 'marketplace.create_listing', {
      asset_type: assetType,
      resource_id: resourceId,
      quantity,
      price: pricePerUnit,
      company_id: companyId,
    });

    await this.matchOrders(assetType, resourceId, itemTemplateId);

    return { success: true, listingId, error: null };
  }

  async createMarketOrder(
    userId: string,
    companyId: string | null,
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemTemplateId: number | null,
    quantity: number,
    pricePerUnit: number,
    currencyType: 'local' | 'gold'
  ): Promise<{ success: boolean; orderId: string | null; error: string | null }> {
    this.ensureInitialized(userId);

    if (quantity <= 0 || pricePerUnit <= 0) {
      return { success: false, orderId: null, error: 'Quantity and price must be positive.' };
    }

    const cashRequired = quantity * pricePerUnit;

    if (companyId === null) {
      const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
      const wallet = currenciesMap[userId];
      if (!wallet || wallet.local_currency_balance < cashRequired) {
        return { success: false, orderId: null, error: 'Insufficient cash in wallet.' };
      }
      wallet.local_currency_balance -= cashRequired;
      this.setStorageItem('mmo_currencies', currenciesMap);
    } else {
      const members = this.getStorageItem<CompanyMember[]>('mmo_company_members', []);
      const member = members.find((m) => m.company_id === companyId && m.profile_id === userId);
      if (!member || !['Owner', 'Director', 'Manager', 'Accountant'].includes(member.role)) {
        return { success: false, orderId: null, error: 'Insufficient company permission.' };
      }

      const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
      const vault = vaults[companyId];
      if (!vault || vault.local_currency < cashRequired) {
        return { success: false, orderId: null, error: 'Insufficient cash in company vault.' };
      }
      vault.local_currency -= cashRequired;
      this.setStorageItem('mmo_company_vaults', vaults);
    }

    let orderRegionId = 1;
    if (companyId) {
      const companies = this.getStorageItem<Company[]>('mmo_companies', []);
      const company = companies.find((c) => c.id === companyId);
      if (company) orderRegionId = company.region_id;
    } else {
      const profiles = this.getStorageItem<any>('mmo_profiles', {});
      const profile = profiles[userId];
      if (profile && profile.current_region_id) orderRegionId = profile.current_region_id;
    }

    const orders = this.getStorageItem<MarketOrder[]>('mmo_market_orders', []);
    const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
    const newOrder: MarketOrder = {
      id: orderId,
      buyer_id: userId,
      buyer_company_id: companyId,
      region_id: orderRegionId,
      asset_type: assetType,
      resource_id: resourceId,
      item_template_id: itemTemplateId,
      quantity,
      price_per_unit: pricePerUnit,
      currency_type: currencyType,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.push(newOrder);
    this.setStorageItem('mmo_market_orders', orders);

    const escrow = this.getStorageItem<MarketEscrow[]>('mmo_market_escrow', []);
    escrow.push({
      id: 'esc-' + Math.random().toString(36).substring(2, 9),
      profile_id: companyId ? null : userId,
      company_id: companyId,
      order_id: orderId,
      escrow_type: 'currency',
      currency_type: currencyType,
      amount: cashRequired,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_market_escrow', escrow);

    this.addAuditLog(userId, 'marketplace.create_order', {
      asset_type: assetType,
      resource_id: resourceId,
      quantity,
      price: pricePerUnit,
      company_id: companyId,
    });

    await this.matchOrders(assetType, resourceId, itemTemplateId);

    return { success: true, orderId, error: null };
  }

  async cancelMarketListing(userId: string, listingId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const listings = this.getStorageItem<MarketListing[]>('mmo_market_listings', []);
    const idx = listings.findIndex((l) => l.id === listingId);
    if (idx === -1) {
      return { success: false, error: 'Listing not found.' };
    }

    const listing = listings[idx];
    if (listing.seller_id !== userId) {
      return { success: false, error: 'Unauthorized cancellation request.' };
    }

    if (listing.status !== 'active') {
      return { success: false, error: 'Listing is no longer active.' };
    }

    listing.status = 'cancelled';
    listing.updated_at = new Date().toISOString();
    this.setStorageItem('mmo_market_listings', listings);

    const escrow = this.getStorageItem<MarketEscrow[]>('mmo_market_escrow', []);
    const eIdx = escrow.findIndex((e) => e.listing_id === listingId);
    if (eIdx !== -1) {
      const escrowRow = escrow[eIdx];
      if (listing.asset_type === 'resource') {
        if (listing.seller_company_id === null) {
          const playerResources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
          const rIdx = playerResources.findIndex((item) => item.profile_id === userId && item.resource_id === listing.resource_id);
          if (rIdx !== -1) playerResources[rIdx].quantity += escrowRow.amount;
          else playerResources.push({ profile_id: userId, resource_id: listing.resource_id!, quantity: escrowRow.amount });
          this.setStorageItem('mmo_player_resources', playerResources);
        } else {
          const companyInv = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);
          const rIdx = companyInv.findIndex((item) => item.company_id === listing.seller_company_id! && item.resource_id === listing.resource_id);
          if (rIdx !== -1) companyInv[rIdx].quantity += escrowRow.amount;
          else companyInv.push({ company_id: listing.seller_company_id!, resource_id: listing.resource_id!, quantity: escrowRow.amount });
          this.setStorageItem('mmo_company_inventory', companyInv);
        }
      } else {
        const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
        const iIdx = inventories.findIndex((item) => item.id === listing.item_id);
        if (iIdx !== -1) {
          inventories[iIdx].owner_id = userId;
          this.setStorageItem('mmo_inventories', inventories);
        }
      }
      escrow.splice(eIdx, 1);
      this.setStorageItem('mmo_market_escrow', escrow);
    }

    this.addNotification(userId, 'cancellation', `Cancelled listing for ${listing.asset_type}. Assets returned to stock.`);
    this.addAuditLog(userId, 'marketplace.cancel_listing', { listing_id: listingId });

    return { success: true, error: null };
  }

  async cancelMarketOrder(userId: string, orderId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const orders = this.getStorageItem<MarketOrder[]>('mmo_market_orders', []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      return { success: false, error: 'Order not found.' };
    }

    const order = orders[idx];
    if (order.buyer_id !== userId) {
      return { success: false, error: 'Unauthorized cancellation request.' };
    }

    if (order.status !== 'active') {
      return { success: false, error: 'Order is no longer active.' };
    }

    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();
    this.setStorageItem('mmo_market_orders', orders);

    const escrow = this.getStorageItem<MarketEscrow[]>('mmo_market_escrow', []);
    const eIdx = escrow.findIndex((e) => e.order_id === orderId);
    if (eIdx !== -1) {
      const escrowRow = escrow[eIdx];
      if (order.buyer_company_id === null) {
        const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
        if (currenciesMap[userId]) {
          currenciesMap[userId].local_currency_balance += escrowRow.amount;
          this.setStorageItem('mmo_currencies', currenciesMap);
        }
      } else {
        const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
        if (order.buyer_company_id && vaults[order.buyer_company_id]) {
          vaults[order.buyer_company_id].local_currency += escrowRow.amount;
          this.setStorageItem('mmo_company_vaults', vaults);
        }
      }
      escrow.splice(eIdx, 1);
      this.setStorageItem('mmo_market_escrow', escrow);
    }

    this.addNotification(userId, 'cancellation', `Cancelled active buy order. Locked currency was refunded.`);
    this.addAuditLog(userId, 'marketplace.cancel_order', { order_id: orderId });

    return { success: true, error: null };
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const list = this.getStorageItem<WatchlistItem[]>('mmo_market_watchlists', []);
    return list.filter((w) => w.profile_id === userId);
  }

  async toggleWatchlist(userId: string, assetType: 'resource' | 'item', assetId: number): Promise<{ success: boolean; isWatched: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const list = this.getStorageItem<WatchlistItem[]>('mmo_market_watchlists', []);
    const idx = list.findIndex((w) => w.profile_id === userId && w.asset_type === assetType && w.asset_id === assetId);
    let isWatched = false;
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      list.push({ profile_id: userId, asset_type: assetType, asset_id: assetId, created_at: new Date().toISOString() });
      isWatched = true;
    }
    this.setStorageItem('mmo_market_watchlists', list);
    return { success: true, isWatched, error: null };
  }

// Phase 5: Dynasties, Kingdom Leadership, and Succession implementations

  async getNobleHouses(): Promise<NobleHouse[]> {
    // Return static noble houses inspired by medieval civilizations
    return [
      { id: 1, name: 'House of York', culture: 'european', founded_at: new Date().toISOString(), motto: 'Forward into battle', is_extant: true },
      { id: 2, name: 'House of Wittelsbach', culture: 'european', founded_at: new Date().toISOString(), motto: 'Per severa ad alta', is_extant: true },
      { id: 3, name: 'House of Osman', culture: 'middle_eastern', founded_at: new Date().toISOString(), motto: 'Asar us', is_extant: true },
      { id: 4, name: 'House of Ming', culture: 'asian', founded_at: new Date().toISOString(), motto: 'The dragon protects', is_extant: true },
      { id: 5, name: 'House of Chagatai', culture: 'steppe', founded_at: new Date().toISOString(), motto: 'Wind of the steppe', is_extant: false }
    ];
  }

  async getDynasty(profileId?: string): Promise<Dynasty | null> {
    const sid = profileId || this.getSessionUserId();
    this.ensureInitialized(sid);
    const dynasties = this.getStorageItem<Dynasty[]>('mmo_dynasties', []);
    if (profileId) {
      return dynasties.find((d) => d.founder_profile_id === profileId) || null;
    }
    return dynasties.length > 0 ? dynasties[0] : null;
  }

  async getDynastyMembers(dynastyId: number): Promise<DynastyMember[]> {
    this.ensureInitialized(this.getSessionUserId());
    const members = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
    return members.filter((m) => m.dynasty_id === dynastyId && m.is_alive);
  }

  async getRulerLegitimacy(profileId: string): Promise<RulerLegitimacy | null> {
    this.ensureInitialized(profileId);
    const legitimacyRecords = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {});
    const record = legitimacyRecords[profileId];
    if (record) {
      return record;
    }
    // Initialize new record
    const newRecord: RulerLegitimacy = {
      profile_id: profileId,
      legitimacy: 100,
      last_validated_at: new Date().toISOString(),
      legitimacy_reasons: 'heir_clear',
      last_succession_event: undefined
    };
    legitimacyRecords[profileId] = newRecord;
    this.setStorageItem('mmo_ruler_legitimacy', legitimacyRecords);
    return newRecord;
  }

  async getKingdomStability(countryId: number): Promise<KingdomStability | null> {
    this.ensureInitialized(this.getSessionUserId());
    const stabilities = this.getStorageItem<KingdomStability[]>('mmo_kingdom_stability', []);
    let record = stabilities.find((s) => s.country_id === countryId);
    if (record) {
      return record;
    }
    // Initialize new record
    const newRecord: KingdomStability = {
      country_id: countryId,
      stability: 100,
      legitimacy_modifier: 0,
      dynasty_prestige_modifier: 0,
      last_checked_at: new Date().toISOString(),
      notes: undefined
    };
    stabilities.push(newRecord);
    this.setStorageItem('mmo_kingdom_stability', stabilities);
    return newRecord;
  }

  async establishDynasty(dynastyName: string, nobleHouseName: string, founderTitle: 'King' | 'Queen' | 'Sultan' | 'Shah' | 'Khagan', countryId: number, successionLaw: 'hereditary' | 'elective' | 'appointed'): Promise<{ success: boolean; dynastyId?: number; error: string | null }> {
    const sid = this.getSessionUserId();
    this.ensureInitialized(sid);

    // Validate founder has a country
    const countries = this.getStorageItem<Country[]>('mmo_countries', DEFAULT_COUNTRIES);
    const country = countries.find((c) => c.id === countryId);
    if (!country) {
      return { success: false, dynastyId: undefined, error: 'Country not found.' };
    }

    // Create dynasty
    const newDynasty: Dynasty = {
      id: Math.floor(Math.random() * 10000) + 1000,
      name: dynastyName,
      noble_house_id: 1, // simplified: always use House of York for now
      founder_profile_id: sid,
      founder_title: founderTitle,
      country_id: countryId,
      founded_at: new Date().toISOString(),
      capital_region_id: 1,
      succession_law: successionLaw,
      is_active: true,
      member_count: 1,
      total_prestige: 0,
      members: [],
      historical_rulers: []
    };

    // Initialize dynasty storage
    let dynasties = this.getStorageItem<Dynasty[]>('mmo_dynasties', []);
    dynasties.push(newDynasty);
    this.setStorageItem('mmo_dynasties', dynasties);

    // Initialize dynasty members
    let dynastyMembers = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
    const founderMember: DynastyMember = {
      id: dynastyMembers.length + 1,
      dynasty_id: newDynasty.id,
      profile_id: sid,
      name: 'Founder Ruler',
      title: (founderTitle === 'Queen' ? 'Queen' : 'King') as any,
      relationship: 'founder',
      succession_order: 1,
      is_alive: true,
      date_of_birth: new Date().toISOString(),
      date_of_death: undefined,
      notes: 'Founder of the dynasty'
    };
    dynastyMembers.push(founderMember);
    this.setStorageItem('mmo_dynasty_members', dynastyMembers);

    // Initialize ruler legitimacy
    let legitimacyRecords = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {});
    legitimacyRecords[sid] = {
      profile_id: sid,
      legitimacy: 100,
      last_validated_at: new Date().toISOString(),
      legitimacy_reasons: 'heir_clear',
      last_succession_event: 'dynasty_established'
    };
    this.setStorageItem('mmo_ruler_legitimacy', legitimacyRecords);

    // Initialize kingdom stability
    let stabilities = this.getStorageItem<KingdomStability[]>('mmo_kingdom_stability', []);
    const existingIdx = stabilities.findIndex((s) => s.country_id === countryId);
    if (existingIdx !== -1) {
      stabilities[existingIdx] = {
        country_id: countryId,
        stability: 100,
        legitimacy_modifier: 0,
        dynasty_prestige_modifier: 0,
        last_checked_at: new Date().toISOString(),
        notes: 'Initialized on dynasty establishment'
      };
    } else {
      stabilities.push({
        country_id: countryId,
        stability: 100,
        legitimacy_modifier: 0,
        dynasty_prestige_modifier: 0,
        last_checked_at: new Date().toISOString(),
        notes: 'Initialized on dynasty establishment'
      });
    }
    this.setStorageItem('mmo_kingdom_stability', stabilities);

    return { success: true, dynastyId: newDynasty.id, error: null };
  }

  async designateHeir(dynastyId: number, heirProfileId: string, heirTitle: 'King' | 'Queen' | 'Heir', successionLaw: 'hereditary' | 'elective' | 'appointed'): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(this.getSessionUserId());

    const dynastyMembers = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
    const dynasty = this.getStorageItem<Dynasty[]>('mmo_dynasties', [])?.find((d) => d.id === dynastyId);

    if (!dynasty) {
      return { success: false, error: 'Dynasty not found.' };
    }

    // Check if heir already exists in dynasty
    const existingHeir = dynastyMembers.find((m) => m.profile_id === heirProfileId);
    if (existingHeir) {
      return { success: false, error: 'This profile is already a member of the dynasty.' };
    }

    // Determine succession order based on law
    let nextOrder = 1;
    if (dynastyMembers.length > 0) {
      const maxOrder = Math.max(...dynastyMembers.map((m) => m.succession_order));
      nextOrder = maxOrder + 1;
    }

    // If elective, allow designation; if hereditary, eldest child; if appointed, designated
    const newHeir: DynastyMember = {
      id: dynastyMembers.length + 1,
      profile_id: heirProfileId,
      name: 'Heir Designate', // In production, would look up name from profile
      title: heirTitle,
      relationship: 'other',
      succession_order: nextOrder,
      is_alive: true,
      date_of_birth: new Date().toISOString(),
      date_of_death: null,
      notes: `Heir designated via ${successionLaw} succession`,
      dynasty_id: dynastyId
    };

    dynastyMembers.push(newHeir);
    this.setStorageItem('mmo_dynasty_members', dynastyMembers);

    return { success: true, error: null };
  }

  async abdicateThrone(profileId: string, regentProfileId?: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(profileId);

    const legitimacy = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {});
    const legitimacyRecord = legitimacy[profileId];

    if (!legitimacyRecord) {
      return { success: false, error: 'No legitimacy record found for this profile.' };
    }

    // If there's a regent, validate them
    if (regentProfileId) {
      const dynastyMembers = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
      const regent = dynastyMembers.find((m) => m.profile_id === regentProfileId);
      if (!regent) {
        return { success: false, error: 'Regent profile not found in dynasty.' };
      }
    }

    // Mark the current ruler as abdicated
    legitimacyRecord.last_succession_event = 'abdication';
    legitimacy[profileId] = legitimacyRecord;
    this.setStorageItem('mmo_ruler_legitimacy', legitimacy);

    // If there's a regent, designate them as the ruling authority
    if (regentProfileId) {
      // In a full implementation, we would transfer rule authority
      return { success: true, error: null };
    }

    // No regent - succession will be determined by succession law
    return { success: true, error: null };
  }

  async resolveSuccession(dynastyId: number, newRulerProfileId: string): Promise<{ success: boolean; newRulerTitle?: string; error: string | null }> {
    this.ensureInitialized(this.getSessionUserId());

    const dynasty = this.getStorageItem<Dynasty[]>('mmo_dynasties', [])?.find((d) => d.id === dynastyId);
    if (!dynasty) {
      return { success: false, newRulerTitle: undefined, error: 'Dynasty not found.' };
    }

    const dynastyMembers = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
    const legitimacyRecord = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {})[newRulerProfileId];

    if (!legitimacyRecord) {
      return { success: false, newRulerTitle: undefined, error: 'No legitimacy record for new ruler.' };
    }

    // Determine the new ruler's title based on succession law
    let newRulerTitle: string | undefined;
    switch (dynasty.succession_law) {
      case 'hereditary':
        // Find the heir (highest succession_order among those alive and related)
        const eligibleHeirs = dynastyMembers.filter((m) => m.is_alive && m.relationship !== 'founder');
        if (eligibleHeirs.length > 0) {
          // Sort by succession order (lower = first)
          const sorted = eligibleHeirs.sort((a, b) => a.succession_order - b.succession_order);
          newRulerTitle = sorted[0].title;
        } else {
          return { success: false, newRulerTitle: undefined, error: 'No eligible heirs in hereditary succession.' };
        }
        break;

      case 'elective':
        // In elective succession, the new ruler was already designated
        newRulerTitle = legitimacyRecord.last_succession_event ? 'King' : 'Elected Ruler';
        break;

      case 'appointed':
        newRulerTitle = legitimacyRecord.last_succession_event ? 'Appointed Ruler' : 'Appointed Ruler';
        break;

      default:
        newRulerTitle = 'Ruler';
    }

    // Update legitimacy record with succession event
    legitimacyRecord.last_succession_event = `succession_resolved_via_${dynasty.succession_law}`;
    legitimacyRecord.legitimacy = legitimacyRecord.legitimacy; // keep existing
    legitimacyRecord.last_validated_at = new Date().toISOString();
    const legitimacyRecords = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {});
    legitimacyRecords[newRulerProfileId] = legitimacyRecord;
    this.setStorageItem('mmo_ruler_legitimacy', legitimacyRecords);

    // Update dynasty member status - mark previous ruler as deceased or retired
    // In a full implementation, we'd update the dynasty's historical_rulers

    return { success: true, newRulerTitle, error: null };
  }

  async updateLegitimacy(profileId: string, legitimacy: number, reason: 'heir_clear' | 'election_verified' | 'appointment_confirmed' | 'usurpation' | 'disputed'): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(profileId);

    if (legitimacy < 0 || legitimacy > 100) {
      return { success: false, error: 'Legitimacy must be between 0 and 100.' };
    }

    let legitimacyRecords = this.getStorageItem<Record<string, RulerLegitimacy>>('mmo_ruler_legitimacy', {});
    const record = legitimacyRecords[profileId] || {
      profile_id: profileId,
      legitimacy: 50,
      last_validated_at: new Date().toISOString(),
      legitimacy_reasons: 'heir_clear',
      last_succession_event: undefined
    };

    record.legitimacy = legitimacy;
    record.last_validated_at = new Date().toISOString();
    record.legitimacy_reasons = reason;

    legitimacyRecords[profileId] = record;
    this.setStorageItem('mmo_ruler_legitimacy', legitimacyRecords);

    return { success: true, error: null };
  }

  async getSuccessionOrder(dynastyId: number): Promise<DynastyMember[]> {
    this.ensureInitialized(this.getSessionUserId());
    const dynastyMembers = this.getStorageItem<DynastyMember[]>('mmo_dynasty_members', []);
    return dynastyMembers.filter((m) => m.dynasty_id === dynastyId).sort((a, b) => a.succession_order - b.succession_order);
  }

  // End Phase 5 implementations
  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const alerts = this.getStorageItem<PriceAlert[]>('mmo_price_alerts', []);
    return alerts.filter((a) => a.profile_id === userId && !a.is_triggered);
  }

  async createPriceAlert(userId: string, assetType: 'resource' | 'item', assetId: number, targetPrice: number, condition: 'above' | 'below'): Promise<{ success: boolean; alertId: string | null; error: string | null }> {
    this.ensureInitialized(userId);
    const alerts = this.getStorageItem<PriceAlert[]>('mmo_price_alerts', []);
    const alertId = 'al-' + Math.random().toString(36).substring(2, 9);
    alerts.push({
      id: alertId,
      profile_id: userId,
      asset_type: assetType,
      asset_id: assetId,
      target_price: targetPrice,
      alert_condition: condition,
      is_triggered: false,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_price_alerts', alerts);
    return { success: true, alertId, error: null };
  }

  async deletePriceAlert(userId: string, alertId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const alerts = this.getStorageItem<PriceAlert[]>('mmo_price_alerts', []);
    const idx = alerts.findIndex((a) => a.id === alertId && a.profile_id === userId);
    if (idx !== -1) {
      alerts.splice(idx, 1);
      this.setStorageItem('mmo_price_alerts', alerts);
    }
    return { success: true, error: null };
  }

  private addNotification(userId: string, type: string, message: string) {
    const notifications = this.getStorageItem<MarketNotification[]>('mmo_market_notifications', []);
    notifications.push({
      id: 'not-' + Math.random().toString(36).substring(2, 9),
      profile_id: userId,
      type,
      message,
      read: false,
      created_at: new Date().toISOString(),
    });
    this.setStorageItem('mmo_market_notifications', notifications);
  }

  private async matchOrders(
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemTemplateId: number | null
  ): Promise<void> {
    const listings = this.getStorageItem<MarketListing[]>('mmo_market_listings', []);
    const orders = this.getStorageItem<MarketOrder[]>('mmo_market_orders', []);
    const escrow = this.getStorageItem<MarketEscrow[]>('mmo_market_escrow', []);
    const txs = this.getStorageItem<MarketTransaction[]>('mmo_market_transactions', []);
    const alerts = this.getStorageItem<PriceAlert[]>('mmo_price_alerts', []);

    const feeRate = 0.0200;

    let loopMatched = true;

    while (loopMatched) {
      loopMatched = false;

      const activeBids = orders
        .filter((o) => o.status === 'active' && o.asset_type === assetType && (resourceId === null || o.resource_id === resourceId))
        .sort((a, b) => b.price_per_unit - a.price_per_unit || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const activeAsks = listings
        .filter((l) => {
          if (l.status !== 'active' || l.asset_type !== assetType) return false;
          if (assetType === 'resource') {
            return resourceId === null || l.resource_id === resourceId;
          } else {
            if (itemTemplateId === null) return true;
            const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
            const item = inventories.find((i) => i.id === l.item_id);
            return item && item.item_template_id === itemTemplateId;
          }
        })
        .sort((a, b) => a.price_per_unit - b.price_per_unit || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      if (activeBids.length === 0 || activeAsks.length === 0) break;

      const topBid = activeBids[0];
      const topAsk = activeAsks[0];

      if (topBid.price_per_unit >= topAsk.price_per_unit) {
        loopMatched = true;

        const regionId = topAsk.region_id;
        const regions = this.getStorageItem<Region[]>('mmo_regions', DEFAULT_REGIONS);
        const region = regions.find((r) => r.id === regionId);
        const countryId = region ? region.country_id : 1;
        const countries = this.getStorageItem<Country[]>('mmo_countries', DEFAULT_COUNTRIES);
        const country = countries.find((c) => c.id === countryId);
        const vatRate = country ? country.vat_rate / 100.0 : 0.0500;

        const tradeQty = Math.min(topBid.quantity, topAsk.quantity);
        const tradePrice = topAsk.price_per_unit;

        const totalCost = tradeQty * tradePrice;
        const taxCollected = Number((totalCost * vatRate).toFixed(2));
        const marketFee = Number((totalCost * feeRate).toFixed(2));
        const payout = totalCost - taxCollected - marketFee;

        topAsk.quantity -= tradeQty;
        if (topAsk.quantity === 0) topAsk.status = 'completed';
        topAsk.updated_at = new Date().toISOString();

        topBid.quantity -= tradeQty;
        if (topBid.quantity === 0) topBid.status = 'completed';
        topBid.updated_at = new Date().toISOString();

        const askEscRow = escrow.find((e) => e.listing_id === topAsk.id);
        if (askEscRow) askEscRow.amount -= tradeQty;

        const bidEscRow = escrow.find((e) => e.order_id === topBid.id);
        if (bidEscRow) bidEscRow.amount -= (topBid.price_per_unit * tradeQty);

        const refundAmt = (topBid.price_per_unit - tradePrice) * tradeQty;
        if (refundAmt > 0) {
          if (topBid.buyer_company_id === null) {
            const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
            if (currenciesMap[topBid.buyer_id]) currenciesMap[topBid.buyer_id].local_currency_balance += refundAmt;
            this.setStorageItem('mmo_currencies', currenciesMap);
          } else {
            const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
            if (vaults[topBid.buyer_company_id!]) vaults[topBid.buyer_company_id!].local_currency += refundAmt;
            this.setStorageItem('mmo_company_vaults', vaults);
          }
        }

        if (assetType === 'resource') {
          if (topBid.buyer_company_id === null) {
            const playerResources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
            const rIdx = playerResources.findIndex((r) => r.profile_id === topBid.buyer_id && r.resource_id === topBid.resource_id);
            if (rIdx !== -1) playerResources[rIdx].quantity += tradeQty;
            else playerResources.push({ profile_id: topBid.buyer_id, resource_id: topBid.resource_id!, quantity: tradeQty });
            this.setStorageItem('mmo_player_resources', playerResources);
          } else {
            const companyInv = this.getStorageItem<CompanyInventoryItem[]>('mmo_company_inventory', []);
            const rIdx = companyInv.findIndex((c) => c.company_id === topBid.buyer_company_id! && c.resource_id === topBid.resource_id);
            if (rIdx !== -1) companyInv[rIdx].quantity += tradeQty;
            else companyInv.push({ company_id: topBid.buyer_company_id!, resource_id: topBid.resource_id!, quantity: tradeQty });
            this.setStorageItem('mmo_company_inventory', companyInv);
          }
        } else {
          const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
          const iIdx = inventories.findIndex((item) => item.id === topAsk.item_id);
          if (iIdx !== -1) {
            inventories[iIdx].owner_id = topBid.buyer_id;
            this.setStorageItem('mmo_inventories', inventories);
          }
        }

        if (topAsk.seller_company_id === null) {
          const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
          if (currenciesMap[topAsk.seller_id]) currenciesMap[topAsk.seller_id].local_currency_balance += payout;
          this.setStorageItem('mmo_currencies', currenciesMap);
        } else {
          const vaults = this.getStorageItem<Record<string, CompanyVault>>('mmo_company_vaults', {});
          if (vaults[topAsk.seller_company_id!]) vaults[topAsk.seller_company_id!].local_currency += payout;
          this.setStorageItem('mmo_company_vaults', vaults);
        }

        txs.push({
          id: 'tx-' + Math.random().toString(36).substring(2, 9),
          seller_id: topAsk.seller_id,
          seller_company_id: topAsk.seller_company_id,
          buyer_id: topBid.buyer_id,
          buyer_company_id: topBid.buyer_company_id,
          asset_type: assetType,
          resource_id: topAsk.resource_id,
          item_template_id: itemTemplateId,
          quantity: tradeQty,
          price_per_unit: tradePrice,
          currency_type: topAsk.currency_type,
          tax_collected: taxCollected,
          marketplace_fee: marketFee,
          created_at: new Date().toISOString(),
        });

        this.addNotification(topAsk.seller_id, 'sale', `Your listing was purchased! Sold ${tradeQty} units at ${tradePrice} LC.`);
        this.addNotification(topBid.buyer_id, 'purchase', `Your order was fulfilled! Bought ${tradeQty} units at ${tradePrice} LC.`);

        const trgId = resourceId || itemTemplateId;
        if (trgId !== null) {
          alerts.forEach((alert) => {
            if (alert.asset_type === assetType && alert.asset_id === trgId && !alert.is_triggered) {
              if (
                (alert.alert_condition === 'below' && alert.target_price >= tradePrice) ||
                (alert.alert_condition === 'above' && alert.target_price <= tradePrice)
              ) {
                alert.is_triggered = true;
                this.addNotification(alert.profile_id, 'alert', `Price Alert triggered! ${assetType} reached target price of ${tradePrice} LC.`);
              }
            }
          });
        }
      }
    }

    this.setStorageItem('mmo_market_listings', listings.filter((l) => l.quantity > 0 || l.status !== 'active'));
    this.setStorageItem('mmo_market_orders', orders.filter((o) => o.quantity > 0 || o.status !== 'active'));
    this.setStorageItem('mmo_market_escrow', escrow.filter((e) => e.amount > 0));
    this.setStorageItem('mmo_market_transactions', txs);
    this.setStorageItem('mmo_price_alerts', alerts);
  }

  // Phase 6 Advanced Item mock implementation
  async getItemRecipes(): Promise<ItemRecipe[]> {
    return this.getStorageItem<ItemRecipe[]>('mmo_recipes', [
      {
        id: 1,
        result_template_id: 1,
        result_quantity: 1,
        craft_time: 4,
        energy_cost: 5,
        required_level: 1,
        experience_reward: 10,
        failure_chance: 0.0,
        is_blueprint_required: false,
        inputs: [
          { recipe_id: 1, resource_id: 5, item_template_id: null, quantity: 2 },
          { recipe_id: 1, resource_id: 7, item_template_id: null, quantity: 1 }
        ]
      },
      {
        id: 2,
        result_template_id: 2,
        result_quantity: 1,
        craft_time: 10,
        energy_cost: 15,
        required_level: 2,
        experience_reward: 40,
        failure_chance: 0.05,
        is_blueprint_required: true,
        inputs: [
          { recipe_id: 2, resource_id: 12, item_template_id: null, quantity: 5 },
          { recipe_id: 2, resource_id: 4, item_template_id: null, quantity: 1 }
        ]
      }
    ]);
  }

  async getItemBlueprints(userId: string): Promise<ItemBlueprint[]> {
    return this.getStorageItem<ItemBlueprint[]>('mmo_blueprints_' + userId, []);
  }

  async getItemHistory(userId: string): Promise<ItemHistory[]> {
    return this.getStorageItem<ItemHistory[]>('mmo_history_' + userId, []);
  }

  async getEquipment(userId: string): Promise<Equipment | null> {
    const equips = this.getStorageItem<Record<string, Equipment>>('mmo_equipment_mapping', {});
    if (!equips[userId]) {
      equips[userId] = {
        profile_id: userId,
        weapon_id: null,
        tool_id: null,
        helmet_id: null,
        chest_id: null,
        legs_id: null,
        boots_id: null,
        gloves_id: null,
        shield_id: null,
        ring_id: null,
        necklace_id: null,
        backpack_id: null,
        accessory_id: null,
        updated_at: new Date().toISOString()
      };
      this.setStorageItem('mmo_equipment_mapping', equips);
    }
    return equips[userId];
  }

  async equipItem(userId: string, itemId: string, slot: string): Promise<{ success: boolean; error: string | null }> {
    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const item = inventories.find((i) => i.id === itemId && i.owner_id === userId);
    if (!item) return { success: false, error: 'Item not found in inventory.' };

    const slotCol = (slot + '_id') as keyof Equipment;
    const equips = this.getStorageItem<Record<string, Equipment>>('mmo_equipment_mapping', {});
    if (!equips[userId]) {
      equips[userId] = {
        profile_id: userId,
        weapon_id: null,
        tool_id: null,
        helmet_id: null,
        chest_id: null,
        legs_id: null,
        boots_id: null,
        gloves_id: null,
        shield_id: null,
        ring_id: null,
        necklace_id: null,
        backpack_id: null,
        accessory_id: null,
        updated_at: new Date().toISOString()
      };
    }
    
    (equips[userId] as any)[slotCol] = itemId;
    equips[userId].updated_at = new Date().toISOString();
    this.setStorageItem('mmo_equipment_mapping', equips);

    const hist = this.getStorageItem<ItemHistory[]>('mmo_history_' + userId, []);
    hist.push({
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      item_instance_id: item.item_instance_id || null,
      item_template_id: item.item_template_id,
      profile_id: userId,
      action: 'equipped',
      quantity: 1,
      metadata: { slot },
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_history_' + userId, hist);

    return { success: true, error: null };
  }

  async unequipItem(userId: string, slot: string): Promise<{ success: boolean; error: string | null }> {
    const slotCol = (slot + '_id') as keyof Equipment;
    const equips = this.getStorageItem<Record<string, Equipment>>('mmo_equipment_mapping', {});
    if (!equips[userId] || !(equips[userId] as any)[slotCol]) {
      return { success: false, error: 'No item equipped in this slot.' };
    }

    const itemId = (equips[userId] as any)[slotCol];
    (equips[userId] as any)[slotCol] = null;
    equips[userId].updated_at = new Date().toISOString();
    this.setStorageItem('mmo_equipment_mapping', equips);

    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const item = inventories.find((i) => i.id === itemId);

    if (item) {
      const hist = this.getStorageItem<ItemHistory[]>('mmo_history_' + userId, []);
      hist.push({
        id: 'h-' + Math.random().toString(36).substring(2, 9),
        item_instance_id: item.item_instance_id || null,
        item_template_id: item.item_template_id,
        profile_id: userId,
        action: 'unequipped',
        quantity: 1,
        metadata: { slot },
        created_at: new Date().toISOString()
      });
      this.setStorageItem('mmo_history_' + userId, hist);
    }

    return { success: true, error: null };
  }

  async consumeItem(userId: string, itemId: string): Promise<{ success: boolean; newEnergy?: number; error: string | null }> {
    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const idx = inventories.findIndex((i) => i.id === itemId && i.owner_id === userId);
    if (idx === -1) return { success: false, error: 'Item not found in inventory.' };

    const item = inventories[idx];
    const templates = DEFAULT_ITEM_TEMPLATES;
    const template = templates.find((t) => t.id === item.item_template_id);
    if (!template) return { success: false, error: 'Template not found.' };

    const energyVal = template.attributes?.['energy_restore'] || 0;
    const healthVal = template.attributes?.['health_restore'] || 0;

    if (energyVal === 0 && healthVal === 0) {
      return { success: false, error: 'Item is not consumable.' };
    }

    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    if (statsMap[userId]) {
      statsMap[userId].energy = Math.min(100, statsMap[userId].energy + energyVal);
      this.setStorageItem('mmo_player_stats', statsMap);
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      inventories.splice(idx, 1);
    }
    this.setStorageItem('mmo_inventories', inventories);

    const hist = this.getStorageItem<ItemHistory[]>('mmo_history_' + userId, []);
    hist.push({
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      item_instance_id: item.item_instance_id || null,
      item_template_id: item.item_template_id,
      profile_id: userId,
      action: 'consumed',
      quantity: 1,
      metadata: { energy_restored: energyVal },
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_history_' + userId, hist);

    return { success: true, newEnergy: statsMap[userId]?.energy, error: null };
  }

  async craftItem(userId: string, recipeId: number): Promise<{ success: boolean; error: string | null }> {
    const recipes = await this.getItemRecipes();
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, error: 'Recipe not found.' };

    const statsMap = this.getStorageItem<Record<string, PlayerStats>>('mmo_player_stats', {});
    const stats = statsMap[userId];
    if (!stats) return { success: false, error: 'Stats not found.' };
    if (stats.level < recipe.required_level) {
      return { success: false, error: `Required level ${recipe.required_level} to craft this.` };
    }
    if (stats.energy < recipe.energy_cost) {
      return { success: false, error: 'Insufficient energy.' };
    }

    if (recipe.is_blueprint_required) {
      const blueprints = await this.getItemBlueprints(userId);
      const unlocked = blueprints.some((b) => b.recipe_id === recipeId);
      if (!unlocked) return { success: false, error: 'Blueprint is required to craft this recipe.' };
    }

    const resources = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    for (const input of recipe.inputs || []) {
      if (input.resource_id) {
        const stock = resources.find((r) => r.profile_id === userId && r.resource_id === input.resource_id);
        if (!stock || stock.quantity < input.quantity) {
          return { success: false, error: 'Missing required crafting ingredients.' };
        }
      }
    }

    for (const input of recipe.inputs || []) {
      if (input.resource_id) {
        const stock = resources.find((r) => r.profile_id === userId && r.resource_id === input.resource_id);
        if (stock) stock.quantity -= input.quantity;
      }
    }
    this.setStorageItem('mmo_player_resources', resources);

    stats.energy -= recipe.energy_cost;
    stats.experience += recipe.experience_reward;
    this.setStorageItem('mmo_player_stats', statsMap);

    const roll = Math.random();
    const quality = roll < 0.70 ? 2 : roll < 0.90 ? 3 : roll < 0.98 ? 4 : 5;

    if (Math.random() < recipe.failure_chance) {
      return { success: false, error: 'Crafting failed. Ingredients lost in critical failure.' };
    }

    const template = DEFAULT_ITEM_TEMPLATES.find((t) => t.id === recipe.result_template_id);
    if (!template) return { success: false, error: 'Result template not found.' };

    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);

    if (template.max_durability > 0) {
      const instances = this.getStorageItem<ItemInstance[]>('mmo_instances', []);
      const newInstanceId = 'inst-' + Math.random().toString(36).substring(2, 9);
      instances.push({
        id: newInstanceId,
        template_id: recipe.result_template_id,
        quality,
        current_durability: template.max_durability,
        max_durability: template.max_durability,
        enchantment_level: 0,
        sockets_json: [],
        modifiers_json: [],
        metadata: { crafted_by: userId },
        created_at: new Date().toISOString()
      });
      this.setStorageItem('mmo_instances', instances);

      inventories.push({
        id: 'inv-' + Math.random().toString(36).substring(2, 9),
        owner_id: userId,
        item_template_id: recipe.result_template_id,
        quantity: 1,
        quality,
        item_instance_id: newInstanceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else {
      const existingIdx = inventories.findIndex((i) => i.owner_id === userId && i.item_template_id === recipe.result_template_id && i.quality === quality && !i.item_instance_id);
      if (existingIdx !== -1) {
        inventories[existingIdx].quantity += recipe.result_quantity;
      } else {
        inventories.push({
          id: 'inv-' + Math.random().toString(36).substring(2, 9),
          owner_id: userId,
          item_template_id: recipe.result_template_id,
          quantity: recipe.result_quantity,
          quality,
          item_instance_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    this.setStorageItem('mmo_inventories', inventories);

    const hist = this.getStorageItem<ItemHistory[]>('mmo_history_' + userId, []);
    hist.push({
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      item_instance_id: null,
      item_template_id: recipe.result_template_id,
      profile_id: userId,
      action: 'crafted',
      quantity: recipe.result_quantity,
      metadata: { quality },
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_history_' + userId, hist);

    return { success: true, error: null };
  }

  async repairItem(userId: string, itemId: string): Promise<{ success: boolean; costPaid?: number; error: string | null }> {
    const inventories = this.getStorageItem<InventoryItem[]>('mmo_inventories', []);
    const item = inventories.find((i) => i.id === itemId && i.owner_id === userId);
    if (!item || !item.item_instance_id) return { success: false, error: 'Item not found or not repairable.' };

    const instances = this.getStorageItem<ItemInstance[]>('mmo_instances', []);
    const inst = instances.find((i) => i.id === item.item_instance_id);
    if (!inst) return { success: false, error: 'Item instance not found.' };

    if (inst.current_durability === inst.max_durability) {
      return { success: false, error: 'Item is already at full durability.' };
    }

    const missing = inst.max_durability - inst.current_durability;
    const cost = missing * 1.50;

    const currenciesMap = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    const cur = currenciesMap[userId];
    if (!cur || cur.local_currency_balance < cost) {
      return { success: false, error: `Requires ${cost} LC to repair.` };
    }

    cur.local_currency_balance -= cost;
    inst.current_durability = inst.max_durability;
    this.setStorageItem('mmo_currencies', currenciesMap);
    this.setStorageItem('mmo_instances', instances);

    const hist = this.getStorageItem<ItemHistory[]>('mmo_history_' + userId, []);
    hist.push({
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      item_instance_id: inst.id,
      item_template_id: item.item_template_id,
      profile_id: userId,
      action: 'repaired',
      quantity: 1,
      metadata: { cost },
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_history_' + userId, hist);

    return { success: true, costPaid: cost, error: null };
  }

  async unlockBlueprint(userId: string, recipeId: number): Promise<{ success: boolean; error: string | null }> {
    const blueKey = 'mmo_blueprints_' + userId;
    const blueprints = this.getStorageItem<ItemBlueprint[]>(blueKey, []);
    const already = blueprints.some((b) => b.recipe_id === recipeId);
    if (already) return { success: false, error: 'Blueprint already unlocked.' };

    blueprints.push({
      profile_id: userId,
      recipe_id: recipeId,
      unlocked_at: new Date().toISOString()
    });
    this.setStorageItem(blueKey, blueprints);
    return { success: true, error: null };
  }

  // Phase 7 Living World Mock implementations
  async getRegionalEconomies(): Promise<RegionalEconomy[]> {
    return this.getStorageItem<RegionalEconomy[]>('mmo_regional_economies', [
      { region_id: 1, region_name: 'Solitude Plains', population: 1250, employed: 1020, gdp: 12500.50, tax_reserves: 125.00, updated_at: new Date().toISOString() },
      { region_id: 2, region_name: 'Saragusta', population: 890, employed: 780, gdp: 18900.20, tax_reserves: 340.50, updated_at: new Date().toISOString() },
      { region_id: 3, region_name: 'Obsidian Peaks', population: 1420, employed: 1150, gdp: 24500.00, tax_reserves: 520.10, updated_at: new Date().toISOString() }
    ]);
  }

  async getWorldEvents(): Promise<WorldEvent[]> {
    return this.getStorageItem<WorldEvent[]>('mmo_world_events', [
      {
        id: 'ev-1',
        name: 'Mining Boom',
        description: 'Rich carbon mineral deposits discovered. Coal and Iron Ore output multiplier increases by 50%.',
        type: 'mining_boom',
        region_id: 2,
        active: true,
        modifiers_json: { yield_multiplier: 1.5 },
        duration_ticks: 8,
        created_at: new Date().toISOString()
      }
    ]);
  }

  async getSimulationLogs(): Promise<SimulationLog[]> {
    return this.getStorageItem<SimulationLog[]>('mmo_simulation_logs', [
      { id: 'log-1', tick_index: 1, region_id: 1, metric_name: 'price.grain', metric_value: 1.25, created_at: new Date().toISOString() },
      { id: 'log-2', tick_index: 1, region_id: 1, metric_name: 'price.bread', metric_value: 5.20, created_at: new Date().toISOString() },
      { id: 'log-3', tick_index: 1, region_id: 1, metric_name: 'gdp.total', metric_value: 12500.50, created_at: new Date().toISOString() }
    ]);
  }

  async getNPCLogs(): Promise<NPCActivityLog[]> {
    return this.getStorageItem<NPCActivityLog[]>('mmo_npc_activity_logs', [
      { id: 'npc-log-1', region_id: 1, actor_name: 'NPC Farmer Solitude Plains', action: 'factory.produce', details: 'Harvested and listed 10 raw materials on marketplace.', created_at: new Date().toISOString() },
      { id: 'npc-log-2', region_id: 2, actor_name: 'Steel Smelter of Saragusta', action: 'factory.manufacture', details: 'Consumed inputs and listed 5 refined products on marketplace.', created_at: new Date().toISOString() }
    ]);
  }

  async executeSimulationTick(): Promise<{ success: boolean; tickIndex?: number; error: string | null }> {
    const now = new Date();
    
    // 1. Load data
    const elections = this.getStorageItem<Election[]>('mmo_elections', []);
    const countries = this.getStorageItem<Country[]>('mmo_countries', DEFAULT_COUNTRIES);
    const governmentTerms = this.getStorageItem<GovernmentTerm[]>('mmo_government_terms', []);
    const bills = this.getStorageItem<Bill[]>('mmo_bills', []);

    // 2. Tally expired elections
    const activeElections = elections.filter(e => e.status === 'campaign' && new Date(e.ends_at) <= now);
    for (const election of activeElections) {
      election.status = 'completed';
      const candidates = this.getStorageItem<Candidate[]>(`mmo_candidates_${election.id}`, []);
      candidates.sort((a, b) => b.votes_received - a.votes_received);
      
      if (candidates.length > 0) {
        const winner = candidates[0];
        // Create new term
        governmentTerms.push({
          country_id: election.country_id,
          term_number: election.term_number,
          president_id: winner.candidate_id,
          started_at: now.toISOString(),
          ends_at: new Date(now.getTime() + 86400000).toISOString() // 24 hours
        });
      }
    }

    // 3. Tally expired bills
    const activeBills = bills.filter(b => b.status === 'voting' && new Date(b.ends_at) <= now);
    for (const bill of activeBills) {
      const isApproved = bill.yes_votes > bill.no_votes;
      bill.status = isApproved ? 'passed' : 'rejected';
      
      if (isApproved) {
        const country = countries.find(c => c.id === bill.country_id);
        if (country) {
          if (bill.type === 'tax_change') {
            country.vat_rate = bill.parameters_json?.vat_rate ?? country.vat_rate;
            country.income_tax_rate = bill.parameters_json?.income_tax_rate ?? country.income_tax_rate;
          } else if (bill.type === 'budget_transfer') {
            country.local_currency_reserve -= bill.parameters_json?.amount ?? 0;
          } else if (bill.type === 'national_project') {
            const projects = this.getStorageItem<NationalProject[]>('mmo_national_projects', []);
            projects.push({
              id: projects.length + 1,
              country_id: bill.country_id,
              name: bill.title,
              description: bill.description,
              cost_local: bill.parameters_json?.cost_local ?? 5000.0,
              progress_percent: 0,
              bonuses_json: bill.parameters_json?.bonuses_json ?? {},
              created_at: now.toISOString()
            });
            this.setStorageItem('mmo_national_projects', projects);
          }
        }
      }
    }

    // Save changes
    this.setStorageItem('mmo_elections', elections);
    this.setStorageItem('mmo_countries', countries);
    this.setStorageItem('mmo_government_terms', governmentTerms);
    this.setStorageItem('mmo_bills', bills);

    return { success: true, tickIndex: 3, error: null };
  }

  // Phase 8 Military Combat mock implementations
  async getEnemyTemplates(): Promise<EnemyTemplate[]> {
    return this.getStorageItem<EnemyTemplate[]>('mmo_enemy_templates', [
      { id: 1, name: 'Forest Wolf', health: 50, attack: 10, defense: 4, speed: 12, xp_reward: 10, currency_reward: 3.50, spawn_region_id: 1, difficulty: 'standard', ai_profile: 'standard' },
      { id: 2, name: 'Highway Bandit', health: 80, attack: 16, defense: 6, speed: 9, xp_reward: 20, currency_reward: 8.00, spawn_region_id: 2, difficulty: 'standard', ai_profile: 'standard' },
      { id: 3, name: 'Obsidian Bear', health: 150, attack: 25, defense: 12, speed: 6, xp_reward: 40, currency_reward: 15.00, spawn_region_id: 3, difficulty: 'hard', ai_profile: 'standard' },
      { id: 4, name: 'Ancient Skeleton', health: 120, attack: 22, defense: 18, speed: 10, xp_reward: 50, currency_reward: 20.00, spawn_region_id: 2, difficulty: 'hard', ai_profile: 'standard' },
      { id: 5, name: 'Colossus Warden (Boss)', health: 500, attack: 60, defense: 40, speed: 15, xp_reward: 250, currency_reward: 150.00, spawn_region_id: 3, difficulty: 'boss', ai_profile: 'standard' }
    ]);
  }

  async getCombatRankings(): Promise<CombatRanking[]> {
    return this.getStorageItem<CombatRanking[]>('mmo_combat_rankings', [
      { profile_id: 'p-1', username: 'Aegis_Commander', strength: 24.50, level_pve: 15, pvp_rating: 1450, kills: 48, deaths: 3 },
      { profile_id: 'p-2', username: 'Iron_Striker', strength: 18.20, level_pve: 12, pvp_rating: 1200, kills: 23, deaths: 8 },
      { profile_id: 'p-3', username: 'Novice_recruit', strength: 2.10, level_pve: 2, pvp_rating: 980, kills: 1, deaths: 4 }
    ]);
  }

  async executePvEBattle(enemyTemplateId: number): Promise<{ success: boolean; isVictory?: boolean; xpGained?: number; currencyGained?: number; roundsLog?: CombatRoundLog[]; lootGained?: CombatRewardItem[]; playerHp?: number; error: string | null }> {
    const enemies = await this.getEnemyTemplates();
    const enemy = enemies.find(e => e.id === enemyTemplateId) || enemies[0];

    const roundsLog: CombatRoundLog[] = [
      { round: 1, attacker: 'Player', defender: enemy.name, action: 'hit', damage: 25, defender_hp: enemy.health - 25 },
      { round: 1, attacker: enemy.name, defender: 'Player', action: 'hit', damage: 10, defender_hp: 90 },
      { round: 2, attacker: 'Player', defender: enemy.name, action: 'critical', damage: 50, defender_hp: Math.max(0, enemy.health - 75) }
    ];

    const isVictory = (enemy.health - 75 <= 0);

    const lootGained: CombatRewardItem[] = isVictory ? [
      { type: 'resource', id: 6, quantity: 2, name: 'Fish' }
    ] : [];

    return {
      success: true,
      isVictory,
      xpGained: isVictory ? enemy.xp_reward : 0,
      currencyGained: isVictory ? enemy.currency_reward : 0,
      roundsLog,
      lootGained,
      playerHp: isVictory ? 90 : 0,
      error: null
    };
  }

  async executePvPBattle(opponentProfileId: string): Promise<{ success: boolean; isVictory?: boolean; roundsLog?: CombatRoundLog[]; ratingChange?: number; playerHp?: number; error: string | null }> {
    const roundsLog: CombatRoundLog[] = [
      { round: 1, attacker: 'You', defender: 'Opponent', action: 'hit', damage: 30, defender_hp: 70 },
      { round: 1, attacker: 'Opponent', defender: 'You', action: 'hit', damage: 20, defender_hp: 80 },
      { round: 2, attacker: 'You', defender: 'Opponent', action: 'critical', damage: 80, defender_hp: 0 }
    ];

    return {
      success: true,
      isVictory: true,
      roundsLog,
      ratingChange: 25,
      playerHp: 80,
      error: null
    };
  }

  // Phase 9 Nations and Politics mock implementations
  async getPoliticalParties(): Promise<PoliticalParty[]> {
    return this.getStorageItem<PoliticalParty[]>('mmo_political_parties', [
      { id: 1, name: 'Genesis Alliance Party', description: 'Promoting free trade and industrial expansion across regions.', leader_id: 'p-1', country_id: 1, created_at: new Date().toISOString(), leader_name: 'Aegis_Commander', members_count: 5 },
      { id: 2, name: 'Sovereign Technocracy', description: 'Focusing on research centers, automation, and industrial machinery.', leader_id: 'p-2', country_id: 1, created_at: new Date().toISOString(), leader_name: 'Iron_Striker', members_count: 2 },
      { id: 3, name: 'Pioneers of Solitude', description: 'Agricultural development and basic raw materials extraction.', leader_id: 'p-3', country_id: 2, created_at: new Date().toISOString(), leader_name: 'Novice_recruit', members_count: 1 }
    ]);
  }

  async getElections(): Promise<Election[]> {
    return this.getStorageItem<Election[]>('mmo_elections', [
      { id: 1, country_id: 1, term_number: 1, status: 'campaign', started_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString() },
      { id: 2, country_id: 2, term_number: 1, status: 'campaign', started_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString() }
    ]);
  }

  async getCandidates(electionId: number): Promise<Candidate[]> {
    return this.getStorageItem<Candidate[]>(`mmo_candidates_${electionId}`, [
      { election_id: electionId, candidate_id: 'p-1', party_id: 1, votes_received: 4, username: 'Aegis_Commander', party_name: 'Genesis Alliance Party' },
      { election_id: electionId, candidate_id: 'p-2', party_id: 2, votes_received: 2, username: 'Iron_Striker', party_name: 'Sovereign Technocracy' }
    ]);
  }

  async getBills(): Promise<Bill[]> {
    return this.getStorageItem<Bill[]>('mmo_bills', [
      { id: 1, country_id: 1, creator_id: 'p-1', title: 'VAT Tax Modification', description: 'Decrease marketplace VAT to stimulate local commodity trading.', type: 'tax_change', parameters_json: { vat_rate: 8.0 }, yes_votes: 12, no_votes: 3, status: 'voting', ends_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString(), creator_name: 'Aegis_Commander' },
      { id: 2, country_id: 1, creator_id: 'p-2', title: 'Genesis Highway Infrastructure', description: 'Allocate funds to build roads to boost regional gather output.', type: 'national_project', parameters_json: { cost_local: 15000.00 }, yes_votes: 8, no_votes: 5, status: 'voting', ends_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString(), creator_name: 'Iron_Striker' }
    ]);
  }

  async getNationalProjects(): Promise<NationalProject[]> {
    return this.getStorageItem<NationalProject[]>('mmo_national_projects', [
      { id: 1, country_id: 1, name: 'Genesis Hub Harbor', description: 'Enables 5% bonus to regional export efficiency.', cost_local: 20000.00, progress_percent: 45, bonuses_json: { export_efficiency: 5 }, created_at: new Date().toISOString() }
    ]);
  }

  async createPoliticalParty(name: string, description: string): Promise<{ success: boolean; partyId?: number; error: string | null }> {
    const parties = await this.getPoliticalParties();
    const newId = parties.length + 1;
    parties.push({
      id: newId,
      name,
      description,
      leader_id: 'test-user',
      country_id: 1,
      created_at: new Date().toISOString(),
      leader_name: 'Player',
      members_count: 1
    });
    this.setStorageItem('mmo_political_parties', parties);
    return { success: true, partyId: newId, error: null };
  }

  async joinPoliticalParty(partyId: number): Promise<{ success: boolean; error: string | null }> {
    const parties = await this.getPoliticalParties();
    const party = parties.find(p => p.id === partyId);
    if (!party) return { success: false, error: 'Party not found.' };
    if (party.members_count !== undefined) {
      party.members_count += 1;
    }
    this.setStorageItem('mmo_political_parties', parties);
    return { success: true, error: null };
  }

  async registerAsCandidate(electionId: number): Promise<{ success: boolean; error: string | null }> {
    const candidates = await this.getCandidates(electionId);
    if (candidates.some(c => c.candidate_id === 'test-user')) {
      return { success: false, error: 'Already registered.' };
    }
    candidates.push({
      election_id: electionId,
      candidate_id: 'test-user',
      party_id: null,
      votes_received: 0,
      username: 'Player',
      party_name: 'Independent'
    });
    this.setStorageItem(`mmo_candidates_${electionId}`, candidates);
    return { success: true, error: null };
  }

  async voteForCandidate(electionId: number, candidateId: string): Promise<{ success: boolean; error: string | null }> {
    const candidates = await this.getCandidates(electionId);
    const candidate = candidates.find(c => c.candidate_id === candidateId);
    if (!candidate) return { success: false, error: 'Candidate not found.' };
    candidate.votes_received += 1;
    this.setStorageItem(`mmo_candidates_${electionId}`, candidates);
    return { success: true, error: null };
  }

  async proposeBill(title: string, description: string, type: string, parameters: any): Promise<{ success: boolean; billId?: number; error: string | null }> {
    const bills = await this.getBills();
    const newId = bills.length + 1;
    bills.push({
      id: newId,
      country_id: 1,
      creator_id: 'test-user',
      title,
      description,
      type: type as any,
      parameters_json: parameters,
      yes_votes: 1,
      no_votes: 0,
      status: 'voting',
      ends_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
      creator_name: 'Player'
    });
    this.setStorageItem('mmo_bills', bills);
    return { success: true, billId: newId, error: null };
  }

  async voteOnBill(billId: number, vote: 'yes' | 'no'): Promise<{ success: boolean; error: string | null }> {
    const bills = await this.getBills();
    const bill = bills.find(b => b.id === billId);
    if (!bill) return { success: false, error: 'Bill not found.' };
    if (vote === 'yes') {
      bill.yes_votes += 1;
    } else {
      bill.no_votes += 1;
    }
    this.setStorageItem('mmo_bills', bills);
    return { success: true, error: null };
  }

  // Phase 10 Warfare mock implementations
  async getWars(): Promise<War[]> {
    return this.getStorageItem<War[]>('mmo_wars', [
      { id: 1, attacker_country_id: 1, defender_country_id: 2, status: 'active', started_at: new Date().toISOString(), attacker_name: 'Taifa of Qurtuba', defender_name: 'Saragusta' }
    ]);
  }

  async getMilitaryRegions(): Promise<MilitaryRegion[]> {
    this.ensureInitialized(this.getSessionUserId());
    const rows = this.getStorageItem<MilitaryRegion[]>('mmo_military_regions', [
      { region_id: 1, owner_country_id: 1, occupier_country_id: 1, resistance_level: 0, supply_status: 'supplied', region_name: 'Genesis Capital', owner_name: 'Taifa of Qurtuba', occupier_name: 'Taifa of Qurtuba' },
      { region_id: 2, owner_country_id: 2, occupier_country_id: 2, resistance_level: 0, supply_status: 'supplied', region_name: 'Plains of Devastation', owner_name: 'Taifa of Ishbiliya', occupier_name: 'Taifa of Ishbiliya' },
      { region_id: 3, owner_country_id: 2, occupier_country_id: 1, resistance_level: 30, supply_status: 'unsupplied', region_name: 'Iron Mine Outpost', owner_name: 'Taifa of Ishbiliya', occupier_name: 'Taifa of Qurtuba' }
    ]);
    // Keep display names in step with ownership (conquest backfill)
    for (const r of rows) {
      const expected = r.owner_country_id === 1 ? 'Taifa of Qurtuba' : r.owner_country_id === 2 ? 'Taifa of Ishbiliya' : 'Taifa of Gharnata';
      if (r.owner_name !== expected) r.owner_name = expected;
    }
    this.setStorageItem('mmo_military_regions', rows);
    return rows;
  }

  async getArmyUnits(): Promise<ArmyUnit[]> {
    return this.getStorageItem<ArmyUnit[]>('mmo_army_units', [
      { id: 1, country_id: 1, current_region_id: 1, size: 1000, morale: 95, ammo_qty: 100, rations_qty: 100, status: 'idle', created_at: new Date().toISOString(), region_name: 'Genesis Capital' },
      { id: 2, country_id: 2, current_region_id: 2, size: 800, morale: 80, ammo_qty: 60, rations_qty: 80, status: 'defending', created_at: new Date().toISOString(), region_name: 'Plains of Devastation' }
    ]);
  }

  async getSupplyRoutes(): Promise<SupplyRoute[]> {
    return this.getStorageItem<SupplyRoute[]>('mmo_supply_routes', [
      { id: 1, from_region_id: 1, to_region_id: 2, status: 'active', bandwidth: 80, from_region_name: 'Genesis Capital', to_region_name: 'Plains of Devastation' }
    ]);
  }

  async getPeaceTreaties(): Promise<PeaceTreaty[]> {
    return this.getStorageItem<PeaceTreaty[]>('mmo_peace_treaties', [
      { id: 1, war_id: 1, proposer_country_id: 2, status: 'proposed', reparations_amount: 1500.00, territory_transfer_json: [2], created_at: new Date().toISOString(), proposer_name: 'Saragusta' }
    ]);
  }

  async declareWar(defenderCountryId: number): Promise<{ success: boolean; warId?: number; error: string | null }> {
    const uid = this.getSessionUserId();
    this.ensureInitialized(uid);
    // Vertical-slice balance: a recruitable muster that fits starting stocks.
    const recruitmentCost = [
      { resourceId: 5, quantity: 5 },  // Grain
      { resourceId: 3, quantity: 2 },  // Iron Ore
      { resourceId: 6, quantity: 3 },  // Fish / rations
    ];

    const all = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    const resources = all.filter((r: any) => r.profile_id === uid);
    const hasEnough = recruitmentCost.every(({ resourceId, quantity }) => {
      const item = resources.find((r: any) => r.resource_id === resourceId);
      return (item?.quantity ?? 0) >= quantity;
    });

    if (!hasEnough) {
      return { success: false, warId: undefined, error: 'Insufficient resources to muster: need 5 Grain, 2 Iron Ore, 3 Fish.' };
    }

    for (const { resourceId, quantity } of recruitmentCost) {
      const found = resources.find((r: any) => r.resource_id === resourceId);
      if (found) {
        (found as PlayerResource).quantity = ((found as PlayerResource).quantity ?? 0) - quantity;
      }
    }
    this.setStorageItem('mmo_player_resources', all);

    const wars = await this.getWars();
    const newId = wars.length + 1;
    wars.push({
      id: newId,
      attacker_country_id: 1,
      defender_country_id: defenderCountryId,
      status: 'active',
      started_at: new Date().toISOString(),
      attacker_name: 'Taifa of Qurtuba',
      defender_name: defenderCountryId === 2 ? 'Taifa of Ishbiliya' : defenderCountryId === 3 ? 'Taifa of Gharnata' : 'Foreign Adversary'
    });
    this.setStorageItem('mmo_wars', wars);
    return { success: true, warId: newId, error: null };
  }

  async mobilizeArmy(): Promise<{ success: boolean; armyId?: number; error: string | null }> {
    const uid = this.getSessionUserId();
    this.ensureInitialized(uid);
    const mobilizationCost = [
      { resourceId: 5, quantity: 3 },  // Grain
      { resourceId: 3, quantity: 1 },  // Iron Ore
      { resourceId: 6, quantity: 2 },  // Fish
    ];

    const all = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    const resources = all.filter((r: any) => r.profile_id === uid);
    const hasEnough = mobilizationCost.every(({ resourceId, quantity }) => {
      const item = resources.find((r: any) => r.resource_id === resourceId);
      return (item?.quantity ?? 0) >= quantity;
    });

    if (!hasEnough) {
      return { success: false, armyId: undefined, error: 'Insufficient resources to mobilize: need 3 Grain, 1 Iron Ore, 2 Fish.' };
    }

    for (const { resourceId, quantity } of mobilizationCost) {
      const found = resources.find((r: any) => r.resource_id === resourceId);
      if (found) {
        (found as PlayerResource).quantity = ((found as PlayerResource).quantity ?? 0) - quantity;
      }
    }
    this.setStorageItem('mmo_player_resources', all);

    const armies = await this.getArmyUnits();
    const newId = armies.length + 1;
    armies.push({
      id: newId,
      country_id: 1,
      current_region_id: 1,
      size: 120,
      morale: 92,
      ammo_qty: 80,
      rations_qty: 80,
      status: 'idle',
      created_at: new Date().toISOString(),
      region_name: 'Genesis Capital'
    });
    this.setStorageItem('mmo_army_units', armies);
    return { success: true, armyId: newId, error: null };
  }

  async commandArmyMovement(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }> {
    const armies = await this.getArmyUnits();
    const army = armies.find(a => a.id === armyId);
    if (!army) return { success: false, error: 'Army not found.' };

    // Validate movement against region_edges graph
    const edges = await this.getRegionEdges();
    const edge = edges.find(
      (e: any) =>
        (e.from_region_id === army.current_region_id && e.to_region_id === targetRegionId) ||
        (e.to_region_id === army.current_region_id && e.from_region_id === targetRegionId)
    );

    if (!edge) {
      return { success: false, error: `Invalid movement route from region ${army.current_region_id} to ${targetRegionId}. No valid connection.` };
    }

    // Apply terrain penalty: mountain passes cost extra rations, sea crossings cost ammo
    const terrain = army.status; // simplified - would use region terrain
    const rationsCost = 10; // base ration cost for movement
    const ammoCost = 5; // base ammo cost for movement

    // Check if army has sufficient supplies
    if (army.rations_qty < rationsCost) {
      return { success: false, error: `Insufficient rations for movement. Required ${rationsCost}, have ${army.rations_qty}` };
    }
    if (army.ammo_qty < ammoCost) {
      return { success: false, error: `Insufficient ammunition for movement. Required ${ammoCost}, have ${army.ammo_qty}` };
    }

    // Deduct supplies
    army.rations_qty -= rationsCost;
    army.ammo_qty -= ammoCost;

    // Apply terrain penalty - mountain passes slow movement
    // In a full implementation, this would check edge.mode for terrain type
    const movementPenalty = edge.mode === 'mountain_pass' ? 20 : 0; // 20% effective penalty
    const effectiveDistance = Math.abs(army.current_region_id - targetRegionId) * (1 - movementPenalty / 100);

    army.current_region_id = targetRegionId;
    army.status = 'marching';

    // Check if movement crosses into enemy territory (would require valid war)
    const milRegs = await this.getMilitaryRegions();
    const targetRegion = milRegs.find((r: any) => r.region_id === targetRegionId);
    if (targetRegion && targetRegion.owner_country_id !== army.country_id && targetRegion.occupier_country_id !== army.country_id) {
      // Enemy territory - movement is allowed but marks army as potentially vulnerable
      army.status = 'marching';
    }

    this.setStorageItem('mmo_army_units', armies);
    return { success: true, error: null };
  }

  async engageMilitaryBattle(armyId: number, targetRegionId: number): Promise<{ success: boolean; outcome?: string; error: string | null }> {
    const armies = await this.getArmyUnits();
    const army = armies.find(a => a.id === armyId);
    if (!army) return { success: false, error: 'Army not found.' };

    const milRegs = await this.getMilitaryRegions();
    const targetRegion = milRegs.find((r: any) => r.region_id === targetRegionId);
    if (!targetRegion) return { success: false, error: 'Target region not found.' };

    // Verify active war with the province owner (not a hardcoded country)
    const wars = await this.getWars();
    const atWar = wars.some(
      (w: any) => w.status === 'active' && (
        (w.attacker_country_id === army.country_id && w.defender_country_id === targetRegion.owner_country_id) ||
        (w.attacker_country_id === targetRegion.owner_country_id && w.defender_country_id === army.country_id)
      )
    );

    if (!atWar && targetRegion.owner_country_id !== army.country_id) {
      return { success: false, error: 'Cannot engage without an active war declaration against this province.' };
    }
    if (targetRegion.owner_country_id === army.country_id) {
      return { success: false, error: 'This province is already yours.' };
    }

    // Deterministic resolution (seeded by region+army for repeatability)
    const attackerSize = army.size;
    const attackerMorale = army.morale;
    const defenderSize = targetRegion.resistance_level * 2; // smaller garrison so a mustered host can win the field battle
    const defenderMorale = Math.max(50, 100 - targetRegion.resistance_level);

    const sizeDifference = attackerSize - defenderSize;
    const moraleDifference = attackerMorale - defenderMorale;

    let outcome: string = 'retreat';
    let sizeLoss = Math.min(40, Math.floor(attackerSize * 0.12));
    let moraleLoss = 12;

    if (sizeDifference > 10 && moraleDifference >= -5) {
      outcome = 'pyrrhic_victory';
      sizeLoss = Math.max(12, Math.floor(attackerSize * 0.15));
      moraleLoss = 10;
    } else if (sizeDifference <= -10) {
      outcome = 'repelled';
      sizeLoss = Math.max(15, Math.floor(attackerSize * 0.2));
      moraleLoss = 18;
    } else {
      outcome = 'pyrrhic_victory';
      sizeLoss = Math.max(15, Math.floor(attackerSize * 0.18));
      moraleLoss = 14;
    }

    const attackerAfter = Math.max(0, attackerSize - sizeLoss);
    const defenderAfter = Math.max(0, defenderSize - Math.floor(sizeLoss * 0.6));
    const casualties = sizeLoss;

    army.size = attackerAfter;
    army.morale = Math.max(20, attackerMorale - moraleLoss);
    army.status = 'defending';

    // Field battle weakens resistance but NEVER captures — siege is required.
    targetRegion.occupier_country_id = army.country_id;
    targetRegion.occupier_name = 'Taifa of Qurtuba';
    targetRegion.resistance_level = Math.max(15, targetRegion.resistance_level - 12);

    const report: MilitaryBattleReport = {
      outcome: outcome as any,
      attackerSizeBefore: attackerSize,
      defenderSizeBefore: defenderSize,
      attackerSizeAfter: attackerAfter,
      defenderSizeAfter: defenderAfter,
      casualties,
      moraleAfter: army.morale,
      rounds: [
        `Your host (${attackerSize}) meets the garrison (${defenderSize}) outside ${targetRegion.region_name}.`,
        `Morale ${attackerMorale} against ${defenderMorale} decides the clash.`,
        `Outcome: ${outcome}. The province holds — begin a siege to capture it.`,
      ],
      regionName: targetRegion.region_name || `Province ${targetRegionId}`,
      resistanceAfter: targetRegion.resistance_level,
      siegeRequired: true,
      provinceCaptured: false,
    };
    this.setStorageItem('mmo_last_battle_report', report);

    if (outcome === 'repelled') {
      army.size = Math.max(10, attackerAfter - 10);
      army.morale = Math.max(20, army.morale - 8);
    }

    this.setStorageItem('mmo_army_units', armies);
    this.setStorageItem('mmo_military_regions', milRegs);

    return { success: true, outcome, error: null };
  }

  // Phase 4: Region edges graph for strategic movement
  async getRegionEdges(): Promise<RegionEdge[]> {
    return this.getStorageItem<RegionEdge[]>('mmo_region_edges', [
      { id: 1, from_region_id: 1, to_region_id: 2, mode: 'land', cost: 10, seasonal_restrictions: [], is_reciprocal: true },
      { id: 2, from_region_id: 2, to_region_id: 3, mode: 'mountain_pass', cost: 15, seasonal_restrictions: ['winter'], is_reciprocal: true },
      { id: 3, from_region_id: 1, to_region_id: 3, mode: 'navigable_sea', cost: 20, seasonal_restrictions: [], is_reciprocal: true },
      { id: 4, from_region_id: 3, to_region_id: 4, mode: 'land', cost: 12, seasonal_restrictions: [], is_reciprocal: true },
      { id: 5, from_region_id: 2, to_region_id: 4, mode: 'strait', cost: 18, seasonal_restrictions: ['stormy_season'], is_reciprocal: true }
    ]);
  }

  async proposePeace(warId: number, reparations: number, transfers: number[]): Promise<{ success: boolean; treatyId?: number; error: string | null }> {
    const treaties = await this.getPeaceTreaties();
    const newId = treaties.length + 1;
    treaties.push({
      id: newId,
      war_id: warId,
      proposer_country_id: 1,
      status: 'proposed',
      reparations_amount: reparations,
      territory_transfer_json: transfers,
      created_at: new Date().toISOString(),
      proposer_name: 'Taifa of Qurtuba'
    });
    this.setStorageItem('mmo_peace_treaties', treaties);
    return { success: true, treatyId: newId, error: null };
  }

  async acceptPeace(treatyId: number): Promise<{ success: boolean; error: string | null }> {
    const treaties = await this.getPeaceTreaties();
    const treaty = treaties.find(t => t.id === treatyId);
    if (!treaty) return { success: false, error: 'Treaty not found.' };
    treaty.status = 'accepted';
    this.setStorageItem('mmo_peace_treaties', treaties);

    const wars = await this.getWars();
    const war = wars.find(w => w.id === treaty.war_id);
    if (war) {
      war.status = 'ended';
      this.setStorageItem('mmo_wars', wars);
    }

    return { success: true, error: null };
  }

  // Phase 4: Siege mechanics
  async initiateSiege(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }> {
    const armies = await this.getArmyUnits();
    const army = armies.find(a => a.id === armyId);
    if (!army) return { success: false, error: 'Army not found.' };

    const milRegs = await this.getMilitaryRegions();
    const targetRegion = milRegs.find((r: any) => r.region_id === targetRegionId);
    if (!targetRegion) return { success: false, error: 'Target region not found.' };

    // Check if army is in the same region as the target
    if (army.current_region_id !== targetRegionId) {
      return { success: false, error: 'Army must be in the same province to initiate a siege.' };
    }

    // Check if the region is already under siege (has an occupier with resistance)
    if (targetRegion.resistance_level <= 0) {
      return { success: false, error: 'Region is already captured (resistance level 0).' };
    }

    // Check if the attacking country is at war with the region owner
    const wars = await this.getWars();
    const atWar = wars.some(
      (w: any) =>
        (w.attacker_country_id === army.country_id && w.defender_country_id === targetRegion.owner_country_id) ||
        (w.attacker_country_id === targetRegion.owner_country_id && w.defender_country_id === army.country_id)
    );

    if (!atWar) {
      return { success: false, error: 'Cannot siege a region without an active war declaration.' };
    }

    // Siege consumes rations and reduces army size over time
    const siegeRationCost = 20; // simplified per day cost
    if (army.rations_qty < siegeRationCost) {
      return { success: false, error: `Insufficient rations for siege. Required ${siegeRationCost}, have ${army.rations_qty}` };
    }

    // Dedicate the army to siege status (no resistance inflation — battle already lowered it)
    army.status = 'sieging';
    army.rations_qty -= 8;
    targetRegion.occupier_country_id = army.country_id;
    targetRegion.occupier_name = 'Taifa of Qurtuba';

    this.setStorageItem('mmo_army_units', armies);
    this.setStorageItem('mmo_military_regions', milRegs);

    return { success: true, error: null };
  }

  async progressSiege(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null; provinceCaptured?: boolean; report?: any }> {
    const armies = await this.getArmyUnits();
    const army = armies.find(a => a.id === armyId);
    if (!army) return { success: false, error: 'Army not found.' };

    const milRegs = await this.getMilitaryRegions();
    const targetRegion = milRegs.find((r: any) => r.region_id === targetRegionId);
    if (!targetRegion) return { success: false, error: 'Target region not found.' };

    // Only armies with 'sieging' status can progress a siege
    if (army.status !== 'sieging') {
      return { success: false, error: 'Army is not currently besieging.' };
    }

    // A siege tick: capped damage so even the 850-strong host needs 3 ticks
    const siegeDamage = Math.min(18, Math.max(10, Math.floor(army.size / 20)));
    targetRegion.resistance_level = Math.max(0, targetRegion.resistance_level - siegeDamage);

    const siegeRationCost = 8;
    if (army.rations_qty < siegeRationCost) {
      army.size = Math.max(10, army.size - 12);
    } else {
      army.rations_qty -= siegeRationCost;
    }

    // Check if siege is successful (resistance reaches 0)
    let provinceCaptured = false;
    if (targetRegion.resistance_level <= 0) {
      provinceCaptured = true;
      targetRegion.owner_country_id = army.country_id;
      targetRegion.occupier_country_id = army.country_id;
      targetRegion.owner_name = army.country_id === 1 ? 'Taifa of Qurtuba' : army.country_id === 2 ? 'Taifa of Ishbiliya' : 'Taifa of Gharnata';
      targetRegion.occupier_name = targetRegion.owner_name;
      targetRegion.resistance_level = 0;
      // Army becomes garrison
      army.status = 'garrisoning';
    }

    this.setStorageItem('mmo_army_units', armies);
    this.setStorageItem('mmo_military_regions', milRegs);

    return { success: true, error: null, provinceCaptured };
  }

  async liftSiege(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }> {
    const armies = await this.getArmyUnits();
    const army = armies.find(a => a.id === armyId);
    if (!army) return { success: false, error: 'Army not found.' };

    const milRegs = await this.getMilitaryRegions();
    const targetRegion = milRegs.find((r: any) => r.region_id === targetRegionId);
    if (!targetRegion) return { success: false, error: 'Target region not found.' };

    // Only besieging armies can lift siege
    if (army.status !== 'sieging') {
      return { success: false, error: 'Army is not currently besieging.' };
    }

    // Lift siege - army returns to idle status in the region
    army.status = 'idle';

    this.setStorageItem('mmo_army_units', armies);
    this.setStorageItem('mmo_military_regions', milRegs);

    return { success: true, error: null };
  }

  // ---- Phase 6.5: onboarding character + vertical-slice warfare ----
  async getPlayerCharacter(userId: string): Promise<PlayerCharacter | null> {
    this.ensureInitialized(userId);
    const chars = this.getStorageItem<PlayerCharacter[]>('mmo_player_characters', []);
    return chars.find((c) => c.profile_id === userId) || null;
  }

  async savePlayerCharacter(userId: string, input: { name: string; epithet?: string; kingdom_id: number; profession: any; origin?: string; motto?: string; banner_seed?: number }): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const name = (input.name || '').trim();
    if (name.length < 2) return { success: false, error: 'Your name must be at least 2 characters.' };
    const chars = this.getStorageItem<PlayerCharacter[]>('mmo_player_characters', []);
    const idx = chars.findIndex((c) => c.profile_id === userId);
    const now = new Date().toISOString();
    const row: PlayerCharacter = {
      id: idx >= 0 ? chars[idx].id : 'char-' + Math.random().toString(36).slice(2, 10),
      profile_id: userId,
      name,
      epithet: input.epithet || 'the Unwritten',
      kingdom_id: input.kingdom_id,
      profession: (input.profession || 'farmer') as ProfessionId,
      profession_rank: idx >= 0 ? chars[idx].profession_rank : 1,
      origin: input.origin || 'The open roads',
      motto: input.motto || 'By hearth and sword',
      banner_seed: input.banner_seed ?? Math.floor(Math.random() * 1000),
      onboarding_completed: idx >= 0 ? chars[idx].onboarding_completed : false,
      created_at: idx >= 0 ? chars[idx].created_at : now,
      updated_at: now,
    };
    if (idx >= 0) chars[idx] = row; else chars.push(row);
    this.setStorageItem('mmo_player_characters', chars);
    // Align profile citizenship/region with chosen kingdom where possible
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    if (profiles[userId]) {
      profiles[userId].citizenship_country_id = input.kingdom_id;
      const capitalRegionMap: Record<number, number> = {
        1: 1, 2: 6, 3: 8, 4: 3, 5: 5, 6: 10, 7: 9, 8: 1, 9: 5, 10: 10,
      };
      profiles[userId].current_region_id = capitalRegionMap[input.kingdom_id] || 1;
      profiles[userId].username = name;
      this.setStorageItem('mmo_profiles', profiles);
    }
    return { success: true, error: null };
  }

  async completeOnboarding(userId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const chars = this.getStorageItem<PlayerCharacter[]>('mmo_player_characters', []);
    const idx = chars.findIndex((c) => c.profile_id === userId);
    if (idx === -1) return { success: false, error: 'Create your character first.' };
    chars[idx].onboarding_completed = true;
    chars[idx].updated_at = new Date().toISOString();
    this.setStorageItem('mmo_player_characters', chars);
    return { success: true, error: null };
  }

  async resetPlayerCharacter(userId: string): Promise<{ success: boolean; error: string | null }> {
    this.ensureInitialized(userId);
    const chars = this.getStorageItem<PlayerCharacter[]>('mmo_player_characters', []);
    const filtered = chars.filter((c) => c.profile_id !== userId);
    this.setStorageItem('mmo_player_characters', filtered);

    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    if (profiles[userId]) {
      profiles[userId].citizenship_country_id = 1;
      profiles[userId].current_region_id = 1;
      this.setStorageItem('mmo_profiles', profiles);
    }
    return { success: true, error: null };
  }

  async upgradeProfession(userId: string, cost: number = 120): Promise<{ success: boolean; error: string | null; newRank?: number }> {
    this.ensureInitialized(userId);
    const chars = this.getStorageItem<PlayerCharacter[]>('mmo_player_characters', []);
    const idx = chars.findIndex((c) => c.profile_id === userId);
    if (idx === -1) return { success: false, error: 'No character found.', newRank: undefined };
    const currencies = this.getStorageItem<Record<string, Currencies>>('mmo_currencies', {});
    const wallet = currencies[userId];
    if (!wallet || wallet.local_currency_balance < cost) return { success: false, error: `Need ${cost} LC to train.`, newRank: undefined };
    wallet.local_currency_balance -= cost;
    this.setStorageItem('mmo_currencies', currencies);
    chars[idx].profession_rank += 1;
    chars[idx].updated_at = new Date().toISOString();
    this.setStorageItem('mmo_player_characters', chars);
    return { success: true, error: null, newRank: chars[idx].profession_rank };
  }

  async recruitArmy(userId: string): Promise<{ success: boolean; armyId?: number; error: string | null }> {
    this.ensureInitialized(userId);
    const cost = [
      { resourceId: 5, quantity: 5 },
      { resourceId: 3, quantity: 2 },
      { resourceId: 6, quantity: 3 },
    ];
    const all = this.getStorageItem<PlayerResource[]>('mmo_player_resources', []);
    const mine = all.filter((r) => r.profile_id === userId);
    const ok = cost.every(({ resourceId, quantity }) => (mine.find((r) => r.resource_id === resourceId)?.quantity ?? 0) >= quantity);
    if (!ok) return { success: false, armyId: undefined, error: 'Need 5 Grain, 2 Iron Ore and 3 Fish to recruit.' };
    for (const { resourceId, quantity } of cost) {
      const row = mine.find((r) => r.resource_id === resourceId);
      if (row) row.quantity -= quantity;
    }
    this.setStorageItem('mmo_player_resources', all);
    const armies = await this.getArmyUnits();
    const id = armies.length + 1;
    const profiles = this.getStorageItem<Record<string, Profile>>('mmo_profiles', {});
    const region = profiles[userId]?.current_region_id || 1;
    armies.push({ id, country_id: profiles[userId]?.citizenship_country_id || 1, current_region_id: region, size: 120, morale: 92, ammo_qty: 80, rations_qty: 80, status: 'idle', created_at: new Date().toISOString(), region_name: 'Host' });
    this.setStorageItem('mmo_army_units', armies);
    return { success: true, armyId: id, error: null };
  }

  async getLastBattleReport(userId?: string): Promise<MilitaryBattleReport | null> {
    const sid = userId || this.getSessionUserId();
    this.ensureInitialized(sid);
    return this.getStorageItem<MilitaryBattleReport | null>('mmo_last_battle_report', null);
  }

  // Phase 11 Social & Community Mock Implementations
  async getGuilds(): Promise<Guild[]> {
    return this.getStorageItem<Guild[]>('mmo_guilds', [
      { id: 1, name: 'Order of Aegis', tag: 'AEGIS', description: 'Protectors of the realm.', leader_id: '99999999-9999-9999-9999-999999999999', treasury_local: 50000.0, treasury_gold: 150.0, created_at: new Date().toISOString(), leader_name: 'Admin', members_count: 5 },
      { id: 2, name: 'Syndicate Tech', tag: 'SYNC', description: 'Industrial innovators and traders.', leader_id: '11111111-1111-1111-1111-111111111111', treasury_local: 120000.0, treasury_gold: 450.0, created_at: new Date().toISOString(), leader_name: 'FounderX', members_count: 8 }
    ]);
  }

  async getMyGuild(userId: string): Promise<Guild | null> {
    const members = await this.getStorageItem<GuildMember[]>('mmo_guild_members', [
      { guild_id: 1, profile_id: userId, role_id: 1, joined_at: new Date().toISOString() }
    ]);
    const myMembership = members.find(m => m.profile_id === userId);
    if (!myMembership) return null;

    const guilds = await this.getGuilds();
    return guilds.find(g => g.id === myMembership.guild_id) || null;
  }

  async getGuildMembers(guildId: number): Promise<GuildMember[]> {
    const members = await this.getStorageItem<GuildMember[]>('mmo_guild_members', [
      { guild_id: 1, profile_id: 'user-id-placeholder', role_id: 1, joined_at: new Date().toISOString(), username: 'Admin', role_name: 'Leader' }
    ]);
    return members.filter(m => m.guild_id === guildId);
  }

  async getGuildInventory(guildId: number): Promise<GuildInventory[]> {
    return this.getStorageItem<GuildInventory[]>(`mmo_guild_inventory_${guildId}`, [
      { id: 1, guild_id: guildId, item_template_id: 1, quantity: 15, item_name: 'Iron Sword' },
      { id: 2, guild_id: guildId, item_template_id: 2, quantity: 25, item_name: 'Travel Ticket' }
    ]);
  }

  async getGuildApplications(guildId: number): Promise<GuildApplication[]> {
    return this.getStorageItem<GuildApplication[]>(`mmo_guild_apps_${guildId}`, [
      { id: 1, guild_id: guildId, profile_id: 'applicant-uuid', status: 'pending', message: 'I want to join your guild to help coordinate combat!', created_at: new Date().toISOString(), username: 'CombatStar' }
    ]);
  }

  async getGuildInvitations(userId: string): Promise<GuildInvitation[]> {
    return this.getStorageItem<GuildInvitation[]>('mmo_guild_invitations', [
      { id: 1, guild_id: 2, profile_id: userId, status: 'pending', created_at: new Date().toISOString(), guild_name: 'Syndicate Tech', username: 'You' }
    ]);
  }

  async getGuildWars(): Promise<GuildWar[]> {
    return this.getStorageItem<GuildWar[]>('mmo_guild_wars', [
      { id: 1, attacker_guild_id: 1, defender_guild_id: 2, status: 'active', started_at: new Date().toISOString(), attacker_name: 'Order of Aegis', defender_name: 'Syndicate Tech' }
    ]);
  }

  async getGuildAlliances(): Promise<GuildAlliance[]> {
    return this.getStorageItem<GuildAlliance[]>('mmo_guild_alliances', []);
  }

  async getCoalitions(): Promise<Coalition[]> {
    return this.getStorageItem<Coalition[]>('mmo_coalitions', [
      { id: 1, name: 'Northern Shield Covenant', description: 'Coordinating Northern borders.', founder_guild_id: 1, created_at: new Date().toISOString() }
    ]);
  }

  async getCoalitionMembers(coalitionId: number): Promise<CoalitionMember[]> {
    return this.getStorageItem<CoalitionMember[]>(`mmo_coalition_members_${coalitionId}`, [
      { coalition_id: coalitionId, guild_id: 1, joined_at: new Date().toISOString(), guild_name: 'Order of Aegis' }
    ]);
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    return this.getStorageItem<Friendship[]>('mmo_friendships', [
      { id: 1, profile_id_1: userId, profile_id_2: 'friend-uuid-1', status: 'accepted', is_favorite: true, created_at: new Date().toISOString(), friend_name: 'GamerGuy', friend_id: 'friend-uuid-1' },
      { id: 2, profile_id_1: userId, profile_id_2: 'friend-uuid-2', status: 'pending', is_favorite: false, created_at: new Date().toISOString(), friend_name: 'NoobTrader', friend_id: 'friend-uuid-2' }
    ]);
  }

  async getPlayerBlocks(userId: string): Promise<PlayerBlock[]> {
    return this.getStorageItem<PlayerBlock[]>('mmo_blocks', []);
  }

  async getConversationThreads(userId: string): Promise<ConversationThread[]> {
    return this.getStorageItem<ConversationThread[]>('mmo_threads', [
      { id: 1, type: 'private', metadata_json: {}, created_at: new Date().toISOString(), title: 'Chat with GamerGuy', last_message: 'Hey, ready to run combat?', last_message_at: new Date().toISOString() },
      { id: 2, type: 'guild', metadata_json: {}, created_at: new Date().toISOString(), title: 'Guild Chat - Order of Aegis', last_message: 'Leader: Welcome to the new members!', last_message_at: new Date().toISOString() },
      { id: 3, type: 'trade', metadata_json: {}, created_at: new Date().toISOString(), title: 'Global Trade Channel', last_message: 'WTS Iron Ore x100 local currency', last_message_at: new Date().toISOString() }
    ]);
  }

  async getDirectMessages(threadId: number): Promise<DirectMessage[]> {
    return this.getStorageItem<DirectMessage[]>(`mmo_messages_${threadId}`, [
      { id: 1, thread_id: threadId, sender_id: 'some-id', content: 'Hello community!', created_at: new Date().toISOString(), read_by_json: [], sender_name: 'System' }
    ]);
  }

  async getPlayerMail(userId: string): Promise<PlayerMail[]> {
    return this.getStorageItem<PlayerMail[]>('mmo_mail', [
      { id: 1, sender_id: 'system', recipient_id: userId, subject: 'Welcome Rewards', body: 'Thank you for registering in Aegis Kingdoms! Claim your travel tokens.', attached_currency: 100.0, attached_gold: 5.0, attached_item_template_id: 2, attached_item_qty: 5, is_read: false, is_claimed: false, created_at: new Date().toISOString(), sender_name: 'Kingdom Overseer', item_name: 'Travel Ticket' }
    ]);
  }

  async getPlayerReputation(userId: string): Promise<PlayerReputation | null> {
    return this.getStorageItem<PlayerReputation>('mmo_reputation', {
      profile_id: userId,
      trading_rep: 75,
      military_rep: 120,
      political_rep: 45,
      industrial_rep: 160,
      community_rep: 90,
      moderation_history: []
    });
  }

  async getPlayerTitles(userId: string): Promise<PlayerTitle[]> {
    return this.getStorageItem<PlayerTitle[]>('mmo_titles', [
      { id: 1, profile_id: userId, title: 'Iron Vanguard', source: 'military', is_equipped: true, created_at: new Date().toISOString() },
      { id: 2, profile_id: userId, title: 'Grand Legislator', source: 'politics', is_equipped: false, created_at: new Date().toISOString() }
    ]);
  }

  async getPlayerBadges(userId: string): Promise<PlayerBadge[]> {
    return this.getStorageItem<PlayerBadge[]>('mmo_badges', [
      { id: 1, profile_id: userId, badge_name: 'Founder Medal', image_url: '/badges/founder.svg', created_at: new Date().toISOString() }
    ]);
  }

  async getContracts(): Promise<Contract[]> {
    return this.getStorageItem<Contract[]>('mmo_contracts', [
      { id: 1, creator_id: 'creator-uuid', type: 'supply', terms_json: { target_item: 'Iron Ore', qty: 100 }, escrow_local: 5000.0, escrow_gold: 0.0, deadline: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'offered', created_at: new Date().toISOString(), creator_name: 'Syndicate Tech' }
    ]);
  }

  async getContractOffers(userId: string): Promise<ContractOffer[]> {
    return this.getStorageItem<ContractOffer[]>('mmo_contract_offers', []);
  }

  async getContractExecutions(contractId: number): Promise<ContractExecution[]> {
    return this.getStorageItem<ContractExecution[]>(`mmo_contract_exec_${contractId}`, []);
  }

  async getRecruitmentPosts(): Promise<RecruitmentPost[]> {
    return this.getStorageItem<RecruitmentPost[]>('mmo_recruitment', [
      { id: 1, creator_id: 'admin', target_type: 'guild', target_id: 1, title: 'Order of Aegis is Hiring Soldiers', description: 'Looking for active combat players to defend borders.', requirements_json: { min_strength: 50 }, created_at: new Date().toISOString(), creator_name: 'Admin', target_name: 'Order of Aegis' }
    ]);
  }

  async getNewspapers(): Promise<Newspaper[]> {
    return this.getStorageItem<Newspaper[]>('mmo_newspapers', [
      { id: 1, name: 'The Aegis Chronicle', description: 'Daily stories across the regions.', owner_id: 'admin', created_at: new Date().toISOString(), owner_name: 'Admin' }
    ]);
  }

  async getArticles(): Promise<Article[]> {
    return this.getStorageItem<Article[]>('mmo_articles', [
      { id: 1, newspaper_id: 1, author_id: 'admin', title: 'The Expansion of Border Skirmishes', content: 'Regions 2 and 3 are facing severe military conflicts as country boundaries shift.', category: 'news', ratings_score: 15, created_at: new Date().toISOString(), author_name: 'Admin', newspaper_name: 'The Aegis Chronicle' }
    ]);
  }

  async getArticleComments(articleId: number): Promise<ArticleComment[]> {
    return this.getStorageItem<ArticleComment[]>(`mmo_comments_${articleId}`, [
      { id: 1, article_id: articleId, commenter_id: 'gamer-uuid', comment: 'We must mobilize reinforcements immediately!', created_at: new Date().toISOString(), commenter_name: 'GamerGuy' }
    ]);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return this.getStorageItem<Announcement[]>('mmo_announcements', [
      { id: 1, sender_type: 'system', sender_id: 'system', title: 'Maintenance Window', content: 'Servers will undergo security patches tonight at 04:00 UTC.', created_at: new Date().toISOString() }
    ]);
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.getStorageItem<CalendarEvent[]>('mmo_calendar', [
      { id: 1, title: 'Congressional Voting Starts', description: 'Vote on tax rate proposal changes.', type: 'election', starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() }
    ]);
  }

  async getCommunityLogs(guildId: number): Promise<CommunityLog[]> {
    return this.getStorageItem<CommunityLog[]>(`mmo_guild_logs_${guildId}`, [
      { id: 1, guild_id: guildId, profile_id: 'admin', action: 'deposit', details: 'Deposited 500 local currency into the vault.', created_at: new Date().toISOString() }
    ]);
  }

  async createGuild(userId: string, name: string, tag: string, description: string): Promise<{ success: boolean; guildId?: number; error: string | null }> {
    const guilds = await this.getGuilds();
    const newId = guilds.length + 1;
    guilds.push({
      id: newId,
      name,
      tag,
      description,
      leader_id: userId,
      treasury_local: 0,
      treasury_gold: 0,
      created_at: new Date().toISOString(),
      leader_name: 'You',
      members_count: 1
    });
    this.setStorageItem('mmo_guilds', guilds);

    const members = await this.getGuildMembers(newId);
    members.push({
      guild_id: newId,
      profile_id: userId,
      role_id: 1,
      joined_at: new Date().toISOString(),
      username: 'You',
      role_name: 'Leader'
    });
    this.setStorageItem('mmo_guild_members', members);

    return { success: true, guildId: newId, error: null };
  }

  async applyToGuild(userId: string, guildId: number, message: string): Promise<{ success: boolean; error: string | null }> {
    const apps = await this.getGuildApplications(guildId);
    apps.push({
      id: apps.length + 1,
      guild_id: guildId,
      profile_id: userId,
      status: 'pending',
      message,
      created_at: new Date().toISOString(),
      username: 'You'
    });
    this.setStorageItem(`mmo_guild_apps_${guildId}`, apps);
    return { success: true, error: null };
  }

  async respondToGuildApplication(applicationId: number, approve: boolean): Promise<{ success: boolean; error: string | null }> {
    return { success: true, error: null };
  }

  async sendGuildInvitation(guildId: number, targetProfileId: string): Promise<{ success: boolean; error: string | null }> {
    const invites = await this.getStorageItem<GuildInvitation[]>('mmo_guild_invitations', []);
    invites.push({
      id: invites.length + 1,
      guild_id: guildId,
      profile_id: targetProfileId,
      status: 'pending',
      created_at: new Date().toISOString(),
      guild_name: 'Inviting Guild',
      username: 'Target User'
    });
    this.setStorageItem('mmo_guild_invitations', invites);
    return { success: true, error: null };
  }

  async respondToGuildInvitation(invitationId: number, accept: boolean): Promise<{ success: boolean; error: string | null }> {
    const invites = await this.getStorageItem<GuildInvitation[]>('mmo_guild_invitations', []);
    const inviteIndex = invites.findIndex(i => i.id === invitationId);
    if (inviteIndex === -1) return { success: false, error: 'Invitation not found.' };

    if (accept) {
      invites[inviteIndex].status = 'accepted';
      // Add member
      const members = await this.getStorageItem<GuildMember[]>('mmo_guild_members', []);
      members.push({
        guild_id: invites[inviteIndex].guild_id,
        profile_id: invites[inviteIndex].profile_id,
        role_id: 3, // Member
        joined_at: new Date().toISOString(),
        username: 'You',
        role_name: 'Member'
      });
      this.setStorageItem('mmo_guild_members', members);
    } else {
      invites[inviteIndex].status = 'rejected';
    }

    this.setStorageItem('mmo_guild_invitations', invites);
    return { success: true, error: null };
  }

  async manageGuildMember(guildId: number, targetProfileId: string, action: 'kick' | 'promote' | 'demote'): Promise<{ success: boolean; error: string | null }> {
    const members = await this.getStorageItem<GuildMember[]>('mmo_guild_members', []);
    const memberIndex = members.findIndex(m => m.guild_id === guildId && m.profile_id === targetProfileId);
    if (memberIndex === -1) return { success: false, error: 'Member not found.' };

    if (action === 'kick') {
      members.splice(memberIndex, 1);
    } else if (action === 'promote') {
      members[memberIndex].role_name = 'Officer';
    } else if (action === 'demote') {
      members[memberIndex].role_name = 'Member';
    }

    this.setStorageItem('mmo_guild_members', members);
    return { success: true, error: null };
  }

  async withdrawGuildVault(guildId: number, amount: number, isGold: boolean): Promise<{ success: boolean; error: string | null }> {
    const guilds = await this.getGuilds();
    const guild = guilds.find(g => g.id === guildId);
    if (!guild) return { success: false, error: 'Guild not found.' };

    if (isGold) {
      if (guild.treasury_gold < amount) return { success: false, error: 'Insufficient gold reserves.' };
      guild.treasury_gold -= amount;
    } else {
      if (guild.treasury_local < amount) return { success: false, error: 'Insufficient local currency reserves.' };
      guild.treasury_local -= amount;
    }

    this.setStorageItem('mmo_guilds', guilds);
    return { success: true, error: null };
  }

  async sendDirectMessage(threadId: number, content: string): Promise<{ success: boolean; messageId?: number; error: string | null }> {
    const messages = await this.getDirectMessages(threadId);
    const newId = messages.length + 1;
    messages.push({
      id: newId,
      thread_id: threadId,
      sender_id: 'current-user-uuid',
      content,
      created_at: new Date().toISOString(),
      read_by_json: [],
      sender_name: 'You'
    });
    this.setStorageItem(`mmo_messages_${threadId}`, messages);
    return { success: true, messageId: newId, error: null };
  }

  async createConversationThread(type: 'private' | 'group' | 'guild' | 'coalition' | 'country' | 'trade' | 'system', participantIds: string[]): Promise<{ success: boolean; threadId?: number; error: string | null }> {
    const threads = await this.getConversationThreads('current-user-uuid');
    const newId = threads.length + 1;
    threads.push({
      id: newId,
      type,
      metadata_json: {},
      created_at: new Date().toISOString(),
      title: `${type.toUpperCase()} Room #${newId}`,
      last_message: 'No messages yet',
      last_message_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_threads', threads);
    return { success: true, threadId: newId, error: null };
  }

  async sendMail(recipientId: string, subject: string, body: string, attachedCurrency: number, attachedGold: number, attachedItemTemplateId?: number, attachedItemQty?: number): Promise<{ success: boolean; mailId?: number; error: string | null }> {
    const mail = await this.getPlayerMail('current-user-uuid');
    const newId = mail.length + 1;
    mail.push({
      id: newId,
      sender_id: 'current-user-uuid',
      recipient_id: recipientId,
      subject,
      body,
      attached_currency: attachedCurrency,
      attached_gold: attachedGold,
      attached_item_template_id: attachedItemTemplateId,
      attached_item_qty: attachedItemQty || 0,
      is_read: false,
      is_claimed: false,
      created_at: new Date().toISOString(),
      sender_name: 'You',
      item_name: attachedItemTemplateId ? 'Item' : undefined
    });
    this.setStorageItem('mmo_mail', mail);
    return { success: true, mailId: newId, error: null };
  }

  async claimMailAttachments(mailId: number): Promise<{ success: boolean; error: string | null }> {
    const mail = await this.getStorageItem<PlayerMail[]>('mmo_mail', []);
    const item = mail.find(m => m.id === mailId);
    if (!item) return { success: false, error: 'Mail not found.' };
    if (item.is_claimed) return { success: false, error: 'Attachments already claimed.' };
    item.is_claimed = true;
    this.setStorageItem('mmo_mail', mail);
    return { success: true, error: null };
  }

  async createContract(type: string, terms: any, escrowLocal: number, escrowGold: number, deadline?: string): Promise<{ success: boolean; contractId?: number; error: string | null }> {
    const contracts = await this.getContracts();
    const newId = contracts.length + 1;
    contracts.push({
      id: newId,
      creator_id: 'current-user-uuid',
      type: type as any,
      terms_json: terms,
      escrow_local: escrowLocal,
      escrow_gold: escrowGold,
      deadline,
      status: 'offered',
      created_at: new Date().toISOString(),
      creator_name: 'You'
    });
    this.setStorageItem('mmo_contracts', contracts);
    return { success: true, contractId: newId, error: null };
  }

  async acceptContract(contractId: number): Promise<{ success: boolean; error: string | null }> {
    const contracts = await this.getContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return { success: false, error: 'Contract not found.' };
    contract.status = 'active';
    contract.acceptor_id = 'current-user-uuid';
    contract.acceptor_name = 'You';
    this.setStorageItem('mmo_contracts', contracts);
    return { success: true, error: null };
  }

  async completeContract(contractId: number): Promise<{ success: boolean; error: string | null }> {
    const contracts = await this.getContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return { success: false, error: 'Contract not found.' };
    contract.status = 'completed';
    this.setStorageItem('mmo_contracts', contracts);
    return { success: true, error: null };
  }

  async createNewspaper(name: string, description: string): Promise<{ success: boolean; newspaperId?: number; error: string | null }> {
    const papers = await this.getNewspapers();
    const newId = papers.length + 1;
    papers.push({
      id: newId,
      name,
      description,
      owner_id: 'current-user-uuid',
      created_at: new Date().toISOString(),
      owner_name: 'You'
    });
    this.setStorageItem('mmo_newspapers', papers);
    return { success: true, newspaperId: newId, error: null };
  }

  async publishArticle(newspaperId: number, title: string, content: string, category: 'news' | 'opinion' | 'government' | 'developer'): Promise<{ success: boolean; articleId?: number; error: string | null }> {
    const articles = await this.getArticles();
    const newId = articles.length + 1;
    articles.push({
      id: newId,
      newspaper_id: newspaperId,
      author_id: 'current-user-uuid',
      title,
      content,
      category,
      ratings_score: 0,
      created_at: new Date().toISOString(),
      author_name: 'You',
      newspaper_name: 'Your Newspaper'
    });
    this.setStorageItem('mmo_articles', articles);
    return { success: true, articleId: newId, error: null };
  }

  async commentOnArticle(articleId: number, comment: string): Promise<{ success: boolean; commentId?: number; error: string | null }> {
    const comments = await this.getArticleComments(articleId);
    const newId = comments.length + 1;
    comments.push({
      id: newId,
      article_id: articleId,
      commenter_id: 'current-user-uuid',
      comment,
      created_at: new Date().toISOString(),
      commenter_name: 'You'
    });
    this.setStorageItem(`mmo_comments_${articleId}`, comments);
    return { success: true, commentId: newId, error: null };
  }

  async respondToFriendRequest(friendshipId: number, accept: boolean): Promise<{ success: boolean; error: string | null }> {
    const friends = await this.getFriendships('current-user-uuid');
    const friend = friends.find(f => f.id === friendshipId);
    if (!friend) return { success: false, error: 'Friendship request not found.' };

    if (accept) {
      friend.status = 'accepted';
      this.setStorageItem('mmo_friendships', friends);
    } else {
      const idx = friends.indexOf(friend);
      friends.splice(idx, 1);
      this.setStorageItem('mmo_friendships', friends);
    }
    return { success: true, error: null };
  }

  async sendFriendRequest(targetProfileId: string): Promise<{ success: boolean; friendshipId?: number; error: string | null }> {
    const friends = await this.getFriendships('current-user-uuid');
    const newId = friends.length + 1;
    friends.push({
      id: newId,
      profile_id_1: 'current-user-uuid',
      profile_id_2: targetProfileId,
      status: 'pending',
      is_favorite: false,
      created_at: new Date().toISOString(),
      friend_name: 'OtherPlayer',
      friend_id: targetProfileId
    });
    this.setStorageItem('mmo_friendships', friends);
    return { success: true, friendshipId: newId, error: null };
  }

  // Phase 12 implementations
  async getLiveOpsConfig(): Promise<LiveOpsConfig> {
    return this.getStorageItem<LiveOpsConfig>('mmo_live_ops', {
      id: 1,
      emergency_shutdown: false,
      maintenance_mode: false,
      resource_multiplier: 1.00,
      xp_multiplier: 1.00,
      drop_rate_multiplier: 1.00,
      tax_limit_multiplier: 1.00,
      active_season_id: 1,
      updated_at: new Date().toISOString()
    });
  }

  async updateLiveOpsConfig(config: Partial<LiveOpsConfig>): Promise<{ success: boolean; error: string | null }> {
    const current = await this.getLiveOpsConfig();
    const updated = { ...current, ...config, updated_at: new Date().toISOString() };
    this.setStorageItem('mmo_live_ops', updated);
    return { success: true, error: null };
  }

  async getModerationActions(profileId?: string): Promise<ModerationAction[]> {
    const list = this.getStorageItem<ModerationAction[]>('mmo_moderation_actions', [
      {
        id: 1,
        profile_id: profileId || 'current-user-uuid',
        action_type: 'warn',
        reason: 'Spamming trade chat frequencies.',
        ends_at: null,
        moderator_id: 'admin-uuid',
        appeal_status: 'none',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        username: 'AegisCitizen',
        moderator_name: 'GM_Vanguard'
      }
    ]);
    return profileId ? list.filter(m => m.profile_id === profileId) : list;
  }

  async createModerationAction(action: Omit<ModerationAction, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }> {
    const list = await this.getModerationActions();
    const newId = list.length + 1;
    list.push({
      ...action,
      id: newId,
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_moderation_actions', list);
    return { success: true, error: null };
  }

  async getPlayerReports(): Promise<PlayerReport[]> {
    return this.getStorageItem<PlayerReport[]>('mmo_player_reports', [
      {
        id: 1,
        reporter_id: 'reporter-uuid',
        reported_id: 'current-user-uuid',
        category: 'spam',
        details: 'Player advertised outside marketplace channel.',
        status: 'open',
        created_at: new Date().toISOString(),
        reporter_name: 'MerchantBob',
        reported_name: 'You'
      }
    ]);
  }

  async createPlayerReport(report: Omit<PlayerReport, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }> {
    const list = await this.getPlayerReports();
    const newId = list.length + 1;
    list.push({
      ...report,
      id: newId,
      status: 'open',
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_player_reports', list);
    return { success: true, error: null };
  }

  async getSupportTickets(profileId?: string): Promise<SupportTicket[]> {
    const list = this.getStorageItem<SupportTicket[]>('mmo_support_tickets', [
      {
        id: 1,
        profile_id: 'current-user-uuid',
        category: 'gameplay',
        subject: 'Stuck in wilderness map boundary',
        details: 'I cannot travel between local maps, travel buttons are greyed out.',
        status: 'open',
        priority: 'high',
        assigned_to: 'admin-uuid',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        username: 'You'
      }
    ]);
    return profileId ? list.filter(t => t.profile_id === profileId) : list;
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at'>): Promise<{ success: boolean; ticketId?: number; error: string | null }> {
    const list = await this.getSupportTickets();
    const newId = list.length + 1;
    list.push({
      ...ticket,
      id: newId,
      status: 'open',
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_support_tickets', list);
    return { success: true, ticketId: newId, error: null };
  }

  async addTicketReply(reply: Omit<TicketReply, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }> {
    const list = await this.getTicketReplies(reply.ticket_id);
    const newId = list.length + 1;
    list.push({
      ...reply,
      id: newId,
      created_at: new Date().toISOString()
    });
    this.setStorageItem(`mmo_ticket_replies_${reply.ticket_id}`, list);
    return { success: true, error: null };
  }

  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return this.getStorageItem<TicketReply[]>(`mmo_ticket_replies_${ticketId}`, [
      {
        id: 1,
        ticket_id: ticketId,
        sender_id: 'admin-uuid',
        message: 'Hello, our moderation team has received your ticket. We are investigating the map nodes.',
        is_internal_note: false,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        sender_name: 'GM_Admin'
      }
    ]);
  }

  async getSystemMetrics(): Promise<SystemMetric[]> {
    return [
      { timestamp: new Date().toISOString(), metric_name: 'cpu_usage', metric_value: 42.5 },
      { timestamp: new Date().toISOString(), metric_name: 'memory_usage', metric_value: 68.2 },
      { timestamp: new Date().toISOString(), metric_name: 'db_connections', metric_value: 12 },
      { timestamp: new Date().toISOString(), metric_name: 'http_requests_per_sec', metric_value: 8.5 }
    ];
  }

  async getDailyActiveUsers(): Promise<DailyActiveUser[]> {
    return [
      { date: '2026-06-27', dau: 120, mau: 850, retention_rate: 65.5, average_playtime_minutes: 45.2 },
      { date: '2026-06-28', dau: 135, mau: 880, retention_rate: 68.2, average_playtime_minutes: 50.1 },
      { date: '2026-06-29', dau: 142, mau: 900, retention_rate: 70.0, average_playtime_minutes: 48.6 }
    ];
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return this.getStorageItem<FeatureFlag[]>('mmo_feature_flags', [
      { id: 1, name: 'experimental_combat', description: 'Enable active combat system features.', is_enabled: false, rollout_percentage: 0 },
      { id: 2, name: 'marketplace_v2', description: 'Enable limit order listings.', is_enabled: true, rollout_percentage: 100 }
    ]);
  }

  async toggleFeatureFlag(flagId: number, isEnabled: boolean, percentage?: number): Promise<{ success: boolean; error: string | null }> {
    const list = await this.getFeatureFlags();
    const idx = list.findIndex(f => f.id === flagId);
    if (idx !== -1) {
      list[idx].is_enabled = isEnabled;
      if (percentage !== undefined) {
        list[idx].rollout_percentage = percentage;
      }
      this.setStorageItem('mmo_feature_flags', list);
    }
    return { success: true, error: null };
  }

  async getDeveloperKeys(profileId: string): Promise<DeveloperKey[]> {
    return this.getStorageItem<DeveloperKey[]>(`mmo_developer_keys_${profileId}`, [
      { id: 1, profile_id: profileId, api_key_hash: 'aegis_pk_live_xxxxxx', label: 'Dashboard API Integration', rate_limit_per_min: 120, is_active: true, created_at: new Date().toISOString() }
    ]);
  }

  async createDeveloperKey(profileId: string, label: string): Promise<{ success: boolean; key?: string; error: string | null }> {
    const list = await this.getDeveloperKeys(profileId);
    const newId = list.length + 1;
    const generatedKey = `aegis_pk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    list.push({
      id: newId,
      profile_id: profileId,
      api_key_hash: generatedKey.slice(0, 15) + '...',
      label,
      rate_limit_per_min: 60,
      is_active: true,
      created_at: new Date().toISOString()
    });
    this.setStorageItem(`mmo_developer_keys_${profileId}`, list);
    return { success: true, key: generatedKey, error: null };
  }

  async revokeDeveloperKey(keyId: number): Promise<{ success: boolean; error: string | null }> {
    // In our mock we can just leave as is or set active false
    return { success: true, error: null };
  }

  async getQuests(): Promise<Quest[]> {
    return [
      { id: 1, title: 'Tutorial: First Steps', description: 'Explore map screens, gather resources, and examine the industrial factory dashboard.', category: 'tutorial', rewards_json: { currency: 100, xp: 50 }, requirements_json: { clicks: 1 }, is_active: true },
      { id: 2, title: 'Daily: Tool Crafting', description: 'Manufacture tools in a local factory.', category: 'daily', rewards_json: { currency: 250, xp: 120 }, requirements_json: { craft: 1 }, is_active: true },
      { id: 3, title: 'Seasonal: Trade War', description: 'Complete high-volume market sales inside the global exchange.', category: 'seasonal', rewards_json: { currency: 1000, gold: 5 }, requirements_json: { trade_volume: 5000 }, is_active: true }
    ];
  }

  async getPlayerQuests(profileId: string): Promise<PlayerQuest[]> {
    return this.getStorageItem<PlayerQuest[]>(`mmo_player_quests_${profileId}`, [
      { profile_id: profileId, quest_id: 1, status: 'active', progress_json: { current: 0, required: 1 }, updated_at: new Date().toISOString(), title: 'Tutorial: First Steps', description: 'Explore map screens and gather resources.' }
    ]);
  }

  async startQuest(profileId: string, questId: number): Promise<{ success: boolean; error: string | null }> {
    const list = await this.getPlayerQuests(profileId);
    const quests = await this.getQuests();
    const target = quests.find(q => q.id === questId);
    if (!target) return { success: false, error: 'Quest not found.' };

    list.push({
      profile_id: profileId,
      quest_id: questId,
      status: 'active',
      progress_json: { current: 0, required: 1 },
      updated_at: new Date().toISOString(),
      title: target.title,
      description: target.description
    });
    this.setStorageItem(`mmo_player_quests_${profileId}`, list);
    return { success: true, error: null };
  }

  async updateQuestProgress(profileId: string, questId: number, progress: any): Promise<{ success: boolean; error: string | null }> {
    const list = await this.getPlayerQuests(profileId);
    const idx = list.findIndex(q => q.quest_id === questId);
    if (idx !== -1) {
      list[idx].progress_json = progress;
      if (progress.current >= progress.required) {
        list[idx].status = 'completed';
      }
      list[idx].updated_at = new Date().toISOString();
      this.setStorageItem(`mmo_player_quests_${profileId}`, list);
    }
    return { success: true, error: null };
  }

  async getAchievements(): Promise<Achievement[]> {
    return [
      { id: 1, title: 'First Harvest', description: 'Successfully manual harvest resources from map nodes.', category: 'economy', points: 10, requirements_json: {} },
      { id: 2, title: 'Industrialist', description: 'Operate a private production company.', category: 'industry', points: 20, requirements_json: {} },
      { id: 3, title: 'Diplomat Champion', description: 'Voted to a government congressional bill.', category: 'politics', points: 30, requirements_json: {} }
    ];
  }

  async getPlayerAchievements(profileId: string): Promise<PlayerAchievement[]> {
    return this.getStorageItem<PlayerAchievement[]>(`mmo_player_achievements_${profileId}`, [
      { profile_id: profileId, achievement_id: 1, unlocked_at: new Date().toISOString(), title: 'First Harvest', description: 'Successfully manual harvest resources from map nodes.', points: 10 }
    ]);
  }

  async getSeasons(): Promise<Season[]> {
    return [
      { id: 1, number: 1, title: 'Age of Rebirth', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 86400000 * 30).toISOString(), reward_cosmetic_template_id: 99, status: 'active' }
    ];
  }

  async getSeasonLeaderboard(seasonId: number): Promise<SeasonLeaderboard[]> {
    return [
      { season_id: seasonId, profile_id: 'user-1', score: 5400, rank: 1, username: 'Legion_Lord' },
      { season_id: seasonId, profile_id: 'user-2', score: 4800, rank: 2, username: 'CoinMaster' },
      { season_id: seasonId, profile_id: 'current-user-uuid', score: 1200, rank: 15, username: 'You' }
    ];
  }

  async getClosedAlphaInvites(): Promise<any[]> {
    return this.getStorageItem<any[]>('mmo_closed_alpha_invites', []);
  }

  async generateClosedAlphaInvite(code: string): Promise<{ success: boolean; error: string | null }> {
    const list = this.getStorageItem<any[]>('mmo_closed_alpha_invites', []);
    list.push({
      id: list.length + 1,
      invite_code: code,
      is_used: false,
      used_by_email: null,
      created_at: new Date().toISOString()
    });
    this.setStorageItem('mmo_closed_alpha_invites', list);
    return { success: true, error: null };
  }
}





