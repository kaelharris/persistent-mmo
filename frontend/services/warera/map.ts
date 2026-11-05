/**
 * WarEra DTO → Aegis entity mappings.
 *
 * These are read-only projections. WarEra field names and values are kept as
 * close as possible to the source; where Aegis expects something WarEra has no
 * equivalent for, the field is `null` or a sensible default so the UI can fall
 * back gracefully.
 *
 * Casts are deliberate: the shared `types/entities.ts` is also used by the
 * mock and Supabase repositories, so this adapter projects onto it
 * best-effort rather than loosening the shared schema.
 */

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
  ItemRecipe,
  ItemBlueprint,
  ItemHistory,
  Equipment,
  RegionalEconomy,
  WorldEvent,
  SimulationLog,
  NPCActivityLog,
  EnemyTemplate,
  CombatRoundLog,
  CombatResponse,
  CombatResult,
  CombatEvent,
  CombatRewardItem,
  CombatRanking,
  PoliticalParty,
  Election,
  Candidate,
  Bill,
  NationalProject,
  War,
  MilitaryRegion,
  ArmyUnit,
  SupplyRoute,
  PeaceTreaty,
  Guild,
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
} from '../../types/entities';
import type {
  WarEraCountry,
  WarEraRegion,
  WarEraUser,
  WarEraInventory,
  WarEraCompany,
  WarEraGameConfig,
  WarEraBattle,
} from './types';
import { numericId } from './ids';

function fmt(level: number): number {
  return Math.round(level * 100) / 100;
}

/*──────────────────────────── IDs ────────────────────────────*/

export function countryId(warEraCountryId: string): number {
  return numericId('country', warEraCountryId);
}
export function regionId(warEraRegionId: string): number {
  return numericId('region', warEraRegionId);
}
export function itemId(warEraCode: string): number {
  return numericId('item', warEraCode);
}
export function userId(warEraUserId: string): string {
  return warEraUserId;
}

/*──────────────────────────── Countries ────────────────────────────*/

export function mapCountry(c: WarEraCountry): Country {
  return {
    id: countryId(c._id),
    name: c.name,
    gold_reserve: 0,
    local_currency_reserve: c.money,
    vat_rate: c.taxes?.market ?? 0,
    import_tax_rate: c.taxes?.income ?? 0,
    income_tax_rate: c.taxes?.income ?? 0,
    created_at: c.updatedAt ?? new Date().toISOString(),
  } as Country;
}

/*──────────────────────────── Regions ────────────────────────────*/

export function mapRegion(
  r: WarEraRegion,
  countryIdOverride?: number,
): Region {
  return {
    id: regionId(r._id),
    name: r.name,
    country_id: countryIdOverride ?? countryId(r.country),
    climate: r.climate,
    population: r.currentPopulation ?? r.population,
    production_bonus: fmt(r.development / 100),
    travel_cost: 0,
    travel_cooldown: 0,
    created_at: new Date().toISOString(),
  } as Region;
}

/*──────────────────────────── Player / profile ────────────────────────────*/

export function mapProfile(u: WarEraUser): Profile {
  return {
    id: userId(u._id),
    username: u.username,
    avatar_url: u.avatarUrl ?? null,
    citizenship_country_id: countryId(u.country),
    current_region_id:
      u.location ? regionId(u.location) : u.region ? regionId(u.region) : 0,
    role: 'player',
    created_at: u.createdAt ?? new Date().toISOString(),
    updated_at: u.updatedAt ?? new Date().toISOString(),
  } as Profile;
}

