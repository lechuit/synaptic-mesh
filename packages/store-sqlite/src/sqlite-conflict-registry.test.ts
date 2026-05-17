import type {
  AgentId,
  ConflictId,
  ConflictRecord,
  MemoryId,
  Visibility,
} from '@aletheia-labs/core';
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
  { kind: 'global:safe' },
  { kind: 'sealed:sensitive' },
  { kind: 'team', name: 'core' },
];

function makeConflict(over: Partial<ConflictRecord> = {}): ConflictRecord {
  return {
    conflictId: 'conf-1' as ConflictId,
    topic: 'preferred-stack',
    scope: { kind: 'project', projectId: 'aletheia' },
    claims: [
      { memoryId: 'mem-a' as MemoryId, value: 'TypeScript', authority: 0.7, freshness: 'current' },
      { memoryId: 'mem-b' as MemoryId, value: 'Python', authority: 0.6, freshness: 'current' },
    ],
    status: 'unresolved',
    decisionPolicy: 'surface_conflict',
    recordedAt: '2026-05-16T12:00:00Z',
    resolvedAt: null,
    ...over,
  };
}

describe('SqliteConflictRegistry', () => {
  it('records and retrieves a conflict round-trip', async () => {
    const c = makeConflict();
    await stores.conflictRegistry.record(c);

    const got = await stores.conflictRegistry.get(c.conflictId, ALLOW_ALL);
    expect(got).not.toBeNull();
    expect(got?.topic).toBe('preferred-stack');
    expect(got?.claims).toHaveLength(2);
    expect(got?.status).toBe('unresolved');
  });

  it('rejects duplicate conflict_id', async () => {
    await stores.conflictRegistry.record(makeConflict());
    await expect(stores.conflictRegistry.record(makeConflict())).rejects.toThrow(
      /duplicate conflict_id/,
    );
  });

  it('finds conflicts by touching memory_id', async () => {
    await stores.conflictRegistry.record(
      makeConflict({
        conflictId: 'conf-1' as ConflictId,
        claims: [
          { memoryId: 'mem-x' as MemoryId, value: 'A', authority: 0.5, freshness: 'current' },
          { memoryId: 'mem-y' as MemoryId, value: 'B', authority: 0.5, freshness: 'current' },
        ],
      }),
    );
    await stores.conflictRegistry.record(
      makeConflict({
        conflictId: 'conf-2' as ConflictId,
        claims: [
          { memoryId: 'mem-z' as MemoryId, value: 'C', authority: 0.5, freshness: 'current' },
          { memoryId: 'mem-w' as MemoryId, value: 'D', authority: 0.5, freshness: 'current' },
        ],
      }),
    );

    const touching = await stores.conflictRegistry.query({
      touchingMemoryIds: ['mem-x' as MemoryId],
      permittedVisibilities: ALLOW_ALL,
    });

    expect(touching.map((c) => c.conflictId)).toEqual(['conf-1']);
  });

  it('resolves a conflict and records resolution history', async () => {
    const c = makeConflict();
    await stores.conflictRegistry.record(c);

    const resolved = await stores.conflictRegistry.resolve(c.conflictId, 'resolved', {
      rationale: 'preferred by latest decision',
      actor: 'agent-decider' as AgentId,
      preferredMemoryId: 'mem-a' as MemoryId,
    });

    expect(resolved).not.toBeNull();
    expect(resolved?.status).toBe('resolved');
    expect(resolved?.resolvedAt).not.toBeNull();

    const hist = await stores.conflictRegistry.resolutionHistory(c.conflictId);
    expect(hist).toHaveLength(1);
    expect(hist[0]?.fromStatus).toBe('unresolved');
    expect(hist[0]?.toStatus).toBe('resolved');
    expect(hist[0]?.reason.preferredMemoryId).toBe('mem-a');
  });

  it('returns null when resolving a non-existent conflict', async () => {
    const r = await stores.conflictRegistry.resolve('conf-ghost' as ConflictId, 'resolved', {
      rationale: 'ghost',
      actor: 'a' as AgentId,
      preferredMemoryId: null,
    });
    expect(r).toBeNull();
  });

  it('returns empty results when permitted set is empty', async () => {
    await stores.conflictRegistry.record(makeConflict());
    const result = await stores.conflictRegistry.query({ permittedVisibilities: [] });
    expect(result).toHaveLength(0);
  });
});
