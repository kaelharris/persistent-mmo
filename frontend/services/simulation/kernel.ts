/**
 * Deterministic Simulation Kernel
 *
 * Transactional command application with idempotency keys.
 * All state mutations happen through this module - no direct database writes
 * from UI code. Replayable from snapshot + events.
 */

import type {
  SimulationCommandInput,
  SimulationCommandResult,
  SimulationTick,
  SimulationCommand,
  OutboxEvent,
  SimulationRuleset,
} from '@/types/entities';
import { SeededRNG, DEFAULT_RULESET, applyTravelCommand, applyGatherCommand, applyCombatCommand, applyProductionTick } from './rules';

/*──────────────────────────── In-Memory Kernel State ────────────────────────────*/

let ticks: SimulationTick[] = [];
let commands: Map<string, SimulationCommand> = new Map();
let outboxEvents: OutboxEvent[] = [];
let ruleset: SimulationRuleset = { ...DEFAULT_RULESET };
let nextEventSeq = 0;

/*──────────────────────────── Initialization ────────────────────────────*/

export function initializeKernel(
  initialTicks: SimulationTick[],
  initialCommands: SimulationCommand[],
  initialOutboxEvents: OutboxEvent[],
  initialRuleset: SimulationRuleset,
): void {
  ticks = [...initialTicks];
  commands = new Map(initialCommands.map((c) => [c.command_id, c]));
  outboxEvents = [...initialOutboxEvents];
  ruleset = { ...initialRuleset };
  nextEventSeq = initialOutboxEvents.length;
}

/*──────────────────────────── State Accessors ────────────────────────────*/

export function getCurrentTick(): SimulationTick | null {
  if (ticks.length === 0) return null;
  return ticks[ticks.length - 1];
}

export function getAllTicks(): SimulationTick[] {
  return [...ticks];
}

export function getRuleset(): SimulationRuleset {
  return { ...ruleset };
}

/*──────────────────────────── Command Submission ────────────────────────────*/

export function submitCommand(input: SimulationCommandInput): SimulationCommandResult {
  const existing = commands.get(input.idempotency_key);
  if (existing) {
    return {
      success: existing.status === 'applied',
      command_id: existing.command_id,
      applied_tick_id: existing.applied_tick_id ?? null,
      error: existing.error_message ?? null,
    };
  }

  const currentTick = getCurrentTick();

  switch (input.command_type) {
    case 'travel':
      return applyTravelToKernel(input, rngFromSeed(ruleset.seed));
    case 'gather':
      return applyGatherToKernel(input, rngFromSeed(ruleset.seed));
    case 'combat':
      return applyCombatToKernel(input, rngFromSeed(ruleset.seed));
    case 'production':
      return applyProductionToKernel(input, rngFromSeed(ruleset.seed));
    default:
      return {
        success: false,
        error: `Unknown command type: ${input.command_type}`,
        events: [],
      };
  }
}

function rngFromSeed(seed: number): SeededRNG {
  return new SeededRNG(seed);
}

function applyTravelToKernel(input: SimulationCommandInput, rng: SeededRNG): SimulationCommandResult {
  const { region_id: targetRegionId } = input.payload;

  if (!targetRegionId) {
    return { success: false, error: 'Missing target_region_id', events: [] };
  }

  const currentRegionId = 1013;
  const currentEnergy = 100;
  const edges: { from_region_id: number; to_region_id: number; mode: string }[] = [];
  const countries = new Map<number, { id: number }>();

  const result = applyTravelCommand(
    input,
    ruleset,
    rng,
    currentRegionId,
    targetRegionId,
    currentEnergy,
    edges,
    countries,
  );

  if (!result.success) {
    return { success: false, error: result.error, events: result.events ?? [] };
  }

  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const command: SimulationCommand = {
    command_id: commandId,
    idempotency_key: input.idempotency_key,
    actor_id: 'system',
    command_type: input.command_type,
    payload: input.payload,
    status: 'applied',
    applied_tick_id: getCurrentTick()?.tick_id ?? null,
    error_message: null,
    created_at: new Date().toISOString(),
    applied_at: new Date().toISOString(),
  };

  commands.set(input.idempotency_key, command);

  const events: OutboxEvent[] = (result.events ?? []).map((e, idx) => ({
    ...e,
    event_id: nextEventSeq++,
    tick_id: command.applied_tick_id ?? 0,
    seq: nextEventSeq + idx,
  }));

  outboxEvents.push(...events);

  return {
    success: true,
    command_id: commandId,
    applied_tick_id: command.applied_tick_id,
    events,
  };
}

