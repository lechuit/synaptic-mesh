import type { MemoryId } from '@aletheia-labs/core';
import { scopeKey } from '@aletheia-labs/core';
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

export interface MultiCycleReport {
  readonly reports: readonly SleepCycleReport[];
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
  /**
   * Run a lifecycle tick for a single explicit cycle input.
   */
  tick(input: DynamicsTickInput): Promise<DynamicsTickResult>;
}

export class SleepCycleRunner {
  /**
   * Wrap a dynamics-compatible engine with report formatting helpers.
   *
   * @remarks
   * The runner is an orchestrator, not a scheduler. It only runs when the host
   * calls `run()` or `runMany()`.
   */
  constructor(private readonly engine: SleepCycleEngine) {}

  /**
   * Run one explicit sleep cycle and return an audit-friendly report.
   *
   * @remarks
   * The report mirrors the underlying `DynamicsEngine.tick()` result while
   * grouping memory IDs by applied/planned/rejected/skipped outcome for logs,
   * dashboards, or tests.
   */
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

  /**
   * Run a host-provided sequence of explicit cycles in order.
   *
   * @remarks
   * This is deterministic orchestration only. It does not retry, schedule,
   * sleep, or watch the store; hosts decide when each cycle input exists.
   */
  async runMany(inputs: readonly SleepCycleInput[]): Promise<MultiCycleReport> {
    const reports: SleepCycleReport[] = [];
    for (const input of inputs) {
      reports.push(await this.run(input));
    }

    return {
      reports,
      appliedMemoryIds: uniqueFlatMap(reports, (report) => report.appliedMemoryIds),
      plannedMemoryIds: uniqueFlatMap(reports, (report) => report.plannedMemoryIds),
      rejectedMemoryIds: uniqueFlatMap(reports, (report) => report.rejectedMemoryIds),
      skippedMemoryIds: uniqueFlatMap(reports, (report) => report.skippedMemoryIds),
      appliedCount: reports.reduce((sum, report) => sum + report.appliedCount, 0),
      plannedCount: reports.reduce((sum, report) => sum + report.plannedCount, 0),
      rejectedCount: reports.reduce((sum, report) => sum + report.rejectedCount, 0),
      skippedCount: reports.reduce((sum, report) => sum + report.skippedCount, 0),
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

function uniqueFlatMap(
  reports: readonly SleepCycleReport[],
  getIds: (report: SleepCycleReport) => readonly MemoryId[],
): readonly MemoryId[] {
  return [...new Set(reports.flatMap((report) => getIds(report)))];
}
