/**
 * Primitive value objects shared across all domain types.
 *
 * All identifiers are zod-branded strings: at runtime a `MemoryId` and an
 * `EventId` are both strings; TypeScript enforces nominal separation so they
 * cannot be mixed. The single source of truth is the zod schema — types are
 * derived from it via `z.infer`.
 */

import { z } from 'zod';

// -- Branded IDs (one brand system: zod) -------------------------------------

const idShape = z.string().min(1).max(256);

export const MemoryIdSchema = idShape.brand<'MemoryId'>();
export type MemoryId = z.infer<typeof MemoryIdSchema>;

export const EventIdSchema = idShape.brand<'EventId'>();
export type EventId = z.infer<typeof EventIdSchema>;

export const ProposalIdSchema = idShape.brand<'ProposalId'>();
export type ProposalId = z.infer<typeof ProposalIdSchema>;

export const ConflictIdSchema = idShape.brand<'ConflictId'>();
export type ConflictId = z.infer<typeof ConflictIdSchema>;

export const AgentIdSchema = idShape.brand<'AgentId'>();
export type AgentId = z.infer<typeof AgentIdSchema>;

export const SourceArtifactIdSchema = idShape.brand<'SourceArtifactId'>();
export type SourceArtifactId = z.infer<typeof SourceArtifactIdSchema>;

export const ReceiptIdSchema = idShape.brand<'ReceiptId'>();
export type ReceiptId = z.infer<typeof ReceiptIdSchema>;

// -- Timestamps --------------------------------------------------------------

/** ISO-8601 UTC timestamp. We never accept partial dates or local timezones. */
export const IsoTimestampSchema = z
  .string()
  .datetime({ offset: false, message: 'must be ISO-8601 in UTC (e.g. 2026-05-16T12:00:00Z)' });
export type IsoTimestamp = z.infer<typeof IsoTimestampSchema>;

// -- Hash digests ------------------------------------------------------------

/**
 * Content digest of a source artifact. We accept any well-formed hex hash
 * (sha256, blake3, etc.) — the algorithm is implicit in the lane that produced it.
 */
export const HashDigestSchema = z
  .string()
  .regex(/^[a-f0-9]{32,128}$/i, 'must be a hex digest between 32 and 128 chars');
export type HashDigest = z.infer<typeof HashDigestSchema>;

// -- Source paths / lanes ----------------------------------------------------

/**
 * Path or registry lane to the source artifact. NOT prose: must be resolvable
 * to a real artifact by the source-lane resolver.
 */
export const SourcePathSchema = z
  .string()
  .min(1)
  .max(1024)
  .refine((s) => !s.includes('\n'), 'source path cannot contain newlines');
export type SourcePath = z.infer<typeof SourcePathSchema>;
