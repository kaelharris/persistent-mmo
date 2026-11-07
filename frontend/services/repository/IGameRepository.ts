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
  NobleHouse,
  Dynasty,
  DynastyMember,
  RulerLegitimacy,
  KingdomStability,
} from '../../types/entities';

export interface IGameRepository {
  getProfile(userId: string): Promise<Profile | null>;
  getPlayerStats(userId: string): Promise<PlayerStats | null>;
  getCurrencies(userId: string): Promise<Currencies | null>;
  getRegions(): Promise<Region[]>;
  getCountries(): Promise<Country[]>;
  getInventory(userId: string): Promise<InventoryItem[]>;
  getItemTemplates(): Promise<ItemTemplate[]>;
  
  // Phase 2 Economy APIs
  getResources(): Promise<Resource[]>;
  getResourceSpawns(): Promise<ResourceSpawn[]>;
  getPlayerResources(userId: string): Promise<PlayerResource[]>;
  getEnergyHistory(userId: string): Promise<EnergyHistory[]>;
  getGatherLogs(userId: string): Promise<GatherLog[]>;
  getExperienceThresholds(): Promise<ExperienceThreshold[]>;
  gatherResource(userId: string, resourceId: number): Promise<{
    success: boolean;
    gatheredQuantity: number;
    energySpent: number;
    experienceGained: number;
    leveledUp: boolean;
    newLevel: number;
    newEnergy: number;
    error: string | null;
  }>;

  // Phase 4 Industrial System APIs
  getCompanyTemplates(): Promise<CompanyTemplate[]>;
  getMyCompanies(userId: string): Promise<Company[]>;
  getCompanyMembers(companyId: string): Promise<CompanyMember[]>;
  getCompanyInventory(companyId: string): Promise<CompanyInventoryItem[]>;
  getCompanyVault(companyId: string): Promise<CompanyVault | null>;
  getCompanyJobs(companyId?: string): Promise<CompanyJob[]>;
  getProductionRecipes(): Promise<ProductionRecipe[]>;
  getProductionInputs(): Promise<ProductionInput[]>;
  getCompanyProductionQueue(companyId: string): Promise<CompanyProductionQueue[]>;
  getCompanyLogs(companyId: string): Promise<CompanyLog[]>;
  getCompanyMachines(companyId: string): Promise<CompanyMachine[]>;
  
  createCompany(userId: string, name: string, regionId: number, templateId: number): Promise<{
    success: boolean;
    companyId: string | null;
    error: string | null;
  }>;
  
