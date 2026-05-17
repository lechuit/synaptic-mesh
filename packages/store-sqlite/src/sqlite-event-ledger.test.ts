import type { Event, Visibility } from '@aletheia/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type SqliteStores, openSqliteStores } from './index.js';

let stores: SqliteStores;

beforeEach(() => {
  stores = openSqliteStores(':memory:');
});

afterEach(() => {
  stores.close();
});

function makeEvent(over: Partial<Event> = {}): Event {
  return {
    eventId: 'evt-1' as Event['eventId'],
    kind: 'observation',
    agentId: 'agent-1' as Event['agentId'],
    occurredAt: '2026-05-16T12:00:00Z',
    payload: { note: 'hello' },
    scope: { kind: 'local' },
    visibility: { kind: 'private:agent' },
    ...over,
  };
}

const ALLOW_ALL: readonly Visibility[] = [
  { kind: 'private:agent' },
  { kind: 'private:user' },
  { kind: 'global:safe' },
  { kind: 'sealed:sensitive' },
  { kind: 'ephemeral' },
  { kind: 'team', name: 'core' },
];

describe('SqliteEventLedger', () => {
  it('appends and retrieves an event round-trip', async () => {
    const e = makeEvent();
    const id = await stores.eventLedger.append(e);
    expect(id).toBe(e.eventId);

    const got = await stores.eventLedger.get(e.eventId, ALLOW_ALL);
    expect(got).not.toBeNull();
    expect(got?.kind).toBe('observation');
    if (got?.payload && typeof got.payload === 'object' && !Array.isArray(got.payload)) {
      expect(got.payload).toEqual({ note: 'hello' });
    }
  });

  it('rejects duplicate event_id (append-only)', async () => {
    await stores.eventLedger.append(makeEvent({ eventId: 'evt-dup' as Event['eventId'] }));
    await expect(
      stores.eventLedger.append(makeEvent({ eventId: 'evt-dup' as Event['eventId'] })),
    ).rejects.toThrow(/duplicate event_id/);
  });

  it('returns null when caller cannot see the visibility', async () => {
    await stores.eventLedger.append(
      makeEvent({
        eventId: 'evt-private' as Event['eventId'],
        visibility: { kind: 'sealed:sensitive' },
      }),
    );

    const got = await stores.eventLedger.get('evt-private' as Event['eventId'], [
      { kind: 'private:agent' },
    ]);
    expect(got).toBeNull();
  });

  it('returns nothing when permitted set is empty (fail-closed)', async () => {
    await stores.eventLedger.append(makeEvent());
    const result = await stores.eventLedger.query({ permittedVisibilities: [] });
    expect(result).toHaveLength(0);
  });

  it('filters by time window and orders ascending', async () => {
    await stores.eventLedger.append(
      makeEvent({ eventId: 'a' as Event['eventId'], occurredAt: '2026-05-16T10:00:00Z' }),
    );
    await stores.eventLedger.append(
      makeEvent({ eventId: 'b' as Event['eventId'], occurredAt: '2026-05-16T11:00:00Z' }),
    );
    await stores.eventLedger.append(
      makeEvent({ eventId: 'c' as Event['eventId'], occurredAt: '2026-05-16T12:00:00Z' }),
    );

    const result = await stores.eventLedger.query({
      permittedVisibilities: ALLOW_ALL,
      since: '2026-05-16T10:30:00Z',
      until: '2026-05-16T11:30:00Z',
    });

    expect(result.map((e) => e.eventId)).toEqual(['b']);
  });

  it('counts events matching the filter', async () => {
    for (let i = 0; i < 5; i++) {
      await stores.eventLedger.append(makeEvent({ eventId: `evt-${i}` as Event['eventId'] }));
    }
    const n = await stores.eventLedger.count({ permittedVisibilities: ALLOW_ALL });
    expect(n).toBe(5);
  });
});
