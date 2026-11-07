import { useState, useEffect, useCallback, useRef } from 'react';
import { gameRepository, activeProvider } from '../services/repository/provider';
import { supabase } from '../services/api/supabaseClient';
import {
  Profile,
  PlayerStats,
  Currencies,
  Region,
  Country,
  InventoryItem,
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
  ItemTemplate,
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
  PlayerCharacter,
  Dynasty,
  DynastyMember,
  RulerLegitimacy,
  KingdomStability,
  MilitaryBattleReport,
  RegionEdge,
} from '../types/entities';

export function useGame(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [currencies, setCurrencies] = useState<Currencies | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [itemTemplates, setItemTemplates] = useState<ItemTemplate[]>([]);
  
  // Phase 1
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Phase 2
  const [resources, setResources] = useState<Resource[]>([]);
  const [spawns, setSpawns] = useState<ResourceSpawn[]>([]);
  const [playerResources, setPlayerResources] = useState<PlayerResource[]>([]);
  const [energyHistory, setEnergyHistory] = useState<EnergyHistory[]>([]);
  const [gatherLogs, setGatherLogs] = useState<GatherLog[]>([]);
  const [experienceThresholds, setExperienceThresholds] = useState<ExperienceThreshold[]>([]);

  // Phase 4 (Industrial additions)
  const [companyTemplates, setCompanyTemplates] = useState<CompanyTemplate[]>([]);
  const [myCompanies, setMyCompanies] = useState<Company[]>([]);
  const [productionRecipes, setProductionRecipes] = useState<ProductionRecipe[]>([]);
  const [productionInputs, setProductionInputs] = useState<ProductionInput[]>([]);
  const [companyJobs, setCompanyJobs] = useState<CompanyJob[]>([]);

  // Selected company sub-states
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeCompanyMembers, setActiveCompanyMembers] = useState<CompanyMember[]>([]);
  const [activeCompanyInventory, setActiveCompanyInventory] = useState<CompanyInventoryItem[]>([]);
  const [activeCompanyVault, setActiveCompanyVault] = useState<CompanyVault | null>(null);
  const [activeCompanyProductionQueue, setActiveCompanyProductionQueue] = useState<CompanyProductionQueue[]>([]);
  const [activeCompanyLogs, setActiveCompanyLogs] = useState<CompanyLog[]>([]);
  const [activeCompanyMachines, setActiveCompanyMachines] = useState<CompanyMachine[]>([]);

  // Phase 5 (Marketplace additions)
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>([]);
  const [marketHistory, setMarketHistory] = useState<MarketTransaction[]>([]);
  const [marketNotifications, setMarketNotifications] = useState<MarketNotification[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // Phase 6 (Advanced Item additions)
  const [recipes, setRecipes] = useState<ItemRecipe[]>([]);
  const [blueprints, setBlueprints] = useState<ItemBlueprint[]>([]);
  const [itemHistory, setItemHistory] = useState<ItemHistory[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  // Phase 7 (Living World additions)
  const [regionalEconomies, setRegionalEconomies] = useState<RegionalEconomy[]>([]);
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>([]);
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([]);
  const [npcLogs, setNpcLogs] = useState<NPCActivityLog[]>([]);

  // Phase 8 (Military Combat additions)
  const [enemyTemplates, setEnemyTemplates] = useState<EnemyTemplate[]>([]);
  const [combatRankings, setCombatRankings] = useState<CombatRanking[]>([]);

  // Phase 9 (Nations & Politics additions)
  const [politicalParties, setPoliticalParties] = useState<PoliticalParty[]>([]);
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [nationalProjects, setNationalProjects] = useState<NationalProject[]>([]);

  // Phase 10 (Warfare & Logistics additions)
  const [activeWars, setActiveWars] = useState<War[]>([]);
  const [militaryRegions, setMilitaryRegions] = useState<MilitaryRegion[]>([]);
  const [armyUnits, setArmyUnits] = useState<ArmyUnit[]>([]);
  const [supplyRoutes, setSupplyRoutes] = useState<SupplyRoute[]>([]);
  const [peaceTreaties, setPeaceTreaties] = useState<PeaceTreaty[]>([]);

  // Phase 11 (Social/Community additions)
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [guildApplications, setGuildApplications] = useState<GuildApplication[]>([]);
  const [guildInvitations, setGuildInvitations] = useState<GuildInvitation[]>([]);
  const [coalitions, setCoalitions] = useState<Coalition[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [conversationThreads, setConversationThreads] = useState<ConversationThread[]>([]);
  const [playerMail, setPlayerMail] = useState<PlayerMail[]>([]);
  const [reputation, setReputation] = useState<PlayerReputation | null>(null);
  const [playerTitles, setPlayerTitles] = useState<PlayerTitle[]>([]);
  const [playerBadges, setPlayerBadges] = useState<PlayerBadge[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [recruitmentPosts, setRecruitmentPosts] = useState<RecruitmentPost[]>([]);
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Phase 12 (Launch & Operations additions)
  const [liveOpsConfig, setLiveOpsConfig] = useState<LiveOpsConfig | null>(null);
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievement[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonLeaderboard, setSeasonLeaderboard] = useState<SeasonLeaderboard[]>([]);
  const [developerKeys, setDeveloperKeys] = useState<DeveloperKey[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [closedAlphaInvites, setClosedAlphaInvites] = useState<any[]>([]);

  // Phase 6.5 vertical slice
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter | null>(null);
  const [dynasty, setDynasty] = useState<Dynasty | null>(null);
  const [dynastyMembers, setDynastyMembers] = useState<DynastyMember[]>([]);
  const [successionOrder, setSuccessionOrder] = useState<DynastyMember[]>([]);
  const [rulerLegitimacy, setRulerLegitimacy] = useState<RulerLegitimacy | null>(null);
  const [kingdomStability, setKingdomStability] = useState<KingdomStability | null>(null);
  const [lastBattleReport, setLastBattleReport] = useState<MilitaryBattleReport | null>(null);
  const [regionEdges, setRegionEdges] = useState<RegionEdge[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const fetchStaticData = useCallback(async () => {
    try {
      const [rList, cList, resList, spList, expList, tempCol, recCol, inCol, itemTemps, edges] = await Promise.all([
        gameRepository.getRegions(),
        gameRepository.getCountries(),
        gameRepository.getResources(),
        gameRepository.getResourceSpawns(),
        gameRepository.getExperienceThresholds(),
        gameRepository.getCompanyTemplates(),
        gameRepository.getProductionRecipes(),
        gameRepository.getProductionInputs(),
        gameRepository.getItemTemplates(),
        (gameRepository as any).getRegionEdges?.() ?? Promise.resolve([]),
      ]);
      setRegions(rList);
      setCountries(cList);
      setResources(resList);
      setSpawns(spList);
      setExperienceThresholds(expList);
      setCompanyTemplates(tempCol);
      setProductionRecipes(recCol);
      setProductionInputs(inCol);
      setItemTemplates(itemTemps);
      setRegionEdges(edges as RegionEdge[]);
    } catch (err) {
      console.error('Failed to fetch static data:', err);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [
        prof,
        st,
        curr,
        inv,
        comp,
        jobs,
        bat,
        logs,
        pRes,
        eHist,
        gLogs,
        myComps,
        cJobs,
        mListings,
        mOrders,
        mHistory,
        mNotifs,
        mWatch,
        mAlerts,
        rcp,
        bp,
        hist,
        eq,
        rEcon,
        wEvts,
        sLogs,
        nLogs,
        enemyTemps,
        combatRanks,
        polParties,
        elections,
        billsList,
        natProj,
        warsList,
        milRegs,
        armies,
        routes,
        treaties,
        guildsList,
        myG,
        coalitionsList,
        friendsList,
        threadsList,
        mailList,
        rep,
        titlesList,
        badgesList,
        contractsList,
        recruitList,
        newspapersList,
        articlesList,
        announcementsList,
        calEvents,
        liveOpsData,
        pQuests,
        pAchievements,
        seasonsList,
        devKeys,
        ticketsList,
        flagsList,
        invitesList
      ] = await Promise.all([
        gameRepository.getProfile(userId),
        gameRepository.getPlayerStats(userId),
        gameRepository.getCurrencies(userId),
        gameRepository.getInventory(userId),
        gameRepository.getCompanies(),
        gameRepository.getJobOffers(),
        gameRepository.getActiveBattles(),
        gameRepository.getAuditLogs(userId),
        gameRepository.getPlayerResources(userId),
        gameRepository.getEnergyHistory(userId),
        gameRepository.getGatherLogs(userId),
        gameRepository.getMyCompanies(userId),
        gameRepository.getCompanyJobs(),
        gameRepository.getMarketListings(),
        gameRepository.getMarketOrders(),
        gameRepository.getMarketHistory(),
        gameRepository.getMarketNotifications(userId),
        gameRepository.getWatchlist(userId),
        gameRepository.getPriceAlerts(userId),
        gameRepository.getItemRecipes(),
        gameRepository.getItemBlueprints(userId),
        gameRepository.getItemHistory(userId),
        gameRepository.getEquipment(userId),
        gameRepository.getRegionalEconomies(),
        gameRepository.getWorldEvents(),
        gameRepository.getSimulationLogs(),
        gameRepository.getNPCLogs(),
        gameRepository.getEnemyTemplates(),
        gameRepository.getCombatRankings(),
        gameRepository.getPoliticalParties(),
        gameRepository.getElections(),
        gameRepository.getBills(),
        gameRepository.getNationalProjects(),
        gameRepository.getWars(),
        gameRepository.getMilitaryRegions(),
        gameRepository.getArmyUnits(),
        gameRepository.getSupplyRoutes(),
        gameRepository.getPeaceTreaties(),
        gameRepository.getGuilds(),
        gameRepository.getMyGuild(userId),
        gameRepository.getCoalitions(),
        gameRepository.getFriendships(userId),
        gameRepository.getConversationThreads(userId),
        gameRepository.getPlayerMail(userId),
        gameRepository.getPlayerReputation(userId),
        gameRepository.getPlayerTitles(userId),
        gameRepository.getPlayerBadges(userId),
        gameRepository.getContracts(),
        gameRepository.getRecruitmentPosts(),
        gameRepository.getNewspapers(),
        gameRepository.getArticles(),
        gameRepository.getAnnouncements(),
        gameRepository.getCalendarEvents(),
        gameRepository.getLiveOpsConfig(),
        gameRepository.getPlayerQuests(userId),
        gameRepository.getPlayerAchievements(userId),
        gameRepository.getSeasons(),
        gameRepository.getDeveloperKeys(userId),
        gameRepository.getSupportTickets(userId),
        gameRepository.getFeatureFlags(),
        gameRepository.getClosedAlphaInvites()
      ]);
      setProfile(prof);
      setStats(st);
      setCurrencies(curr);
      setInventory(inv);
      setCompanies(comp);
      setJobOffers(jobs);
      setBattles(bat);
      setAuditLogs(logs);
      setPlayerResources(pRes);
      setEnergyHistory(eHist);
      setGatherLogs(gLogs);
      setMyCompanies(myComps);
      setCompanyJobs(cJobs);
      setMarketListings(mListings);
      setMarketOrders(mOrders);
      setMarketHistory(mHistory);
      setMarketNotifications(mNotifs);
      setWatchlist(mWatch);
      setPriceAlerts(mAlerts);
      setRecipes(rcp);
      setBlueprints(bp);
      setItemHistory(hist);
      setEquipment(eq);
      setRegionalEconomies(rEcon);
      setWorldEvents(wEvts);
      setSimulationLogs(sLogs);
      setNpcLogs(nLogs);
      setEnemyTemplates(enemyTemps);
      setCombatRankings(combatRanks);
      setPoliticalParties(polParties);
      setActiveElections(elections);
      setBills(billsList);
      setNationalProjects(natProj);
      setActiveWars(warsList);
      setMilitaryRegions(milRegs);
      setArmyUnits(armies);
      setSupplyRoutes(routes);
      setPeaceTreaties(treaties);
      setGuilds(guildsList);
      setMyGuild(myG);
      setCoalitions(coalitionsList);
      setFriendships(friendsList);
      setConversationThreads(threadsList);
      setPlayerMail(mailList);
      setReputation(rep);
      setPlayerTitles(titlesList);
      setPlayerBadges(badgesList);
      setContracts(contractsList);
      setRecruitmentPosts(recruitList);
      setNewspapers(newspapersList);
      setArticles(articlesList);
      setAnnouncements(announcementsList);
      setCalendarEvents(calEvents);
      setLiveOpsConfig(liveOpsData);
      setPlayerQuests(pQuests);
      setPlayerAchievements(pAchievements);
      setSeasons(seasonsList);
      setDeveloperKeys(devKeys);
      setSupportTickets(ticketsList);
      setFeatureFlags(flagsList);
      setClosedAlphaInvites(invitesList);

      // Phase 6.5: character, dynasty, battle report, edges
      try {
        const [char, dyn, report, edgesNow] = await Promise.all([
          (gameRepository as any).getPlayerCharacter?.(userId) ?? Promise.resolve(null),
          (gameRepository as any).getDynasty?.(userId) ?? Promise.resolve(null),
          (gameRepository as any).getLastBattleReport?.(userId) ?? Promise.resolve(null),
          (gameRepository as any).getRegionEdges?.() ?? Promise.resolve([]),
        ]);
        setPlayerCharacter(char as PlayerCharacter | null);
        const d = dyn as Dynasty | null;
        setDynasty(d);
        if (d) {
          const [members, order] = await Promise.all([
            (gameRepository as any).getDynastyMembers?.(d.id) ?? Promise.resolve([]),
            (gameRepository as any).getSuccessionOrder?.(d.id) ?? Promise.resolve([]),
          ]);
          setDynastyMembers(members as DynastyMember[]);
          setSuccessionOrder(order as DynastyMember[]);
          const countryId = (d.country_id as number) || (prof?.citizenship_country_id as number) || 1;
          const [leg, stab] = await Promise.all([
            (gameRepository as any).getRulerLegitimacy?.(userId) ?? Promise.resolve(null),
            (gameRepository as any).getKingdomStability?.(countryId) ?? Promise.resolve(null),
          ]);
          setRulerLegitimacy(leg as RulerLegitimacy | null);
          setKingdomStability(stab as KingdomStability | null);
        } else {
          setDynastyMembers([]);
          setSuccessionOrder([]);
        }
        setLastBattleReport(report as MilitaryBattleReport | null);
        if (Array.isArray(edgesNow) && edgesNow.length) setRegionEdges(edgesNow as RegionEdge[]);
      } catch (e) {
        console.warn('6.5 state load failed', e);
      }
      setHasLoadedOnce(true);
      setRefreshCount((n) => n + 1);

      if (seasonsList.length > 0) {
        const activeS = (seasonsList as Season[]).find(s => s.status === 'active') || (seasonsList as Season[])[0];
        const board = await gameRepository.getSeasonLeaderboard(activeS.id);
        setSeasonLeaderboard(board);
      } else {
        setSeasonLeaderboard([]);
      }

      // Fetch guild members & applications if user has a guild
      if (myG) {
        const [mems, apps] = await Promise.all([
          gameRepository.getGuildMembers(myG.id),
          gameRepository.getGuildApplications(myG.id)
        ]);
        setGuildMembers(mems);
        setGuildApplications(apps);
      } else {
        setGuildMembers([]);
        setGuildApplications([]);
      }

      // Fetch candidates for active election
      const activeElect = (elections as Election[]).find(e => e.status === 'campaign' || e.status === 'voting');
      if (activeElect) {
        const cands = await gameRepository.getCandidates(activeElect.id);
        setCandidates(cands);
      } else {
        setCandidates([]);
      }

      // Auto-select first company if none is selected
      if (myComps.length > 0 && !activeCompanyId) {
        setActiveCompanyId(myComps[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch game state.');
    } finally {
      setLoading(false);
    }
  }, [userId, activeCompanyId]);

  const fetchSelectedCompanyData = useCallback(async () => {
    if (!activeCompanyId) {
      setActiveCompanyMembers([]);
      setActiveCompanyInventory([]);
      setActiveCompanyVault(null);
      setActiveCompanyProductionQueue([]);
      setActiveCompanyLogs([]);
      setActiveCompanyMachines([]);
      return;
    }

    try {
      const [mems, inv, vlt, q, logCol, machCol] = await Promise.all([
        gameRepository.getCompanyMembers(activeCompanyId),
        gameRepository.getCompanyInventory(activeCompanyId),
        gameRepository.getCompanyVault(activeCompanyId),
        gameRepository.getCompanyProductionQueue(activeCompanyId),
        gameRepository.getCompanyLogs(activeCompanyId),
        gameRepository.getCompanyMachines(activeCompanyId),
      ]);
      setActiveCompanyMembers(mems);
      setActiveCompanyInventory(inv);
      setActiveCompanyVault(vlt);
      setActiveCompanyProductionQueue(q);
      setActiveCompanyLogs(logCol);
      setActiveCompanyMachines(machCol);
    } catch (err) {
      console.error('Failed to load selected company sub-data:', err);
    }
  }, [activeCompanyId]);

  // Online/Offline network event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      if (userId) {
        fetchUserData();
        fetchSelectedCompanyData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId, fetchUserData, fetchSelectedCompanyData]);

  useEffect(() => {
    fetchStaticData();
  }, [fetchStaticData]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      
      const interval = setInterval(async () => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return; // Skip if offline
        const syncedStats = await gameRepository.syncEnergyTicks(userId);
        if (syncedStats) {
          setStats(syncedStats);
          const eHist = await gameRepository.getEnergyHistory(userId);
          setEnergyHistory(eHist);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [userId, fetchUserData]);

  // Load sub-data for selected company
  useEffect(() => {
    fetchSelectedCompanyData();
  }, [activeCompanyId, fetchSelectedCompanyData]);

  // Realtime subscription listeners for user & global gameplay tables
  useEffect(() => {
    if (!userId || activeProvider !== 'supabase') return;

    // Listen to changes in player_stats (e.g. level, energy, strength updates)
    const statsChannel = supabase
      .channel(`stats-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_stats', filter: `profile_id=eq.${userId}` },
        (payload: any) => {
          if (payload.new) {
            setStats(payload.new as PlayerStats);
          }
        }
      )
      .subscribe();

    // Listen to currencies changes (e.g. gold, local currency balance updates)
    const currenciesChannel = supabase
      .channel(`currencies-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'currencies', filter: `profile_id=eq.${userId}` },
        (payload: any) => {
          if (payload.new) {
            setCurrencies(payload.new as Currencies);
          }
        }
      )
      .subscribe();

    // Listen to inventories changes (e.g. gear, items added or modified)
    const inventoriesChannel = supabase
      .channel(`inventories-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventories', filter: `owner_id=eq.${userId}` },
        async () => {
          const inv = await gameRepository.getInventory(userId);
          setInventory(inv);
        }
      )
      .subscribe();

    // Listen to player raw/refined resources changes (cargo hold updates)
    const playerResourcesChannel = supabase
      .channel(`player-resources-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_resources', filter: `profile_id=eq.${userId}` },
        async () => {
          const res = await gameRepository.getPlayerResources(userId);
          setPlayerResources(res);
        }
      )
      .subscribe();

    // Listen to market notifications changes (reads, new alerts matching)
    const notificationsChannel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_notifications', filter: `profile_id=eq.${userId}` },
        async () => {
          const notifs = await gameRepository.getMarketNotifications(userId);
          setMarketNotifications(notifs);
        }
      )
      .subscribe();

    // Listen to global battles active changes
    const battlesChannel = supabase
      .channel('global-battles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'battles' },
        async () => {
          const activeBattles = await gameRepository.getActiveBattles();
          setBattles(activeBattles);
        }
      )
      .subscribe();

    // Listen to global marketplace listings changes
    const marketListingsChannel = supabase
      .channel('global-listings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_listings' },
        async () => {
          const listings = await gameRepository.getMarketListings();
          setMarketListings(listings);
        }
      )
      .subscribe();

    // Listen to global marketplace buy orders changes
    const marketOrdersChannel = supabase
      .channel('global-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_orders' },
        async () => {
          const orders = await gameRepository.getMarketOrders();
          setMarketOrders(orders);
        }
      )
      .subscribe();

    // Listen to regional economies changes
    const regionalEconChannel = supabase
      .channel('global-regional-economies')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'regional_economies' },
        async () => {
          const e = await gameRepository.getRegionalEconomies();
          setRegionalEconomies(e);
        }
      )
      .subscribe();

    // Listen to world events changes
    const worldEventsChannel = supabase
      .channel('global-world-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'world_events' },
        async () => {
          const evts = await gameRepository.getWorldEvents();
          setWorldEvents(evts);
        }
      )
      .subscribe();

    // Listen to simulation analytics logs changes
    const simulationLogsChannel = supabase
      .channel('global-simulation-logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'simulation_logs' },
        async () => {
          const s = await gameRepository.getSimulationLogs();
          setSimulationLogs(s);
        }
      )
      .subscribe();

    // Listen to NPC activity logs changes
    const npcLogsChannel = supabase
      .channel('global-npc-logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'npc_activity_logs' },
        async () => {
          const n = await gameRepository.getNPCLogs();
          setNpcLogs(n);
        }
      )
      .subscribe();

    return () => {
      statsChannel.unsubscribe();
      currenciesChannel.unsubscribe();
      inventoriesChannel.unsubscribe();
      playerResourcesChannel.unsubscribe();
      notificationsChannel.unsubscribe();
      battlesChannel.unsubscribe();
      marketListingsChannel.unsubscribe();
      marketOrdersChannel.unsubscribe();
      regionalEconChannel.unsubscribe();
      worldEventsChannel.unsubscribe();
      simulationLogsChannel.unsubscribe();
      npcLogsChannel.unsubscribe();
    };
  }, [userId]);

  // Realtime subscription listeners for active company sub-data
  useEffect(() => {
    if (!userId || !activeCompanyId || activeProvider !== 'supabase') return;

    // Listen to company vaults updates (deposits, wage payouts)
    const vaultChannel = supabase
      .channel(`vault-${activeCompanyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_vaults', filter: `company_id=eq.${activeCompanyId}` },
        (payload: any) => {
          if (payload.new) {
            setActiveCompanyVault(payload.new as CompanyVault);
          }
        }
      )
      .subscribe();

    // Listen to company storage changes
    const compInventoryChannel = supabase
      .channel(`comp-inv-${activeCompanyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_inventory', filter: `company_id=eq.${activeCompanyId}` },
        async () => {
          const cInv = await gameRepository.getCompanyInventory(activeCompanyId);
          setActiveCompanyInventory(cInv);
        }
      )
      .subscribe();

    // Listen to production queues shifts
    const compQueueChannel = supabase
      .channel(`comp-queue-${activeCompanyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_production_queues', filter: `company_id=eq.${activeCompanyId}` },
        async () => {
          const queue = await gameRepository.getCompanyProductionQueue(activeCompanyId);
          setActiveCompanyProductionQueue(queue);
        }
      )
      .subscribe();

    // Listen to company activity logs
    const compLogsChannel = supabase
      .channel(`comp-logs-${activeCompanyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_logs', filter: `company_id=eq.${activeCompanyId}` },
        async () => {
          const logs = await gameRepository.getCompanyLogs(activeCompanyId);
          setActiveCompanyLogs(logs);
        }
      )
      .subscribe();

    return () => {
      vaultChannel.unsubscribe();
      compInventoryChannel.unsubscribe();
      compQueueChannel.unsubscribe();
      compLogsChannel.unsubscribe();
    };
  }, [userId, activeCompanyId]);

  // Action lock: prevents overlapping mutations (expedition lock contract)
  const actionLockRef = useRef(false);
  const lockNow = () => { if (actionLockRef.current) return true; actionLockRef.current = true; return false; };
  const unlockNow = () => { actionLockRef.current = false; };

  const travel = async (targetRegionId: number): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    if (lockNow()) return { success: false, error: 'Busy — action in progress.' };
    setActionLoading(true);
    try {
      const res = await gameRepository.travelToRegion(userId, targetRegionId);
      if (res.success) {
        await fetchUserData();
      }
      return res;
    } finally {
      unlockNow();
      setActionLoading(false);
    }
  };

  const work = async (companyId: string): Promise<{ success: boolean; earnedSalary: number; skillIncrease: number; expGained: number; error: string | null }> => {
    if (!userId) return { success: false, earnedSalary: 0, skillIncrease: 0, expGained: 0, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.workAtCompany(userId, companyId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const train = async (): Promise<{ success: boolean; strengthGained: number; expGained: number; energyRemaining: number; error: string | null }> => {
    if (!userId) return { success: false, strengthGained: 0, expGained: 0, energyRemaining: 0, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.trainStrength(userId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const fight = async (battleId: string, sideCountryId: number): Promise<{ success: boolean; damageDealt: number; xpGained: number; energyRemaining: number; error: string | null }> => {
    if (!userId) return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: 0, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.fightInBattle(userId, battleId, sideCountryId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const gather = async (resourceId: number): Promise<{
    success: boolean;
    gatheredQuantity: number;
    energySpent: number;
    experienceGained: number;
    leveledUp: boolean;
    newLevel: number;
    newEnergy: number;
    error: string | null;
  }> => {
    if (!userId) return { success: false, gatheredQuantity: 0, energySpent: 0, experienceGained: 0, leveledUp: false, newLevel: 0, newEnergy: 0, error: 'Not logged in.' };
    if (lockNow()) return { success: false, gatheredQuantity: 0, energySpent: 0, experienceGained: 0, leveledUp: false, newLevel: 0, newEnergy: 0, error: 'Busy — action in progress.' };
    setActionLoading(true);
    try {
      const res = await gameRepository.gatherResource(userId, resourceId);
      if (res.success) {
        await fetchUserData();
      }
      return res;
    } finally {
      unlockNow();
      setActionLoading(false);
    }
  };

  const claimTicket = async (): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.claimTestTicket(userId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const claimFunding = async (): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.claimDevFunding(userId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const claimCheat = async (): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.cheatResourcesAndCurrencies(userId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const claimEnergy = async (): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.claimDevEnergy(userId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  // Phase 5 Marketplace mutations
  const listAssetForSale = async (
    companyId: string | null,
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemId: string | null,
    quantity: number,
    pricePerUnit: number,
    currencyType: 'local' | 'gold'
  ): Promise<{ success: boolean; listingId: string | null; error: string | null }> => {
    if (!userId) return { success: false, listingId: null, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.createMarketListing(
      userId,
      companyId,
      assetType,
      resourceId,
      itemId,
      quantity,
      pricePerUnit,
      currencyType
    );
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const placeBuyOrder = async (
    companyId: string | null,
    assetType: 'resource' | 'item',
    resourceId: number | null,
    itemTemplateId: number | null,
    quantity: number,
    pricePerUnit: number,
    currencyType: 'local' | 'gold'
  ): Promise<{ success: boolean; orderId: string | null; error: string | null }> => {
    if (!userId) return { success: false, orderId: null, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.createMarketOrder(
      userId,
      companyId,
      assetType,
      resourceId,
      itemTemplateId,
      quantity,
      pricePerUnit,
      currencyType
    );
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const cancelListing = async (listingId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.cancelMarketListing(userId, listingId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const cancelOrder = async (orderId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.cancelMarketOrder(userId, orderId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const toggleWatch = async (assetType: 'resource' | 'item', assetId: number): Promise<{ success: boolean; isWatched: boolean; error: string | null }> => {
    if (!userId) return { success: false, isWatched: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.toggleWatchlist(userId, assetType, assetId);
    if (res.success) {
      const wList = await gameRepository.getWatchlist(userId);
      setWatchlist(wList);
    }
    setActionLoading(false);
    return res;
  };

  const createAlert = async (assetType: 'resource' | 'item', assetId: number, targetPrice: number, condition: 'above' | 'below'): Promise<{ success: boolean; alertId: string | null; error: string | null }> => {
    if (!userId) return { success: false, alertId: null, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.createPriceAlert(userId, assetType, assetId, targetPrice, condition);
    if (res.success) {
      const aList = await gameRepository.getPriceAlerts(userId);
      setPriceAlerts(aList);
    }
    setActionLoading(false);
    return res;
  };

  const deleteAlert = async (alertId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.deletePriceAlert(userId, alertId);
    if (res.success) {
      const aList = await gameRepository.getPriceAlerts(userId);
      setPriceAlerts(aList);
    }
    setActionLoading(false);
    return res;
  };

  const readNotification = async (notificationId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.markNotificationRead(userId, notificationId);
    if (res.success) {
      const nList = await gameRepository.getMarketNotifications(userId);
      setMarketNotifications(nList);
    }
    setActionLoading(false);
    return res;
  };

  // Phase 6 Advanced Item mutations
  const equipItem = async (itemId: string, slot: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.equipItem(userId, itemId, slot);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const unequipItem = async (slot: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.unequipItem(userId, slot);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const consumeItem = async (itemId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.consumeItem(userId, itemId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const craftItem = async (recipeId: number): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    if (lockNow()) return { success: false, error: 'Busy — action in progress.' };
    setActionLoading(true);
    try {
      const res = await gameRepository.craftItem(userId, recipeId);
      if (res.success) {
        await fetchUserData();
      }
      return res;
    } finally {
      unlockNow();
      setActionLoading(false);
    }
  };

  const repairItem = async (itemId: string): Promise<{ success: boolean; costPaid?: number; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.repairItem(userId, itemId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const unlockBlueprint = async (recipeId: number): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.unlockBlueprint(userId, recipeId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  // Phase 4 Mutation functions
  const createCompany = async (name: string, regionId: number, templateId: number): Promise<{
    success: boolean;
    companyId: string | null;
    error: string | null;
  }> => {
    if (!userId) return { success: false, companyId: null, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.createCompany(userId, name, regionId, templateId);
    if (res.success && res.companyId) {
      setActiveCompanyId(res.companyId);
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const vaultCashTransfer = async (companyId: string, amount: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.vaultCashTransaction(userId, companyId, amount, isDeposit);
    if (res.success) {
      await fetchUserData();
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const vaultResourceTransfer = async (companyId: string, resourceId: number, quantity: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.vaultResourceTransaction(userId, companyId, resourceId, quantity, isDeposit);
    if (res.success) {
      await fetchUserData();
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const postCompanyJob = async (companyId: string, regionId: number, salary: number, vacancies: number): Promise<{
    success: boolean;
    error: string | null;
  }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.postCompanyJob(userId, companyId, regionId, salary, vacancies);
    if (res.success) {
      await fetchUserData();
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const applyJob = async (jobId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.applyForJob(userId, jobId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const resignFromCompany = async (companyId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.resignFromCompany(userId, companyId);
    if (res.success) {
      setActiveCompanyId(null);
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const terminateEmployee = async (companyId: string, employeeId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.terminateEmployee(userId, companyId, employeeId);
    if (res.success) {
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const setEmployeeSalary = async (companyId: string, employeeId: string, newSalary: number): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.setEmployeeSalary(userId, companyId, employeeId, newSalary);
    if (res.success) {
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const queueJob = async (companyId: string, recipeId: number, quantity: number): Promise<{ success: boolean; error: string | null }> => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.queueProduction(userId, companyId, recipeId, quantity);
    if (res.success) {
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const runCompanyShift = async (companyId: string): Promise<{
    success: boolean;
    salaryEarned: number;
    expRewarded: number;
    leveledUp: boolean;
    newEnergy: number;
    error: string | null;
  }> => {
    if (!userId) return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: 0, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await gameRepository.executeCompanyWorkShift(userId, companyId);
    if (res.success) {
      await fetchUserData();
      await fetchSelectedCompanyData();
    }
    setActionLoading(false);
    return res;
  };

  const triggerSimulationTick = async (): Promise<{ success: boolean; tickIndex?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.executeSimulationTick();
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const executePvE = async (enemyTemplateId: number, _idempotencyKey?: string): Promise<{ success: boolean; isVictory?: boolean; xpGained?: number; currencyGained?: number; roundsLog?: CombatRoundLog[]; lootGained?: CombatRewardItem[]; playerHp?: number; error: string | null }> => {
    if (lockNow()) return { success: false, error: 'Busy — action in progress.' };
    setActionLoading(true);
    try {
      const res = await gameRepository.executePvEBattle(enemyTemplateId);
      if (res.success) {
        await fetchUserData();
      }
      return res;
    } finally {
      unlockNow();
      setActionLoading(false);
    }
  };

  const executePvP = async (opponentProfileId: string): Promise<{ success: boolean; isVictory?: boolean; roundsLog?: CombatRoundLog[]; ratingChange?: number; playerHp?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.executePvPBattle(opponentProfileId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const createParty = async (name: string, description: string): Promise<{ success: boolean; partyId?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.createPoliticalParty(name, description);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const joinParty = async (partyId: number): Promise<{ success: boolean; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.joinPoliticalParty(partyId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const runForOffice = async (electionId: number): Promise<{ success: boolean; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.registerAsCandidate(electionId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const voteCandidate = async (electionId: number, candidateId: string): Promise<{ success: boolean; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.voteForCandidate(electionId, candidateId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const proposeBill = async (title: string, description: string, type: string, parameters: any): Promise<{ success: boolean; billId?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.proposeBill(title, description, type, parameters);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const voteBill = async (billId: number, vote: 'yes' | 'no'): Promise<{ success: boolean; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.voteOnBill(billId, vote);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const handleDeclareWar = async (defenderCountryId: number): Promise<{ success: boolean; warId?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.declareWar(defenderCountryId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const handleMobilizeArmy = async (): Promise<{ success: boolean; armyId?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.mobilizeArmy();
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const handleCommandArmyMovement = async (armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.commandArmyMovement(armyId, targetRegionId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const handleEngageMilitaryBattle = async (armyId: number, targetRegionId: number): Promise<{ success: boolean; outcome?: string; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.engageMilitaryBattle(armyId, targetRegionId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const handleProposePeace = async (warId: number, reparations: number, transfers: number[]): Promise<{ success: boolean; treatyId?: number; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.proposePeace(warId, reparations, transfers);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  const handleAcceptPeace = async (treatyId: number): Promise<{ success: boolean; error: string | null }> => {
    setActionLoading(true);
    const res = await gameRepository.acceptPeace(treatyId);
    if (res.success) {
      await fetchUserData();
    }
    setActionLoading(false);
    return res;
  };

  // Phase 11 Social mutations
  const createGuild = async (name: string, tag: string, description: string) => {
    if (!userId) return { success: false, error: 'Unauthorized' };
    setActionLoading(true);
    const res = await gameRepository.createGuild(userId, name, tag, description);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const applyToGuild = async (guildId: number, message: string) => {
    if (!userId) return { success: false, error: 'Unauthorized' };
    setActionLoading(true);
    const res = await gameRepository.applyToGuild(userId, guildId, message);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const manageGuildMember = async (guildId: number, targetProfileId: string, action: 'kick' | 'promote' | 'demote') => {
    setActionLoading(true);
    const res = await gameRepository.manageGuildMember(guildId, targetProfileId, action);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const withdrawGuildVault = async (guildId: number, amount: number, isGold: boolean) => {
    setActionLoading(true);
    const res = await gameRepository.withdrawGuildVault(guildId, amount, isGold);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const sendDirectMessage = async (threadId: number, content: string) => {
    setActionLoading(true);
    const res = await gameRepository.sendDirectMessage(threadId, content);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createConversationThread = async (type: any, participantIds: string[]) => {
    setActionLoading(true);
    const res = await gameRepository.createConversationThread(type, participantIds);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const sendMail = async (recipientId: string, subject: string, body: string, attachedCurrency: number, attachedGold: number, attachedItemTemplateId?: number, attachedItemQty?: number) => {
    setActionLoading(true);
    const res = await gameRepository.sendMail(recipientId, subject, body, attachedCurrency, attachedGold, attachedItemTemplateId, attachedItemQty);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const claimMailAttachments = async (mailId: number) => {
    setActionLoading(true);
    const res = await gameRepository.claimMailAttachments(mailId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createContract = async (type: string, terms: any, escrowLocal: number, escrowGold: number, deadline?: string) => {
    setActionLoading(true);
    const res = await gameRepository.createContract(type, terms, escrowLocal, escrowGold, deadline);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const acceptContract = async (contractId: number) => {
    setActionLoading(true);
    const res = await gameRepository.acceptContract(contractId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const completeContract = async (contractId: number) => {
    setActionLoading(true);
    const res = await gameRepository.completeContract(contractId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createNewspaper = async (name: string, description: string) => {
    setActionLoading(true);
    const res = await gameRepository.createNewspaper(name, description);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const publishArticle = async (newspaperId: number, title: string, content: string, category: any) => {
    setActionLoading(true);
    const res = await gameRepository.publishArticle(newspaperId, title, content, category);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const commentOnArticle = async (articleId: number, comment: string) => {
    setActionLoading(true);
    const res = await gameRepository.commentOnArticle(articleId, comment);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const respondToFriendRequest = async (friendshipId: number, accept: boolean) => {
    setActionLoading(true);
    const res = await gameRepository.respondToFriendRequest(friendshipId, accept);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const sendFriendRequest = async (targetProfileId: string) => {
    setActionLoading(true);
    const res = await gameRepository.sendFriendRequest(targetProfileId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const respondToGuildApplication = async (applicationId: number, approve: boolean) => {
    setActionLoading(true);
    const res = await gameRepository.respondToGuildApplication(applicationId, approve);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const respondToGuildInvitation = async (invitationId: number, accept: boolean) => {
    setActionLoading(true);
    const res = await gameRepository.respondToGuildInvitation(invitationId, accept);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  // Phase 12 mutations
  const updateLiveOpsConfig = async (config: Partial<LiveOpsConfig>) => {
    setActionLoading(true);
    const res = await gameRepository.updateLiveOpsConfig(config);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createModerationAction = async (action: Omit<ModerationAction, 'id' | 'created_at'>) => {
    setActionLoading(true);
    const res = await gameRepository.createModerationAction(action);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createPlayerReport = async (report: Omit<PlayerReport, 'id' | 'created_at'>) => {
    setActionLoading(true);
    const res = await gameRepository.createPlayerReport(report);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'created_at'>) => {
    setActionLoading(true);
    const res = await gameRepository.createSupportTicket(ticket);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const addTicketReply = async (reply: Omit<TicketReply, 'id' | 'created_at'>) => {
    setActionLoading(true);
    const res = await gameRepository.addTicketReply(reply);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const toggleFeatureFlag = async (flagId: number, isEnabled: boolean, percentage?: number) => {
    setActionLoading(true);
    const res = await gameRepository.toggleFeatureFlag(flagId, isEnabled, percentage);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const createDeveloperKey = async (label: string) => {
    if (!userId) return { success: false, error: 'Unauthorized' };
    setActionLoading(true);
    const res = await gameRepository.createDeveloperKey(userId, label);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const revokeDeveloperKey = async (keyId: number) => {
    setActionLoading(true);
    const res = await gameRepository.revokeDeveloperKey(keyId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const startQuest = async (questId: number) => {
    if (!userId) return { success: false, error: 'Unauthorized' };
    setActionLoading(true);
    const res = await gameRepository.startQuest(userId, questId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const updateQuestProgress = async (questId: number, progress: any) => {
    if (!userId) return { success: false, error: 'Unauthorized' };
    setActionLoading(true);
    const res = await gameRepository.updateQuestProgress(userId, questId, progress);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  const generateClosedAlphaInvite = async (code: string) => {
    setActionLoading(true);
    const res = await gameRepository.generateClosedAlphaInvite(code);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };

  // ---- Phase 6.5 vertical-slice mutations ----
  const savePlayerCharacter = async (input: { name: string; epithet?: string; kingdom_id: number; profession: any; origin?: string; motto?: string; banner_seed?: number }) => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await (gameRepository as any).savePlayerCharacter(userId, input);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const completeOnboarding = async () => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await (gameRepository as any).completeOnboarding(userId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const upgradeProfession = async (cost?: number) => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await (gameRepository as any).upgradeProfession(userId, cost ?? 120);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const recruitArmy = async () => {
    if (!userId) return { success: false, error: 'Not logged in.' };
    setActionLoading(true);
    const res = await (gameRepository as any).recruitArmy(userId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const initiateSiege = async (armyId: number, targetRegionId: number) => {
    setActionLoading(true);
    const res = await (gameRepository as any).initiateSiege(armyId, targetRegionId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const progressSiege = async (armyId: number, targetRegionId: number) => {
    setActionLoading(true);
    const res = await (gameRepository as any).progressSiege(armyId, targetRegionId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const liftSiege = async (armyId: number, targetRegionId: number) => {
    setActionLoading(true);
    const res = await (gameRepository as any).liftSiege(armyId, targetRegionId);
    if (res.success) await fetchUserData();
    setActionLoading(false);
    return res;
  };
  const refreshCharacterAndDynasty = async () => { await fetchUserData(); };

  return {
    profile,
    stats,
    currencies,
    regions,
    countries,
    inventory,
    itemTemplates,
    companies,
    jobOffers,
    battles,
    auditLogs,
    // Phase 2 structures
    resources,
    spawns,
    playerResources,
    energyHistory,
    gatherLogs,
    experienceThresholds,
    // Phase 4 structures
    companyTemplates,
    myCompanies,
    productionRecipes,
    productionInputs,
    companyJobs,
    activeCompanyId,
    activeCompanyMembers,
    activeCompanyInventory,
    activeCompanyVault,
    activeCompanyProductionQueue,
    activeCompanyLogs,
    activeCompanyMachines,
    // Phase 5 states
    marketListings,
    marketOrders,
    marketHistory,
    marketNotifications,
    watchlist,
    priceAlerts,
    // Phase 6 states
    recipes,
    blueprints,
    itemHistory,
    equipment,
    // Phase 7 states
    regionalEconomies,
    worldEvents,
    simulationLogs,
    npcLogs,
    isOnline,
    // Phase 8 states
    enemyTemplates,
    combatRankings,
    // Phase 9 states
    politicalParties,
    activeElections,
    candidates,
    bills,
    nationalProjects,
    // Phase 10 states
    activeWars,
    militaryRegions,
    armyUnits,
    supplyRoutes,
    peaceTreaties,
    // Phase 11 states
    guilds,
    myGuild,
    guildMembers,
    guildApplications,
    guildInvitations,
    coalitions,
    friendships,
    conversationThreads,
    playerMail,
    reputation,
    playerTitles,
    playerBadges,
    contracts,
    recruitmentPosts,
    newspapers,
    articles,
    announcements,
    calendarEvents,
    // Phase 12 states
    liveOpsConfig,
    playerQuests,
    playerAchievements,
    seasons,
    seasonLeaderboard,
    developerKeys,
    supportTickets,
    featureFlags,
    closedAlphaInvites,
    // Phase 6.5 states
    playerCharacter,
    dynasty,
    dynastyMembers,
    successionOrder,
    rulerLegitimacy,
    kingdomStability,
    lastBattleReport,
    regionEdges,
    loading,
    isInitialLoading: loading && !hasLoadedOnce,
    isRefreshing: loading && hasLoadedOnce,
    actionLoading,
    error,
    travel,
    work,
    train,
    fight,
    gather,
    claimTicket,
    claimFunding,
    claimCheat,
    claimEnergy,
    // Phase 4 mutations
    createCompany,
    vaultCashTransfer,
    vaultResourceTransfer,
    postCompanyJob,
    applyJob,
    resignFromCompany,
    terminateEmployee,
    setEmployeeSalary,
    queueJob,
    runCompanyShift,
    // Phase 5 mutations
    listAssetForSale,
    placeBuyOrder,
    cancelListing,
    cancelOrder,
    toggleWatch,
    createAlert,
    deleteAlert,
    readNotification,
    // Phase 6 mutations
    equipItem,
    unequipItem,
    consumeItem,
    craftItem,
    repairItem,
    unlockBlueprint,
    // Phase 7 mutations
    triggerSimulationTick,
    // Phase 8 mutations
    executePvEBattle: executePvE,
    executePvPBattle: executePvP,
    // Phase 9 mutations
    createParty,
    joinParty,
    runForOffice,
    voteCandidate,
    proposeBill,
    voteBill,
    // Phase 10 mutations
    declareWar: handleDeclareWar,
    mobilizeArmy: handleMobilizeArmy,
    moveArmy: handleCommandArmyMovement,
    engageBattle: handleEngageMilitaryBattle,
    proposePeace: handleProposePeace,
    acceptPeace: handleAcceptPeace,
    // Phase 6.5 mutations
    savePlayerCharacter,
    completeOnboarding,
    upgradeProfession,
    recruitArmy,
    initiateSiege,
    progressSiege,
    liftSiege,
    refreshCharacterAndDynasty,
    getLastBattleReport: async () => (gameRepository as any).getLastBattleReport?.(userId ?? undefined) ?? null,
    // Phase 11 mutations
    createGuild,
    applyToGuild,
    respondToGuildApplication,
    respondToGuildInvitation,
    manageGuildMember,
    withdrawGuildVault,
    sendDirectMessage,
    createConversationThread,
    sendMail,
    claimMailAttachments,
    createContract,
    acceptContract,
    completeContract,
    createNewspaper,
    publishArticle,
    commentOnArticle,
    respondToFriendRequest,
    sendFriendRequest,
    // Phase 12 mutations
    updateLiveOpsConfig,
    createModerationAction,
    createPlayerReport,
    createSupportTicket,
    addTicketReply,
    toggleFeatureFlag,
    createDeveloperKey,
    revokeDeveloperKey,
    startQuest,
    updateQuestProgress,
    generateClosedAlphaInvite,
    selectCompany: setActiveCompanyId,
    refreshData: fetchUserData,
    refreshCompany: fetchSelectedCompanyData,
  };
}