export function mapPlayerStats(u: WarEraUser): PlayerStats {
  const skills = u.skills;
  const leveling = u.leveling;
  const now = new Date(u.updatedAt ?? Date.now()).toISOString();
  return {
    profile_id: userId(u._id),
    level: leveling.level,
    experience: leveling.totalXp,
    energy: skills.energy?.value ?? 100,
    max_health: skills.health?.total ?? 100,
    strength: skills.attack?.value ?? 100,
    work_skill: skills.production?.value ?? 30,
    health: skills.health?.value ?? 100,
    defense: skills.armor?.total ?? 0,
    speed: skills.stamina?.value ?? 100,
    crit_chance: skills.criticalChance?.total ?? skills.criticalChance?.value ?? 0,
    evasion: skills.dodge?.total ?? skills.dodge?.value ?? 0,
    xp_pve: leveling.xp,
    level_pve: leveling.level,
    pvp_rating: leveling.level,
    kills: 0,
    deaths: 0,
    damage_dealt: (u as any).stats?.damagesCount ?? 0,
    damage_taken: 0,
    healing_done: 0,
    updated_at: now,
    last_work_at: (u as any).dates?.lastWorkAt ?? null,
    last_train_at: (u as any).dates?.lastTrainAt ?? null,
  } as PlayerStats;
}

export function mapCurrencies(
  u: WarEraUser,
  inventory?: WarEraInventory,
): Currencies {
  const money = inventory?.money ?? 0;
  const invAny = inventory as any;
  return {
    profile_id: userId(u._id),
    gold: money,
    local_currency_balance: money,
    updated_at: new Date(
      invAny?.updatedAt ?? u.updatedAt ?? Date.now(),
    ).toISOString(),
  } as Currencies;
}

/*──────────────────────────── Inventory / items ────────────────────────────*/

