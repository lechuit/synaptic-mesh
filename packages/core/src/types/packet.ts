/**
 * ActionContextPacket — the handoff packet given to an acting agent.
 * Source: specs/aletheia-memory-authority-v0.md §8.
 *
 * Hard rule: this is NOT a permission token. The receiving agent must STILL
 * classify the proposed action and run the receiver algorithm. The packet
 * carries the data needed to do that, not the decision itself.
 */

import { z } from 'zod';
import { CompressedReceiptSchema } from './compressed-receipt.js';
import { ConflictRecordSchema } from './conflict.js';
import { CoverageReceiptSchema } from './coverage.js';
import { ScopeSchema } from './enums.js';
import { IsoTimestampSchema, MemoryIdSchema } from './primitives.js';

/**
 * Per-cited-memory bundle: the atom id + the receipt that justifies citing it.
 */
export const CitedMemorySchema = z.object({
  memoryId: MemoryIdSchema,
  receipt: CompressedReceiptSchema,
});
export type CitedMemory = z.infer<typeof CitedMemorySchema>;

export const ActionContextPacketSchema = z.object({
  /** Scope within which the receiver is being asked to act. */
  scope: ScopeSchema,
  /** Memories the proposer cited as authority. */
  citedMemories: z.array(CitedMemorySchema),
  /** Coverage info: what should have been retrieved vs what was. */
  coverage: CoverageReceiptSchema,
  /** Any conflicts touching these memories or this topic. */
  relatedConflicts: z.array(ConflictRecordSchema),
  /** Explicit forbidden effects the receiver must honor. */
  forbiddenEffects: z.array(z.string().min(1)),
  /** Promotion boundary applicable to this packet. */
  promotionBoundary: z.string().min(1),
  /**
   * Instructions for the receiver. Must include the fail-closed rule:
   * "verify everything before acting".
   */
  receiverInstructions: z.string().min(1).max(8192),
  /** When the packet was assembled. */
  assembledAt: IsoTimestampSchema,
});
export type ActionContextPacket = z.infer<typeof ActionContextPacketSchema>;
