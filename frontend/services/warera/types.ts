/**
 * WarEra wire types.
 *
 * Only the fields the Aegis adapter consumes are typed. WarEra returns more
 * fields than listed here; treat this as a projection, not a complete schema.
 */

export type WarEraId = string;

export interface WarEraCountry {
  _id: WarEraId;
  name: string;
  code: string;
  money: number;
  taxes: { income: number; market: number; manager: number };
  allies: WarEraId[];
  warsWith: WarEraId[];
  allianceId?: WarEraId;
  enemy?: WarEraId;
  scheme?: string;
  mapAccent?: string;
  currentDevelopment?: number;
  currentPopulation?: number;
  updatedAt?: string;
}

export interface WarEraRegion {
  _id: WarEraId;
  code: string;
  name: string;
  mainCity: string;
  country: WarEraId;
  initialCountry: WarEraId;
  countryCode: string;
  neighbors: WarEraId[];
  position: [number, number];
  biome: string;
  climate: string;
  isCapital: boolean;
  isLinkedToCapital: boolean;
  development: number;
  baseDevelopment: number;
  resistance: number;
  resistanceMax: number;
  strategicResource?: string;
  currentPopulation: number;
  population: number;
  companyCount: number;
  employeeCount: number;
}

export interface WarEraSkillBar {
  level: number;
  value: number | null;
  total: number | null;
  currentBarValue?: number | null;
  hourlyBarRegen?: number;
}

export interface WarEraUser {
  _id: WarEraId;
  secretId: string;
  username: string;
  country: WarEraId;
  region?: WarEraId;
  location?: WarEraId;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified?: boolean;
  leveling: {
    level: number;
    xp: number;
    totalXp: number;
    dailyXpLeft: number;
    availableSkillPoints: number;
    spentSkillPoints: number;
    totalSkillPoints: number;
    prestigeLevel: number;
  };
  militaryRank: number;
  skills: Record<string, WarEraSkillBar>;
  createdAt: string;
  updatedAt: string;
}

export interface WarEraItemInstance {
  _id: WarEraId;
  code: string;
  type?: string;
  state: number;
  maxState: number;
  quantity: number;
  skills?: Record<string, number>;
}

export interface WarEraInventory {
  _id: WarEraId;
  user: WarEraId;
  money: number;
  items: {
    basics?: Record<string, number>;
    weapons?: WarEraItemInstance[];
    equipments?: WarEraItemInstance[];
  };
}

export interface WarEraCompany {
  _id: WarEraId;
  user: WarEraId;
  region: WarEraId;
  name: string;
  itemCode: string;
  production: number;
  concreteInvested: number;
  isFull: boolean;
  estimatedValue: number;
  freeMoves: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarEraBattleSide {
  country: WarEraId;
  region?: WarEraId;
  damages: number;
  hitCount: number;
  wonRoundsCount: number;
  countryOrders: WarEraId[];
  muOrders: WarEraId[];
  moneyPer1kDamages?: number;
  moneyPool?: number;
}

export interface WarEraBattle {
  _id: WarEraId;
  war: WarEraId;
  type: string;
  attacker: WarEraBattleSide;
  defender: WarEraBattleSide;
  rounds: WarEraId[];
  roundsHistory: WarEraId[];
  currentRound?: WarEraId;
  isActive: boolean;
  roundsToWin: number;
}

export interface WarEraPaged<T> {
  items: T[];
  nextCursor?: string;
}

export interface WarEraGameConfig {
  items: Record<
    string,
    {
      type: string;
      code: string;
      rarity: string;
      productionPoints?: number;
      productionNeeds?: Record<string, number>;
      flatStats?: Record<string, number>;
      dynamicStats?: Record<string, [number, number]>;
    }
  >;
  user: Record<string, unknown>;
  battle: Record<string, unknown>;
  [key: string]: unknown;
}
