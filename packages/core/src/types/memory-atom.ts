/**
 * MemoryAtom — the smallest actionable memory unit.
 * Source: specs/aletheia-memory-authority-v0.md §4.
 *
 * Atoms are append-only. A "modification" produces a successor atom with a
 * `supersedes` link. Status transitions are tracked separately (Phase 2).
 */

import { z } from 'zod';
import {
  LinkRelationSchema,
  MemoryStatusSchema,
  MemoryTypeSchema,
  ScopeSchema,
  VisibilitySchema,
} from './enums.js';
import { AgentIdSchema, EventIdSchema, IsoTimestampSchema, MemoryIdSchema } from './primitives.js';

/**
 * Scores attached to a MemoryAtom.
 *
 * Hard rule from spec: "No single score is authoritative. `confidence` cannot
 * override weak evidence, stale freshness, wrong scope, or missing permission."
 *
 * Scores inform routing and ranking; they NEVER substitute for receipt fields.
 */
export const MemoryScoresSchema = z.object({
  confidence: z.number().min(0).max(1),
  evidence: z.number().min(0).max(1),
  authority: z.number().min(0).max(1),
  freshness: z.number().min(0).max(1),
  stability: z.number().min(0).max(1),
  consensus: z.number().min(0).max(1),
});
export type MemoryScores = z.infer<typeof MemoryScoresSchema>;

/**
 * A typed edge from one atom to another.
 * The relation determines whether the link is informational (`derived_from`)
 * or has authority implications (`supersedes`, `contradicts`).
 */
export const MemoryLinkSchema = z.object({
  relation: LinkRelationSchema,
  targetMemoryId: MemoryIdSchema,
});
export type MemoryLink = z.infer<typeof MemoryLinkSchema>;

export const MemoryAtomSchema = z.object({
  memoryId: MemoryIdSchema,
  memoryType: MemoryTypeSchema,
  /** The actual claim/observation/decision text. */
  content: z.string().min(1),
  /** Which agent produced this atom (proposer, not authority). */
  sourceAgentId: AgentIdSchema,
  /** Raw events this atom is grounded in. */
  sourceEventIds: z.array(EventIdSchema).min(1, {
    message: 'an atom must reference at least one source event',
  }),
  /** Other atoms this one is derived from (chain of summarization). */
  sourceMemoryIds: z.array(MemoryIdSchema),
  scope: ScopeSchema,
  visibility: VisibilitySchema,
  status: MemoryStatusSchema,
  scores: MemoryScoresSchema,
  /** When this atom became (or will become) valid. */
  validFrom: IsoTimestampSchema,
  /** When this atom expires; null means open-ended. */
  validUntil: IsoTimestampSchema.nullable(),
  /** Last time the atom was explicitly re-confirmed. */
  lastConfirmedAt: IsoTimestampSchema.nullable(),
  /** Graph edges to other atoms. */
  links: z.array(MemoryLinkSchema),
});
export type MemoryAtom = z.infer<typeof MemoryAtomSchema>;
