/**
 * Action types for the consumer API: what an agent proposes to DO, and the
 * context in which it proposes to do it.
 */

import { z } from 'zod';
import { ActionClassSchema, MemoryStatusSchema, MemoryTypeSchema, ScopeSchema } from './enums.js';
import { AgentIdSchema, MemoryIdSchema } from './primitives.js';

/**
 * What an agent wants to do. The verb is the receiver-classified `ACT` class;
 * `target` and `params` are advisory metadata.
 */
export const ProposedActionSchema = z.object({
  /** Receiver-side classification — never accept this from the sender. */
  classifiedAction: ActionClassSchema,
  /** What/where the action operates on. */
  target: z.string().min(1).max(512),
  /** Free-form params (must round-trip JSON cleanly). */
  params: z.record(z.unknown()).optional(),
});
export type ProposedAction = z.infer<typeof ProposedActionSchema>;

/**
 * Context an agent passes to tryAct(): who is acting, in what scope, with
 * which memories cited.
 */
export const ActionContextSchema = z.object({
  agentId: AgentIdSchema,
  scope: ScopeSchema,
  /** Memories the agent is citing as authority for this action. */
  citedMemoryIds: z.array(MemoryIdSchema),
});
export type ActionContext = z.infer<typeof ActionContextSchema>;

/**
 * RecallQuery — what an agent asks the RetrievalRouter for.
 *
 * No semantic similarity field. Recall is by status, scope, type, and an
 * optional opaque tag — never by embedding distance.
 */
export const RecallQuerySchema = z.object({
  /** Caller identity, used for visibility filtering. */
  agentId: AgentIdSchema,
  /** Visibility/scope must permit retrieval. */
  scope: ScopeSchema,
  /** Restrict to atoms of these statuses (default: ['verified', 'trusted']). */
  requiredStatus: z.array(MemoryStatusSchema).optional(),
  /** Restrict to these memory types. */
  memoryTypes: z.array(MemoryTypeSchema).optional(),
  /** Optional opaque topic tag — exact match only, not similarity. */
  topic: z.string().min(1).max(256).optional(),
  /** Max atoms to return. */
  limit: z.number().int().positive().max(1000).optional(),
});
export type RecallQuery = z.infer<typeof RecallQuerySchema>;
