/**
 * Tests for MemoryAtom and the discriminated unions it carries.
 */

import { describe, expect, it } from 'vitest';
import { ScopeSchema, VisibilitySchema } from './enums.js';
import { MemoryAtomSchema } from './memory-atom.js';

function baseAtom(): unknown {
  return {
    memoryId: 'mem-001',
    memoryType: 'claim',
    content: 'the user prefers TypeScript strict mode',
    sourceAgentId: 'agent-planner',
    sourceEventIds: ['evt-1'],
    sourceMemoryIds: [],
    scope: { kind: 'project', projectId: 'aletheia' },
    visibility: { kind: 'team', name: 'core' },
    status: 'candidate',
    scores: {
      confidence: 0.8,
      evidence: 0.7,
      authority: 0.6,
      freshness: 0.9,
      stability: 0.5,
      consensus: 0.4,
    },
    validFrom: '2026-05-16T12:00:00Z',
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
  };
}

describe('MemoryAtom — invariants', () => {
  it('parses a valid candidate atom with team visibility', () => {
    const a = MemoryAtomSchema.parse(baseAtom());
    expect(a.status).toBe('candidate');
    if (a.visibility.kind === 'team') {
      expect(a.visibility.name).toBe('core');
    }
  });

  it('rejects an atom with zero source events', () => {
    expect(() =>
      MemoryAtomSchema.parse({
        ...(baseAtom() as object),
        sourceEventIds: [],
      }),
    ).toThrow(/at least one source event/);
  });

  it('rejects unknown status', () => {
    expect(() =>
      MemoryAtomSchema.parse({
        ...(baseAtom() as object),
        status: 'maybe_verified',
      }),
    ).toThrow();
  });

  it('rejects score > 1', () => {
    expect(() =>
      MemoryAtomSchema.parse({
        ...(baseAtom() as object),
        scores: {
          confidence: 1.1,
          evidence: 0.5,
          authority: 0.5,
          freshness: 0.5,
          stability: 0.5,
          consensus: 0.5,
        },
      }),
    ).toThrow();
  });

  it('accepts a valid supersession link', () => {
    const a = MemoryAtomSchema.parse({
      ...(baseAtom() as object),
      links: [{ relation: 'supersedes', targetMemoryId: 'mem-000' }],
    });
    expect(a.links).toHaveLength(1);
    expect(a.links[0]?.relation).toBe('supersedes');
  });
});

describe('Visibility — discriminated union', () => {
  it('parses private:agent without payload', () => {
    expect(() => VisibilitySchema.parse({ kind: 'private:agent' })).not.toThrow();
  });

  it('parses team with name payload', () => {
    expect(() => VisibilitySchema.parse({ kind: 'team', name: 'platform' })).not.toThrow();
  });

  it('rejects team without name', () => {
    expect(() => VisibilitySchema.parse({ kind: 'team' })).toThrow();
  });

  it('rejects unknown kind', () => {
    expect(() => VisibilitySchema.parse({ kind: 'private:everyone' })).toThrow();
  });
});

describe('Scope — discriminated union', () => {
  it('parses local without payload', () => {
    expect(() => ScopeSchema.parse({ kind: 'local' })).not.toThrow();
  });

  it('parses project with id', () => {
    expect(() => ScopeSchema.parse({ kind: 'project', projectId: 'p-1' })).not.toThrow();
  });

  it('rejects project without id', () => {
    expect(() => ScopeSchema.parse({ kind: 'project' })).toThrow();
  });
});
