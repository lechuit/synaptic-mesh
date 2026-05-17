/**
 * Visibility policy boundary for runtime components.
 *
 * Core does not know who an agent is allowed to see. The host application must
 * provide that mapping explicitly; the default runtime behavior is fail-closed.
 */

import type { AgentId, Visibility } from '../types/index.js';

export interface VisibilityPolicy {
  permittedVisibilitiesForAgent(agentId: AgentId): readonly Visibility[];
}

export const DENY_ALL_VISIBILITY_POLICY: VisibilityPolicy = {
  permittedVisibilitiesForAgent: () => [],
};

export function staticVisibilityPolicy(
  permittedVisibilities: readonly Visibility[],
): VisibilityPolicy {
  return {
    permittedVisibilitiesForAgent: () => permittedVisibilities,
  };
}
