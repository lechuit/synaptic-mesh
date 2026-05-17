/**
 * Enumerated value sets used across the receipt and atom protocols.
 *
 * Every union here is "fail-closed by default": adding a new variant requires
 * a deliberate spec change. Unknown strings parsed into these schemas reject.
 */

import { z } from 'zod';

// -- Memory atom status (specs/aletheia-memory-authority-v0.md §4) -----------

export const MemoryStatusSchema = z.enum([
  'candidate',
  'verified',
  'trusted',
  'deprecated',
  'rejected',
  'sealed',
  'human_required',
]);
export type MemoryStatus = z.infer<typeof MemoryStatusSchema>;

// -- Memory types (atom categories) ------------------------------------------

export const MemoryTypeSchema = z.enum([
  'observation',
  'claim',
  'preference',
  'policy',
  'decision',
  'task_state',
  'warning',
  'skill',
]);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

// -- Visibility planes (specs §5) --------------------------------------------

/**
 * Visibility is a discriminated union because `team:<name>` carries a payload
 * the other variants don't have. Encoded compactly on the wire as a single string.
 */
export const VisibilitySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('private:agent') }),
  z.object({ kind: z.literal('private:user') }),
  z.object({ kind: z.literal('team'), name: z.string().min(1).max(128) }),
  z.object({ kind: z.literal('global:safe') }),
  z.object({ kind: z.literal('sealed:sensitive') }),
  z.object({ kind: z.literal('ephemeral') }),
]);
export type Visibility = z.infer<typeof VisibilitySchema>;

// -- Scope (specs §4 and ACP) ------------------------------------------------

export const ScopeKindSchema = z.enum(['local', 'project', 'user', 'team', 'global']);
export type ScopeKind = z.infer<typeof ScopeKindSchema>;

/**
 * Scope can be bare (`local`, `global`) or carry an id (`project:foo`, `team:bar`).
 */
export const ScopeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('local') }),
  z.object({ kind: z.literal('project'), projectId: z.string().min(1) }),
  z.object({ kind: z.literal('user'), userId: z.string().min(1) }),
  z.object({ kind: z.literal('team'), teamId: z.string().min(1) }),
  z.object({ kind: z.literal('global') }),
]);
export type Scope = z.infer<typeof ScopeSchema>;

// -- Freshness (receipt FRESH field) -----------------------------------------

export const FreshnessSchema = z.enum(['current', 'stale', 'unknown']);
export type Freshness = z.infer<typeof FreshnessSchema>;

// -- Risk tier ---------------------------------------------------------------

export const RiskTierSchema = z.enum(['low_local', 'medium_local', 'sensitive']);
export type RiskTier = z.infer<typeof RiskTierSchema>;

// -- Effect boundary ---------------------------------------------------------

export const EffectBoundarySchema = z.enum([
  'local_only',
  'no_runtime_effect',
  'external_send_requires_human',
  'config_change_forbidden',
]);
export type EffectBoundary = z.infer<typeof EffectBoundarySchema>;

// -- Promotion boundary ------------------------------------------------------

export const PromotionBoundarySchema = z.enum([
  'no_memory_write',
  'no_durable_promotion',
  'human_confirmation_required',
]);
export type PromotionBoundary = z.infer<typeof PromotionBoundarySchema>;

// -- Readiness boundary ------------------------------------------------------

export const ReadinessBoundarySchema = z.enum([
  'paper_only',
  'fixture_only',
  'research_ready_not_implementation_ready',
  'implementation_ready',
]);
export type ReadinessBoundary = z.infer<typeof ReadinessBoundarySchema>;

// -- Target status (memory authority receipt) --------------------------------

export const TargetStatusSchema = z.enum([
  'candidate',
  'partial',
  'experiment_ready',
  'pass_closed',
  'blocked',
  'requires_human',
]);
export type TargetStatus = z.infer<typeof TargetStatusSchema>;

// -- Lineage completeness ----------------------------------------------------

export const LineageCompletenessSchema = z.enum(['complete', 'partial', 'unknown']);
export type LineageCompleteness = z.infer<typeof LineageCompletenessSchema>;

// -- Later restrictive event (LRE) -------------------------------------------

/**
 * `LRE=none` is the only safe-to-act value. Anything else (a supersession,
 * a tombstone, an unresolved conflict) fails closed.
 */
export const LaterRestrictiveEventSchema = z.enum([
  'none',
  'superseded',
  'tombstoned',
  'conflict_unresolved',
  'unknown',
]);
export type LaterRestrictiveEvent = z.infer<typeof LaterRestrictiveEventSchema>;

// -- Action classification (proposed action verbs) ---------------------------

/**
 * The `ACT` field of a compressed receipt and the proposed action of `tryAct`.
 * Sensitive verbs always route to ask_human regardless of receipt validity.
 */
export const ActionClassSchema = z.enum([
  'local_documentation',
  'local_fixture',
  'local_diagnostic',
  'local_report',
  'external_send',
  'runtime_change',
  'config_change',
  'publication',
  'durable_memory_write',
  'delete',
  'canary',
  'enforcement',
  'production_action',
  'l2_plus',
  'unknown',
]);
export type ActionClass = z.infer<typeof ActionClassSchema>;

/** Verbs that may proceed locally if every other check passes. */
export const SAFE_LOCAL_ACTIONS: ReadonlySet<ActionClass> = new Set<ActionClass>([
  'local_documentation',
  'local_fixture',
  'local_diagnostic',
  'local_report',
]);

/** Verbs that always require human approval regardless of receipt validity. */
export const SENSITIVE_ACTIONS: ReadonlySet<ActionClass> = new Set<ActionClass>([
  'external_send',
  'runtime_change',
  'config_change',
  'publication',
  'durable_memory_write',
  'delete',
  'canary',
  'enforcement',
  'production_action',
  'l2_plus',
  'unknown',
]);

// -- Memory link relations (atom-to-atom edges) ------------------------------

export const LinkRelationSchema = z.enum(['supports', 'contradicts', 'supersedes', 'derived_from']);
export type LinkRelation = z.infer<typeof LinkRelationSchema>;
