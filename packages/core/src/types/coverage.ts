/**
 * Coverage receipt (specs/memory-authority-receipt-v0.md — "Receipt classes").
 *
 * Tells a receiver which high-boundary claims should have been retrieved and
 * which are missing. Missing high-boundary digests are absence-of-retrieval,
 * not permission to ignore them.
 */

import { z } from 'zod';
import { HashDigestSchema } from './primitives.js';

export const CoverageDecisionSchema = z.enum(['complete', 'partial', 'critical_gap', 'absent']);
export type CoverageDecision = z.infer<typeof CoverageDecisionSchema>;

export const CoverageReceiptSchema = z
  .object({
    /** Number of high-boundary/must-surface claims in this scope. */
    highBoundaryTotal: z.number().int().nonnegative(),
    /** Number of high-boundary claims actually retrieved in this packet. */
    retrievedHighBoundary: z.number().int().nonnegative(),
    /** Digests of high-boundary claims that should have been retrieved but weren't. */
    missingHighBoundaryDigests: z.array(HashDigestSchema),
    /** Receiver-side decision based on the above. */
    coverageDecision: CoverageDecisionSchema,
  })
  .refine((c) => c.retrievedHighBoundary <= c.highBoundaryTotal, {
    message: 'retrievedHighBoundary cannot exceed highBoundaryTotal',
    path: ['retrievedHighBoundary'],
  })
  .refine(
    (c) => c.missingHighBoundaryDigests.length === c.highBoundaryTotal - c.retrievedHighBoundary,
    {
      message: 'missingHighBoundaryDigests count must equal (total - retrieved)',
      path: ['missingHighBoundaryDigests'],
    },
  );
export type CoverageReceipt = z.infer<typeof CoverageReceiptSchema>;