function applyGatherToKernel(input: SimulationCommandInput, rng: SeededRNG): SimulationCommandResult {
  const { resource_id, energy_cost, experience_reward } = input.payload;

  if (!resource_id) {
    return { success: false, error: 'Missing resource_id', events: [] };
  }

  const result = applyGatherCommand(
    input,
    ruleset,
    rng,
    100,
    energy_cost ?? 10,
    experience_reward ?? 10,
  );

  if (!result.success) {
    return { success: false, error: result.error, events: result.events ?? [] };
  }

  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const command: SimulationCommand = {
    command_id: commandId,
    idempotency_key: input.idempotency_key,
    actor_id: 'system',
    command_type: input.command_type,
    payload: input.payload,
    status: 'applied',
    applied_tick_id: getCurrentTick()?.tick_id ?? null,
    error_message: null,
    created_at: new Date().toISOString(),
    applied_at: new Date().toISOString(),
  };

  commands.set(input.idempotency_key, command);

  const gatheredEvents: OutboxEvent[] = result.events?.map((e, idx) => ({
    ...e,
    event_id: nextEventSeq++,
    tick_id: command.applied_tick_id ?? 0,
    seq: nextEventSeq + idx,
  })) ?? [];

  outboxEvents.push(...gatheredEvents);

  return {
    success: true,
    command_id: commandId,
    applied_tick_id: command.applied_tick_id,
    events: gatheredEvents,
  };
}

function applyCombatToKernel(input: SimulationCommandInput, rng: SeededRNG): SimulationCommandResult {
  const { enemy_template_id } = input.payload;

  if (!enemy_template_id) {
    return { success: false, error: 'Missing enemy_template_id', events: [] };
  }

  const playerHealth = 100;
  const enemyHealth = 50;
  const playerEnergy = 100;

  const result = applyCombatCommand(input, ruleset, rng, playerHealth, enemyHealth, playerEnergy);

  if (!result.success) {
    return { success: false, error: result.error, events: result.events ?? [] };
  }

  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const command: SimulationCommand = {
    command_id: commandId,
    idempotency_key: input.idempotency_key,
    actor_id: 'system',
    command_type: input.command_type,
    payload: input.payload,
    status: 'applied',
    applied_tick_id: getCurrentTick()?.tick_id ?? null,
    error_message: null,
    created_at: new Date().toISOString(),
    applied_at: new Date().toISOString(),
  };

  commands.set(input.idempotency_key, command);

  const combatEvents: OutboxEvent[] = result.events?.map((e, idx) => ({
    ...e,
    event_id: nextEventSeq++,
    tick_id: command.applied_tick_id ?? 0,
    seq: nextEventSeq + idx,
  })) ?? [];

  outboxEvents.push(...combatEvents);

  return {
    success: true,
    command_id: commandId,
    applied_tick_id: command.applied_tick_id,
    events: combatEvents,
  };
}

function applyProductionToKernel(input: SimulationCommandInput, rng: SeededRNG): SimulationCommandResult {
  const { region_id } = input.payload;

  const { events, newResources } = applyProductionTick(
    ruleset,
    region_id ?? 1013,
    new Map() // player resources
  );

  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const command: SimulationCommand = {
    command_id: commandId,
    idempotency_key: input.idempotency_key,
    actor_id: 'system',
    command_type: input.command_type,
    payload: input.payload,
    status: 'applied',
    applied_tick_id: getCurrentTick()?.tick_id ?? null,
    error_message: null,
    created_at: new Date().toISOString(),
    applied_at: new Date().toISOString(),
  };

  commands.set(input.idempotency_key, command);

  const productionEvents: OutboxEvent[] = events.map((e, idx) => ({
    ...e,
    event_id: nextEventSeq++,
    tick_id: command.applied_tick_id ?? 0,
    seq: nextEventSeq + idx,
  }));

  outboxEvents.push(...productionEvents);

  return {
    success: true,
    command_id: commandId,
    applied_tick_id: command.applied_tick_id,
    events: productionEvents,
  };
}

/*──────────────────────────── Command Lookup ────────────────────────────*/

export function getCommand(idempotencyKey: string): SimulationCommand | null {
  return commands.get(idempotencyKey) ?? null;
}

export function getOutboxEvents(
  tickId?: number,
  limit = 50,
): OutboxEvent[] {
  let filtered = outboxEvents;
  if (tickId !== undefined) {
    filtered = filtered.filter((e) => e.tick_id === tickId);
  }
  return filtered.slice(0, limit);
}

export function markEventsPublished(eventIds: number[]): void {
  for (const id of eventIds) {
    const event = outboxEvents.find((e) => e.event_id === id);
    if (event) {
      event.published = true;
      event.published_at = new Date().toISOString();
    }
  }
}

/*──────────────────────────── Tick Execution ────────────────────────────*/

export function executeSimulationTick(): {
  success: boolean;
  tickId?: number | null;
  error?: string | null;
} {
  try {
    const prevTick = getCurrentTick();
    const newTickId = (prevTick?.tick_id ?? 0) + 1;

    const newTick: SimulationTick = {
      tick_id: newTickId,
      world_id: 'default',
      ruleset_version: ruleset.version,
      seed: ruleset.seed,
      status: 'applied',
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    ticks.push(newTick);

    const { events: productionEvents, newResources } = applyProductionTick(
      ruleset,
      1013,
      new Map(),
    );

    outboxEvents.push(
      ...productionEvents.map((e, idx) => ({
        ...e,
        event_id: nextEventSeq++,
        tick_id: newTickId,
        seq: nextEventSeq + idx,
      }))
    );

    outboxEvents
      .filter((e) => e.tick_id === prevTick?.tick_id && !e.published)
      .forEach((e) => {
        e.published = true;
        e.published_at = new Date().toISOString();
      });

    return {
      success: true,
      tickId: newTickId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}