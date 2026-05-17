/**
 * Compressed Temporal Receipt (specs/compressed-temporal-receipt-v0.md).
 *
 * The compact cross-source handoff tuple. 11 required authority fields,
 * 5 optional audit fields. Every field has a fail-closed interpretation.
 *
 * Wire keys (deliberately short, from the spec):
 *   Required: SRC, SRCPATH, SRCDIGEST, PROD, FRESH, SCOPE, PB, NO, LRE, TOK, ACT
 *   Optional: CTRID, RB, CHAIN, CONF, PROSE
 */

import { z } from 'zod';
import {
  ActionClassSchema,
  EffectBoundarySchema,
  FreshnessSchema,
  LaterRestrictiveEventSchema,
  PromotionBoundarySchema,
  ScopeKindSchema,
} from './enums.js';
import {
  HashDigestSchema,
  IsoTimestampSchema,
  ReceiptIdSchema,
  SourceArtifactIdSchema,
  SourcePathSchema,
} from './primitives.js';

/**
 * Internal representation of a Compressed Temporal Receipt.
 *
 * This is the parsed, validated form. The wire format (SRC=...; PROD=...; ...)
 * is handled by codec functions in a separate module — never construct one of
 * these by hand from untrusted input, always go through the parser.
 */
export const CompressedReceiptSchema = z.object({
  // -- Required authority-critical fields -----------------------------------
  /** SRC — source artifact identity/lane. */
  src: SourceArtifactIdSchema,
  /** SRCPATH — source path or source lane binding. */
  srcPath: SourcePathSchema,
  /** SRCDIGEST — digest of the source artifact's content. */
  srcDigest: HashDigestSchema,
  /** PROD — produced-at timestamp (ISO-8601 UTC). */
  producedAt: IsoTimestampSchema,
  /** FRESH — receiver freshness assessment. */
  freshness: FreshnessSchema,
  /** SCOPE — usable scope kind of the packet. */
  scope: ScopeKindSchema,
  /** PB — promotion/use boundary. */
  promotionBoundary: PromotionBoundarySchema,
  /**
   * NO — explicit forbidden effects.
   *
   * Spec rule: this is a *prohibition lane*, not a permission lane. The
   * presence of words like "runtime" or "L2+" inside `NO` means "forbidden",
   * NOT "granted". The receiver MUST NOT treat these as operational grants.
   *
   * Empty array fails closed (missing prohibitions → fetch_abstain).
   */
  forbiddenEffects: z.array(EffectBoundarySchema).min(1, {
    message: 'NO must list at least one forbidden effect — empty fails closed',
  }),
  /** LRE — later restrictive event status. Anything except `none` fails closed. */
  laterRestrictiveEvent: LaterRestrictiveEventSchema,
  /**
   * TOK — tuple completeness token. `true` means "all required fields are
   * present and not truncated". `false` fails closed.
   */
  tupleComplete: z.literal(true, {
    errorMap: () => ({ message: 'TOK must be true; incomplete tuples fail closed' }),
  }),
  /** ACT — proposed action, to be independently classified by the receiver. */
  proposedAction: ActionClassSchema,

  // -- Optional audit/readability fields ------------------------------------
  /** CTRID — receipt identifier (audit only, never authority). */
  receiptId: ReceiptIdSchema.optional(),
  /** RB — receiver behavior hint (useful, not permission). */
  receiverHint: z.string().max(512).optional(),
  /** CHAIN — lineage label (useful, not permission). */
  chain: z.string().max(512).optional(),
  /**
   * CONF — confidence value [0, 1]. NEVER authority by itself.
   * Spec: "confidence cannot override weak evidence, stale freshness,
   * wrong scope, or missing permission."
   */
  confidence: z.number().min(0).max(1).optional(),
  /**
   * PROSE — human-readable summary. NEVER authority by itself; the receiver
   * must not infer permission from polished prose.
   */
  prose: z.string().max(8192).optional(),
});

export type CompressedReceipt = z.infer<typeof CompressedReceiptSchema>;

/**
 * The 11 authority-critical wire keys, in spec-defined order.
 * Used by parsers and by `tupleComplete` checks.
 */
export const AUTHORITY_CRITICAL_KEYS = [
  'SRC',
  'SRCPATH',
  'SRCDIGEST',
  'PROD',
  'FRESH',
  'SCOPE',
  'PB',
  'NO',
  'LRE',
  'TOK',
  'ACT',
] as const;
export type AuthorityCriticalKey = (typeof AUTHORITY_CRITICAL_KEYS)[number];

/**
 * The 5 optional audit keys.
 */
export const OPTIONAL_AUDIT_KEYS = ['CTRID', 'RB', 'CHAIN', 'CONF', 'PROSE'] as const;
export type OptionalAuditKey = (typeof OPTIONAL_AUDIT_KEYS)[number];
