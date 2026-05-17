import type { MemoryId } from '@aletheia/core';
import { scopeKey } from '@aletheia/core';
import type { DynamicsDecision, DynamicsTickInput, DynamicsTickResult } from './dynamics-engine.js';

export type SleepCycleMode = 'dry_run' | 'apply';

export interface SleepCycleInput extends DynamicsTickInput {
  readonly cycleId?: string;
}

export interface SleepCycleReport {
  readonly cycleId: string;
  readonly mode: SleepCycleMode;
  readonly now: DynamicsTickResult['now'];
  readonly scope: DynamicsTickResult['scope'];
  readonly scopeKey: string;
  readonly outcome: DynamicsTickResult['outcome'];
  readonly reasons: readonly string[];
  readonly decisions: readonly DynamicsDecision[];
  readonly appliedMemoryIds: readonly MemoryId[];
  readonly plannedMemoryIds: readonly MemoryId[];
  readonly rejectedMemoryIds: readonly MemoryId[];
  readonly skippedMemoryIds: readonly MemoryId[];
  readonly appliedCount: number;
  readonly plannedCount: number;
  readonly rejectedCount: number;
  readonly skippedCount: number;
}

export interface SleepCycleEngine {
  tick(input: DynamicsTickInput): Promise<DynamicsTickResult>;
}

export class SleepCycleRunner {
  constructor(private readonly engine: SleepCycleEngine) {}

  async run(input: SleepCycleInput): Promise<SleepCycleReport> {
    const result = await this.engine.tick(input);
    const cycleId = input.cycleId ?? `sleep:${input.now}:${scopeKey(input.scope)}`;

    return {
      cycleId,
      mode: input.applyTransitions === true ? 'apply' : 'dry_run',
      now: result.now,
      scope: result.scope,
      scopeKey: scopeKey(result.scope),
      outcome: result.outcome,
      reasons: result.reasons,
      decisions: result.decisions,
      appliedMemoryIds: idsFor(result.decisions, 'applied'),
      plannedMemoryIds: idsFor(result.decisions, 'planned'),
      rejectedMemoryIds: idsFor(result.decisions, 'rejected'),
      skippedMemoryIds: idsFor(result.decisions, 'skipped'),
      appliedCount: result.appliedCount,
      plannedCount: result.plannedCount,
      rejectedCount: result.rejectedCount,
      skippedCount: result.skippedCount,
    };
  }
}

function idsFor(
  decisions: readonly DynamicsDecision[],
  outcome: DynamicsDecision['outcome'],
): readonly MemoryId[] {
  return decisions
    .filter((decision) => decision.outcome === outcome)
    .map((decision) => decision.memoryId);
}
