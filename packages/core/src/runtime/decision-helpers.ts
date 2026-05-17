import {
  type ConflictId,
  type Decision,
  type DecisionOutcome,
  type DecisionReason,
  DecisionSchema,
  type IsoTimestamp,
  type MemoryId,
} from '../types/index.js';

export interface Clock {
  /** Return the logical timestamp used for emitted decisions and transitions. */
  now(): IsoTimestamp;
}

export const SYSTEM_CLOCK: Clock = {
  now: () => new Date().toISOString() as IsoTimestamp,
};

/**
 * Construct and validate a decision envelope.
 *
 * @remarks
 * Runtime components use this instead of hand-building decision objects so
 * every allow/deny/abstain path conforms to the exported zod schema. Callers
 * should treat the returned value as the auditable result of the authority
 * check.
 */
export function decision(
  outcome: DecisionOutcome,
  reasons: readonly DecisionReason[],
  relatedMemoryIds: readonly MemoryId[],
  relatedConflictIds: readonly ConflictId[],
  emittedAt: IsoTimestamp,
): Decision {
  return DecisionSchema.parse({
    outcome,
    reasons,
    relatedMemoryIds,
    relatedConflictIds,
    emittedAt,
  });
}