export function mapItemTemplates(config: WarEraGameConfig): ItemTemplate[] {
  const out: ItemTemplate[] = [];
  for (const [code, raw] of Object.entries(config.items)) {
    out.push({
      id: itemId(code),
      category_id: 0,
      name: code.charAt(0).toUpperCase() + code.slice(1),
      description: `${raw.rarity} ${raw.type}`,
      type: raw.type,
      base_value: 1,
      weight: 0,
      max_durability: 100,
      rarity: raw.rarity as any,
      attributes:
        (raw.dynamicStats as Record<string, number> | undefined) ??
        (raw.flatStats as Record<string, number> | undefined) ??
        undefined,
    } as ItemTemplate);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function mapInventory(inventory: WarEraInventory): InventoryItem[] {
  const out: InventoryItem[] = [];
  const invAny = inventory as any;
  const now = invAny.updatedAt ?? new Date().toISOString();

  for (const [code, qty] of Object.entries(inventory.items.basics ?? {})) {
    out.push({
      id: `${inventory._id}:${code}`,
      owner_id: inventory.user,
      item_template_id: itemId(code),
      quantity: qty,
      quality: 1,
      item_instance_id: null,
      instance: null,
      created_at: invAny.createdAt ?? now,
      updated_at: now,
    } as InventoryItem);
  }

  const items = inventory.items ?? {};
  for (const listKey of ['weapons', 'equipments'] as const) {
    for (const item of items[listKey] ?? []) {
      out.push({
        id: item._id,
        owner_id: inventory.user,
        item_template_id: itemId(item.code),
        quantity: item.quantity,
        quality: 1,
        item_instance_id: item._id,
        instance: item as any,
        created_at: (item as any).lastAcquisitionAt ?? now,
        updated_at: now,
      } as InventoryItem);
    }
  }

  return out;
}

/*──────────────────────────── Companies ────────────────────────────*/

export function mapCompany(c: WarEraCompany): Company {
  return {
    id: c._id,
    name: c.name,
    owner_id: c.user,
    region_id: regionId(c.region),
    item_template_id: itemId(c.itemCode),
    vault_balance: (c as any).money ?? c.concreteInvested ?? 0,
    created_at: c.createdAt ?? new Date().toISOString(),
  } as Company;
}

/*──────────────────────────── Battles / wars ────────────────────────────*/

export function mapBattle(b: WarEraBattle): Battle {
  return {
    id: b._id,
    name: `${b.attacker.country} vs ${b.defender.country}`,
    status: b.isActive ? 'active' : 'finished',
    war_id: b.war,
    region_id: (b.defender.region ?? '') as any,
    attacker_id: b.attacker.country as any,
    defender_id: b.defender.country as any,
    winner_id: null,
    created_at: b.rounds?.[0] ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Battle;
}

export function mapWar(w: {
  _id: string;
  attacker: { country: string };
  defender: { country: string };
  isActive: boolean;
}): War {
  return {
    id: w._id,
    attacker_id: w.attacker.country as any,
    defender_id: w.defender.country as any,
    is_active: w.isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as War;
}

/*──────────────────────────── Politics ────────────────────────────*/

export function mapElection(e: {
  _id: string;
  country: string;
  type: string;
  status: string;
  candidates: Array<{ user: string; party?: string; voteCount: number }>;
  votesCount: number;
  votesStartAt?: string;
  votesEndAt?: string;
}): Election {
  return {
    id: e._id,
    country_id: e.country as any,
    type: e.type as any,
    status: e.status as any,
    candidates: e.candidates.map((c) => ({
      id: `${e._id}:${c.user}`,
      election_id: e._id as any,
      user_id: c.user as any,
      party_id: c.party ?? null,
      vote_count: c.voteCount,
    })),
    votes_count: e.votesCount,
    start_at: e.votesStartAt ?? new Date().toISOString(),
    end_at: e.votesEndAt ?? new Date().toISOString(),
  } as unknown as Election;
}

export function mapBill(l: {
  _id: string;
  country: string;
  type?: string;
  status: string;
  votes: { accept?: string[]; reject?: string[] };
}): Bill {
  const accepts = l.votes?.accept?.length ?? 0;
  const rejects = l.votes?.reject?.length ?? 0;
  return {
    id: l._id,
    country_id: l.country as any,
    type: l.type ?? 'tax_change',
    title: l.type ?? 'Legislative proposal',
    status: (accepts > rejects ? 'passed' : 'voting') as any,
    yes_votes: accepts,
    no_votes: rejects,
    created_at: new Date().toISOString(),
  } as unknown as Bill;
}

export function mapConversation(c: {
  _id: string;
  type: string;
  tag?: string;
  name?: string;
  memberCount: number;
  myRole: string;
}): ConversationThread {
  return {
    id: c._id,
    type: c.type as any,
    name: c.name ?? c.tag ?? c._id,
    participant_count: c.memberCount,
    my_role: c.myRole as any,
    created_at: new Date().toISOString(),
  } as unknown as ConversationThread;
}

export function mapDirectMessage(m: {
  _id: string;
  user: string;
  message: string;
  fullTextVersion?: string;
  createdAt: string;
}): DirectMessage {
  return {
    id: m._id,
    thread_id: '',
    author_id: m.user as any,
    content: m.fullTextVersion ?? m.message,
    created_at: m.createdAt,
  } as unknown as DirectMessage;
}

/*──────────────────────────── Economy helpers ────────────────────────────*/

export function mapResources(config: WarEraGameConfig): Resource[] {
  const out: Resource[] = [];
  for (const [code, raw] of Object.entries(config.items)) {
    if (raw.type === 'raw') {
      out.push({
        id: itemId(code),
        name: raw.code,
        icon: '',
        description: '',
        rarity: raw.rarity as any,
        category: raw.type as any,
        weight: (raw as any).weight ?? 0,
        base_value: (raw as any).base_value ?? 1,
        stack_limit: 1000,
        enabled: true,
        created_at: new Date().toISOString(),
      } as Resource);
    }
  }
  return out;
}

export function mapResourceSpawns(): ResourceSpawn[] {
  // WarEra does not expose per-region spawn tables through a public call.
  return [];
}

export function mapExperienceThresholds(): ExperienceThreshold[] {
  const out: ExperienceThreshold[] = [];
  for (let i = 1; i <= 10; i++) {
    out.push({ level: i, required_experience: i * 100 });
  }
  return out;
}

/*──────────────────────────── Player resources (empty until API exposes them) ────────────────────────────*/

export function mapPlayerResources(profileId: string): PlayerResource[] {
  return [];
}
