import type { AgentId, EventId, IsoTimestamp, MemoryAtom, MemoryId } from '@aletheia/core';
import { describe, expect, it } from 'vitest';
import { DEFAULT_AUTHORITY_DECAY_POLICY, decayedAuthority } from './authority-decay.js';

const NOW = '2026-05-17T00:00:00Z' as IsoTimestamp;

describe('decayedAuthority', () => {
  it('decays verified authority with a configurable half-life', () => {
    const score = decayedAuthority(
      atom({
        status: 'verified',
        scores: { ...baseScores(), authority: 0.8 },
        lastConfirmedAt: '2026-04-17T00:00:00Z' as IsoTimestamp,
      }),
      NOW,
      { verifiedHalfLifeMs: dayMs(7) },
    );

    expect(score).toBeLessThan(0.1);
    expect(score).toBeGreaterThan(0);
  });

  it('decays candidates faster than verified memories by default', () => {
    const candidate = decayedAuthority(
      atom({
        status: 'candidate',
        validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
      }),
      NOW,
    );
    const verified = decayedAuthority(
      atom({
        status: 'verified',
        lastConfirmedAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
      }),
      NOW,
    );

    expect(candidate).toBeLessThan(verified);
  });

  it('decreases deterministically as logical time advances', () => {
    const memory = atom({
      status: 'verified',
      lastConfirmedAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });

    const early = decayedAuthority(memory, '2026-05-16T00:00:00Z' as IsoTimestamp);
    const later = decayedAuthority(memory, NOW);

    expect(later).toBeLessThan(early);
  });

  it('does not mutate the atom while calculating decay', () => {
    const memory = atom({
      status: 'verified',
      lastConfirmedAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const before = JSON.stringify(memory);

    decayedAuthority(memory, NOW);

    expect(JSON.stringify(memory)).toBe(before);
  });

  it('decays trusted memories slower than verified memories by default', () => {
    const verified = decayedAuthority(
      atom({
        status: 'verified',
        lastConfirmedAt: '2026-04-17T00:00:00Z' as IsoTimestamp,
      }),
      NOW,
    );
    const trusted = decayedAuthority(
      atom({
        status: 'trusted',
        lastConfirmedAt: '2026-04-17T00:00:00Z' as IsoTimestamp,
      }),
      NOW,
    );

    expect(trusted).toBeGreaterThan(verified);
  });

  it('does not decay sealed memories', () => {
    expect(decayedAuthority(atom({ status: 'sealed' }), NOW)).toBe(baseScores().authority);
  });

  it('still fails closed for sealed memory outside its validity window', () => {
    expect(
      decayedAuthority(
        atom({
          status: 'sealed',
          validFrom: '2026-05-18T00:00:00Z' as IsoTimestamp,
        }),
        NOW,
      ),
    ).toBe(0);
    expect(
      decayedAuthority(
        atom({
          status: 'sealed',
          validUntil: '2026-05-16T23:59:59Z' as IsoTimestamp,
        }),
        NOW,
      ),
    ).toBe(0);
  });

  it('scores non-actionable terminal states as zero', () => {
    expect(decayedAuthority(atom({ status: 'deprecated' }), NOW)).toBe(0);
    expect(decayedAuthority(atom({ status: 'rejected' }), NOW)).toBe(0);
    expect(decayedAuthority(atom({ status: 'human_required' }), NOW)).toBe(0);
  });

  it('fails closed for invalid clocks, future atoms, and expired windows', () => {
    expect(decayedAuthority(atom(), 'not-a-date' as IsoTimestamp)).toBe(0);
    expect(
      decayedAuthority(
        atom({
          validFrom: '2026-05-18T00:00:00Z' as IsoTimestamp,
        }),
        NOW,
      ),
    ).toBe(0);
    expect(
      decayedAuthority(
        atom({
          validUntil: '2026-05-16T23:59:59Z' as IsoTimestamp,
        }),
        NOW,
      ),
    ).toBe(0);
  });

  it('exposes stable defaults for host policy composition', () => {
    expect(DEFAULT_AUTHORITY_DECAY_POLICY.candidateHalfLifeMs).toBeLessThan(
      DEFAULT_AUTHORITY_DECAY_POLICY.verifiedHalfLifeMs,
    );
    expect(DEFAULT_AUTHORITY_DECAY_POLICY.verifiedHalfLifeMs).toBeLessThan(
      DEFAULT_AUTHORITY_DECAY_POLICY.trustedHalfLifeMs,
    );
  });
});

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-decay' as MemoryId,
    memoryType: 'claim',
    content: 'Aletheia memory ages.',
    sourceAgentId: 'agent-decay' as AgentId,
    sourceEventIds: ['evt-decay' as EventId],
    sourceMemoryIds: [],
    scope: { kind: 'project', projectId: 'decay' },
    visibility: { kind: 'private:user' },
    status: 'verified',
    scores: baseScores(),
    validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...overrides,
  };
}

function baseScores(): MemoryAtom['scores'] {
  return {
    confidence: 0.7,
    evidence: 0.9,
    authority: 0.8,
    freshness: 0.9,
    stability: 0.8,
    consensus: 0.2,
  };
}

function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}
