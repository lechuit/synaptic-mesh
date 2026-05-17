/**
 * MemoryProposal — what an agent submits to the WriteGate.
 * Source: specs/aletheia-memory-authority-v0.md §2 "Memory Proposal Layer".
 *
 * Proposals are NOT memories yet. The WriteGate produces (or rejects)
 * the MemoryAtom from a proposal.
 */

import { z } from 'zod';
import { MemoryTypeSchema, RiskTierSchema, ScopeSchema, VisibilitySchema } from './enums.js';
import {
  AgentIdSchema,
  EventIdSchema,
  IsoTimestampSchema,
  MemoryIdSchema,
  ProposalIdSchema,
} from './primitives.js';

/**
 * A reference to a memory the proposer knows about as a known conflict source.
 * The proposer is responsible for surfacing known contradictions; the
 * ConflictRegistry can also discover them.
 */
export const KnownConflictSchema = z.object({
  conflictingMemoryId: MemoryIdSchema,
  rationale: z.string().min(1).max(2048),
});
export type KnownConflict = z.infer<typeof KnownConflictSchema>;

export const MemoryProposalSchema = z.object({
  proposalId: ProposalIdSchema,
  proposedBy: AgentIdSchema,
  proposedAt: IsoTimestampSchema,
  candidateType: MemoryTypeSchema,
  /** The claim text the proposer wants stored. */
  claim: z.string().min(1).max(16_384),
  /** Raw events this proposal is grounded in (must be non-empty). */
  sourceEventIds: z.array(EventIdSchema).min(1),
  intendedScope: ScopeSchema,
  intendedVisibility: VisibilitySchema,
  riskLevel: RiskTierSchema,
  knownConflicts: z.array(KnownConflictSchema),
});
export type MemoryProposal = z.infer<typeof MemoryProposalSchema>;
