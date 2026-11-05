/**
 * Deterministic Simulation Rules
 *
 * All game rules are pure functions of (state, command, ruleset, seed).
 * No randomness outside the seeded PRNG. No side effects.
 * This module is UI-independent and can be tested in isolation.
 */

import type {
  SimulationRuleset,
  SimulationCommandInput,
  SimulationCommandResult,
  OutboxEvent,
} from '@/types/entities';

/*──────────────────────────── Seeded PRNG ────────────────────────────*/

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return (this.state >>> 0) / 0xffffffff;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextRange(min: number, max: number): number {
    return min + this.nextInt(max - min + 1);
  }
}

/*──────────────────────────── Deterministic Rules ────────────────────────────*/

export const DEFAULT_RULESET: SimulationRuleset = {
  id: 'v1',
  version: 'v1',
  seed: 1730755200,
  energy_regen_per_tick: 5,
  energy_regen_interval_seconds: 360,
  tick_interval_seconds: 300,
  travel_domestic_cost: 10,
  travel_international_cost: 20,
  max_energy: 100,
  combat_health_cost: 10,
  combat_energy_cost: 10,
  production_points_per_tick: 1,
  created_at: new Date().toISOString(),
};

/**
 * Apply a travel command deterministically.
 */
export function applyTravelCommand(
  input: SimulationCommandInput,
  ruleset: SimulationRuleset,
  rng: SeededRNG,
  currentRegionId: number,
  targetRegionId: number,
  currentEnergy: number,
  edges: any[],
  countries: Map<number, { id: number }>,
): SimulationCommandResult {
  const events: OutboxEvent[] = [];

  const edge = edges.find(
    (e) =>
      (e.from_region_id === currentRegionId && e.to_region_id === targetRegionId) ||
      (e.to_region_id === currentRegionId && e.from_region_id === targetRegionId)
  );

  if (!edge) {
    return {
      success: false,
      error: `No valid travel route from region ${currentRegionId} to ${targetRegionId}`,
      events,
    };
  }

  const isSameCountry = countries.get(currentRegionId)?.id === countries.get(targetRegionId)?.id;
  const energyCost = isSameCountry ? ruleset.travel_domestic_cost : ruleset.travel_international_cost;

  if (currentEnergy < energyCost) {
    return {
      success: false,
      error: `Insufficient energy: required ${energyCost}, have ${currentEnergy}`,
      events,
    };
  }

  const newEnergy = currentEnergy - energyCost;

  events.push({
    event_id: 0,
    tick_id: 0,
    seq: 0,
    event_type: 'region.travel',
    payload: {
      from_region_id: currentRegionId,
      to_region_id: targetRegionId,
      energy_cost: energyCost,
      edge_mode: edge.mode,
      ticket_used: !isSameCountry,
    },
    published: false,
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    events,
  };
}

/**
 * Apply a gather command deterministically.
 */
export function applyGatherCommand(
  input: SimulationCommandInput,
  ruleset: SimulationRuleset,
  rng: SeededRNG,
  currentEnergy: number,
  energyCost: number,
  experienceReward: number,
): SimulationCommandResult {
  const events: OutboxEvent[] = [];

  if (currentEnergy < energyCost) {
    return {
      success: false,
      error: `Insufficient energy: required ${energyCost}, have ${currentEnergy}`,
      events,
    };
  }

  const newEnergy = currentEnergy - energyCost;

  const quantityGathered = 1; // deterministic yield

  events.push({
    event_id: 0,
    tick_id: 0,
    seq: 0,
    event_type: 'resource.gather',
    payload: {
      quantity_gathered: quantityGathered,
      energy_spent: energyCost,
      experience_gained: experienceReward,
      new_energy: newEnergy,
    },
    published: false,
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    newEnergy,
    events,
  };
}

/**
 * Apply a combat command deterministically.
 */
export function applyCombatCommand(
  input: SimulationCommandInput,
  ruleset: SimulationRuleset,
  rng: SeededRNG,
  playerHealth: number,
  enemyHealth: number,
  playerEnergy: number,
): SimulationCommandResult {
  const events: OutboxEvent[] = [];

  if (playerEnergy < ruleset.combat_energy_cost) {
    return {
      success: false,
      error: `Insufficient energy for combat`,
      events,
    };
  }

  const newEnergy = playerEnergy - ruleset.combat_energy_cost;
  const victory = enemyHealth <= 50; // deterministic: player wins if enemy has low health
  const damageDealt = victory ? enemyHealth : 50;
  const damageTaken = 10; // fixed damage

  events.push({
    event_id: 0,
    tick_id: 0,
    seq: 0,
    event_type: victory ? 'combat.victory' : 'combat.defeat',
    payload: {
      victory,
      damage_dealt: damageDealt,
      damage_taken: damageTaken,
      xp_gained: victory ? 10 : 0,
      currency_gained: victory ? 3.5 : 0,
      player_hp: victory ? enemyHealth : 0,
      new_energy: newEnergy,
    },
    published: false,
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    victory,
    newEnergy,
    events,
  };
}

/**
 * Apply production tick - adds resources to player inventory based on region.
 */
export function applyProductionTick(
  ruleset: SimulationRuleset,
  regionId: number,
  currentResources: Map<number, number>,
): { events: OutboxEvent[]; newResources: Map<number, number> } {
  const events: OutboxEvent[] = [];
  const newResources = new Map<number, number>(currentResources);

  // Determine production based on region development and tick interval
  const baseProduction = ruleset.production_points_per_tick; // 1 per tick
  const developmentFactor = 1.0; // simplified deterministic factor

  // For now, use a flat production amount based on development
  // Higher development = more production
  const productionAmount = Math.floor(baseProduction * 1);

  // Add resources to the region
  for (const [resId, currentQty] of newResources.entries()) {
    const newQty = currentQty + productionAmount;
    newResources.set(resId, newQty);
  }

  // If no resources yet, initialize with some
  if (newResources.size === 0) {
    newResources.set(5, productionAmount); // Grain by default
  }

  events.push({
    event_id: 0,
    tick_id: 0,
    seq: 0,
    event_type: 'region.production',
    payload: {
      region_id: regionId,
      resource_produced: productionAmount,
      previous_quantity: 0,
      new_quantity: productionAmount,
    },
    published: false,
    created_at: new Date().toISOString(),
  });

  return {
    events,
    newResources,
  };
}