  vaultCashTransaction(userId: string, companyId: string, amount: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  vaultResourceTransaction(userId: string, companyId: string, resourceId: number, quantity: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  postCompanyJob(userId: string, companyId: string, regionId: number, salary: number, vacancies: number): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  applyForJob(userId: string, jobId: string): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  resignFromCompany(userId: string, companyId: string): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  terminateEmployee(userId: string, companyId: string, employeeId: string): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  setEmployeeSalary(userId: string, companyId: string, employeeId: string, newSalary: number): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  queueProduction(userId: string, companyId: string, recipeId: number, quantity: number): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  executeCompanyWorkShift(userId: string, companyId: string): Promise<{
    success: boolean;
    salaryEarned: number;
    expRewarded: number;
    leveledUp: boolean;
    newEnergy: number;
    error: string | null;
  }>;
  
  travelToRegion(userId: string, targetRegionId: number): Promise<{
    success: boolean;
    error: string | null;
  }>;
  
  workAtCompany(userId: string, companyId: string): Promise<{
    success: boolean;
    earnedSalary: number;
    skillIncrease: number;
    expGained: number;
    error: string | null;
  }>;
  
  trainStrength(userId: string): Promise<{
    success: boolean;
    strengthGained: number;
    expGained: number;
    energyRemaining: number;
    error: string | null;
  }>;
  
  fightInBattle(userId: string, battleId: string, sideCountryId: number): Promise<{
    success: boolean;
    damageDealt: number;
    xpGained: number;
    energyRemaining: number;
    error: string | null;
  }>;

  getCompanies(regionId?: number): Promise<Company[]>;
  getJobOffers(): Promise<JobOffer[]>;
  getActiveBattles(): Promise<Battle[]>;
  getAuditLogs(userId: string): Promise<AuditLog[]>;

  // Admin/System functions (for mock triggers & seeding representation)
  syncEnergyTicks(userId: string): Promise<PlayerStats | null>;
  claimTestTicket(userId: string): Promise<{ success: boolean; error: string | null }>;
  claimDevFunding(userId: string): Promise<{ success: boolean; error: string | null }>;
  cheatResourcesAndCurrencies(userId: string): Promise<{ success: boolean; error: string | null }>;
  claimDevEnergy(userId: string): Promise<{ success: boolean; error: string | null }>;

  // Marketplace Methods
  getMarketListings(): Promise<MarketListing[]>;
  getMarketOrders(): Promise<MarketOrder[]>;
  getMarketHistory(): Promise<MarketTransaction[]>;
  getMarketNotifications(userId: string): Promise<MarketNotification[]>;
  markNotificationRead(userId: string, notificationId: string): Promise<{ success: boolean; error: string | null }>;
  
  createMarketListing(
    userId: string,
    companyId: string | null,
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemId: string | null,
    quantity: number,
    pricePerUnit: number,
    currencyType: 'local' | 'gold'
  ): Promise<{ success: boolean; listingId: string | null; error: string | null }>;

  createMarketOrder(
    userId: string,
    companyId: string | null,
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemTemplateId: number | null,
    quantity: number,
    pricePerUnit: number,
    currencyType: 'local' | 'gold'
  ): Promise<{ success: boolean; orderId: string | null; error: string | null }>;

  cancelMarketListing(userId: string, listingId: string): Promise<{ success: boolean; error: string | null }>;
  cancelMarketOrder(userId: string, orderId: string): Promise<{ success: boolean; error: string | null }>;

  getWatchlist(userId: string): Promise<WatchlistItem[]>;
  toggleWatchlist(userId: string, assetType: 'resource' | 'item', assetId: number): Promise<{ success: boolean; isWatched: boolean; error: string | null }>;
  getPriceAlerts(userId: string): Promise<PriceAlert[]>;
  createPriceAlert(userId: string, assetType: 'resource' | 'item', assetId: number, targetPrice: number, condition: 'above' | 'below'): Promise<{ success: boolean; alertId: string | null; error: string | null }>;
  deletePriceAlert(userId: string, alertId: string): Promise<{ success: boolean; error: string | null }>;

  // Phase 6 Advanced Item signatures
  getItemRecipes(): Promise<ItemRecipe[]>;
  getItemBlueprints(userId: string): Promise<ItemBlueprint[]>;
  getItemHistory(userId: string): Promise<ItemHistory[]>;
  getEquipment(userId: string): Promise<Equipment | null>;
  equipItem(userId: string, itemId: string, slot: string): Promise<{ success: boolean; error: string | null }>;
  unequipItem(userId: string, slot: string): Promise<{ success: boolean; error: string | null }>;
  consumeItem(userId: string, itemId: string): Promise<{ success: boolean; newEnergy?: number; error: string | null }>;
  craftItem(userId: string, recipeId: number): Promise<{ success: boolean; error: string | null }>;
  repairItem(userId: string, itemId: string): Promise<{ success: boolean; costPaid?: number; error: string | null }>;
  unlockBlueprint(userId: string, recipeId: number): Promise<{ success: boolean; error: string | null }>;

  // Phase 7 Living World signatures
  getRegionalEconomies(): Promise<RegionalEconomy[]>;
  getWorldEvents(): Promise<WorldEvent[]>;
  getSimulationLogs(): Promise<SimulationLog[]>;
  getNPCLogs(): Promise<NPCActivityLog[]>;
  executeSimulationTick(): Promise<{ success: boolean; tickIndex?: number; error: string | null }>;

  // Phase 8 Military Combat signatures
  getEnemyTemplates(): Promise<EnemyTemplate[]>;
  getCombatRankings(): Promise<CombatRanking[]>;
  executePvEBattle(enemyTemplateId: number): Promise<{ success: boolean; isVictory?: boolean; xpGained?: number; currencyGained?: number; roundsLog?: CombatRoundLog[]; lootGained?: CombatRewardItem[]; playerHp?: number; error: string | null }>;
  executePvPBattle(opponentProfileId: string): Promise<{ success: boolean; isVictory?: boolean; roundsLog?: CombatRoundLog[]; ratingChange?: number; playerHp?: number; error: string | null }>;

  // Phase 9 Nations and Politics signatures
  getPoliticalParties(): Promise<PoliticalParty[]>;
  getElections(): Promise<Election[]>;
  getCandidates(electionId: number): Promise<Candidate[]>;
  getBills(): Promise<Bill[]>;
  getNationalProjects(): Promise<NationalProject[]>;
  createPoliticalParty(name: string, description: string): Promise<{ success: boolean; partyId?: number; error: string | null }>;
  joinPoliticalParty(partyId: number): Promise<{ success: boolean; error: string | null }>;
  registerAsCandidate(electionId: number): Promise<{ success: boolean; error: string | null }>;
  voteForCandidate(electionId: number, candidateId: string): Promise<{ success: boolean; error: string | null }>;
  proposeBill(title: string, description: string, type: string, parameters: any): Promise<{ success: boolean; billId?: number; error: string | null }>;
  voteOnBill(billId: number, vote: 'yes' | 'no'): Promise<{ success: boolean; error: string | null }>;

  // Phase 10 Warfare signatures
  getWars(): Promise<War[]>;
  getMilitaryRegions(): Promise<MilitaryRegion[]>;
  getArmyUnits(): Promise<ArmyUnit[]>;
  getSupplyRoutes(): Promise<SupplyRoute[]>;
  getPeaceTreaties(): Promise<PeaceTreaty[]>;
  declareWar(defenderCountryId: number): Promise<{ success: boolean; warId?: number; error: string | null }>;
  mobilizeArmy(): Promise<{ success: boolean; armyId?: number; error: string | null }>;
  commandArmyMovement(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }>;
  engageMilitaryBattle(armyId: number, targetRegionId: number): Promise<{ success: boolean; outcome?: string; error: string | null }>;
  proposePeace(warId: number, reparations: number, transfers: number[]): Promise<{ success: boolean; treatyId?: number; error: string | null }>;
  acceptPeace(treatyId: number): Promise<{ success: boolean; error: string | null }>;

  // Phase 11 Social/Community signatures
  getGuilds(): Promise<Guild[]>;
  getMyGuild(userId: string): Promise<Guild | null>;
  getGuildMembers(guildId: number): Promise<GuildMember[]>;
  getGuildInventory(guildId: number): Promise<GuildInventory[]>;
  getGuildApplications(guildId: number): Promise<GuildApplication[]>;
  getGuildInvitations(userId: string): Promise<GuildInvitation[]>;
  getGuildWars(): Promise<GuildWar[]>;
  getGuildAlliances(): Promise<GuildAlliance[]>;
  getCoalitions(): Promise<Coalition[]>;
  getCoalitionMembers(coalitionId: number): Promise<CoalitionMember[]>;
  getFriendships(userId: string): Promise<Friendship[]>;
  getPlayerBlocks(userId: string): Promise<PlayerBlock[]>;
  getConversationThreads(userId: string): Promise<ConversationThread[]>;
  getDirectMessages(threadId: number): Promise<DirectMessage[]>;
  getPlayerMail(userId: string): Promise<PlayerMail[]>;
  getPlayerReputation(userId: string): Promise<PlayerReputation | null>;
  // Phase 5: Dynasties, Kingdom Leadership, and Succession signatures
  getNobleHouses(): Promise<NobleHouse[]>;
  getDynasty(profileId?: string): Promise<Dynasty | null>;
  getDynastyMembers(dynastyId: number): Promise<DynastyMember[]>;
  getRulerLegitimacy(profileId: string): Promise<RulerLegitimacy | null>;
  getKingdomStability(countryId: number): Promise<KingdomStability | null>;
  establishDynasty(dynastyName: string, nobleHouseName: string, founderTitle: 'King' | 'Queen' | 'Sultan' | 'Shah' | 'Khagan', countryId: number, successionLaw: 'hereditary' | 'elective' | 'appointed'): Promise<{ success: boolean; dynastyId?: number; error: string | null }>;
  designateHeir(dynastyId: number, heirProfileId: string, heirTitle: 'King' | 'Queen' | 'Heir', successionLaw: 'hereditary' | 'elective' | 'appointed'): Promise<{ success: boolean; error: string | null }>;
  abdicateThrone(profileId: string, regentProfileId?: string): Promise<{ success: boolean; error: string | null }>;
  resolveSuccession(dynastyId: number, newRulerProfileId: string): Promise<{ success: boolean; newRulerTitle?: string; error: string | null }>;
  updateLegitimacy(profileId: string, legitimacy: number, reason: 'heir_clear' | 'election_verified' | 'appointment_confirmed' | 'usurpation' | 'disputed'): Promise<{ success: boolean; error: string | null }>;
  getSuccessionOrder(dynastyId: number): Promise<DynastyMember[]>;

  getPlayerTitles(userId: string): Promise<PlayerTitle[]>;
  getPlayerBadges(userId: string): Promise<PlayerBadge[]>;
  getContracts(): Promise<Contract[]>;
  getContractOffers(userId: string): Promise<ContractOffer[]>;
  getContractExecutions(contractId: number): Promise<ContractExecution[]>;
  getRecruitmentPosts(): Promise<RecruitmentPost[]>;
  getNewspapers(): Promise<Newspaper[]>;
  getArticles(): Promise<Article[]>;
  getArticleComments(articleId: number): Promise<ArticleComment[]>;
  getAnnouncements(): Promise<Announcement[]>;
  getCalendarEvents(): Promise<CalendarEvent[]>;
  getCommunityLogs(guildId: number): Promise<CommunityLog[]>;

  createGuild(userId: string, name: string, tag: string, description: string): Promise<{ success: boolean; guildId?: number; error: string | null }>;
  applyToGuild(userId: string, guildId: number, message: string): Promise<{ success: boolean; error: string | null }>;
  respondToGuildApplication(applicationId: number, approve: boolean): Promise<{ success: boolean; error: string | null }>;
  sendGuildInvitation(guildId: number, targetProfileId: string): Promise<{ success: boolean; error: string | null }>;
  respondToGuildInvitation(invitationId: number, accept: boolean): Promise<{ success: boolean; error: string | null }>;
  manageGuildMember(guildId: number, targetProfileId: string, action: 'kick' | 'promote' | 'demote'): Promise<{ success: boolean; error: string | null }>;
  withdrawGuildVault(guildId: number, amount: number, isGold: boolean): Promise<{ success: boolean; error: string | null }>;
  sendDirectMessage(threadId: number, content: string): Promise<{ success: boolean; messageId?: number; error: string | null }>;
  createConversationThread(type: 'private' | 'group' | 'guild' | 'coalition' | 'country' | 'trade' | 'system', participantIds: string[]): Promise<{ success: boolean; threadId?: number; error: string | null }>;
  sendMail(recipientId: string, subject: string, body: string, attachedCurrency: number, attachedGold: number, attachedItemTemplateId?: number, attachedItemQty?: number): Promise<{ success: boolean; mailId?: number; error: string | null }>;
  claimMailAttachments(mailId: number): Promise<{ success: boolean; error: string | null }>;
  createContract(type: string, terms: any, escrowLocal: number, escrowGold: number, deadline?: string): Promise<{ success: boolean; contractId?: number; error: string | null }>;
  acceptContract(contractId: number): Promise<{ success: boolean; error: string | null }>;
  completeContract(contractId: number): Promise<{ success: boolean; error: string | null }>;
  createNewspaper(name: string, description: string): Promise<{ success: boolean; newspaperId?: number; error: string | null }>;
  publishArticle(newspaperId: number, title: string, content: string, category: 'news' | 'opinion' | 'government' | 'developer'): Promise<{ success: boolean; articleId?: number; error: string | null }>;
  commentOnArticle(articleId: number, comment: string): Promise<{ success: boolean; commentId?: number; error: string | null }>;
  respondToFriendRequest(friendshipId: number, accept: boolean): Promise<{ success: boolean; error: string | null }>;
  sendFriendRequest(targetProfileId: string): Promise<{ success: boolean; friendshipId?: number; error: string | null }>;

  // Phase 12 signatures
  getLiveOpsConfig(): Promise<LiveOpsConfig>;
  updateLiveOpsConfig(config: Partial<LiveOpsConfig>): Promise<{ success: boolean; error: string | null }>;
  getModerationActions(profileId?: string): Promise<ModerationAction[]>;
  createModerationAction(action: Omit<ModerationAction, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }>;
  getPlayerReports(): Promise<PlayerReport[]>;
  createPlayerReport(report: Omit<PlayerReport, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }>;
  getSupportTickets(profileId?: string): Promise<SupportTicket[]>;
  createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at'>): Promise<{ success: boolean; ticketId?: number; error: string | null }>;
  addTicketReply(reply: Omit<TicketReply, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }>;
  getTicketReplies(ticketId: number): Promise<TicketReply[]>;
  getSystemMetrics(): Promise<SystemMetric[]>;
  getDailyActiveUsers(): Promise<DailyActiveUser[]>;
  getFeatureFlags(): Promise<FeatureFlag[]>;
  toggleFeatureFlag(flagId: number, isEnabled: boolean, percentage?: number): Promise<{ success: boolean; error: string | null }>;
  getDeveloperKeys(profileId: string): Promise<DeveloperKey[]>;
  createDeveloperKey(profileId: string, label: string): Promise<{ success: boolean; key?: string; error: string | null }>;
  revokeDeveloperKey(keyId: number): Promise<{ success: boolean; error: string | null }>;
  getQuests(): Promise<Quest[]>;
  getPlayerQuests(profileId: string): Promise<PlayerQuest[]>;
  startQuest(profileId: string, questId: number): Promise<{ success: boolean; error: string | null }>;
  updateQuestProgress(profileId: string, questId: number, progress: any): Promise<{ success: boolean; error: string | null }>;
  getAchievements(): Promise<Achievement[]>;
  getPlayerAchievements(profileId: string): Promise<PlayerAchievement[]>;
  getSeasons(): Promise<Season[]>;
  getSeasonLeaderboard(seasonId: number): Promise<SeasonLeaderboard[]>;
  getClosedAlphaInvites(): Promise<any[]>;
  generateClosedAlphaInvite(code: string): Promise<{ success: boolean; error: string | null }>;

  // Phase 6.5 Vertical Slice: onboarding + strategic warfare
  getPlayerCharacter(userId: string): Promise<any | null>;
  savePlayerCharacter(userId: string, input: { name: string; epithet?: string; kingdom_id: number; profession: any; origin?: string; motto?: string; banner_seed?: number }): Promise<{ success: boolean; error: string | null }>;
  completeOnboarding(userId: string): Promise<{ success: boolean; error: string | null }>;
  resetPlayerCharacter(userId: string): Promise<{ success: boolean; error: string | null }>;
  upgradeProfession(userId: string, cost?: number): Promise<{ success: boolean; error: string | null; newRank?: number }>;
  recruitArmy(userId: string): Promise<{ success: boolean; armyId?: number; error: string | null }>;
  initiateSiege(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }>;
  progressSiege(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null; provinceCaptured?: boolean; report?: any }>;
  liftSiege(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }>;
  getRegionEdges(): Promise<any[]>;
  getLastBattleReport(userId?: string): Promise<any | null>;
}
