import {
  type AgentId,
  type ConflictId,
  type ConflictRecord,
  type ConflictRegistry,
  type ConflictStatus,
  type EventId,
  type IsoTimestamp,
  type MemoryAtom,
  type MemoryId,
  type MemoryQuery,
  type MemoryStatus,
  type MemoryStore,
  type ResolveReason,
  type Scope,
  type StatusTransitionOptions,
  type StatusTransitionReason,
  type StatusTransitionResult,
  type Visibility,
  isAllowedTransition,
  scopeKey,
  visibilityKey,
} from '@aletheia-labs/core';
import { describe, expect, it } from 'vitest';
import { DynamicsEngine, type DynamicsEvidenceProvider } from './dynamics-engine.js';
import { createDynamicsPolicy } from './policy.js';

const ACTOR = 'agent-dynamics' as AgentId;
const NOW = '2026-05-17T00:00:00Z' as IsoTimestamp;
const SCOPE: Scope = { kind: 'project', projectId: 'aletheia' };
const VISIBILITY: Visibility = { kind: 'private:user' };

describe('DynamicsEngine', () => {
  it('fails closed before store queries when no visibility is permitted', async () => {
    const memoryStore = new FakeMemoryStore([atom({ memoryId: 'mem-a' as MemoryId })]);
    const engine = engineFor({ memoryStore });

    const result = await engine.tick({
      now: NOW,
      scope: SCOPE,
      permittedVisibilities: [],
      applyTransitions: true,
    });

    expect(result.outcome).toBe('fetch_abstain');
    expect(result.reasons).toEqual(['no_permitted_visibilities']);
    expect(result.decisions).toEqual([]);
    expect(memoryStore.queryCalls).toBe(0);
  });

  it('deprecates stale candidates through audited status transitions', async () => {
    const candidate = atom({
      memoryId: 'mem-stale-candidate' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([candidate]);
    const engine = engineFor({
      memoryStore,
      policy: createDynamicsPolicy(ACTOR, {
        decay: { candidateAfterMs: dayMs(3) },
      }),
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.appliedCount).toBe(1);
    expect(result.decisions[0]).toMatchObject({
      memoryId: candidate.memoryId,
      outcome: 'applied',
      reason: 'stale_by_policy',
      recommendedStatus: 'deprecated',
    });
    expect(memoryStore.atom(candidate.memoryId)?.status).toBe('deprecated');

    const history = await memoryStore.statusHistory(candidate.memoryId);
    expect(history.at(-1)?.reason).toMatchObject({
      actor: ACTOR,
      rationale: 'phase2:stale_by_policy',
    });
  });

  it('does not pass validAt so expired or corrupt windows can be decommissioned', async () => {
    const memoryStore = new FakeMemoryStore([atom({ memoryId: 'mem-lifecycle-scan' as MemoryId })]);
    const engine = engineFor({ memoryStore });

    await engine.tick(tickInput());

    expect(memoryStore.lastQuery?.validAt).toBeUndefined();
  });

  it('does not mutate stale memories in dry-run mode', async () => {
    const candidate = atom({
      memoryId: 'mem-dry-run' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([candidate]);
    const engine = engineFor({
      memoryStore,
      policy: createDynamicsPolicy(ACTOR, {
        decay: { candidateAfterMs: dayMs(3) },
      }),
    });

    const result = await engine.tick(tickInput());

    expect(result.plannedCount).toBe(1);
    expect(result.appliedCount).toBe(0);
    expect(result.decisions[0]).toMatchObject({
      outcome: 'planned',
      recommendedStatus: 'deprecated',
    });
    expect(memoryStore.atom(candidate.memoryId)?.status).toBe('candidate');
  });

  it('fails closed on invalid clocks by planning deprecation', async () => {
    const invalid = atom({
      memoryId: 'mem-invalid-clock' as MemoryId,
      status: 'verified',
      validFrom: 'not-a-date' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([invalid]);
    const engine = engineFor({ memoryStore });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.decisions[0]).toMatchObject({
      memoryId: invalid.memoryId,
      outcome: 'applied',
      reason: 'invalid_clock',
      recommendedStatus: 'deprecated',
    });
    expect(memoryStore.atom(invalid.memoryId)?.status).toBe('deprecated');
  });

  it('fails closed on invalid validUntil by planning deprecation', async () => {
    const invalid = atom({
      memoryId: 'mem-invalid-valid-until' as MemoryId,
      status: 'trusted',
      validUntil: 'not-a-date' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([invalid]);
    const engine = engineFor({ memoryStore });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.decisions[0]).toMatchObject({
      memoryId: invalid.memoryId,
      outcome: 'applied',
      reason: 'invalid_clock',
      recommendedStatus: 'deprecated',
    });
    expect(memoryStore.atom(invalid.memoryId)?.status).toBe('deprecated');
  });

  it('deprecates expired atoms instead of filtering them out of the lifecycle scan', async () => {
    const expired = atom({
      memoryId: 'mem-expired' as MemoryId,
      status: 'verified',
      validUntil: '2026-05-10T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([expired]);
    const engine = engineFor({ memoryStore });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.decisions[0]).toMatchObject({
      memoryId: expired.memoryId,
      outcome: 'applied',
      reason: 'expired',
      recommendedStatus: 'deprecated',
    });
    expect(memoryStore.atom(expired.memoryId)?.status).toBe('deprecated');
  });

  it('promotes candidates only from explicit evidence and authority scores', async () => {
    const lowEvidenceCandidate = atom({
      memoryId: 'mem-low-evidence' as MemoryId,
      status: 'candidate',
      scores: {
        confidence: 1,
        consensus: 1,
        evidence: 0.1,
        authority: 0.1,
        freshness: 1,
        stability: 0.1,
      },
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const promotableCandidate = atom({
      memoryId: 'mem-promotable' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([lowEvidenceCandidate, promotableCandidate]);
    const evidenceProvider = evidenceProviderFor(3);
    const engine = engineFor({ memoryStore, evidenceProvider });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(memoryStore.atom(lowEvidenceCandidate.memoryId)?.status).toBe('candidate');
    expect(memoryStore.atom(promotableCandidate.memoryId)?.status).toBe('verified');
    expect(result.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memoryId: lowEvidenceCandidate.memoryId,
          outcome: 'skipped',
          reason: 'insufficient_promotion_evidence',
        }),
        expect.objectContaining({
          memoryId: promotableCandidate.memoryId,
          outcome: 'applied',
          reason: 'promotion_evidence_satisfied',
          recommendedStatus: 'verified',
        }),
      ]),
    );
  });

  it('promotes recall-consistent candidates before stale candidate deprecation', async () => {
    const candidate = atom({
      memoryId: 'mem-old-but-recalled' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([candidate]);
    const engine = engineFor({
      memoryStore,
      policy: createDynamicsPolicy(ACTOR, {
        decay: { candidateAfterMs: dayMs(3) },
        promotion: { minSourceConsistentRecalls: 2 },
      }),
      evidenceProvider: evidenceProviderFor(2),
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(memoryStore.atom(candidate.memoryId)?.status).toBe('verified');
    expect(result.decisions[0]).toMatchObject({
      memoryId: candidate.memoryId,
      outcome: 'applied',
      reason: 'promotion_evidence_satisfied',
      recommendedStatus: 'verified',
    });
  });

  it('uses recent recall evidence when deciding verified staleness', async () => {
    const verified = atom({
      memoryId: 'mem-recently-used' as MemoryId,
      status: 'verified',
      lastConfirmedAt: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([verified]);
    const engine = engineFor({
      memoryStore,
      policy: createDynamicsPolicy(ACTOR, {
        decay: { verifiedAfterMs: dayMs(3) },
      }),
      evidenceProvider: {
        async evidenceFor() {
          return {
            sourceConsistentRecalls: 0,
            lastUsedAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
          };
        },
      },
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.decisions[0]).toMatchObject({
      memoryId: verified.memoryId,
      outcome: 'skipped',
      reason: 'not_due',
    });
    expect(memoryStore.atom(verified.memoryId)?.status).toBe('verified');
  });

  it('lets trusted memories decay slower than verified memories', async () => {
    const verified = atom({
      memoryId: 'mem-verified-old' as MemoryId,
      status: 'verified',
      lastConfirmedAt: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const trusted = atom({
      memoryId: 'mem-trusted-old' as MemoryId,
      status: 'trusted',
      lastConfirmedAt: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([verified, trusted]);
    const engine = engineFor({
      memoryStore,
      policy: createDynamicsPolicy(ACTOR, {
        decay: {
          candidateAfterMs: dayMs(99),
          verifiedAfterMs: dayMs(7),
          trustedAfterMs: dayMs(30),
        },
      }),
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(memoryStore.atom(verified.memoryId)?.status).toBe('deprecated');
    expect(memoryStore.atom(trusted.memoryId)?.status).toBe('trusted');
    expect(result.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memoryId: verified.memoryId,
          outcome: 'applied',
          reason: 'stale_by_policy',
        }),
        expect.objectContaining({
          memoryId: trusted.memoryId,
          outcome: 'skipped',
          reason: 'not_due',
        }),
      ]),
    );
  });

  it('returns no decisions for atoms outside the requested scope', async () => {
    const outside = atom({
      memoryId: 'mem-other-scope' as MemoryId,
      scope: { kind: 'project', projectId: 'other' },
    });
    const memoryStore = new FakeMemoryStore([outside]);
    const engine = engineFor({ memoryStore, evidenceProvider: evidenceProviderFor(99) });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.decisions).toEqual([]);
    expect(memoryStore.atom(outside.memoryId)?.status).toBe('candidate');
  });

  it('returns no decisions for atoms outside permitted visibility', async () => {
    const hidden = atom({
      memoryId: 'mem-hidden' as MemoryId,
      visibility: { kind: 'team', name: 'infra' },
    });
    const memoryStore = new FakeMemoryStore([hidden]);
    const engine = engineFor({ memoryStore, evidenceProvider: evidenceProviderFor(99) });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.decisions).toEqual([]);
    expect(memoryStore.atom(hidden.memoryId)?.status).toBe('candidate');
  });

  it('blocks candidate promotion on unresolved conflicts and deprecates verified claims', async () => {
    const candidate = atom({
      memoryId: 'mem-conflicted-candidate' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const verified = atom({
      memoryId: 'mem-conflicted-verified' as MemoryId,
      status: 'verified',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([candidate, verified]);
    const conflict = conflictFor([candidate.memoryId, verified.memoryId]);
    const engine = engineFor({
      memoryStore,
      conflictRegistry: new FakeConflictRegistry([conflict]),
      evidenceProvider: evidenceProviderFor(99),
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(memoryStore.atom(candidate.memoryId)?.status).toBe('candidate');
    expect(memoryStore.atom(verified.memoryId)?.status).toBe('deprecated');
    expect(result.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memoryId: candidate.memoryId,
          outcome: 'skipped',
          reason: 'unresolved_conflict',
          conflicts: [conflict.conflictId],
        }),
        expect.objectContaining({
          memoryId: verified.memoryId,
          outcome: 'applied',
          reason: 'unresolved_conflict',
          recommendedStatus: 'deprecated',
          conflicts: [conflict.conflictId],
        }),
      ]),
    );

    const history = await memoryStore.statusHistory(verified.memoryId);
    expect(history.at(-1)?.reason.conflictId).toBe(conflict.conflictId);
  });

  it('treats requires-human conflicts as lifecycle blockers', async () => {
    const candidate = atom({
      memoryId: 'mem-human-conflicted-candidate' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const verified = atom({
      memoryId: 'mem-human-conflicted-verified' as MemoryId,
      status: 'verified',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([candidate, verified]);
    const conflict = conflictFor([candidate.memoryId, verified.memoryId], {
      conflictId: 'conflict-human-required' as ConflictId,
      status: 'requires_human',
      decisionPolicy: 'ask_human',
    });
    const engine = engineFor({
      memoryStore,
      conflictRegistry: new FakeConflictRegistry([conflict]),
      evidenceProvider: evidenceProviderFor(99),
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(memoryStore.atom(candidate.memoryId)?.status).toBe('candidate');
    expect(memoryStore.atom(verified.memoryId)?.status).toBe('deprecated');
    expect(result.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memoryId: candidate.memoryId,
          outcome: 'skipped',
          reason: 'unresolved_conflict',
          conflicts: [conflict.conflictId],
        }),
        expect.objectContaining({
          memoryId: verified.memoryId,
          outcome: 'applied',
          reason: 'unresolved_conflict',
          recommendedStatus: 'deprecated',
          conflicts: [conflict.conflictId],
        }),
      ]),
    );
  });

  it('reports transition rejections without pretending the tick applied them', async () => {
    const candidate = atom({
      memoryId: 'mem-reject-transition' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const memoryStore = new FakeMemoryStore([candidate], { rejectTransitions: true });
    const engine = engineFor({
      memoryStore,
      policy: createDynamicsPolicy(ACTOR, {
        decay: { candidateAfterMs: dayMs(3) },
      }),
    });

    const result = await engine.tick(tickInput({ applyTransitions: true }));

    expect(result.rejectedCount).toBe(1);
    expect(result.appliedCount).toBe(0);
    expect(result.decisions[0]).toMatchObject({
      outcome: 'rejected',
      reason: 'stale_by_policy',
      recommendedStatus: 'deprecated',
      transition: { kind: 'rejected', reason: 'forced rejection' },
    });
    expect(memoryStore.atom(candidate.memoryId)?.status).toBe('candidate');
  });

  it('skips sealed and human-required atoms even if explicitly requested', async () => {
    const sealed = atom({ memoryId: 'mem-sealed' as MemoryId, status: 'sealed' });
    const humanRequired = atom({
      memoryId: 'mem-human-required' as MemoryId,
      status: 'human_required',
    });
    const memoryStore = new FakeMemoryStore([sealed, humanRequired]);
    const engine = engineFor({ memoryStore });

    const result = await engine.tick(
      tickInput({
        statuses: ['sealed', 'human_required'],
        applyTransitions: true,
      }),
    );

    expect(result.appliedCount).toBe(0);
    expect(result.decisions).toHaveLength(2);
    expect(result.decisions.every((decision) => decision.reason === 'status_not_processable')).toBe(
      true,
    );
    expect(memoryStore.atom(sealed.memoryId)?.status).toBe('sealed');
    expect(memoryStore.atom(humanRequired.memoryId)?.status).toBe('human_required');
  });

  it('returns deterministic plans for fixed time, policy, and evidence', async () => {
    const firstStore = new FakeMemoryStore([
      atom({ memoryId: 'mem-a' as MemoryId, status: 'verified' }),
      atom({ memoryId: 'mem-b' as MemoryId, status: 'candidate' }),
    ]);
    const secondStore = new FakeMemoryStore([
      atom({ memoryId: 'mem-a' as MemoryId, status: 'verified' }),
      atom({ memoryId: 'mem-b' as MemoryId, status: 'candidate' }),
    ]);

    const first = await engineFor({ memoryStore: firstStore }).tick(tickInput());
    const second = await engineFor({ memoryStore: secondStore }).tick(tickInput());

    expect(first).toEqual(second);
  });
});

function engineFor(options: {
  memoryStore?: MemoryStore;
  conflictRegistry?: ConflictRegistry;
  policy?: ReturnType<typeof createDynamicsPolicy>;
  evidenceProvider?: DynamicsEvidenceProvider;
}): DynamicsEngine {
  return new DynamicsEngine({
    stores: {
      memoryStore: options.memoryStore ?? new FakeMemoryStore([]),
      conflictRegistry: options.conflictRegistry ?? new FakeConflictRegistry([]),
    },
    policy: options.policy ?? createDynamicsPolicy(ACTOR),
    ...(options.evidenceProvider !== undefined
      ? { evidenceProvider: options.evidenceProvider }
      : {}),
  });
}

function tickInput(
  overrides: Partial<{
    applyTransitions: boolean;
    statuses: readonly MemoryStatus[];
  }> = {},
) {
  return {
    now: NOW,
    scope: SCOPE,
    permittedVisibilities: [VISIBILITY],
    ...overrides,
  };
}

function evidenceProviderFor(sourceConsistentRecalls: number): DynamicsEvidenceProvider {
  return {
    async evidenceFor() {
      return { sourceConsistentRecalls };
    },
  };
}

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-default' as MemoryId,
    memoryType: 'claim',
    content: 'Aletheia should distrust stale memory.',
    sourceAgentId: 'agent-writer' as AgentId,
    sourceEventIds: ['evt-1' as EventId],
    sourceMemoryIds: [],
    scope: SCOPE,
    visibility: VISIBILITY,
    status: 'candidate',
    scores: {
      confidence: 0.2,
      evidence: 0.9,
      authority: 0.8,
      freshness: 0.9,
      stability: 0.8,
      consensus: 0.2,
    },
    validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...overrides,
  };
}

function conflictFor(
  memoryIds: readonly MemoryId[],
  overrides: Partial<ConflictRecord> = {},
): ConflictRecord {
  return {
    conflictId: 'conflict-1' as ConflictId,
    topic: 'deployment policy',
    scope: SCOPE,
    claims: memoryIds.map((memoryId, index) => ({
      memoryId,
      value: `claim-${index}`,
      authority: 0.8,
      freshness: 'current',
    })),
    status: 'unresolved',
    decisionPolicy: 'surface_conflict',
    recordedAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
    resolvedAt: null,
    ...overrides,
  };
}

function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

class FakeMemoryStore implements MemoryStore {
  queryCalls = 0;
  lastQuery: MemoryQuery | null = null;
  private readonly atoms = new Map<MemoryId, MemoryAtom>();
  private readonly histories = new Map<
    MemoryId,
    {
      at: IsoTimestamp;
      fromStatus: MemoryStatus | null;
      toStatus: MemoryStatus;
      reason: StatusTransitionReason;
    }[]
  >();

  constructor(
    atoms: readonly MemoryAtom[],
    private readonly options: {
      readonly rejectTransitions?: boolean;
    } = {},
  ) {
    for (const atomValue of atoms) {
      this.atoms.set(atomValue.memoryId, atomValue);
      this.histories.set(atomValue.memoryId, [
        {
          at: atomValue.validFrom,
          fromStatus: null,
          toStatus: atomValue.status,
          reason: { actor: atomValue.sourceAgentId, rationale: 'initial insertion' },
        },
      ]);
    }
  }

  atom(memoryId: MemoryId): MemoryAtom | undefined {
    return this.atoms.get(memoryId);
  }

  async insert(atomValue: MemoryAtom): Promise<MemoryAtom> {
    if (this.atoms.has(atomValue.memoryId)) {
      throw new Error('duplicate memory_id');
    }
    this.atoms.set(atomValue.memoryId, atomValue);
    this.histories.set(atomValue.memoryId, [
      {
        at: atomValue.validFrom,
        fromStatus: null,
        toStatus: atomValue.status,
        reason: { actor: atomValue.sourceAgentId, rationale: 'initial insertion' },
      },
    ]);
    return atomValue;
  }

  async get(
    memoryId: MemoryId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<MemoryAtom | null> {
    const atomValue = this.atoms.get(memoryId);
    if (atomValue === undefined) return null;
    const permitted = new Set(permittedVisibilities.map(visibilityKey));
    return permitted.has(visibilityKey(atomValue.visibility)) ? atomValue : null;
  }

  async query(filter: MemoryQuery): Promise<readonly MemoryAtom[]> {
    this.queryCalls += 1;
    this.lastQuery = filter;
    if (filter.permittedVisibilities.length === 0) return [];

    const permitted = new Set(filter.permittedVisibilities.map(visibilityKey));
    let result = [...this.atoms.values()].filter((atomValue) =>
      permitted.has(visibilityKey(atomValue.visibility)),
    );

    if (filter.statuses !== undefined && filter.statuses.length > 0) {
      result = result.filter((atomValue) => filter.statuses?.includes(atomValue.status) ?? false);
    }
    if (filter.scope !== undefined) {
      const targetScope = scopeKey(filter.scope);
      result = result.filter((atomValue) => scopeKey(atomValue.scope) === targetScope);
    }
    if (filter.validAt !== undefined) {
      result = result.filter(
        (atomValue) =>
          atomValue.validFrom <= filter.validAt &&
          (atomValue.validUntil === null || atomValue.validUntil >= filter.validAt),
      );
    }

    result.sort((left, right) => {
      const byTime = right.validFrom.localeCompare(left.validFrom);
      return byTime !== 0 ? byTime : left.memoryId.localeCompare(right.memoryId);
    });

    if (filter.limit !== undefined) {
      result = result.slice(0, Math.floor(filter.limit));
    }
    return result;
  }

  async transitionStatus(
    memoryId: MemoryId,
    nextStatus: MemoryStatus,
    reason: StatusTransitionReason,
    options?: StatusTransitionOptions,
  ): Promise<StatusTransitionResult> {
    if (this.options.rejectTransitions === true) {
      return { kind: 'rejected', reason: 'forced rejection' };
    }

    const atomValue = this.atoms.get(memoryId);
    if (atomValue === undefined) {
      return { kind: 'rejected', reason: `memory_id "${memoryId}" not found` };
    }
    if (atomValue.status === nextStatus) {
      return { kind: 'rejected', reason: `already in status "${atomValue.status}"` };
    }
    if (!isAllowedTransition(atomValue.status, nextStatus)) {
      return {
        kind: 'rejected',
        reason: `transition not allowed: ${atomValue.status} -> ${nextStatus}`,
      };
    }

    const updated: MemoryAtom = { ...atomValue, status: nextStatus };
    this.atoms.set(memoryId, updated);
    const history = this.histories.get(memoryId) ?? [];
    history.push({
      at: options?.at ?? NOW,
      fromStatus: atomValue.status,
      toStatus: nextStatus,
      reason,
    });
    this.histories.set(memoryId, history);
    return { kind: 'applied', atom: updated };
  }

  async statusHistory(memoryId: MemoryId): Promise<
    readonly {
      at: IsoTimestamp;
      fromStatus: MemoryStatus | null;
      toStatus: MemoryStatus;
      reason: StatusTransitionReason;
    }[]
  > {
    return this.histories.get(memoryId) ?? [];
  }
}

class FakeConflictRegistry implements ConflictRegistry {
  constructor(private readonly conflicts: ConflictRecord[]) {}

  async record(conflict: ConflictRecord): Promise<ConflictRecord> {
    this.conflicts.push(conflict);
    return conflict;
  }

  async get(
    conflictId: ConflictId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<ConflictRecord | null> {
    if (permittedVisibilities.length === 0) return null;
    return this.conflicts.find((conflict) => conflict.conflictId === conflictId) ?? null;
  }

  async query(filter: {
    touchingMemoryIds?: readonly MemoryId[];
    statuses?: readonly ConflictStatus[];
    scope?: Scope;
    permittedVisibilities: readonly Visibility[];
  }): Promise<readonly ConflictRecord[]> {
    if (filter.permittedVisibilities.length === 0) return [];

    let result = [...this.conflicts];
    if (filter.statuses !== undefined && filter.statuses.length > 0) {
      result = result.filter((conflict) => filter.statuses?.includes(conflict.status) ?? false);
    }
    if (filter.scope !== undefined) {
      const targetScope = scopeKey(filter.scope);
      result = result.filter((conflict) => scopeKey(conflict.scope) === targetScope);
    }
    if (filter.touchingMemoryIds !== undefined && filter.touchingMemoryIds.length > 0) {
      const targets = new Set(filter.touchingMemoryIds);
      result = result.filter((conflict) =>
        conflict.claims.some((claim) => targets.has(claim.memoryId)),
      );
    }
    return result;
  }

  async resolve(
    conflictId: ConflictId,
    nextStatus: Exclude<ConflictStatus, 'unresolved'>,
    reason: ResolveReason,
  ): Promise<ConflictRecord | null> {
    const index = this.conflicts.findIndex((conflict) => conflict.conflictId === conflictId);
    if (index === -1) return null;

    const current = this.conflicts[index];
    if (current === undefined) return null;

    const updated: ConflictRecord = {
      ...current,
      status: nextStatus,
      resolvedAt: NOW,
    };
    this.conflicts[index] = updated;
    void reason;
    return updated;
  }

  async resolutionHistory(): Promise<readonly []> {
    return [];
  }
}
