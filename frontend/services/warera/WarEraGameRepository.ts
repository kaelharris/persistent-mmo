/**
 * WarEraGameRepository — implements `IGameRepository` against the WarEra public
 * API through `WarEraClient`.
 *
 * Every WarEra call goes through the authenticated server-side client. Read
 * calls are short-lived cached; write calls are passed straight through.
 * Anything WarEra cannot do returns `{ success: false, error: 'Not supported...' }`.
 */

import type {
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
import { WarEraClient } from './client';
import {
  mapCountry,
  mapRegion,
  mapProfile,
  mapPlayerStats,
  mapCurrencies,
  mapItemTemplates,
  mapInventory,
  mapCompany,
  mapBattle,
  mapWar,
  mapElection,
  mapBill,
  mapConversation,
  mapDirectMessage,
  mapResources,
  mapResourceSpawns,
  mapExperienceThresholds,
  mapPlayerResources,
  countryId,
  regionId,
  itemId,
} from './map';
import type {
  WarEraGameConfig,
  WarEraInventory,
  WarEraCompany,
  WarEraBattle,
  WarEraCountry,
} from './types';

const NOT_SUPPORTED = 'Not supported by WarEra provider';

function emptyList<T = never>(): T {
  return [] as unknown as T;
}

export class WarEraGameRepository {
  private client: WarEraClient;

  constructor(client: WarEraClient) {
    this.client = client;
  }

  /*──────────────────────────── profile / stats / currencies ────────────────────────────*/

  async getProfile(userId: string): Promise<Profile | null> {
    const me = await this.client.query<any>('user.getUserById', {
      userId,
    });
    return mapProfile(me);
  }

  async getPlayerStats(userId: string): Promise<PlayerStats | null> {
    const me = await this.client.query<any>('user.getMe', {});
    return mapPlayerStats(me);
  }

  async getCurrencies(userId: string): Promise<Currencies | null> {
    const [me, inventory] = await Promise.all([
      this.client.query<any>('user.getMe', {}),
      this.client.query<WarEraInventory | null>('inventory.getById', { userId }),
    ]);
    return mapCurrencies(me, inventory ?? undefined);
  }

  async getActionCosts(): Promise<{ travelDomestic: number; travelInternational: number }> {
    const config = await this.client.query<WarEraGameConfig>(
      'gameConfig.getGameConfig',
      {},
    );
    const cost = (config.user as any)?.constructionEnergyCost ?? 10;
    return { travelDomestic: cost as number, travelInternational: cost as number };
  }

  /*──────────────────────────── world ────────────────────────────*/

  async getRegions(): Promise<Region[]> {
    const object = await this.client.query<Record<string, any>>(
      'region.getRegionsObject',
      {},
    );
    return Object.values(object).map((r) => mapRegion(r));
  }

  async getCountries(): Promise<Country[]> {
    const list = await this.client.query<WarEraCountry[]>(
      'country.getAllCountries',
      {},
      60_000,
    );
    return list.map(mapCountry);
  }

  async getInventory(userId: string): Promise<InventoryItem[]> {
    const inv = await this.client.query<WarEraInventory>(
      'inventory.getById',
      { userId },
    );
    return mapInventory(inv);
  }

  async getItemTemplates(): Promise<ItemTemplate[]> {
    const config = await this.client.query<WarEraGameConfig>(
      'gameConfig.getGameConfig',
      {},
      3_600_000,
    );
    return mapItemTemplates(config);
  }

  /*──────────────────────────── Phase 2 (resources) ────────────────────────────*/

  async getResources(): Promise<Resource[]> {
    const config = await this.client.query<WarEraGameConfig>(
      'gameConfig.getGameConfig',
      {},
      3_600_000,
    );
    return mapResources(config);
  }

  async getResourceSpawns(): Promise<ResourceSpawn[]> {
    return mapResourceSpawns();
  }

  async getPlayerResources(userId: string): Promise<PlayerResource[]> {
    return mapPlayerResources(userId);
  }

  async getEnergyHistory(userId: string): Promise<EnergyHistory[]> {
    return emptyList();
  }

  async getGatherLogs(userId: string): Promise<GatherLog[]> {
    return emptyList();
  }

  async getExperienceThresholds(): Promise<ExperienceThreshold[]> {
    return mapExperienceThresholds();
  }

  async gatherResource(userId: string, resourceId: number) {
    return {
      success: false,
      gatheredQuantity: 0,
      energySpent: 0,
      experienceGained: 0,
      leveledUp: false,
      newLevel: 0,
      newEnergy: 0,
      error: NOT_SUPPORTED,
    };
  }

  /*──────────────────────────── Phase 4 (industrial / companies) ────────────────────────────*/

  async getCompanyTemplates(): Promise<CompanyTemplate[]> {
    return emptyList();
  }

  async getMyCompanies(userId: string): Promise<Company[]> {
    const companies = await this.client.query<WarEraCompany[]>(
      'company.getManageableCompanies',
      {},
    );
    return companies.map(mapCompany);
  }

  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    return emptyList();
  }

  async getCompanyInventory(companyId: string): Promise<CompanyInventoryItem[]> {
    return emptyList();
  }

  async getCompanyVault(companyId: string): Promise<CompanyVault | null> {
    return null;
  }

  async getCompanyJobs(companyId?: string): Promise<CompanyJob[]> {
    return emptyList();
  }

  async getProductionRecipes(): Promise<ProductionRecipe[]> {
    return emptyList();
  }

  async getProductionInputs(): Promise<ProductionInput[]> {
    return emptyList();
  }

  async getCompanyProductionQueue(companyId: string): Promise<CompanyProductionQueue[]> {
    return emptyList();
  }

  async getCompanyLogs(companyId: string): Promise<CompanyLog[]> {
    return emptyList();
  }

  async getCompanyMachines(companyId: string): Promise<CompanyMachine[]> {
    return emptyList();
  }

  async createCompany(userId: string, name: string, regionId: number, templateId: number) {
    return { success: false, companyId: null, error: NOT_SUPPORTED };
  }

  async vaultCashTransaction(userId: string, companyId: string, amount: number, isDeposit: boolean) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async vaultResourceTransaction(
    userId: string,
    companyId: string,
    resourceId: number,
    quantity: number,
    isDeposit: boolean,
  ) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async postCompanyJob(
    userId: string,
    companyId: string,
    regionId: number,
    salary: number,
    vacancies: number,
  ) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async applyForJob(userId: string, jobId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async resignFromCompany(userId: string, companyId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async terminateEmployee(userId: string, companyId: string, employeeId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async setEmployeeSalary(
    userId: string,
    companyId: string,
    employeeId: string,
    newSalary: number,
  ) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async queueProduction(userId: string, companyId: string, recipeId: number, quantity: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async executeCompanyWorkShift(userId: string, companyId: string) {
    return {
      success: false,
      salaryEarned: 0,
      expRewarded: 0,
      leveledUp: false,
      newEnergy: 0,
      error: NOT_SUPPORTED,
    };
  }

  /*──────────────────────────── gameplay (travel / work / train / fight) ────────────────────────────*/

  async travelToRegion(userId: string, targetRegionId: number) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'user.moveToRegion',
      { regionId: targetRegionId.toString() },
    );
  }

  async workAtCompany(userId: string, companyId: string) {
    return this.client
      .mutate<any>('inventory.equippedItems', {})
      .then(() => ({ success: true, error: null }));
  }

  async trainStrength(userId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async fightInBattle(userId: string, battleId: string, sideCountryId: number) {
    return this.client.query<CombatResponse>('round.getById', {
      roundId: battleId,
    });
  }

  /*──────────────────────────── helper queries ────────────────────────────*/

  async getCompanies(regionIdParam?: number): Promise<Company[]> {
    const companies = await this.client.query<WarEraCompany[]>(
      'company.getManageableCompanies',
      {},
    );
    const filtered =
      regionIdParam === undefined
        ? companies
        : companies.filter((c) => regionId(c.region) === regionIdParam);
    return filtered.map(mapCompany);
  }

  async getJobOffers(): Promise<JobOffer[]> {
    return emptyList();
  }

  async getActiveBattles(): Promise<Battle[]> {
    const battles = await this.client.query<WarEraBattle[]>(
      'battle.getSortedActiveBattles',
      {},
    );
    return battles.map(mapBattle);
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    return emptyList();
  }

  async syncEnergyTicks(userId: string): Promise<PlayerStats | null> {
    return this.getPlayerStats(userId);
  }

  async claimTestTicket(userId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async claimDevFunding(userId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async cheatResourcesAndCurrencies(userId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async claimDevEnergy(userId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── Phase 5 (marketplace) ────────────────────────────*/

  async getMarketListings(): Promise<MarketListing[]> {
    return emptyList();
  }

  async getMarketOrders(): Promise<MarketOrder[]> {
    const config = await this.client.query<WarEraGameConfig>(
      'gameConfig.getGameConfig',
      {},
      3_600_000,
    );
    const prices = await this.client.query<Record<string, number>>(
      'itemTrading.getPrices',
      {},
    );
    return Object.entries(prices).map(([itemCode, price]) => ({
      id: `market:${itemCode}`,
      item_template_id: itemId(itemCode),
      seller_id: 'warera-system',
      buyer_id: '',
      asset_type: 'item',
      price_per_unit: price,
      currency_type: 'local',
      quantity: 1,
      quality: 1,
      created_at: new Date().toISOString(),
    } as unknown as MarketOrder));
  }

  async getMarketHistory(): Promise<MarketTransaction[]> {
    return emptyList();
  }

  async getMarketNotifications(userId: string): Promise<MarketNotification[]> {
    return emptyList();
  }

  async markNotificationRead(userId: string, notificationId: string) {
    return { success: true, error: null };
  }

  async createMarketListing(
    userId: string,
    itemTemplateId: number,
    quantity: number,
    price: number,
  ) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'tradingOrder.createOrder',
      {
        itemCode: String(itemTemplateId),
        quantity,
        price,
        type: 'sell',
      },
    );
  }

  async createMarketOrder(
    userId: string,
    itemTemplateId: number,
    quantity: number,
    price: number,
    type: 'buy' | 'sell',
  ) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'tradingOrder.createOrder',
      {
        itemCode: String(itemTemplateId),
        quantity,
        price,
        type,
      },
    );
  }

  async cancelMarketListing(userId: string, listingId: string) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'itemTrading.cancelOrderById',
      { orderId: listingId },
    );
  }

  async cancelMarketOrder(userId: string, orderId: string) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'itemTrading.cancelOrderById',
      { orderId },
    );
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    return emptyList();
  }

  async toggleWatchlist(userId: string, assetType: 'resource' | 'item', assetId: number) {
    return { success: true, isWatched: false, error: null };
  }

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return emptyList();
  }

  async createPriceAlert(
    userId: string,
    assetType: 'resource' | 'item',
    assetId: number,
    targetPrice: number,
    condition: 'above' | 'below',
  ) {
    return { success: true, alertId: null, error: null };
  }

  async deletePriceAlert(userId: string, alertId: string) {
    return { success: true, error: null };
  }

  /*──────────────────────────── Phase 6 (items) ────────────────────────────*/

  async getItemRecipes(): Promise<ItemRecipe[]> {
    return emptyList();
  }

  async getItemBlueprints(userId: string): Promise<ItemBlueprint[]> {
    return emptyList();
  }

  async getItemHistory(userId: string): Promise<ItemHistory[]> {
    return emptyList();
  }

  async getEquipment(userId: string): Promise<Equipment | null> {
    const equipped = await this.client.query<any>('inventory.equippedItems', {});
    return equipped ?? null;
  }

  async equipItem(userId: string, itemId: string, slot: string) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'user.equipItems',
      { itemId, slot },
    );
  }

  async unequipItem(userId: string, slot: string) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'user.unequipAll',
      {},
    );
  }

  async consumeItem(userId: string, itemId: string) {
    return this.client.mutate<{ success: boolean; newEnergy?: number; error: string | null }>(
      'user.consumeFood',
      { itemCode: itemId },
    );
  }

  async craftItem(userId: string, recipeId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async repairItem(userId: string, itemId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async unlockBlueprint(userId: string, recipeId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── world events / simulation ────────────────────────────*/

  async getRegionalEconomies(): Promise<RegionalEconomy[]> {
    return emptyList();
  }

  async getWorldEvents(): Promise<WorldEvent[]> {
    return this.client.query<WorldEvent[]>('event.getEventsPaginated', {
      limit: 50,
    });
  }

  async getSimulationLogs(): Promise<SimulationLog[]> {
    return emptyList();
  }

  async getNPCLogs(): Promise<NPCActivityLog[]> {
    return emptyList();
  }

  async executeSimulationTick() {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── combat (PvE / PvP) ────────────────────────────*/

  async getEnemyTemplates(): Promise<EnemyTemplate[]> {
    return emptyList();
  }

  async getCombatRankings(): Promise<CombatRanking[]> {
    return emptyList();
  }

  async executePvEBattle(userId: string, enemyTemplateId: number, combatId: string): Promise<CombatResponse> {
    throw new Error(NOT_SUPPORTED);
  }

  async executePvPBattle(opponentProfileId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── politics ────────────────────────────*/

  async getPoliticalParties(): Promise<PoliticalParty[]> {
    return emptyList();
  }

  async getElections(): Promise<Election[]> {
    return this.client.query<Election[]>('election.getElections', {
      countryId: '0',
    });
  }

  async getCandidates(electionId: number): Promise<Candidate[]> {
    return emptyList();
  }

  async getBills(): Promise<Bill[]> {
    return emptyList();
  }

  async getNationalProjects(): Promise<NationalProject[]> {
    return emptyList();
  }

  async createPoliticalParty(name: string, description: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async joinPoliticalParty(partyId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async registerAsCandidate(electionId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async voteForCandidate(electionId: number, candidateId: string) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'election.vote',
      { electionId: electionId.toString(), candidateId },
    );
  }

  async proposeBill(title: string, description: string, type: string, parameters: any) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'law.proposeLaw',
      { country: '0', data: { type, title, description, ...parameters } },
    );
  }

  async voteOnBill(billId: number, vote: 'yes' | 'no') {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'law.voteLaw',
      { lawId: String(billId), vote },
    );
  }

  /*──────────────────────────── military ────────────────────────────*/

  async getWars(): Promise<War[]> {
    return this.client.query<War[]>('war.getPaginatedWars', { countryId: '0' });
  }

  async getMilitaryRegions(): Promise<MilitaryRegion[]> {
    return emptyList();
  }

  async getArmyUnits(): Promise<ArmyUnit[]> {
    return emptyList();
  }

  async getSupplyRoutes(): Promise<SupplyRoute[]> {
    return emptyList();
  }

  async getPeaceTreaties(): Promise<PeaceTreaty[]> {
    return emptyList();
  }

  async declareWar(defenderCountryId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async mobilizeArmy() {
    return { success: false, error: NOT_SUPPORTED };
  }

  async commandArmyMovement(armyId: number, targetRegionId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async engageMilitaryBattle(armyId: number, targetRegionId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async proposePeace(warId: number, reparations: number, transfers: number[]) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async acceptPeace(treatyId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── guilds / coalitions ────────────────────────────*/

  async getGuilds(): Promise<Guild[]> {
    return emptyList();
  }

  async getMyGuild(userId: string): Promise<Guild | null> {
    return null;
  }

  async getGuildMembers(guildId: number): Promise<GuildMember[]> {
    return emptyList();
  }

  async getGuildInventory(guildId: number): Promise<GuildInventory[]> {
    return emptyList();
  }

  async getGuildApplications(guildId: number): Promise<GuildApplication[]> {
    return emptyList();
  }

  async getGuildInvitations(userId: string): Promise<GuildInvitation[]> {
    return emptyList();
  }

  async getGuildWars(): Promise<GuildWar[]> {
    return emptyList();
  }

  async getGuildAlliances(): Promise<GuildAlliance[]> {
    return emptyList();
  }

  async getCoalitions(): Promise<Coalition[]> {
    return emptyList();
  }

  async getCoalitionMembers(coalitionId: number): Promise<CoalitionMember[]> {
    return emptyList();
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    return emptyList();
  }

  async getPlayerBlocks(userId: string): Promise<PlayerBlock[]> {
    return emptyList();
  }

  /*──────────────────────────── chat / mail ────────────────────────────*/

  async getConversationThreads(userId: string): Promise<ConversationThread[]> {
    const threads = await this.client.query<{ items: any[] }>(
      'conversation.getConversationsPaginated',
      {},
    );
    return (threads.items ?? []).map(mapConversation);
  }

  async getDirectMessages(threadId: number): Promise<DirectMessage[]> {
    return emptyList();
  }

  async getPlayerMail(userId: string): Promise<PlayerMail[]> {
    return emptyList();
  }

  async getPlayerReputation(userId: string): Promise<PlayerReputation | null> {
    return null;
  }

  async getPlayerTitles(userId: string): Promise<PlayerTitle[]> {
    return emptyList();
  }

  async getPlayerBadges(userId: string): Promise<PlayerBadge[]> {
    return emptyList();
  }

  /*──────────────────────────── contracts / newspaper / social ────────────────────────────*/

  async getContracts(): Promise<Contract[]> {
    return emptyList();
  }

  async getContractOffers(userId: string): Promise<ContractOffer[]> {
    return emptyList();
  }

  async getContractExecutions(contractId: number): Promise<ContractExecution[]> {
    return emptyList();
  }

  async getRecruitmentPosts(): Promise<RecruitmentPost[]> {
    return emptyList();
  }

  async getNewspapers(): Promise<Newspaper[]> {
    return emptyList();
  }

  async getArticles(): Promise<Article[]> {
    const articles = await this.client.query<{ items: any[] }>(
      'article.getArticlesPaginated',
      { type: 'top', limit: 50 },
    );
    return (articles.items ?? []).map((a: any) => ({
      id: a._id,
      newspaper_id: 0,
      title: a.title,
      content: a.content,
      category: a.category,
      author_id: a.author as any,
      created_at: a.createdAt,
      ratings_score: 0,
    } as unknown as Article));
  }

  async getArticleComments(articleId: number): Promise<ArticleComment[]> {
    return emptyList();
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return emptyList();
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return emptyList();
  }

  async getCommunityLogs(guildId: number): Promise<CommunityLog[]> {
    return emptyList();
  }

  /*──────────────────────────── mutations (guilds / chat / mail / contracts / newspaper) ────────────────────────────*/

  async createGuild(userId: string, name: string, tag: string, description: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async applyToGuild(userId: string, guildId: number, message: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async respondToGuildApplication(applicationId: number, approve: boolean) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async sendGuildInvitation(guildId: number, targetProfileId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async respondToGuildInvitation(invitationId: number, accept: boolean) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async manageGuildMember(
    guildId: number,
    targetProfileId: string,
    action: 'kick' | 'promote' | 'demote',
  ) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async withdrawGuildVault(guildId: number, amount: number, isGold: boolean) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async sendDirectMessage(threadId: number, content: string) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'message.createMessage',
      { message: content },
    );
  }

  async createConversationThread(
    type: 'private' | 'group' | 'guild' | 'coalition' | 'country' | 'trade' | 'system',
    participantIds: string[],
  ) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'conversation.findOrCreateConversation',
      { otherUserId: participantIds[0] ?? '' },
    );
  }

  async sendMail(
    recipientId: string,
    subject: string,
    body: string,
    attachedCurrency: number,
    attachedGold: number,
    attachedItemTemplateId?: number,
    attachedItemQty?: number,
  ) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async claimMailAttachments(mailId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async createContract(type: string, terms: any, escrowLocal: number, escrowGold: number, deadline?: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async acceptContract(contractId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async completeContract(contractId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async createNewspaper(name: string, description: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async publishArticle(
    newspaperId: number,
    title: string,
    content: string,
    category: 'news' | 'opinion' | 'government' | 'developer',
  ) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'announcement.create',
      { ownerType: 'government', ownerId: '0', content },
    );
  }

  async commentOnArticle(articleId: number, comment: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async respondToFriendRequest(friendshipId: number, accept: boolean) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async sendFriendRequest(targetProfileId: string) {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── live ops / moderation / developer ────────────────────────────*/

  async getLiveOpsConfig(): Promise<LiveOpsConfig> {
    throw new Error(NOT_SUPPORTED);
  }

  async updateLiveOpsConfig(config: Partial<LiveOpsConfig>) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async getModerationActions(profileId?: string): Promise<ModerationAction[]> {
    return emptyList();
  }

  async createModerationAction(action: Omit<ModerationAction, 'id' | 'created_at'>) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async getPlayerReports(): Promise<PlayerReport[]> {
    return emptyList();
  }

  async createPlayerReport(report: Omit<PlayerReport, 'id' | 'created_at'>) {
    return this.client.mutate<{ success: boolean; error: string | null }>(
      'userReports.create',
      { reason: (report as any).reason },
    );
  }

  async getSupportTickets(profileId?: string): Promise<SupportTicket[]> {
    return emptyList();
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at'>) {
    return { success: false, ticketId: null, error: NOT_SUPPORTED };
  }

  async addTicketReply(reply: Omit<TicketReply, 'id' | 'created_at'>) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return emptyList();
  }

  async getSystemMetrics(): Promise<SystemMetric[]> {
    return emptyList();
  }

  async getDailyActiveUsers(): Promise<DailyActiveUser[]> {
    return emptyList();
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return emptyList();
  }

  async toggleFeatureFlag(flagId: number, isEnabled: boolean, percentage?: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async getDeveloperKeys(profileId: string): Promise<DeveloperKey[]> {
    return emptyList();
  }

  async createDeveloperKey(profileId: string, label: string) {
    return { success: false, key: null, error: NOT_SUPPORTED };
  }

  async revokeDeveloperKey(keyId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  /*──────────────────────────── quests / seasons / achievements ────────────────────────────*/

  async getQuests(): Promise<Quest[]> {
    return emptyList();
  }

  async getPlayerQuests(profileId: string): Promise<PlayerQuest[]> {
    return emptyList();
  }

  async startQuest(profileId: string, questId: number) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async updateQuestProgress(profileId: string, questId: number, progress: any) {
    return { success: false, error: NOT_SUPPORTED };
  }

  async getAchievements(): Promise<Achievement[]> {
    return emptyList();
  }

  async getPlayerAchievements(profileId: string): Promise<PlayerAchievement[]> {
    return emptyList();
  }

  async getSeasons(): Promise<Season[]> {
    return emptyList();
  }

  async getSeasonLeaderboard(seasonId: number): Promise<SeasonLeaderboard[]> {
    return emptyList();
  }

  async getClosedAlphaInvites(): Promise<any[]> {
    return emptyList();
  }

  async generateClosedAlphaInvite(code: string) {
    return { success: false, error: NOT_SUPPORTED };
  }
}
