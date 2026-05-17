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
  now(): IsoTimestamp;
}

export const SYSTEM_CLOCK: Clock = {
  now: () => new Date().toISOString() as IsoTimestamp,
};

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
