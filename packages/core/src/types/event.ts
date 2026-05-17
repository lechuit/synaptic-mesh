/**
 * Event — the raw, append-only unit recorded in the EventLedger.
 * Source: specs/aletheia-memory-authority-v0.md §1 "Event Ledger".
 *
 * Spec rules carried into the type:
 *   - events are evidence, not memory authority by themselves;
 *   - summaries never replace original events;
 *   - rollback/debug requires source events;
 *   - external/untrusted text is recorded as "source X claims Y", not as instruction.
 *
 * `payload` is intentionally JSON-shaped (not free text). External/untrusted
 * material lands inside a `claim_of` wrapper so the EventLedger never stores
 * raw instructions a downstream component might mistake for authority.
 */

import { z } from 'zod';
import { ScopeSchema, VisibilitySchema } from './enums.js';
import { AgentIdSchema, EventIdSchema, IsoTimestampSchema } from './primitives.js';

export const EventKindSchema = z.enum([
  'conversation',
  'tool_output',
  'document',
  'observation',
  'decision',
  'artifact_change',
  'external_claim',
]);
export type EventKind = z.infer<typeof EventKindSchema>;

/**
 * JSON-serializable payload. Restricted so the storage layer can persist it
 * via JSON.stringify without information loss.
 */
const JsonScalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type JsonScalar = z.infer<typeof JsonScalarSchema>;
export type JsonValue = JsonScalar | { readonly [k: string]: JsonValue } | readonly JsonValue[];
export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([JsonScalarSchema, z.array(JsonValueSchema), z.record(JsonValueSchema)]),
);

export const EventSchema = z.object({
  eventId: EventIdSchema,
  kind: EventKindSchema,
  /** Null when the event has no responsible agent (e.g. external document). */
  agentId: AgentIdSchema.nullable(),
  occurredAt: IsoTimestampSchema,
  /** Structured payload — no free-text "instruction-shaped" content. */
  payload: JsonValueSchema,
  scope: ScopeSchema,
  visibility: VisibilitySchema,
});
export type Event = z.infer<typeof EventSchema>;
