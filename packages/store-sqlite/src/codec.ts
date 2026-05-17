/**
 * Encoders / decoders between domain types and SQLite row shapes.
 *
 * Every "row → domain" path goes through a zod schema so corruption in the
 * database surfaces as a parse error, not a silent bad value downstream.
 */

import {
  type ConflictRecord,
  ConflictRecordSchema,
  type Event,
  EventSchema,
  type MemoryAtom,
  MemoryAtomSchema,
  scopeKey,
  visibilityKey,
} from '@aletheia/core';

// -- Event row codec ---------------------------------------------------------

export interface EventRow {
  event_id: string;
  kind: string;
  agent_id: string | null;
  occurred_at: string;
  payload_json: string;
  scope_json: string;
  visibility_json: string;
  scope_key: string;
  visibility_key: string;
  inserted_at: string;
}

export function eventToRow(event: Event, insertedAt: string): EventRow {
  return {
    event_id: event.eventId,
    kind: event.kind,
    agent_id: event.agentId,
    occurred_at: event.occurredAt,
    payload_json: JSON.stringify(event.payload),
    scope_json: JSON.stringify(event.scope),
    visibility_json: JSON.stringify(event.visibility),
    scope_key: scopeKey(event.scope),
    visibility_key: visibilityKey(event.visibility),
    inserted_at: insertedAt,
  };
}

export function rowToEvent(row: EventRow): Event {
  return EventSchema.parse({
    eventId: row.event_id,
    kind: row.kind,
    agentId: row.agent_id,
    occurredAt: row.occurred_at,
    payload: JSON.parse(row.payload_json),
    scope: JSON.parse(row.scope_json),
    visibility: JSON.parse(row.visibility_json),
  });
}

// -- MemoryAtom row codec ----------------------------------------------------

export interface AtomRow {
  memory_id: string;
  memory_type: string;
  content: string;
  source_agent_id: string;
  source_event_ids_json: string;
  source_memory_ids_json: string;
  scope_json: string;
  visibility_json: string;
  status: string;
  scores_json: string;
  valid_from: string;
  valid_until: string | null;
  last_confirmed_at: string | null;
  links_json: string;
  scope_key: string;
  visibility_key: string;
  inserted_at: string;
}

export function atomToRow(atom: MemoryAtom, insertedAt: string): AtomRow {
  return {
    memory_id: atom.memoryId,
    memory_type: atom.memoryType,
    content: atom.content,
    source_agent_id: atom.sourceAgentId,
    source_event_ids_json: JSON.stringify(atom.sourceEventIds),
    source_memory_ids_json: JSON.stringify(atom.sourceMemoryIds),
    scope_json: JSON.stringify(atom.scope),
    visibility_json: JSON.stringify(atom.visibility),
    status: atom.status,
    scores_json: JSON.stringify(atom.scores),
    valid_from: atom.validFrom,
    valid_until: atom.validUntil,
    last_confirmed_at: atom.lastConfirmedAt,
    links_json: JSON.stringify(atom.links),
    scope_key: scopeKey(atom.scope),
    visibility_key: visibilityKey(atom.visibility),
    inserted_at: insertedAt,
  };
}

export function rowToAtom(row: AtomRow): MemoryAtom {
  return MemoryAtomSchema.parse({
    memoryId: row.memory_id,
    memoryType: row.memory_type,
    content: row.content,
    sourceAgentId: row.source_agent_id,
    sourceEventIds: JSON.parse(row.source_event_ids_json),
    sourceMemoryIds: JSON.parse(row.source_memory_ids_json),
    scope: JSON.parse(row.scope_json),
    visibility: JSON.parse(row.visibility_json),
    status: row.status,
    scores: JSON.parse(row.scores_json),
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    lastConfirmedAt: row.last_confirmed_at,
    links: JSON.parse(row.links_json),
  });
}

// -- Conflict row codec ------------------------------------------------------

export interface ConflictRow {
  conflict_id: string;
  topic: string;
  scope_json: string;
  scope_key: string;
  claims_json: string;
  status: string;
  decision_policy: string;
  recorded_at: string;
  resolved_at: string | null;
}

export function conflictToRow(conflict: ConflictRecord): ConflictRow {
  return {
    conflict_id: conflict.conflictId,
    topic: conflict.topic,
    scope_json: JSON.stringify(conflict.scope),
    scope_key: scopeKey(conflict.scope),
    claims_json: JSON.stringify(conflict.claims),
    status: conflict.status,
    decision_policy: conflict.decisionPolicy,
    recorded_at: conflict.recordedAt,
    resolved_at: conflict.resolvedAt,
  };
}

export function rowToConflict(row: ConflictRow): ConflictRecord {
  return ConflictRecordSchema.parse({
    conflictId: row.conflict_id,
    topic: row.topic,
    scope: JSON.parse(row.scope_json),
    claims: JSON.parse(row.claims_json),
    status: row.status,
    decisionPolicy: row.decision_policy,
    recordedAt: row.recorded_at,
    resolvedAt: row.resolved_at,
  });
}

// -- Permission filtering helper --------------------------------------------

import type { Visibility } from '@aletheia/core';

/**
 * Build the `visibility_key IN (?, ?, ...)` clause and its parameter array.
 * Returns `{ clause, params }`. Use as: `WHERE ${clause}` then spread params.
 *
 * If the permitted set is empty, returns a clause that matches no rows —
 * a permission-empty caller sees nothing, which is the fail-closed default.
 */
export function permittedClause(permitted: readonly Visibility[]): {
  clause: string;
  params: readonly string[];
} {
  if (permitted.length === 0) {
    return { clause: '1 = 0', params: [] };
  }
  const keys = permitted.map(visibilityKey);
  const placeholders = keys.map(() => '?').join(', ');
  return { clause: `visibility_key IN (${placeholders})`, params: keys };
}
