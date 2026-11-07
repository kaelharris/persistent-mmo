import { IGameRepository } from './IGameRepository';
import { supabase } from '../api/supabaseClient';
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
} from '../../types/entities';

export class SupabaseGameRepository implements IGameRepository {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  async getPlayerStats(userId: string): Promise<PlayerStats | null> {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
    return data;
  }

  async getCurrencies(userId: string): Promise<Currencies | null> {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (error) {
      console.error('Error fetching currencies:', error);
      return null;
    }
    return data;
  }

  async getRegions(): Promise<Region[]> {
    const { data, error } = await supabase.from('regions').select('*');
    if (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
    return data || [];
  }

  async getCountries(): Promise<Country[]> {
    const { data, error } = await supabase.from('countries').select('*');
    if (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
    return data || [];
  }

  async getInventory(userId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventories')
      .select('*')
      .eq('owner_id', userId);

    if (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
    return data || [];
  }

  async getItemTemplates(): Promise<ItemTemplate[]> {
    const { data, error } = await supabase.from('item_templates').select('*');
    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
    return data || [];
  }

  // Phase 2 Economy APIs
  async getResources(): Promise<Resource[]> {
    const { data, error } = await supabase.from('resources').select('*');
    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
    return data || [];
  }

  async getResourceSpawns(): Promise<ResourceSpawn[]> {
    const { data, error } = await supabase.from('resource_spawn_tables').select('*');
    if (error) {
      console.error('Error fetching spawns:', error);
      return [];
    }
    return data || [];
  }

  async getPlayerResources(userId: string): Promise<PlayerResource[]> {
    const { data, error } = await supabase
      .from('player_resources')
      .select('*')
      .eq('profile_id', userId);

    if (error) {
      console.error('Error fetching player resources:', error);
      return [];
    }
    return data || [];
  }

  async getEnergyHistory(userId: string): Promise<EnergyHistory[]> {
    const { data, error } = await supabase
      .from('energy_history')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching energy history:', error);
      return [];
    }
    return data || [];
  }

  async getGatherLogs(userId: string): Promise<GatherLog[]> {
    const { data, error } = await supabase
      .from('gather_logs')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gather logs:', error);
      return [];
    }
    return data || [];
  }

  async getExperienceThresholds(): Promise<ExperienceThreshold[]> {
    const { data, error } = await supabase.from('experience_tables').select('*');
    if (error) {
      console.error('Error fetching experience thresholds:', error);
      return [];
    }
    return data || [];
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
    const { data, error } = await supabase.rpc('rpc_gather_resource', {
      target_resource_id: resourceId,
    });

    if (error) {
      return {
        success: false,
        gatheredQuantity: 0,
        energySpent: 0,
        experienceGained: 0,
        leveledUp: false,
        newLevel: 0,
        newEnergy: 0,
        error: error.message,
      };
    }

    return {
      success: data.success,
      gatheredQuantity: data.gathered_quantity || 0,
      energySpent: data.energy_spent || 0,
      experienceGained: data.experience_gained || 0,
      leveledUp: data.leveled_up || false,
      newLevel: data.new_level || 0,
      newEnergy: data.new_energy || 0,
      error: data.error || null,
    };
  }

  // Phase 4 Industrial System APIs
  async getCompanyTemplates(): Promise<CompanyTemplate[]> {
    const { data, error } = await supabase.from('company_templates').select('*');
    if (error) {
      console.error('Error templates:', error);
      return [];
    }
    return data || [];
  }

  async getMyCompanies(userId: string): Promise<Company[]> {
    // Select companies where user is registered as member
    const { data, error } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('profile_id', userId);

    if (error || !data) {
      return [];
    }

    const ids = data.map((m) => m.company_id);
    if (ids.length === 0) return [];

    const { data: compData, error: compErr } = await supabase
      .from('companies')
      .select('*')
      .in('id', ids);

    if (compErr) return [];
    return compData || [];
  }

  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    // Joins profile to get username
    const { data, error } = await supabase
      .from('company_members')
      .select('*, profiles(username)')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      company_id: m.company_id,
      profile_id: m.profile_id,
      role: m.role,
      salary: m.salary,
      shifts_worked_today: m.shifts_worked_today,
      max_daily_shifts: m.max_daily_shifts,
      created_at: m.created_at,
      username: m.profiles?.username || 'Employee',
    }));
  }

  async getCompanyInventory(companyId: string): Promise<CompanyInventoryItem[]> {
    const { data, error } = await supabase
      .from('company_inventory')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
    return data || [];
  }

  async getCompanyVault(companyId: string): Promise<CompanyVault | null> {
    const { data, error } = await supabase
      .from('company_vaults')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.error('Error fetching vault cash:', error);
      return null;
    }
    return data;
  }

  async getCompanyJobs(companyId?: string): Promise<CompanyJob[]> {
    let query = supabase.from('company_jobs').select('*, companies(name)');
    if (companyId) {
      query = query.eq('company_id', companyId);
    } else {
      query = query.eq('enabled', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return (data || []).map((j: any) => ({
      id: j.id,
      company_id: j.company_id,
      region_id: j.region_id,
      salary: j.salary,
      vacancies: j.vacancies,
      enabled: j.enabled,
      created_at: j.created_at,
      company_name: j.companies?.name || 'Aegis Plant',
    }));
  }

  async getProductionRecipes(): Promise<ProductionRecipe[]> {
    const { data, error } = await supabase.from('production_recipes').select('*');
    if (error) {
      console.error('Error recipes:', error);
      return [];
    }
    return data || [];
  }

  async getProductionInputs(): Promise<ProductionInput[]> {
    const { data, error } = await supabase.from('production_inputs').select('*');
    if (error) {
      console.error('Error inputs:', error);
      return [];
    }
    return data || [];
  }

  async getCompanyProductionQueue(companyId: string): Promise<CompanyProductionQueue[]> {
    const { data, error } = await supabase
      .from('company_production_queues')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error production queue:', error);
      return [];
    }
    return data || [];
  }

  async getCompanyLogs(companyId: string): Promise<CompanyLog[]> {
    const { data, error } = await supabase
      .from('company_logs')
      .select('*, profiles(username)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error company logs:', error);
      return [];
    }

    return (data || []).map((l: any) => ({
      id: l.id,
      company_id: l.company_id,
      actor_id: l.actor_id,
      action: l.action,
      metadata: l.metadata,
      created_at: l.created_at,
      actor_username: l.profiles?.username || 'Operator',
    }));
  }

  async getCompanyMachines(companyId: string): Promise<CompanyMachine[]> {
    const { data, error } = await supabase
      .from('company_machines')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error company machines:', error);
      return [];
    }
    return data || [];
  }

  // Mutator Actions calling RPC procedures
  async createCompany(userId: string, name: string, regionId: number, templateId: number): Promise<{
    success: boolean;
    companyId: string | null;
    error: string | null;
  }> {
    const { data, error } = await supabase.rpc('rpc_create_company', {
      target_name: name,
      target_region_id: regionId,
      target_template_id: templateId,
    });

    if (error) {
      return { success: false, companyId: null, error: error.message };
    }
    return {
      success: data.success,
      companyId: data.company_id || null,
      error: data.error || null,
    };
  }

  async vaultCashTransaction(userId: string, companyId: string, amount: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { data, error } = await supabase.rpc('rpc_vault_transaction', {
      target_company_id: companyId,
      amount,
      is_deposit: isDeposit,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return {
      success: data.success,
      error: data.error || null,
    };
  }

  async vaultResourceTransaction(userId: string, companyId: string, resourceId: number, quantity: number, isDeposit: boolean): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { data, error } = await supabase.rpc('rpc_vault_resource', {
      target_company_id: companyId,
      target_resource_id: resourceId,
      target_quantity: quantity,
      is_deposit: isDeposit,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return {
      success: data.success,
      error: data.error || null,
    };
  }

  async postCompanyJob(userId: string, companyId: string, regionId: number, salary: number, vacancies: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { data, error } = await supabase
      .from('company_jobs')
      .insert({
        company_id: companyId,
        region_id: regionId,
        salary,
        vacancies,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Write log entry via insert
    await supabase.from('company_logs').insert({
      company_id: companyId,
      actor_id: userId,
      action: 'job.posted',
      metadata: { salary, vacancies },
    });

    return { success: true, error: null };
  }

  async applyForJob(userId: string, jobId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { data, error } = await supabase.rpc('rpc_apply_to_job', {
      target_job_id: jobId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return {
      success: data.success,
      error: data.error || null,
    };
  }

  async resignFromCompany(userId: string, companyId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('company_id', companyId)
      .eq('profile_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from('company_logs').insert({
      company_id: companyId,
      actor_id: userId,
      action: 'employee.resigned',
      metadata: {},
    });

    return { success: true, error: null };
  }

  async terminateEmployee(userId: string, companyId: string, employeeId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('company_id', companyId)
      .eq('profile_id', employeeId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from('company_logs').insert({
      company_id: companyId,
      actor_id: userId,
      action: 'employee.terminated',
      metadata: { employee_id: employeeId },
    });

    return { success: true, error: null };
  }

  async setEmployeeSalary(userId: string, companyId: string, employeeId: string, newSalary: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { error } = await supabase
      .from('company_members')
      .update({ salary: newSalary })
      .eq('company_id', companyId)
      .eq('profile_id', employeeId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from('company_logs').insert({
      company_id: companyId,
      actor_id: userId,
      action: 'employee.salary_changed',
      metadata: { employee_id: employeeId, new_salary: newSalary },
    });

    return { success: true, error: null };
  }

  async queueProduction(userId: string, companyId: string, recipeId: number, quantity: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    const { data, error } = await supabase.rpc('rpc_queue_production', {
      target_company_id: companyId,
      target_recipe_id: recipeId,
      target_quantity: quantity,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return {
      success: data.success,
      error: data.error || null,
    };
  }

  async executeCompanyWorkShift(userId: string, companyId: string): Promise<{
    success: boolean;
    salaryEarned: number;
    expRewarded: number;
    leveledUp: boolean;
    newEnergy: number;
    error: string | null;
  }> {
    const { data, error } = await supabase.rpc('rpc_work_shift_company', {
      target_company_id: companyId,
    });

    if (error) {
      return { success: false, salaryEarned: 0, expRewarded: 0, leveledUp: false, newEnergy: 0, error: error.message };
    }

    return {
      success: data.success,
      salaryEarned: data.salary_earned || 0,
      expRewarded: data.exp_rewarded || 10,
      leveledUp: data.leveled_up || false,
      newEnergy: data.new_energy || 0,
      error: data.error || null,
    };
  }

  // Basic Travel & Labor (Legacy compliance)
  async travelToRegion(userId: string, targetRegionId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('travel_to_region', {
      target_region_id: targetRegionId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  }

  async workAtCompany(userId: string, companyId: string): Promise<{ success: boolean; earnedSalary: number; skillIncrease: number; expGained: number; error: string | null }> {
    const { data, error } = await supabase.rpc('work_at_company', {
      company_id: companyId,
    });

    if (error) {
      return { success: false, earnedSalary: 0, skillIncrease: 0, expGained: 0, error: error.message };
    }

    return {
      success: true,
      earnedSalary: data.earned_salary || 0,
      skillIncrease: data.skill_increase || 0.1,
      expGained: data.exp_gained || 10,
      error: null,
    };
  }

  async trainStrength(userId: string): Promise<{ success: boolean; strengthGained: number; expGained: number; energyRemaining: number; error: string | null }> {
    const { data, error } = await supabase.rpc('train_strength');

    if (error) {
      return { success: false, strengthGained: 0, expGained: 0, energyRemaining: 0, error: error.message };
    }

    return {
      success: true,
      strengthGained: data.strength_gained || 0.1,
      expGained: data.exp_gained || 10,
      energyRemaining: data.energy_remaining || 0,
      error: null,
    };
  }

  async fightInBattle(userId: string, battleId: string, sideCountryId: number): Promise<{ success: boolean; damageDealt: number; xpGained: number; energyRemaining: number; error: string | null }> {
    const { data, error } = await supabase.rpc('fight_in_battle', {
      battle_id: battleId,
      side_country_id: sideCountryId,
    });

    if (error) {
      return { success: false, damageDealt: 0, xpGained: 0, energyRemaining: 0, error: error.message };
    }

    return {
      success: true,
      damageDealt: data.damage_dealt || 0,
      xpGained: data.xp_gained || 2,
      energyRemaining: data.energy_remaining || 0,
      error: null,
    };
  }

  async getCompanies(regionId?: number): Promise<Company[]> {
    let query = supabase.from('companies').select('*');
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
    return data || [];
  }

  async getJobOffers(): Promise<JobOffer[]> {
    const { data, error } = await supabase.from('job_offers').select('*');
    if (error) {
      console.error('Error fetching job offers:', error);
      return [];
    }
    return data || [];
  }

  async getActiveBattles(): Promise<Battle[]> {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching active battles:', error);
      return [];
    }
    return data || [];
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
    return data || [];
  }

  async syncEnergyTicks(userId: string): Promise<PlayerStats | null> {
    const { data, error } = await supabase.rpc('sync_energy_ticks');
    if (error) {
      console.error('Error syncing energy ticks:', error);
      return this.getPlayerStats(userId);
    }
    return data;
  }

  async claimTestTicket(userId: string): Promise<{ success: boolean; error: string | null }> {
    return { success: true, error: null };
  }

  async claimDevFunding(userId: string): Promise<{ success: boolean; error: string | null }> {
    return { success: true, error: null };
  }

  async cheatResourcesAndCurrencies(userId: string): Promise<{ success: boolean; error: string | null }> {
    return { success: true, error: null };
  }

  async claimDevEnergy(userId: string): Promise<{ success: boolean; error: string | null }> {
    return { success: true, error: null };
  }

  // Marketplace Getters
  async getMarketListings(): Promise<MarketListing[]> {
    const { data, error } = await supabase
      .from('market_listings')
      .select('*, profiles(username), companies(name), resources(name)')
      .eq('status', 'active');
      
    if (error) {
      console.error('Error fetching market listings:', error);
      return [];
    }
    
    return (data || []).map((l: any) => ({
      ...l,
      seller_name: l.profiles?.username || 'Unknown Seller',
      seller_company_name: l.companies?.name || undefined,
      resource_name: l.resources?.name || undefined,
    }));
  }

  async getMarketOrders(): Promise<MarketOrder[]> {
    const { data, error } = await supabase
      .from('market_orders')
      .select('*, profiles(username), companies(name), resources(name)')
      .eq('status', 'active');
      
    if (error) {
      console.error('Error fetching market orders:', error);
      return [];
    }
    
    return (data || []).map((o: any) => ({
      ...o,
      buyer_name: o.profiles?.username || 'Unknown Buyer',
      buyer_company_name: o.companies?.name || undefined,
      resource_name: o.resources?.name || undefined,
    }));
  }

  async getMarketHistory(): Promise<MarketTransaction[]> {
    const { data, error } = await supabase
      .from('market_transactions')
      .select('*, resources(name)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching market history:', error);
      return [];
    }
    
    return (data || []).map((t: any) => ({
      ...t,
      resource_name: t.resources?.name || undefined,
    }));
  }

  async getMarketNotifications(userId: string): Promise<MarketNotification[]> {
    const { data, error } = await supabase
      .from('market_notifications')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching market notifications:', error);
      return [];
    }
    return data || [];
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase
      .from('market_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('profile_id', userId);
      
    if (error) return { success: false, error: error.message };
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
    const { data, error } = await supabase.rpc('rpc_create_sell_listing', {
      p_company_id: companyId,
      p_asset_type: assetType,
      p_resource_id: resourceId,
      p_item_id: itemId,
      p_quantity: quantity,
      p_price_per_unit: pricePerUnit,
      p_currency_type: currencyType
    });

    if (error) return { success: false, listingId: null, error: error.message };
    return { success: true, listingId: data, error: null };
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
    const { data, error } = await supabase.rpc('rpc_create_buy_order', {
      p_company_id: companyId,
      p_asset_type: assetType,
      p_resource_id: resourceId,
      p_item_template_id: itemTemplateId,
      p_quantity: quantity,
      p_price_per_unit: pricePerUnit,
      p_currency_type: currencyType
    });

    if (error) return { success: false, orderId: null, error: error.message };
    return { success: true, orderId: data, error: null };
  }

  async cancelMarketListing(userId: string, listingId: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.rpc('rpc_cancel_listing', {
      p_listing_id: listingId
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async cancelMarketOrder(userId: string, orderId: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.rpc('rpc_cancel_order', {
      p_order_id: orderId
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  // Watchlist & Alerts
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const { data, error } = await supabase
      .from('market_watchlists')
      .select('*')
      .eq('profile_id', userId);
      
    if (error) {
      console.error('Error fetching watchlist:', error);
      return [];
    }
    return data || [];
  }

  async toggleWatchlist(userId: string, assetType: 'resource' | 'item', assetId: number): Promise<{ success: boolean; isWatched: boolean; error: string | null }> {
    const { data, error: fetchErr } = await supabase
      .from('market_watchlists')
      .select('*')
      .eq('profile_id', userId)
      .eq('asset_type', assetType)
      .eq('asset_id', assetId)
      .maybeSingle();

    if (fetchErr) return { success: false, isWatched: false, error: fetchErr.message };

    if (data) {
      const { error: delErr } = await supabase
        .from('market_watchlists')
        .delete()
        .eq('profile_id', userId)
        .eq('asset_type', assetType)
        .eq('asset_id', assetId);

      if (delErr) return { success: false, isWatched: true, error: delErr.message };
      return { success: true, isWatched: false, error: null };
    } else {
      const { error: insErr } = await supabase
        .from('market_watchlists')
        .insert({ profile_id: userId, asset_type: assetType, asset_id: assetId });

      if (insErr) return { success: false, isWatched: false, error: insErr.message };
      return { success: true, isWatched: true, error: null };
    }
  }

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('market_price_alerts')
      .select('*')
      .eq('profile_id', userId)
      .eq('is_triggered', false);
      
    if (error) {
      console.error('Error fetching price alerts:', error);
      return [];
    }
    return data || [];
  }

  async createPriceAlert(userId: string, assetType: 'resource' | 'item', assetId: number, targetPrice: number, condition: 'above' | 'below'): Promise<{ success: boolean; alertId: string | null; error: string | null }> {
    const { data, error } = await supabase
      .from('market_price_alerts')
      .insert({
        profile_id: userId,
        asset_type: assetType,
        asset_id: assetId,
        target_price: targetPrice,
        alert_condition: condition,
        is_triggered: false
      })
      .select('id')
      .single();

    if (error) return { success: false, alertId: null, error: error.message };
    return { success: true, alertId: data.id, error: null };
  }

  async deletePriceAlert(userId: string, alertId: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase
      .from('market_price_alerts')
      .delete()
      .eq('id', alertId)
      .eq('profile_id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  // Phase 6 Advanced Item implementation
  async getItemRecipes(): Promise<ItemRecipe[]> {
    const { data, error } = await supabase
      .from('item_recipes')
      .select('*, item_recipe_inputs(*, resources(name), item_templates(name))');
      
    if (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      ...r,
      inputs: (r.item_recipe_inputs || []).map((i: any) => ({
        ...i,
        resource_name: i.resources?.name || undefined,
        item_name: i.item_templates?.name || undefined,
      })),
    }));
  }

  async getItemBlueprints(userId: string): Promise<ItemBlueprint[]> {
    const { data, error } = await supabase
      .from('item_blueprints')
      .select('*')
      .eq('profile_id', userId);

    if (error) {
      console.error('Error fetching blueprints:', error);
      return [];
    }
    return data || [];
  }

  async getItemHistory(userId: string): Promise<ItemHistory[]> {
    const { data, error } = await supabase
      .from('item_history')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching item history:', error);
      return [];
    }
    return data || [];
  }

  async getEquipment(userId: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching equipment:', error);
      return null;
    }
    return data;
  }

  async equipItem(userId: string, itemId: string, slot: string): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_equip_item', {
      p_item_id: itemId,
      p_slot: slot
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error };
  }

  async unequipItem(userId: string, slot: string): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_unequip_item', {
      p_slot: slot
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error };
  }

  async consumeItem(userId: string, itemId: string): Promise<{ success: boolean; newEnergy?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_consume_item', {
      p_item_id: itemId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, newEnergy: res.new_energy, error: res.error };
  }

  async craftItem(userId: string, recipeId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_craft_item', {
      p_recipe_id: recipeId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error };
  }

  async repairItem(userId: string, itemId: string): Promise<{ success: boolean; costPaid?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_repair_item', {
      p_item_id: itemId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, costPaid: res.cost_paid, error: res.error };
  }

  async unlockBlueprint(userId: string, recipeId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_unlock_blueprint', {
      p_recipe_id: recipeId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error };
  }

  // Phase 7 Living World implementation
  async getRegionalEconomies(): Promise<RegionalEconomy[]> {
    const { data, error } = await supabase
      .from('regional_economies')
      .select('*, regions(name)');

    if (error) {
      console.error('Error fetching regional economies:', error);
      return [];
    }

    return (data || []).map((e: any) => ({
      region_id: e.region_id,
      region_name: e.regions?.name || 'Unknown Region',
      population: e.population,
      employed: e.employed,
      gdp: e.gdp,
      tax_reserves: e.tax_reserves,
      updated_at: e.updated_at,
    }));
  }

  async getWorldEvents(): Promise<WorldEvent[]> {
    const { data, error } = await supabase
      .from('world_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching world events:', error);
      return [];
    }
    return data || [];
  }

  async getSimulationLogs(): Promise<SimulationLog[]> {
    const { data, error } = await supabase
      .from('simulation_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching simulation logs:', error);
      return [];
    }
    return data || [];
  }

  async getNPCLogs(): Promise<NPCActivityLog[]> {
    const { data, error } = await supabase
      .from('npc_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching NPC activity logs:', error);
      return [];
    }
    return data || [];
  }

  async executeSimulationTick(): Promise<{ success: boolean; tickIndex?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('scheduler_tick');
    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, tickIndex: res.tick_index, error: res.error || null };
  }

  // Phase 8 Military Combat implementation
  async getEnemyTemplates(): Promise<EnemyTemplate[]> {
    const { data, error } = await supabase
      .from('enemy_templates')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching enemy templates:', error);
      return [];
    }
    return data || [];
  }

  async getCombatRankings(): Promise<CombatRanking[]> {
    const { data, error } = await supabase
      .from('player_stats')
      .select('profile_id, strength, level_pve, pvp_rating, kills, deaths, profiles(username)')
      .order('pvp_rating', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching combat rankings:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      profile_id: d.profile_id,
      username: d.profiles?.username || 'Unknown Recruit',
      strength: d.strength,
      level_pve: d.level_pve,
      pvp_rating: d.pvp_rating,
      kills: d.kills,
      deaths: d.deaths,
    }));
  }

  async executePvEBattle(enemyTemplateId: number): Promise<{ success: boolean; isVictory?: boolean; xpGained?: number; currencyGained?: number; roundsLog?: CombatRoundLog[]; lootGained?: CombatRewardItem[]; playerHp?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_execute_pve_battle', {
      p_enemy_template_id: enemyTemplateId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return {
      success: res.success,
      isVictory: res.is_victory,
      xpGained: res.xp_gained,
      currencyGained: res.currency_gained,
      roundsLog: res.rounds_log as CombatRoundLog[],
      lootGained: res.loot_gained as CombatRewardItem[],
      playerHp: res.player_hp,
      error: res.error || null
    };
  }

  async executePvPBattle(opponentProfileId: string): Promise<{ success: boolean; isVictory?: boolean; roundsLog?: CombatRoundLog[]; ratingChange?: number; playerHp?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_execute_pvp_battle', {
      p_opponent_profile_id: opponentProfileId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return {
      success: res.success,
      isVictory: res.is_victory,
      roundsLog: res.rounds_log as CombatRoundLog[],
      ratingChange: res.rating_change,
      playerHp: res.player_hp,
      error: res.error || null
    };
  }

  // Phase 9 Nations and Politics implementations
  async getPoliticalParties(): Promise<PoliticalParty[]> {
    const { data, error } = await supabase
      .from('political_parties')
      .select('*, profiles:leader_id(username)');

    if (error) {
      console.error('Error fetching political parties:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      leader_id: d.leader_id,
      country_id: d.country_id,
      created_at: d.created_at,
      leader_name: d.profiles?.username || 'Independent Leader',
      members_count: 1 // Simple baseline members count
    }));
  }

  async getElections(): Promise<Election[]> {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching elections:', error);
      return [];
    }
    return data || [];
  }

  async getCandidates(electionId: number): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*, profiles:candidate_id(username), political_parties:party_id(name)')
      .eq('election_id', electionId);

    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      election_id: d.election_id,
      candidate_id: d.candidate_id,
      party_id: d.party_id,
      votes_received: d.votes_received,
      username: d.profiles?.username || 'Independent Candidate',
      party_name: d.political_parties?.name || 'Independent'
    }));
  }

  async getBills(): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*, profiles:creator_id(username)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      country_id: d.country_id,
      creator_id: d.creator_id,
      title: d.title,
      description: d.description,
      type: d.type,
      parameters_json: d.parameters_json,
      yes_votes: d.yes_votes,
      no_votes: d.no_votes,
      status: d.status,
      ends_at: d.ends_at,
      created_at: d.created_at,
      creator_name: d.profiles?.username || 'System'
    }));
  }

  async getNationalProjects(): Promise<NationalProject[]> {
    const { data, error } = await supabase
      .from('national_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching national projects:', error);
      return [];
    }
    return data || [];
  }

  async createPoliticalParty(name: string, description: string): Promise<{ success: boolean; partyId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_create_political_party', {
      p_name: name,
      p_description: description
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, partyId: res.party_id, error: res.error || null };
  }

  async joinPoliticalParty(partyId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_join_political_party', {
      p_party_id: partyId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async registerAsCandidate(electionId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_register_candidate', {
      p_election_id: electionId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async voteForCandidate(electionId: number, candidateId: string): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_vote_candidate', {
      p_election_id: electionId,
      p_candidate_id: candidateId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async proposeBill(title: string, description: string, type: string, parameters: any): Promise<{ success: boolean; billId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_propose_bill', {
      p_title: title,
      p_description: description,
      p_type: type,
      p_parameters_json: parameters
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, billId: res.bill_id, error: res.error || null };
  }

  async voteOnBill(billId: number, vote: 'yes' | 'no'): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_vote_bill', {
      p_bill_id: billId,
      p_vote: vote
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  // Phase 10 Warfare implementations
  async getWars(): Promise<War[]> {
    const { data, error } = await supabase
      .from('wars')
      .select('*, attacker:attacker_country_id(name), defender:defender_country_id(name)')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching wars:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      attacker_country_id: d.attacker_country_id,
      defender_country_id: d.defender_country_id,
      status: d.status,
      started_at: d.started_at,
      ended_at: d.ended_at,
      attacker_name: d.attacker?.name || 'Solitude Republic',
      defender_name: d.defender?.name || 'Steel Bastion'
    }));
  }

  async getMilitaryRegions(): Promise<MilitaryRegion[]> {
    const { data, error } = await supabase
      .from('military_regions')
      .select('*, regions(name), owner:owner_country_id(name), occupier:occupier_country_id(name)');

    if (error) {
      console.error('Error fetching military regions:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      region_id: d.region_id,
      owner_country_id: d.owner_country_id,
      occupier_country_id: d.occupier_country_id,
      resistance_level: d.resistance_level,
      supply_status: d.supply_status,
      region_name: d.regions?.name || `Region #${d.region_id}`,
      owner_name: d.owner?.name || 'Solitude Republic',
      occupier_name: d.occupier?.name || 'Steel Bastion'
    }));
  }

  async getArmyUnits(): Promise<ArmyUnit[]> {
    const { data, error } = await supabase
      .from('army_units')
      .select('*, regions(name)')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching army units:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      country_id: d.country_id,
      current_region_id: d.current_region_id,
      size: d.size,
      morale: d.morale,
      ammo_qty: d.ammo_qty,
      rations_qty: d.rations_qty,
      status: d.status,
      created_at: d.created_at,
      region_name: d.regions?.name || `Region #${d.current_region_id}`
    }));
  }

  async getSupplyRoutes(): Promise<SupplyRoute[]> {
    const { data, error } = await supabase
      .from('supply_routes')
      .select('*, from_region:from_region_id(name), to_region:to_region_id(name)')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching supply routes:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      from_region_id: d.from_region_id,
      to_region_id: d.to_region_id,
      status: d.status,
      bandwidth: d.bandwidth,
      from_region_name: d.from_region?.name || `Region #${d.from_region_id}`,
      to_region_name: d.to_region?.name || `Region #${d.to_region_id}`
    }));
  }

  async getPeaceTreaties(): Promise<PeaceTreaty[]> {
    const { data, error } = await supabase
      .from('peace_treaties')
      .select('*, proposer:proposer_country_id(name)')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching peace treaties:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      war_id: d.war_id,
      proposer_country_id: d.proposer_country_id,
      status: d.status,
      reparations_amount: d.reparations_amount,
      territory_transfer_json: d.territory_transfer_json as number[],
      created_at: d.created_at,
      proposer_name: d.proposer?.name || 'Solitude Republic'
    }));
  }

  async declareWar(defenderCountryId: number): Promise<{ success: boolean; warId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_declare_war', {
      p_defender_country_id: defenderCountryId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, warId: res.war_id, error: res.error || null };
  }

  async mobilizeArmy(): Promise<{ success: boolean; armyId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_mobilize_army_unit');

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, armyId: res.army_id, error: res.error || null };
  }

  async commandArmyMovement(armyId: number, targetRegionId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_command_army_movement', {
      p_army_id: armyId,
      p_target_region_id: targetRegionId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async engageMilitaryBattle(armyId: number, targetRegionId: number): Promise<{ success: boolean; outcome?: string; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_engage_military_battle', {
      p_army_id: armyId,
      p_target_region_id: targetRegionId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, outcome: res.outcome, error: res.error || null };
  }

  async proposePeace(warId: number, reparations: number, transfers: number[]): Promise<{ success: boolean; treatyId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_propose_peace_treaty', {
      p_war_id: warId,
      p_reparations: reparations,
      p_transfers: transfers
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, treatyId: res.treaty_id, error: res.error || null };
  }

  async acceptPeace(treatyId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_accept_peace_treaty', {
      p_treaty_id: treatyId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  // Phase 11 Social & Community Supabase Implementations
  async getGuilds(): Promise<Guild[]> {
    const { data, error } = await supabase.from('guilds').select('*');
    if (error) {
      console.error('Error fetching guilds:', error);
      return [];
    }
    return data || [];
  }

  async getMyGuild(userId: string): Promise<Guild | null> {
    const { data, error } = await supabase
      .from('guild_members')
      .select('*, guilds(*)')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data.guilds ? (data.guilds as any) : null;
  }

  async getGuildMembers(guildId: number): Promise<GuildMember[]> {
    const { data, error } = await supabase
      .from('guild_members')
      .select('*, profiles!guild_members_profile_id_fkey(username), guild_roles!guild_members_role_id_fkey(name)')
      .eq('guild_id', guildId);

    if (error) {
      console.error('Error fetching guild members:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      guild_id: d.guild_id,
      profile_id: d.profile_id,
      role_id: d.role_id,
      joined_at: d.joined_at,
      username: d.profiles?.username || 'Unknown Player',
      role_name: d.guild_roles?.name || 'Member'
    }));
  }

  async getGuildInventory(guildId: number): Promise<GuildInventory[]> {
    const { data, error } = await supabase
      .from('guild_inventory')
      .select('*, item_templates(name)')
      .eq('guild_id', guildId);

    if (error) {
      console.error('Error fetching guild inventory:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      guild_id: d.guild_id,
      item_template_id: d.item_template_id,
      quantity: d.quantity,
      item_name: d.item_templates?.name || 'Unknown Item'
    }));
  }

  async getGuildApplications(guildId: number): Promise<GuildApplication[]> {
    const { data, error } = await supabase
      .from('guild_applications')
      .select('*, profiles!guild_applications_profile_id_fkey(username)')
      .eq('guild_id', guildId);

    if (error) {
      console.error('Error fetching guild applications:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      guild_id: d.guild_id,
      profile_id: d.profile_id,
      status: d.status,
      message: d.message,
      created_at: d.created_at,
      username: d.profiles?.username || 'Applicant'
    }));
  }

  async getGuildInvitations(userId: string): Promise<GuildInvitation[]> {
    const { data, error } = await supabase
      .from('guild_invitations')
      .select('*, guilds(name)')
      .eq('profile_id', userId);

    if (error) {
      console.error('Error fetching guild invitations:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      guild_id: d.guild_id,
      profile_id: d.profile_id,
      status: d.status,
      created_at: d.created_at,
      guild_name: d.guilds?.name || 'Unknown Guild'
    }));
  }

  async getGuildWars(): Promise<GuildWar[]> {
    const { data, error } = await supabase.from('guild_wars').select('*');
    if (error) {
      console.error('Error fetching guild wars:', error);
      return [];
    }
    return data || [];
  }

  async getGuildAlliances(): Promise<GuildAlliance[]> {
    const { data, error } = await supabase.from('guild_alliances').select('*');
    if (error) {
      console.error('Error fetching alliances:', error);
      return [];
    }
    return data || [];
  }

  async getCoalitions(): Promise<Coalition[]> {
    const { data, error } = await supabase.from('coalitions').select('*');
    if (error) {
      console.error('Error fetching coalitions:', error);
      return [];
    }
    return data || [];
  }

  async getCoalitionMembers(coalitionId: number): Promise<CoalitionMember[]> {
    const { data, error } = await supabase
      .from('coalition_members')
      .select('*, guilds(name)')
      .eq('coalition_id', coalitionId);

    if (error) {
      console.error('Error fetching coalition members:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      coalition_id: d.coalition_id,
      guild_id: d.guild_id,
      joined_at: d.joined_at,
      guild_name: d.guilds?.name || 'Unknown Guild'
    }));
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`profile_id_1.eq.${userId},profile_id_2.eq.${userId}`);

    if (error) {
      console.error('Error fetching friendships:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      profile_id_1: d.profile_id_1,
      profile_id_2: d.profile_id_2,
      status: d.status,
      is_favorite: d.is_favorite,
      created_at: d.created_at,
      friend_id: d.profile_id_1 === userId ? d.profile_id_2 : d.profile_id_1,
      friend_name: d.profile_id_1 === userId ? `Player ${d.profile_id_2.slice(0, 4)}` : `Player ${d.profile_id_1.slice(0, 4)}`
    }));
  }

  async getPlayerBlocks(userId: string): Promise<PlayerBlock[]> {
    const { data, error } = await supabase.from('player_blocks').select('*').eq('blocker_id', userId);
    if (error) {
      console.error('Error fetching blocked players:', error);
      return [];
    }
    return data || [];
  }

  async getConversationThreads(userId: string): Promise<ConversationThread[]> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('*, conversation_threads(*)')
      .eq('profile_id', userId);

    if (error) {
      console.error('Error fetching conversation threads:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.conversation_threads?.id,
      type: d.conversation_threads?.type,
      metadata_json: d.conversation_threads?.metadata_json || {},
      created_at: d.conversation_threads?.created_at,
      title: `${d.conversation_threads?.type.toUpperCase()} Thread #${d.conversation_threads?.id}`
    }));
  }

  async getDirectMessages(threadId: number): Promise<DirectMessage[]> {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*, profiles!direct_messages_sender_id_fkey(username)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching direct messages:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      thread_id: d.thread_id,
      sender_id: d.sender_id,
      content: d.content,
      created_at: d.created_at,
      read_by_json: d.read_by_json || [],
      sender_name: d.profiles?.username || 'Sender'
    }));
  }

  async getPlayerMail(userId: string): Promise<PlayerMail[]> {
    const { data, error } = await supabase
      .from('player_mail')
      .select('*, profiles!player_mail_sender_id_fkey(username), item_templates(name)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching player mail:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      sender_id: d.sender_id,
      recipient_id: d.recipient_id,
      subject: d.subject,
      body: d.body,
      attached_currency: Number(d.attached_currency),
      attached_gold: Number(d.attached_gold),
      attached_item_template_id: d.attached_item_template_id,
      attached_item_qty: d.attached_item_qty,
      is_read: d.is_read,
      is_claimed: d.is_claimed,
      created_at: d.created_at,
      sender_name: d.profiles?.username || 'System Mailer',
      item_name: d.item_templates?.name
    }));
  }

  async getPlayerReputation(userId: string): Promise<PlayerReputation | null> {
    const { data, error } = await supabase
      .from('player_reputation')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      profile_id: data.profile_id,
      trading_rep: data.trading_rep,
      military_rep: data.military_rep,
      political_rep: data.political_rep,
      industrial_rep: data.industrial_rep,
      community_rep: data.community_rep,
      moderation_history: data.moderation_history || []
    };
  }

  async getPlayerTitles(userId: string): Promise<PlayerTitle[]> {
    const { data, error } = await supabase.from('player_titles').select('*').eq('profile_id', userId);
    if (error) {
      console.error('Error fetching player titles:', error);
      return [];
    }
    return data || [];
  }

  async getPlayerBadges(userId: string): Promise<PlayerBadge[]> {
    const { data, error } = await supabase.from('player_badges').select('*').eq('profile_id', userId);
    if (error) {
      console.error('Error fetching player badges:', error);
      return [];
    }
    return data || [];
  }

  async getContracts(): Promise<Contract[]> {
    const { data, error } = await supabase.from('contracts').select('*');
    if (error) {
      console.error('Error fetching contracts:', error);
      return [];
    }
    return data || [];
  }

  async getContractOffers(userId: string): Promise<ContractOffer[]> {
    const { data, error } = await supabase.from('contract_offers').select('*').eq('target_profile_id', userId);
    if (error) {
      console.error('Error fetching contract offers:', error);
      return [];
    }
    return data || [];
  }

  async getContractExecutions(contractId: number): Promise<ContractExecution[]> {
    const { data, error } = await supabase.from('contract_executions').select('*').eq('contract_id', contractId);
    if (error) {
      console.error('Error fetching contract executions:', error);
      return [];
    }
    return data || [];
  }

  async getRecruitmentPosts(): Promise<RecruitmentPost[]> {
    const { data, error } = await supabase
      .from('recruitment_posts')
      .select('*, profiles!recruitment_posts_creator_id_fkey(username)');

    if (error) {
      console.error('Error fetching recruitment posts:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      creator_id: d.creator_id,
      target_type: d.target_type,
      target_id: d.target_id,
      title: d.title,
      description: d.description,
      requirements_json: d.requirements_json || {},
      created_at: d.created_at,
      creator_name: d.profiles?.username || 'Recruiter'
    }));
  }

  async getNewspapers(): Promise<Newspaper[]> {
    const { data, error } = await supabase
      .from('newspapers')
      .select('*, profiles!newspapers_owner_id_fkey(username)');

    if (error) {
      console.error('Error fetching newspapers:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      owner_id: d.owner_id,
      created_at: d.created_at,
      owner_name: d.profiles?.username || 'Publisher'
    }));
  }

  async getArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(username), newspapers(name)');

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      newspaper_id: d.newspaper_id,
      author_id: d.author_id,
      title: d.title,
      content: d.content,
      category: d.category,
      ratings_score: d.ratings_score,
      created_at: d.created_at,
      author_name: d.profiles?.username || 'Writer',
      newspaper_name: d.newspapers?.name || 'Press'
    }));
  }

  async getArticleComments(articleId: number): Promise<ArticleComment[]> {
    const { data, error } = await supabase
      .from('article_comments')
      .select('*, profiles!article_comments_commenter_id_fkey(username)')
      .eq('article_id', articleId);

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      article_id: d.article_id,
      commenter_id: d.commenter_id,
      comment: d.comment,
      created_at: d.created_at,
      commenter_name: d.profiles?.username || 'Commenter'
    }));
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
    return data || [];
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase.from('calendar_events').select('*');
    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
    return data || [];
  }

  async getCommunityLogs(guildId: number): Promise<CommunityLog[]> {
    const { data, error } = await supabase.from('community_logs').select('*').eq('guild_id', guildId);
    if (error) {
      console.error('Error fetching community logs:', error);
      return [];
    }
    return data || [];
  }

  async createGuild(userId: string, name: string, tag: string, description: string): Promise<{ success: boolean; guildId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_create_guild', {
      p_name: name,
      p_tag: tag,
      p_description: description
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, guildId: res.guild_id, error: res.error || null };
  }

  async applyToGuild(userId: string, guildId: number, message: string): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_apply_to_guild', {
      p_guild_id: guildId,
      p_message: message
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async respondToGuildApplication(applicationId: number, approve: boolean): Promise<{ success: boolean; error: string | null }> {
    const status = approve ? 'approved' : 'rejected';
    const { error } = await supabase.from('guild_applications').update({ status }).eq('id', applicationId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async sendGuildInvitation(guildId: number, targetProfileId: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('guild_invitations').insert({
      guild_id: guildId,
      profile_id: targetProfileId,
      status: 'pending'
    });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async respondToGuildInvitation(invitationId: number, accept: boolean): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_respond_to_guild_invitation', {
      p_invitation_id: invitationId,
      p_accept: accept
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async manageGuildMember(guildId: number, targetProfileId: string, action: 'kick' | 'promote' | 'demote'): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_manage_guild_member', {
      p_guild_id: guildId,
      p_target_profile_id: targetProfileId,
      p_action: action
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async withdrawGuildVault(guildId: number, amount: number, isGold: boolean): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_withdraw_guild_vault', {
      p_guild_id: guildId,
      p_amount: amount,
      p_is_gold: isGold
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async sendDirectMessage(threadId: number, content: string): Promise<{ success: boolean; messageId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_send_direct_message', {
      p_thread_id: threadId,
      p_content: content
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, messageId: res.message_id, error: res.error || null };
  }

  async createConversationThread(type: 'private' | 'group' | 'guild' | 'coalition' | 'country' | 'trade' | 'system', participantIds: string[]): Promise<{ success: boolean; threadId?: number; error: string | null }> {
    const { data, error } = await supabase.from('conversation_threads').insert({ type }).select().single();
    if (error) return { success: false, error: error.message };

    const threadId = data.id;
    const records = participantIds.map((pid: string) => ({ thread_id: threadId, profile_id: pid }));
    const { error: partError } = await supabase.from('conversation_participants').insert(records);

    if (partError) return { success: false, error: partError.message };
    return { success: true, threadId, error: null };
  }

  async sendMail(recipientId: string, subject: string, body: string, attachedCurrency: number, attachedGold: number, attachedItemTemplateId?: number, attachedItemQty?: number): Promise<{ success: boolean; mailId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_send_mail', {
      p_recipient_id: recipientId,
      p_subject: subject,
      p_body: body,
      p_attached_currency: attachedCurrency,
      p_attached_gold: attachedGold,
      p_attached_item_template_id: attachedItemTemplateId || null,
      p_attached_item_qty: attachedItemQty || 0
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, mailId: res.mail_id, error: res.error || null };
  }

  async claimMailAttachments(mailId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_claim_mail_attachments', {
      p_mail_id: mailId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async createContract(type: string, terms: any, escrowLocal: number, escrowGold: number, deadline?: string): Promise<{ success: boolean; contractId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_create_contract', {
      p_type: type,
      p_terms: terms,
      p_escrow_local: escrowLocal,
      p_escrow_gold: escrowGold,
      p_deadline: deadline || null
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, contractId: res.contract_id, error: res.error || null };
  }

  async acceptContract(contractId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_accept_contract', {
      p_contract_id: contractId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async completeContract(contractId: number): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_complete_contract', {
      p_contract_id: contractId
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async createNewspaper(name: string, description: string): Promise<{ success: boolean; newspaperId?: number; error: string | null }> {
    const { error } = await supabase.from('newspapers').insert({ name, description });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async publishArticle(newspaperId: number, title: string, content: string, category: 'news' | 'opinion' | 'government' | 'developer'): Promise<{ success: boolean; articleId?: number; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_publish_article', {
      p_newspaper_id: newspaperId,
      p_title: title,
      p_content: content,
      p_category: category
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, articleId: res.article_id, error: res.error || null };
  }

  async commentOnArticle(articleId: number, comment: string): Promise<{ success: boolean; commentId?: number; error: string | null }> {
    const { error } = await supabase.from('article_comments').insert({ article_id: articleId, comment });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async respondToFriendRequest(friendshipId: number, accept: boolean): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await supabase.rpc('rpc_respond_to_friend_request', {
      p_friendship_id: friendshipId,
      p_accept: accept
    });

    if (error) return { success: false, error: error.message };
    const res = data as any;
    return { success: res.success, error: res.error || null };
  }

  async sendFriendRequest(targetProfileId: string): Promise<{ success: boolean; friendshipId?: number; error: string | null }> {
    const { error } = await supabase.from('friendships').insert({
      profile_id_1: (await supabase.auth.getUser()).data.user?.id,
      profile_id_2: targetProfileId,
      status: 'pending'
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  // Phase 12 implementations
  async getLiveOpsConfig(): Promise<LiveOpsConfig> {
    const { data, error } = await supabase.from('live_ops_config').select('*').order('id', { ascending: true }).limit(1).maybeSingle();
    if (error || !data) {
      return {
        id: 1,
        emergency_shutdown: false,
        maintenance_mode: false,
        resource_multiplier: 1.00,
        xp_multiplier: 1.00,
        drop_rate_multiplier: 1.00,
        tax_limit_multiplier: 1.00,
        active_season_id: 1,
        updated_at: new Date().toISOString()
      };
    }
    return data as LiveOpsConfig;
  }

  async updateLiveOpsConfig(config: Partial<LiveOpsConfig>): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('live_ops_config').update(config).eq('id', 1);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getModerationActions(profileId?: string): Promise<ModerationAction[]> {
    let q = supabase.from('moderation_actions').select('*');
    if (profileId) {
      q = q.eq('profile_id', profileId);
    }
    const { data, error } = await q;
    if (error) return [];
    return (data || []) as ModerationAction[];
  }

  async createModerationAction(action: Omit<ModerationAction, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('moderation_actions').insert(action);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getPlayerReports(): Promise<PlayerReport[]> {
    const { data, error } = await supabase.from('player_reports').select('*');
    if (error) return [];
    return (data || []) as PlayerReport[];
  }

  async createPlayerReport(report: Omit<PlayerReport, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('player_reports').insert(report);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getSupportTickets(profileId?: string): Promise<SupportTicket[]> {
    let q = supabase.from('support_tickets').select('*');
    if (profileId) {
      q = q.eq('profile_id', profileId);
    }
    const { data, error } = await q;
    if (error) return [];
    return (data || []) as SupportTicket[];
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at'>): Promise<{ success: boolean; ticketId?: number; error: string | null }> {
    const { data, error } = await supabase.from('support_tickets').insert(ticket).select('id').single();
    if (error) return { success: false, error: error.message };
    return { success: true, ticketId: data?.id, error: null };
  }

  async addTicketReply(reply: Omit<TicketReply, 'id' | 'created_at'>): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('ticket_replies').insert(reply);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    const { data, error } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    if (error) return [];
    return (data || []) as TicketReply[];
  }

  async getSystemMetrics(): Promise<SystemMetric[]> {
    const { data, error } = await supabase.from('system_metrics_hourly').select('*').order('timestamp', { ascending: false }).limit(50);
    if (error) return [];
    return (data || []) as SystemMetric[];
  }

  async getDailyActiveUsers(): Promise<DailyActiveUser[]> {
    const { data, error } = await supabase.from('daily_active_users').select('*').order('date', { ascending: true });
    if (error) return [];
    return (data || []) as DailyActiveUser[];
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase.from('feature_flags').select('*');
    if (error) return [];
    return (data || []) as FeatureFlag[];
  }

  async toggleFeatureFlag(flagId: number, isEnabled: boolean, percentage?: number): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('feature_flags').update({
      is_enabled: isEnabled,
      rollout_percentage: percentage ?? 100
    }).eq('id', flagId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getDeveloperKeys(profileId: string): Promise<DeveloperKey[]> {
    const { data, error } = await supabase.from('developer_keys').select('*').eq('profile_id', profileId);
    if (error) return [];
    return (data || []) as DeveloperKey[];
  }

  async createDeveloperKey(profileId: string, label: string): Promise<{ success: boolean; key?: string; error: string | null }> {
    const generatedKey = `aegis_pk_live_${Math.random().toString(36).substring(2, 12)}`;
    const { error } = await supabase.from('developer_keys').insert({
      profile_id: profileId,
      api_key_hash: generatedKey.slice(0, 15) + '...',
      label,
      rate_limit_per_min: 60
    });
    if (error) return { success: false, error: error.message };
    return { success: true, key: generatedKey, error: null };
  }

  async revokeDeveloperKey(keyId: number): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('developer_keys').update({ is_active: false }).eq('id', keyId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getQuests(): Promise<Quest[]> {
    const { data, error } = await supabase.from('quests').select('*').eq('is_active', true);
    if (error) return [];
    return (data || []) as Quest[];
  }

  async getPlayerQuests(profileId: string): Promise<PlayerQuest[]> {
    const { data, error } = await supabase.from('player_quests').select('*, quests(*)').eq('profile_id', profileId);
    if (error) return [];
    return (data || []).map((pq: any) => ({
      profile_id: pq.profile_id,
      quest_id: pq.quest_id,
      status: pq.status,
      progress_json: pq.progress_json,
      updated_at: pq.updated_at,
      title: pq.quests?.title,
      description: pq.quests?.description
    }));
  }

  async startQuest(profileId: string, questId: number): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('player_quests').insert({
      profile_id: profileId,
      quest_id: questId,
      status: 'active',
      progress_json: { current: 0, required: 1 }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async updateQuestProgress(profileId: string, questId: number, progress: any): Promise<{ success: boolean; error: string | null }> {
    const isCompleted = progress.current >= progress.required;
    const { error } = await supabase.from('player_quests').update({
      progress_json: progress,
      status: isCompleted ? 'completed' : 'active',
      updated_at: new Date().toISOString()
    }).match({ profile_id: profileId, quest_id: questId });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error) return [];
    return (data || []) as Achievement[];
  }

  async getPlayerAchievements(profileId: string): Promise<PlayerAchievement[]> {
    const { data, error } = await supabase.from('player_achievements').select('*, achievements(*)').eq('profile_id', profileId);
    if (error) return [];
    return (data || []).map((pa: any) => ({
      profile_id: pa.profile_id,
      achievement_id: pa.achievement_id,
      unlocked_at: pa.unlocked_at,
      title: pa.achievements?.title,
      description: pa.achievements?.description,
      points: pa.achievements?.points
    }));
  }

  async getSeasons(): Promise<Season[]> {
    const { data, error } = await supabase.from('seasons').select('*');
    if (error) return [];
    return (data || []) as Season[];
  }

  async getSeasonLeaderboard(seasonId: number): Promise<SeasonLeaderboard[]> {
    const { data, error } = await supabase.from('season_leaderboard').select('*, profiles(username)').eq('season_id', seasonId).order('score', { ascending: false });
    if (error) return [];
    return (data || []).map((sl: any) => ({
      season_id: sl.season_id,
      profile_id: sl.profile_id,
      score: sl.score,
      rank: sl.rank,
    }));
  }

  async getClosedAlphaInvites(): Promise<any[]> {
    const { data, error } = await supabase.from('closed_alpha_invites').select('*');
    if (error) return [];
    return data || [];
  }

  async generateClosedAlphaInvite(code: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('closed_alpha_invites').insert({ invite_code: code });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }

  // Phase 6.5 stubs — Supabase vertical slice paused; return safe empty results
  async getNobleHouses(): Promise<any[]> { return []; }
  async getDynasty(_profileId?: string): Promise<any | null> { return null; }
  async getDynastyMembers(_dynastyId: number): Promise<any[]> { return []; }
  async getRulerLegitimacy(_profileId: string): Promise<any | null> { return null; }
  async getKingdomStability(_countryId: number): Promise<any | null> { return null; }
  async establishDynasty(_a: any, _b: any, _c: any, _d: any, _e: any): Promise<{ success: boolean; dynastyId?: number; error: string | null }> { return { success: false, error: 'Supabase dynasty not wired in this build.' }; }
  async designateHeir(_a: number, _b: string, _c: any, _d: any): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Supabase dynasty not wired in this build.' }; }
  async abdicateThrone(_a: string, _b?: string): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Supabase dynasty not wired in this build.' }; }
  async resolveSuccession(_a: number, _b: string): Promise<{ success: boolean; newRulerTitle?: string; error: string | null }> { return { success: false, error: 'Supabase dynasty not wired in this build.' }; }
  async updateLegitimacy(_a: string, _b: number, _c: any): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Supabase dynasty not wired in this build.' }; }
  async getSuccessionOrder(_dynastyId: number): Promise<any[]> { return []; }
  async getPlayerCharacter(_userId: string): Promise<any | null> { return null; }
  async savePlayerCharacter(_userId: string, _input: any): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Supabase onboarding not yet wired in this build.' }; }
  async completeOnboarding(_userId: string): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Supabase onboarding not yet wired in this build.' }; }
  async upgradeProfession(_userId: string): Promise<{ success: boolean; error: string | null; newRank?: number }> { return { success: false, error: 'Not available via Supabase in this build.' }; }
  async recruitArmy(_userId: string): Promise<{ success: boolean; armyId?: number; error: string | null }> { return { success: false, error: 'Not available via Supabase in this build.' }; }
  async initiateSiege(_a: number, _r: number): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Not available via Supabase in this build.' }; }
  async progressSiege(_a: number, _r: number): Promise<{ success: boolean; error: string | null; provinceCaptured?: boolean; report?: any }> { return { success: false, error: 'Not available via Supabase in this build.' }; }
  async liftSiege(_a: number, _r: number): Promise<{ success: boolean; error: string | null }> { return { success: false, error: 'Not available via Supabase in this build.' }; }
  async getRegionEdges(): Promise<any[]> { return []; }
  async getLastBattleReport(_userId?: string): Promise<any | null> { return null; }
}
