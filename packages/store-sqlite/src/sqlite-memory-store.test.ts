import type { AgentId, EventId, MemoryAtom, MemoryId, Visibility } from '@aletheia/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type SqliteStores, openSqliteStores } from './index.js';

let stores: SqliteStores;

beforeEach(() => {
  stores = openSqliteStores(':memory:');
});

afterEach(() => {
  stores.close();
});

const ALLOW_ALL: readonly Visibility[] = [
  { kind: 'private:agent' },
  { kind: 'private:user' },
  { kind: 'global:safe' },
  { kind: 'sealed:sensitive' },
  { kind: 'ephemeral' },
  { kind: 'team', name: 'core' },
];

function makeAtom(over: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-1' as MemoryId,
    memoryType: 'claim',
    content: 'a candidate claim',
    sourceAgentId: 'agent-1' as AgentId,
    sourceEventIds: ['evt-1' as EventId],
    sourceMemoryIds: [],
    scope: { kind: 'local' },
    visibility: { kind: 'team', name: 'core' },
    status: 'candidate',
    scores: {
      confidence: 0.7,
      evidence: 0.6,
      authority: 0.5,
      freshness: 0.9,
      stability: 0.5,
      consensus: 0.5,
    },
    validFrom: '2026-05-16T12:00:00Z',
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...over,
  };
}

describe('SqliteMemoryStore — CRUD + permission', () => {
  it('inserts and retrieves an atom round-trip', async () => {
    const a = makeAtom();
    await stores.memoryStore.insert(a);

    const got = await stores.memoryStore.get(a.memoryId, ALLOW_ALL);
    expect(got).not.toBeNull();
    expect(got?.content).toBe('a candidate claim');
    expect(got?.status).toBe('candidate');
  });

  it('rejects duplicate memory_id', async () => {
    await stores.memoryStore.insert(makeAtom());
    await expect(stores.memoryStore.insert(makeAtom())).rejects.toThrow(/duplicate memory_id/);
  });

  it('returns null for visibility the caller cannot see', async () => {
    await stores.memoryStore.insert(
      makeAtom({
        memoryId: 'mem-sealed' as MemoryId,
        visibility: { kind: 'sealed:sensitive' },
      }),
    );
    const got = await stores.memoryStore.get('mem-sealed' as MemoryId, [{ kind: 'private:agent' }]);
    expect(got).toBeNull();
  });

  it('records initial status in history on insert', async () => {
    const a = makeAtom();
    await stores.memoryStore.insert(a);
    const hist = await stores.memoryStore.statusHistory(a.memoryId);
    expect(hist).toHaveLength(1);
    expect(hist[0]?.fromStatus).toBeNull();
    expect(hist[0]?.toStatus).toBe('candidate');
  });
});

describe('SqliteMemoryStore — status transitions', () => {
  it('applies a legal transition (candidate → verified)', async () => {
    const a = makeAtom();
    await stores.memoryStore.insert(a);

    const result = await stores.memoryStore.transitionStatus(a.memoryId, 'verified', {
      rationale: 'evidence checked',
      actor: 'agent-reviewer' as AgentId,
    });

    expect(result.kind).toBe('applied');
    if (result.kind === 'applied') {
      expect(result.atom.status).toBe('verified');
    }

    const hist = await stores.memoryStore.statusHistory(a.memoryId);
    expect(hist).toHaveLength(2);
    expect(hist[1]?.fromStatus).toBe('candidate');
    expect(hist[1]?.toStatus).toBe('verified');
  });

  it('rejects an illegal transition (rejected → trusted)', async () => {
    const a = makeAtom({ status: 'rejected' });
    await stores.memoryStore.insert(a);

    const result = await stores.memoryStore.transitionStatus(a.memoryId, 'trusted', {
      rationale: 'should fail',
      actor: 'agent-x' as AgentId,
    });

    expect(result.kind).toBe('rejected');
    if (result.kind === 'rejected') {
      expect(result.reason).toMatch(/not allowed/);
    }
  });

  it('rejects transitioning to the same status', async () => {
    const a = makeAtom({ status: 'verified' });
    await stores.memoryStore.insert(a);

    const result = await stores.memoryStore.transitionStatus(a.memoryId, 'verified', {
      rationale: 'noop',
      actor: 'agent-x' as AgentId,
    });

    expect(result.kind).toBe('rejected');
  });

  it('rejects transitioning a non-existent atom', async () => {
    const result = await stores.memoryStore.transitionStatus('mem-ghost' as MemoryId, 'verified', {
      rationale: 'ghost',
      actor: 'agent-x' as AgentId,
    });
    expect(result.kind).toBe('rejected');
    if (result.kind === 'rejected') {
      expect(result.reason).toMatch(/not found/);
    }
  });
});

describe('SqliteMemoryStore — query', () => {
  it('filters by status and respects ordering', async () => {
    await stores.memoryStore.insert(
      makeAtom({
        memoryId: 'm-a' as MemoryId,
        status: 'candidate',
        validFrom: '2026-05-15T00:00:00Z',
      }),
    );
    await stores.memoryStore.insert(
      makeAtom({
        memoryId: 'm-b' as MemoryId,
        status: 'verified',
        validFrom: '2026-05-16T00:00:00Z',
      }),
    );
    await stores.memoryStore.insert(
      makeAtom({
        memoryId: 'm-c' as MemoryId,
        status: 'verified',
        validFrom: '2026-05-17T00:00:00Z',
      }),
    );

    const result = await stores.memoryStore.query({
      statuses: ['verified'],
      permittedVisibilities: ALLOW_ALL,
    });

    expect(result.map((a) => a.memoryId)).toEqual(['m-c', 'm-b']);
  });

  it('returns nothing when permittedVisibilities is empty', async () => {
    await stores.memoryStore.insert(makeAtom());
    const result = await stores.memoryStore.query({ permittedVisibilities: [] });
    expect(result).toHaveLength(0);
  });
});
