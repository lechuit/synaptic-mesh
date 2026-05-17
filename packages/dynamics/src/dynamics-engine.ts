import type {
  ConflictId,
  ConflictRecord,
  ConflictRegistry,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  MemoryStatus,
  MemoryStore,
  Scope,
  StatusTransitionResult,
  Visibility,
} from '@aletheia/core';
import type { DynamicsPolicy } from './policy.js';

export interface DynamicsEvidence {
  readonly sourceConsistentRecalls: number;
  readonly lastUsedAt?: IsoTimestamp;
  readonly sourceConsistentSince?: IsoTimestamp;
}

export interface DynamicsEvidenceContext {
  readonly now: IsoTimestamp;
  readonly scope: Scope;
  readonly permittedVisibilities: readonly Visibility[];
}

export interface DynamicsEvidenceProvider {
  /**
   * Return explicit promotion evidence for one atom at a lifecycle instant.
   *
   * @remarks
   * Evidence is not model confidence. Implementations should derive these
   * values from auditable host signals such as repeated source-consistent
   * recalls or operator-confirmed evidence.
   */
  evidenceFor(atom: MemoryAtom, context: DynamicsEvidenceContext): Promise<DynamicsEvidence>;
}

export interface DynamicsEngineStores {
  readonly memoryStore: MemoryStore;
  readonly conflictRegistry: ConflictRegistry;
}

export interface DynamicsEngineOptions {
  readonly stores: DynamicsEngineStores;
  readonly policy: DynamicsPolicy;
  readonly evidenceProvider?: DynamicsEvidenceProvider;
}

export interface DynamicsTickInput {
  readonly now: IsoTimestamp;
  readonly scope: Scope;
  readonly permittedVisibilities: readonly Visibility[];
  readonly applyTransitions?: boolean;
  readonly statuses?: readonly MemoryStatus[];
  readonly limit?: number;
}

export type DynamicsTickOutcome = 'ok' | 'fetch_abstain';

export type DynamicsDecisionOutcome = 'applied' | 'planned' | 'rejected' | 'skipped';

export type DynamicsDecisionReason =
  | 'expired'
  | 'insufficient_promotion_evidence'
  | 'invalid_clock'
  | 'not_due'
  | 'not_yet_valid'
  | 'promotion_evidence_satisfied'
  | 'stale_by_policy'
  | 'status_not_processable'
  | 'unresolved_conflict';

export interface DynamicsDecision {
  readonly memoryId: MemoryId;
  readonly fromStatus: MemoryStatus;
  readonly outcome: DynamicsDecisionOutcome;
  readonly reason: DynamicsDecisionReason;
  readonly recommendedStatus?: MemoryStatus;
  readonly conflicts: readonly ConflictId[];
  readonly transition?: StatusTransitionResult;
}

export interface DynamicsTickResult {
  readonly outcome: DynamicsTickOutcome;
  readonly now: IsoTimestamp;
  readonly scope: Scope;
  readonly reasons: readonly string[];
  readonly decisions: readonly DynamicsDecision[];
  readonly appliedCount: number;
  readonly plannedCount: number;
  readonly rejectedCount: number;
  readonly skippedCount: number;
}

const DEFAULT_STATUSES: readonly MemoryStatus[] = ['candidate', 'verified', 'trusted'];

const NO_EVIDENCE_PROVIDER: DynamicsEvidenceProvider = {
  async evidenceFor(): Promise<DynamicsEvidence> {
    return { sourceConsistentRecalls: 0 };
  },
};

export class DynamicsEngine {
  private readonly memoryStore: MemoryStore;
  private readonly conflictRegistry: ConflictRegistry;
  private readonly policy: DynamicsPolicy;
  private readonly evidenceProvider: DynamicsEvidenceProvider;

  /**
   * Create a deterministic lifecycle engine over explicit stores and policy.
   *
   * @remarks
   * The engine owns no scheduler and starts no background work. Hosts trigger
   * lifecycle passes by calling `tick()` or by wrapping it with `SleepCycleRunner`.
   */
  constructor(options: DynamicsEngineOptions) {
    this.memoryStore = options.stores.memoryStore;
    this.conflictRegistry = options.stores.conflictRegistry;
    this.policy = options.policy;
    this.evidenceProvider = options.evidenceProvider ?? NO_EVIDENCE_PROVIDER;
  }

