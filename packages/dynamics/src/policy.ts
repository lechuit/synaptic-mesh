import type { AgentId } from '@aletheia-labs/core';

export interface DecayPolicy {
  readonly candidateAfterMs: number;
  readonly verifiedAfterMs: number;
  readonly trustedAfterMs: number;
}

export interface PromotionPolicy {
  readonly minSourceConsistentRecalls: number;
  readonly minEvidenceScore: number;
  readonly minAuthorityScore: number;
  readonly minStabilityScore: number;
}

export interface DynamicsPolicy {
  readonly actor: AgentId;
  readonly decay: DecayPolicy;
  readonly promotion: PromotionPolicy;
  readonly maxAtomsPerTick?: number;
}

export interface DynamicsPolicyOverrides {
  readonly decay?: Partial<DecayPolicy>;
  readonly promotion?: Partial<PromotionPolicy>;
  readonly maxAtomsPerTick?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_DECAY_POLICY: DecayPolicy = {
  candidateAfterMs: 7 * DAY_MS,
  verifiedAfterMs: 30 * DAY_MS,
  trustedAfterMs: 180 * DAY_MS,
};

export const DEFAULT_PROMOTION_POLICY: PromotionPolicy = {
  minSourceConsistentRecalls: 2,
  minEvidenceScore: 0.7,
  minAuthorityScore: 0.6,
  minStabilityScore: 0.5,
};

/**
 * Build a dynamics policy from defaults plus host overrides.
 *
 * @remarks
 * Use this helper instead of hand-copying defaults in hosts. The `actor` is
 * written into transition audit reasons when the dynamics engine applies
 * status changes.
 */
export function createDynamicsPolicy(
  actor: AgentId,
  overrides: DynamicsPolicyOverrides = {},
): DynamicsPolicy {
  return {
    actor,
    decay: { ...DEFAULT_DECAY_POLICY, ...overrides.decay },
    promotion: { ...DEFAULT_PROMOTION_POLICY, ...overrides.promotion },
    ...(overrides.maxAtomsPerTick !== undefined
      ? { maxAtomsPerTick: overrides.maxAtomsPerTick }
      : {}),
  };
}
