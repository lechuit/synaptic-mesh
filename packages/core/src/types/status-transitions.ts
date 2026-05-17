/**
 * Allowed status transitions for a MemoryAtom.
 *
 * Phase 1 matrix is intentionally strict; Phase 2 (memory dynamics) will
 * relax some terminal states via reconsolidation events.
 *
 * Sealed is terminal-from-without — only an authorized operator can move
 * a sealed atom, and that path doesn't go through `transitionStatus`.
 */

import type { MemoryStatus } from './enums.js';

const TRANSITIONS: Readonly<Record<MemoryStatus, ReadonlySet<MemoryStatus>>> = {
  candidate: new Set<MemoryStatus>([
    'verified',
    'deprecated',
    'rejected',
    'sealed',
    'human_required',
  ]),
  verified: new Set<MemoryStatus>([
    'trusted',
    'deprecated',
    'rejected',
    'sealed',
    'human_required',
  ]),
  trusted: new Set<MemoryStatus>(['deprecated', 'rejected', 'sealed']),
  deprecated: new Set<MemoryStatus>(['verified', 'rejected']),
  rejected: new Set<MemoryStatus>(),
  // Sealed has no outward transitions through this API. Special path required.
  sealed: new Set<MemoryStatus>(),
  human_required: new Set<MemoryStatus>(['candidate', 'verified', 'rejected']),
};

/**
 * Check whether moving from `from` to `to` is a valid transition.
 *
 * Returns `true` for legal transitions and `false` for illegal ones.
 * Does NOT consider permissions, evidence, or conflicts — those are the
 * caller's responsibility (typically the WriteGate or MemoryStore wrapper).
 */
export function isAllowedTransition(from: MemoryStatus, to: MemoryStatus): boolean {
  return TRANSITIONS[from].has(to);
}

/**
 * Get the set of statuses an atom can legally transition to from `from`.
 */
export function allowedTransitionsFrom(from: MemoryStatus): ReadonlySet<MemoryStatus> {
  return TRANSITIONS[from];
}