  /**
   * Plan or apply one lifecycle pass over visible atoms in a scope.
   *
   * @remarks
   * The implementation first validates the logical clock and permitted
   * visibilities. It then queries by permission/scope/status but intentionally
   * does not pass `validAt`, because expired or malformed validity windows must
   * remain visible to the lifecycle pass so they can be deprecated. Mutations
   * happen only when `applyTransitions` is true, and only via
   * `MemoryStore.transitionStatus()`.
   */
  async tick(input: DynamicsTickInput): Promise<DynamicsTickResult> {
    const nowMs = timestampMs(input.now);
    if (nowMs === null) {
      return this.emptyResult(input, 'invalid_now');
    }
    if (input.permittedVisibilities.length === 0) {
      return this.emptyResult(input, 'no_permitted_visibilities');
    }

    // Dynamics is a lifecycle scan: it must be able to see expired or corrupt
    // validity windows in order to deprecate them. Permission/scope/status still
    // happen in the store before any semantic decision; validity is evaluated
    // deterministically below against `input.now`.
    const atoms = await this.memoryStore.query({
      scope: input.scope,
      permittedVisibilities: input.permittedVisibilities,
      statuses: input.statuses ?? DEFAULT_STATUSES,
      ...(input.limit !== undefined ? { limit: input.limit } : {}),
    });

    const limitedAtoms =
      this.policy.maxAtomsPerTick !== undefined
        ? atoms.slice(0, this.policy.maxAtomsPerTick)
        : atoms;

    const decisions: DynamicsDecision[] = [];
    for (const atom of limitedAtoms) {
      decisions.push(await this.evaluateAtom(atom, input, nowMs));
    }

    return summarize(input, 'ok', [], decisions);
  }

  private emptyResult(input: DynamicsTickInput, reason: string): DynamicsTickResult {
    return summarize(input, 'fetch_abstain', [reason], []);
  }

  private async evaluateAtom(
    atom: MemoryAtom,
    input: DynamicsTickInput,
    nowMs: number,
  ): Promise<DynamicsDecision> {
    if (atom.status !== 'candidate' && atom.status !== 'verified' && atom.status !== 'trusted') {
      return skipped(atom, 'status_not_processable', []);
    }

    const validFromMs = timestampMs(atom.validFrom);
    if (validFromMs === null) {
      return this.transition(
        atom,
        'deprecated',
        'invalid_clock',
        [],
        input.now,
        input.applyTransitions === true,
      );
    }
    if (validFromMs > nowMs) {
      return skipped(atom, 'not_yet_valid', []);
    }

    if (atom.validUntil !== null) {
      const validUntilMs = timestampMs(atom.validUntil);
      if (validUntilMs === null) {
        return this.transition(
          atom,
          'deprecated',
          'invalid_clock',
          [],
          input.now,
          input.applyTransitions === true,
        );
      }
      if (validUntilMs < nowMs) {
        return this.transition(
          atom,
          'deprecated',
          'expired',
          [],
          input.now,
          input.applyTransitions === true,
        );
      }
    }

    const unresolvedConflicts = await this.unresolvedConflicts(atom, input);
    if (unresolvedConflicts.length > 0) {
      if (atom.status === 'candidate') {
        return skipped(atom, 'unresolved_conflict', conflictIds(unresolvedConflicts));
      }
      return this.transition(
        atom,
        'deprecated',
        'unresolved_conflict',
        conflictIds(unresolvedConflicts),
        input.now,
        input.applyTransitions === true,
      );
    }

    const evidence = await this.evidenceProvider.evidenceFor(atom, {
      now: input.now,
      scope: input.scope,
      permittedVisibilities: input.permittedVisibilities,
    });

    if (atom.status === 'candidate') {
      if (this.canPromoteCandidate(atom, evidence)) {
        return this.transition(
          atom,
          'verified',
          'promotion_evidence_satisfied',
          [],
          input.now,
          input.applyTransitions === true,
        );
      }

      const staleDecision = this.staleDecision(atom, nowMs, evidence);
      if (staleDecision !== null) {
        return this.transition(
          atom,
          'deprecated',
          staleDecision,
          [],
          input.now,
          input.applyTransitions === true,
        );
      }

      return skipped(atom, 'insufficient_promotion_evidence', []);
    }

    const staleDecision = this.staleDecision(atom, nowMs, evidence);
    if (staleDecision !== null) {
      return this.transition(
        atom,
        'deprecated',
        staleDecision,
        [],
        input.now,
        input.applyTransitions === true,
      );
    }

    return skipped(atom, 'not_due', []);
  }

