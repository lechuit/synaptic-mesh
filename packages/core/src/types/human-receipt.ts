/**
 * Human-readable receipt (specs/memory-authority-receipt-v0.md §"Canonical fields").
 *
 * The verbose YAML/Markdown form for audits and human handoffs. Less compact
 * than CompressedReceipt but carries the same authority semantics.
 */

import { z } from 'zod';
import {
  ActionClassSchema,
  EffectBoundarySchema,
  FreshnessSchema,
  LineageCompletenessSchema,
  PromotionBoundarySchema,
  ReadinessBoundarySchema,
  RiskTierSchema,
  TargetStatusSchema,
} from './enums.js';
import { IsoTimestampSchema, SourceArtifactIdSchema, SourcePathSchema } from './primitives.js';

/**
 * The "nextAllowedAction" sub-object of a human-readable receipt.
 * Spec rule: must be exact; generic "continue" is not authority.
 */
export const NextAllowedActionSchema = z.object({
  /** Specific verb the receiver is allowed to take. */
  action: ActionClassSchema,
  /** Exact next target (e.g. file path, fixture id). */
  target: z.string().min(1).max(512),
  /** The source target this succeeds. */
  successorOf: z.string().min(1).max(512),
  /** Whether re-running the action is allowed. */
  redoAllowed: z.boolean(),
});
export type NextAllowedAction = z.infer<typeof NextAllowedActionSchema>;

export const HumanReadableReceiptSchema = z.object({
  sourceArtifactId: SourceArtifactIdSchema,
  sourceArtifactPath: SourcePathSchema,
  producedAt: IsoTimestampSchema,
  receiverFreshness: FreshnessSchema,
  targetStatus: TargetStatusSchema,
  readinessBoundary: ReadinessBoundarySchema,
  effectBoundary: EffectBoundarySchema,
  promotionBoundary: PromotionBoundarySchema,
  lineageCompleteness: LineageCompletenessSchema,
  riskTier: RiskTierSchema,
  nextAllowedAction: NextAllowedActionSchema,
  /** How the claim was checked (free text, audit only). */
  validation: z.string().min(1).max(2048),
  /** Local/shadow safety result string (audit only). */
  safetyResult: z.string().min(1).max(2048),
});
export type HumanReadableReceipt = z.infer<typeof HumanReadableReceiptSchema>;
