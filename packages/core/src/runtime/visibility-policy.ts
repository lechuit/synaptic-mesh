/**
 * Visibility policy boundary for runtime components.
 *
 * Core does not know who an agent is allowed to see. The host application must
 * provide that mapping explicitly; the default runtime behavior is fail-closed.
 */

import type { AgentId, Visibility } from '../types/index.js';

export interface VisibilityPolicy {
  /**
   * Return the visibility planes an agent may access.
   *
   * @remarks
   * Implementations should return an empty array when access cannot be proven.
   * Runtime components interpret an empty result as fail-closed denial or
   * abstention, never as "all visible".
   */
  permittedVisibilitiesForAgent(agentId: AgentId): readonly Visibility[];
}

export const DENY_ALL_VISIBILITY_POLICY: VisibilityPolicy = {
  permittedVisibilitiesForAgent: () => [],
};

/**
 * Build a fixed visibility policy for tests, demos, and simple single-user hosts.
 *
 * @remarks
 * This helper ignores `agentId` by design. Production hosts should usually
 * provide a policy that derives visibility from their own identity/session
 * model.
 */
export function staticVisibilityPolicy(
  permittedVisibilities: readonly Visibility[],
): VisibilityPolicy {
  return {
    permittedVisibilitiesForAgent: () => permittedVisibilities,
  };
}