  private async unresolvedConflicts(
    atom: MemoryAtom,
    input: DynamicsTickInput,
  ): Promise<readonly ConflictRecord[]> {
    return this.conflictRegistry.query({
      touchingMemoryIds: [atom.memoryId],
      statuses: ['unresolved', 'requires_human'],
      scope: input.scope,
      permittedVisibilities: input.permittedVisibilities,
    });
  }

  private staleDecision(
    atom: MemoryAtom,
    nowMs: number,
    evidence: DynamicsEvidence,
  ): 'stale_by_policy' | null {
    const anchorMs = latestAnchorMs(atom, evidence);
    if (anchorMs === null) {
      return 'stale_by_policy';
    }

    const ageMs = nowMs - anchorMs;
    if (ageMs < 0) return null;

    const threshold = statusThresholdMs(atom.status, this.policy);
    if (threshold === null) return null;
    return ageMs > threshold ? 'stale_by_policy' : null;
  }

  private canPromoteCandidate(atom: MemoryAtom, evidence: DynamicsEvidence): boolean {
    // These scores are gate-produced metadata thresholds. They are never
    // authority by themselves; explicit source-consistent recall evidence is
    // required before any candidate can become verified.
    return (
      evidence.sourceConsistentRecalls >= this.policy.promotion.minSourceConsistentRecalls &&
      atom.scores.evidence >= this.policy.promotion.minEvidenceScore &&
      atom.scores.authority >= this.policy.promotion.minAuthorityScore &&
      atom.scores.stability >= this.policy.promotion.minStabilityScore
    );
  }

  private async transition(
    atom: MemoryAtom,
    recommendedStatus: MemoryStatus,
    reason: DynamicsDecisionReason,
    conflicts: readonly ConflictId[],
    at: IsoTimestamp,
    apply: boolean,
  ): Promise<DynamicsDecision> {
    if (!apply) {
      return {
        memoryId: atom.memoryId,
        fromStatus: atom.status,
        outcome: 'planned',
        reason,
        recommendedStatus,
        conflicts,
      };
    }

    const transition = await this.memoryStore.transitionStatus(
      atom.memoryId,
      recommendedStatus,
      {
        actor: this.policy.actor,
        rationale: `phase2:${reason}`,
        ...(conflicts[0] !== undefined ? { conflictId: conflicts[0] } : {}),
      },
      { at },
    );

    return {
      memoryId: atom.memoryId,
      fromStatus: atom.status,
      outcome: transition.kind === 'applied' ? 'applied' : 'rejected',
      reason,
      recommendedStatus,
      conflicts,
      transition,
    };
  }
}

function statusThresholdMs(status: MemoryStatus, policy: DynamicsPolicy): number | null {
  if (status === 'candidate') return policy.decay.candidateAfterMs;
  if (status === 'verified') return policy.decay.verifiedAfterMs;
  if (status === 'trusted') return policy.decay.trustedAfterMs;
  return null;
}

function timestampMs(timestamp: IsoTimestamp): number | null {
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? null : parsed;
}

function latestAnchorMs(atom: MemoryAtom, evidence: DynamicsEvidence): number | null {
  const anchors = [atom.validFrom, atom.lastConfirmedAt, evidence.lastUsedAt].filter(
    (timestamp): timestamp is IsoTimestamp => timestamp !== null && timestamp !== undefined,
  );
  const parsed = anchors.map(timestampMs);
  if (parsed.some((value) => value === null)) return null;
  return Math.max(...(parsed as number[]));
}

function skipped(
  atom: MemoryAtom,
  reason: DynamicsDecisionReason,
  conflicts: readonly ConflictId[],
): DynamicsDecision {
  return {
    memoryId: atom.memoryId,
    fromStatus: atom.status,
    outcome: 'skipped',
    reason,
    conflicts,
  };
}

function conflictIds(conflicts: readonly ConflictRecord[]): readonly ConflictId[] {
  return conflicts.map((conflict) => conflict.conflictId);
}

function summarize(
  input: DynamicsTickInput,
  outcome: DynamicsTickOutcome,
  reasons: readonly string[],
  decisions: readonly DynamicsDecision[],
): DynamicsTickResult {
  return {
    outcome,
    now: input.now,
    scope: input.scope,
    reasons,
    decisions,
    appliedCount: decisions.filter((decision) => decision.outcome === 'applied').length,
    plannedCount: decisions.filter((decision) => decision.outcome === 'planned').length,
    rejectedCount: decisions.filter((decision) => decision.outcome === 'rejected').length,
    skippedCount: decisions.filter((decision) => decision.outcome === 'skipped').length,
  };
}
