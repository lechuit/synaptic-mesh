import type { IsoTimestamp, MemoryAtom, MemoryStatus } from '@aletheia-labs/core';

export interface AuthorityDecayPolicy {
  readonly candidateHalfLifeMs: number;
  readonly verifiedHalfLifeMs: number;
  readonly trustedHalfLifeMs: number;
}

export interface AuthorityDecayPolicyOverrides {
  readonly candidateHalfLifeMs?: number;
  readonly verifiedHalfLifeMs?: number;
  readonly trustedHalfLifeMs?: number;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const DEFAULT_AUTHORITY_DECAY_POLICY: AuthorityDecayPolicy = {
  candidateHalfLifeMs: 12 * HOUR_MS,
  verifiedHalfLifeMs: 14 * DAY_MS,
  trustedHalfLifeMs: 90 * DAY_MS,
};

/**
 * Compute effective authority for an atom at a logical time.
 *
 * @remarks
 * This is a pure ranking helper: it never mutates status and never grants
 * permission. Hosts can inject it into `RetrievalRouter`/`AletheiaAuthority`
 * as an `authorityScorer` after permission, scope, status, and freshness have
 * already been filtered by core. Sealed memories keep their stored authority;
 * deprecated, rejected, and human-required memories score zero.
 */
export function decayedAuthority(
  atom: MemoryAtom,
  now: IsoTimestamp,
  policy: AuthorityDecayPolicyOverrides = {},
): number {
  const baseAuthority = clamp01(atom.scores.authority);
  if (baseAuthority === 0) return 0;

  if (
    atom.status === 'deprecated' ||
    atom.status === 'rejected' ||
    atom.status === 'human_required'
  ) {
    return 0;
  }

  const nowMs = timestampMs(now);
  const validFromMs = timestampMs(atom.validFrom);
  if (nowMs === null || validFromMs === null) return 0;
  if (validFromMs > nowMs) return 0;
  if (atom.validUntil !== null) {
    const validUntilMs = timestampMs(atom.validUntil);
    if (validUntilMs === null || validUntilMs < nowMs) return 0;
  }

  if (atom.status === 'sealed') return baseAuthority;

  const anchorMs = timestampMs(atom.lastConfirmedAt ?? atom.validFrom);
  if (anchorMs === null) return 0;

  const ageMs = nowMs - anchorMs;
  if (ageMs < 0) return 0;

  const halfLifeMs = halfLifeFor(atom.status, { ...DEFAULT_AUTHORITY_DECAY_POLICY, ...policy });
  if (halfLifeMs === null) return 0;
  if (halfLifeMs <= 0) return ageMs === 0 ? baseAuthority : 0;

  return clamp01(baseAuthority * 2 ** (-ageMs / halfLifeMs));
}

function halfLifeFor(status: MemoryStatus, policy: AuthorityDecayPolicy): number | null {
  if (status === 'candidate') return policy.candidateHalfLifeMs;
  if (status === 'verified') return policy.verifiedHalfLifeMs;
  if (status === 'trusted') return policy.trustedHalfLifeMs;
  return null;
}

function timestampMs(timestamp: IsoTimestamp): number | null {
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? null : parsed;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}
