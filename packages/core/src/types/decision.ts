/**
 * Decision types emitted by the WriteGate, RetrievalRouter, and tryAct().
 *
 * Every decision carries: an outcome verb, a structured reason, and the
 * evidence that supports it. Decisions are values, not exceptions —
 * fail-closed never throws, it returns a structured refusal.
 */

import { z } from 'zod';
import { ConflictIdSchema, MemoryIdSchema } from './primitives.js';

// -- Decision outcomes (spec §"Retrieval Router outputs", "Receiver decision") -

export const DecisionOutcomeSchema = z.enum([
  'allow_local_shadow',
  'fetch_abstain',
  'ask_human',
  'block_local',
  'conflict_boundary_packet',
  'deny',
]);
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

// -- Structured reasons -------------------------------------------------------

/**
 * Why the gate/router/tryAct produced a particular outcome. Discriminated
 * union — every variant has the data needed to debug the decision.
 */
export const DecisionReasonSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('source_check_failed'),
    detail: z.string().min(1).max(1024),
  }),
  z.object({
    kind: z.literal('freshness_not_current'),
    observed: z.string().min(1),
  }),
  z.object({
    kind: z.literal('scope_outside_boundary'),
    requestedScope: z.string().min(1),
    allowedScope: z.string().min(1),
  }),
  z.object({
    kind: z.literal('promotion_boundary_blocked'),
    detail: z.string().min(1).max(1024),
  }),
  z.object({
    kind: z.literal('forbidden_effect_present'),
    effect: z.string().min(1),
  }),
  z.object({
    kind: z.literal('later_restrictive_event'),
    event: z.string().min(1),
  }),
  z.object({
    kind: z.literal('tuple_incomplete'),
    missingFields: z.array(z.string()).min(1),
  }),
  z.object({
    kind: z.literal('sensitive_action'),
    actionClass: z.string().min(1),
  }),
  z.object({
    kind: z.literal('unknown_action'),
    raw: z.string().min(1),
  }),
  z.object({
    kind: z.literal('unresolved_conflict'),
    conflictId: ConflictIdSchema,
  }),
  z.object({
    kind: z.literal('visibility_denied'),
    detail: z.string().min(1),
  }),
  z.object({
    kind: z.literal('all_checks_passed'),
    /** The atoms the action was authorized against. */
    citedMemoryIds: z.array(MemoryIdSchema),
  }),
]);
export type DecisionReason = z.infer<typeof DecisionReasonSchema>;

// -- The decision envelope ----------------------------------------------------

export const DecisionSchema = z.object({
  outcome: DecisionOutcomeSchema,
  /** Why this outcome was chosen. Multiple reasons can stack. */
  reasons: z.array(DecisionReasonSchema).min(1),
  /** Atoms the decision references (cited, conflicted, etc.). */
  relatedMemoryIds: z.array(MemoryIdSchema),
  /** Conflicts the decision references. */
  relatedConflictIds: z.array(ConflictIdSchema),
  /** When the decision was emitted. */
  emittedAt: z.string().datetime({ offset: false }),
});
export type Decision = z.infer<typeof DecisionSchema>;

// -- Named aliases for clarity at call sites ---------------------------------

/** Decision returned by `WriteGate.evaluate(proposal)`. */
export type WriteGateDecision = Decision;
/** Decision returned by `RetrievalRouter.recall(query)`. */
export type RetrievalDecision = Decision;
/** Decision returned by `tryAct(action, ctx)`. */
export type ActionDecision = Decision;
