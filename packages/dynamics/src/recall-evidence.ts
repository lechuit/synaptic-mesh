import type { Event, EventId, EventLedger, JsonValue, MemoryAtom, MemoryId } from '@aletheia/core';
import type {
  DynamicsEvidence,
  DynamicsEvidenceContext,
  DynamicsEvidenceProvider,
} from './dynamics-engine.js';

export const SOURCE_CONSISTENT_RECALL_EVENT = 'aletheia.source_consistent_recall';

export interface SourceConsistentRecallPayload {
  readonly [key: string]: JsonValue;
  readonly aletheiaEvent: typeof SOURCE_CONSISTENT_RECALL_EVENT;
  readonly memoryId: MemoryId;
  readonly sourceEventIds: readonly EventId[];
}

export interface LedgerRecallEvidenceProviderOptions {
  readonly eventLedger: EventLedger;
}

export class LedgerRecallEvidenceProvider implements DynamicsEvidenceProvider {
  /**
   * Create a recall evidence provider backed by append-only events.
   *
   * @remarks
   * The provider treats ledger events as evidence, not authority. Only events
   * with the explicit `SOURCE_CONSISTENT_RECALL_EVENT` payload and matching
   * source-event coverage count toward promotion or last-used freshness.
   */
  constructor(private readonly options: LedgerRecallEvidenceProviderOptions) {}

  /**
   * Count source-consistent recall events for one atom.
   *
   * @remarks
   * Permission and scope filtering are delegated to `EventLedger.query()` before
   * payload inspection. The result is deterministic for a fixed ledger and
   * context clock.
   */
  async evidenceFor(atom: MemoryAtom, context: DynamicsEvidenceContext): Promise<DynamicsEvidence> {
    const events = await this.options.eventLedger.query({
      scope: context.scope,
      permittedVisibilities: context.permittedVisibilities,
      since: atom.validFrom,
      until: context.now,
    });

    const matching = events.filter((event) => isSourceConsistentRecallEvent(event, atom));
    const timestamps = matching.map((event) => event.occurredAt).sort();
    const first = timestamps[0];
    const last = timestamps.at(-1);

    return {
      sourceConsistentRecalls: matching.length,
      ...(last !== undefined ? { lastUsedAt: last } : {}),
      ...(first !== undefined ? { sourceConsistentSince: first } : {}),
    };
  }
}

/**
 * Build the canonical payload hosts should append after a source-consistent recall.
 */
export function sourceConsistentRecallPayload(atom: MemoryAtom): SourceConsistentRecallPayload {
  return {
    aletheiaEvent: SOURCE_CONSISTENT_RECALL_EVENT,
    memoryId: atom.memoryId,
    sourceEventIds: [...atom.sourceEventIds],
  };
}

function isSourceConsistentRecallEvent(event: Event, atom: MemoryAtom): boolean {
  const payload = event.payload;
  if (!isRecallPayload(payload)) return false;
  if (payload.aletheiaEvent !== SOURCE_CONSISTENT_RECALL_EVENT) return false;
  if (payload.memoryId !== atom.memoryId) return false;
  if (!Array.isArray(payload.sourceEventIds)) return false;

  const recalledSources = new Set(
    payload.sourceEventIds.filter((value): value is string => typeof value === 'string'),
  );
  return atom.sourceEventIds.every((eventId) => recalledSources.has(eventId));
}

function isRecallPayload(value: unknown): value is {
  readonly aletheiaEvent?: unknown;
  readonly memoryId?: unknown;
  readonly sourceEventIds?: unknown;
} {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
