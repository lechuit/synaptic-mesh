import type {
  AgentId,
  EventId,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  MemoryQuery,
  MemoryStatus,
  MemoryStore,
  Scope,
  StatusTransitionReason,
  StatusTransitionResult,
  Visibility,
} from '@aletheia-labs/core';
import { scopeKey, visibilityKey } from '@aletheia-labs/core';
import { describe, expect, it } from 'vitest';
import { LineageTracer } from './lineage.js';

const VISIBILITY: Visibility = { kind: 'private:user' };
const PERMITTED: readonly Visibility[] = [VISIBILITY];

describe('LineageTracer', () => {
  it('reconstructs a supersedes chain from newest to oldest', async () => {
    const oldest = atom({ memoryId: 'mem-a' as MemoryId });
    const middle = atom({
      memoryId: 'mem-b' as MemoryId,
      sourceMemoryIds: [oldest.memoryId],
      links: [{ relation: 'supersedes', targetMemoryId: oldest.memoryId }],
    });
    const newest = atom({
      memoryId: 'mem-c' as MemoryId,
      sourceMemoryIds: [middle.memoryId],
      links: [{ relation: 'supersedes', targetMemoryId: middle.memoryId }],
    });
    const tracer = new LineageTracer({
      memoryStore: new FakeMemoryStore([oldest, middle, newest]),
    });

    const result = await tracer.traceBack({
      memoryId: newest.memoryId,
      permittedVisibilities: PERMITTED,
    });

    expect(result.outcome).toBe('ok');
    expect(result.atoms.map((memory) => memory.memoryId)).toEqual(['mem-c', 'mem-b', 'mem-a']);
  });

  it('fails closed when an ancestor is missing or invisible', async () => {
    const newest = atom({
      memoryId: 'mem-c' as MemoryId,
      links: [{ relation: 'supersedes', targetMemoryId: 'mem-hidden' as MemoryId }],
    });
    const hidden = atom({
      memoryId: 'mem-hidden' as MemoryId,
      visibility: { kind: 'team', name: 'hidden' },
    });
    const tracer = new LineageTracer({
      memoryStore: new FakeMemoryStore([newest, hidden]),
    });

    const result = await tracer.traceBack({
      memoryId: newest.memoryId,
      permittedVisibilities: PERMITTED,
    });

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['memory_missing_or_invisible'],
    });
    expect(result.atoms.map((memory) => memory.memoryId)).toEqual(['mem-c']);
  });

  it('fails closed on cycles', async () => {
    const first = atom({
      memoryId: 'mem-a' as MemoryId,
      links: [{ relation: 'supersedes', targetMemoryId: 'mem-b' as MemoryId }],
    });
    const second = atom({
      memoryId: 'mem-b' as MemoryId,
      links: [{ relation: 'supersedes', targetMemoryId: 'mem-a' as MemoryId }],
    });
    const tracer = new LineageTracer({
      memoryStore: new FakeMemoryStore([first, second]),
    });

    const result = await tracer.traceBack({
      memoryId: first.memoryId,
      permittedVisibilities: PERMITTED,
    });

    expect(result.outcome).toBe('fetch_abstain');
    expect(result.reasons).toEqual(['cycle_detected']);
  });

  it('fails closed when lineage exceeds the caller depth bound', async () => {
    const oldest = atom({ memoryId: 'mem-a' as MemoryId });
    const newest = atom({
      memoryId: 'mem-b' as MemoryId,
      links: [{ relation: 'supersedes', targetMemoryId: oldest.memoryId }],
    });
    const tracer = new LineageTracer({
      memoryStore: new FakeMemoryStore([oldest, newest]),
    });

    const result = await tracer.traceBack({
      memoryId: newest.memoryId,
      permittedVisibilities: PERMITTED,
      maxDepth: 1,
    });

    expect(result.outcome).toBe('fetch_abstain');
    expect(result.reasons).toEqual(['max_depth_exceeded']);
    expect(result.atoms.map((memory) => memory.memoryId)).toEqual(['mem-b']);
  });
});

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-a' as MemoryId,
    memoryType: 'claim',
    content: 'Lineage keeps belief history auditable.',
    sourceAgentId: 'agent-lineage' as AgentId,
    sourceEventIds: ['evt-lineage' as EventId],
    sourceMemoryIds: [],
    scope: { kind: 'project', projectId: 'lineage' },
    visibility: VISIBILITY,
    status: 'verified',
    scores: {
      confidence: 0.3,
      evidence: 0.8,
      authority: 0.6,
      freshness: 0.8,
      stability: 0.7,
      consensus: 0.2,
    },
    validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...overrides,
  };
}

class FakeMemoryStore implements MemoryStore {
  private readonly atoms = new Map<MemoryId, MemoryAtom>();

  constructor(atoms: readonly MemoryAtom[]) {
    for (const atomValue of atoms) {
      this.atoms.set(atomValue.memoryId, atomValue);
    }
  }

  async insert(atomValue: MemoryAtom): Promise<MemoryAtom> {
    this.atoms.set(atomValue.memoryId, atomValue);
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
    const permitted = new Set(filter.permittedVisibilities.map(visibilityKey));
    return [...this.atoms.values()]
      .filter((atomValue) => permitted.has(visibilityKey(atomValue.visibility)))
      .filter((atomValue) =>
        filter.scope !== undefined ? scopeKey(atomValue.scope) === scopeKey(filter.scope) : true,
      );
  }

  async transitionStatus(
    memoryId: MemoryId,
    nextStatus: MemoryStatus,
    reason: StatusTransitionReason,
  ): Promise<StatusTransitionResult> {
    void memoryId;
    void nextStatus;
    void reason;
    throw new Error('not implemented');
  }

  async statusHistory(): Promise<readonly []> {
    return [];
  }
}
