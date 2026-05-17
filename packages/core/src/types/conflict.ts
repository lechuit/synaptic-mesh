/**
 * ConflictRecord — first-class contradictions.
 * Source: specs/aletheia-memory-authority-v0.md §6 "Conflict Registry".
 *
 * Rule: contradictions are NEVER overwritten by summaries. They remain
 * queryable until explicitly resolved (or superseded by a later restrictive
 * event).
 */

import { z } from 'zod';
import { FreshnessSchema, ScopeSchema } from './enums.js';
import { ConflictIdSchema, IsoTimestampSchema, MemoryIdSchema } from './primitives.js';

export const ConflictStatusSchema = z.enum([
  'unresolved',
  'resolved',
  'superseded',
  'requires_human',
]);
export type ConflictStatus = z.infer<typeof ConflictStatusSchema>;

export const ConflictDecisionPolicySchema = z.enum([
  'surface_conflict',
  'prefer_latest_authoritative',
  'ask_human',
  'abstain',
]);
export type ConflictDecisionPolicy = z.infer<typeof ConflictDecisionPolicySchema>;

/**
 * One side of a conflict: which memory makes what claim, with what authority.
 */
export const ConflictClaimSchema = z.object({
  memoryId: MemoryIdSchema,
  /** The value the claim asserts (string serialization of any type). */
  value: z.string(),
  /** Authority score of this claim at the time the conflict was recorded. */
  authority: z.number().min(0).max(1),
  freshness: FreshnessSchema,
});
export type ConflictClaim = z.infer<typeof ConflictClaimSchema>;

export const ConflictRecordSchema = z.object({
  conflictId: ConflictIdSchema,
  /** Topic of the conflict — what the claims disagree about. */
  topic: z.string().min(1).max(1024),
  scope: ScopeSchema,
  /** All claims in conflict (typically 2, sometimes more). */
  claims: z.array(ConflictClaimSchema).min(2),
  status: ConflictStatusSchema,
  decisionPolicy: ConflictDecisionPolicySchema,
  recordedAt: IsoTimestampSchema,
  resolvedAt: IsoTimestampSchema.nullable(),
});
export type ConflictRecord = z.infer<typeof ConflictRecordSchema>;
