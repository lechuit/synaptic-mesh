import {
  type AgentId,
  AletheiaAuthority,
  type ConflictId,
  type EventId,
  type IsoTimestamp,
  type MemoryAtom,
  type MemoryId,
  type Scope,
  type Visibility,
  staticVisibilityPolicy,
} from '@aletheia-labs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type SqliteStores, openSqliteStores } from '../../store-sqlite/src/index.js';
import {
  AletheiaOpenAIResponsesBridge,
  type OpenAIResponse,
  type OpenAIResponsesClient,
  type OpenAIResponsesCreateInput,
  textFromOpenAIResponse,
} from './openai-bridge.js';

const AGENT = 'agent-openai' as AgentId;
const SCOPE: Scope = { kind: 'project', projectId: 'aletheia' };
const VISIBILITY: Visibility = { kind: 'private:user' };
const NOW = '2026-05-17T12:00:00Z' as IsoTimestamp;

let stores: SqliteStores;

describe('AletheiaOpenAIResponsesBridge', () => {
  beforeEach(() => {
    stores = openSqliteStores(':memory:');
  });

  afterEach(() => {
    stores.close();
  });

  it('records conversation events and sends model drafts through the WriteGate', async () => {
    const client = new FakeOpenAIResponsesClient([
      {
        output_text: JSON.stringify({
          proposals: [
            {
              candidateType: 'preference',
              claim: 'The user prefers concise Spanish progress updates.',
              riskLevel: 'low_local',
            },
          ],
        }),
      },
    ]);
    const bridge = bridgeFor(client);

    const result = await bridge.ingestConversation({
      agentId: AGENT,
      scope: SCOPE,
      visibility: VISIBILITY,
      episode: {
        episodeId: 'conversation-a',
        kind: 'conversation',
        sessionId: 'session-a',
      },
      turns: [{ role: 'user', content: 'Prefiero avances cortos en español.' }],
      eventId: 'evt-openai-conversation-a' as EventId,
      occurredAt: NOW,
    });

    expect(result.parseError).toBeNull();
    expect(result.event.eventId).toBe('evt-openai-conversation-a');
    expect(result.proposalResults[0]?.decision.outcome).toBe('allow_local_shadow');
    expect(result.proposalResults[0]?.atom?.status).toBe('candidate');
    expect(client.calls).toHaveLength(1);

    const inserted = await stores.memoryStore.get(
      'mem:prop:evt-openai-conversation-a:1' as MemoryId,
      [VISIBILITY],
    );
    expect(inserted?.content).toBe('The user prefers concise Spanish progress updates.');
  });

  it('fails closed on malformed model extraction and writes no memory atom', async () => {
    const client = new FakeOpenAIResponsesClient([{ output_text: 'not json' }]);
    const bridge = bridgeFor(client);

    const result = await bridge.ingestConversation({
      agentId: AGENT,
      scope: SCOPE,
      visibility: VISIBILITY,
      episode: { episodeId: 'conversation-b', kind: 'conversation' },
      turns: [{ role: 'user', content: 'This should not become memory.' }],
      eventId: 'evt-openai-conversation-b' as EventId,
      occurredAt: NOW,
    });

    expect(result.parseError).toContain('Unexpected token');
    expect(result.proposals).toEqual([]);
    expect(result.proposalResults).toEqual([]);
    expect(
      await stores.memoryStore.query({
        permittedVisibilities: [VISIBILITY],
        scope: SCOPE,
      }),
    ).toEqual([]);
  });

  it('does not call the model when governed recall fails closed', async () => {
    const client = new FakeOpenAIResponsesClient([{ output_text: 'Do not consume this.' }]);
    const bridge = bridgeFor(client);

    const result = await bridge.answerWithRecall({
      agentId: AGENT,
      scope: SCOPE,
      userMessage: 'What do you remember?',
      recall: { limit: 5 },
      action: {
        classifiedAction: 'local_report',
        target: 'local summary',
      },
    });

    expect(result.recall.decision.outcome).toBe('fetch_abstain');
    expect(result.action).toBeNull();
    expect(result.modelCalled).toBe(false);
    expect(client.calls).toHaveLength(0);
  });

  it('does not call the model when receiver-side action classification asks human', async () => {
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-openai-sensitive-action' as MemoryId,
        status: 'verified',
      }),
    );
    const client = new FakeOpenAIResponsesClient([{ output_text: 'Do not consume this.' }]);
    const bridge = bridgeFor(client);

    const result = await bridge.answerWithRecall({
      agentId: AGENT,
      scope: SCOPE,
      userMessage: 'Send the remembered preference externally.',
      recall: { limit: 5 },
      action: {
        classifiedAction: 'external_send',
        target: 'email',
      },
    });

    expect(result.recall.decision.outcome).toBe('allow_local_shadow');
    expect(result.action?.decision.outcome).toBe('ask_human');
    expect(result.modelCalled).toBe(false);
    expect(client.calls).toHaveLength(0);
  });

  it('does not call the model when governed recall hits an unresolved conflict', async () => {
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-openai-conflicted-a' as MemoryId,
        status: 'verified',
      }),
    );
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-openai-conflicted-b' as MemoryId,
        status: 'verified',
        content: 'A contradictory claim.',
      }),
    );
    await stores.conflictRegistry.record({
      conflictId: 'conflict-openai-adapter' as ConflictId,
      topic: 'adapter conflict',
      scope: SCOPE,
      claims: [
        {
          memoryId: 'mem-openai-conflicted-a' as MemoryId,
          value: 'a',
          authority: 0.8,
          freshness: 'current',
        },
        {
          memoryId: 'mem-openai-conflicted-b' as MemoryId,
          value: 'b',
          authority: 0.8,
          freshness: 'current',
        },
      ],
      status: 'unresolved',
      decisionPolicy: 'surface_conflict',
      recordedAt: NOW,
      resolvedAt: null,
    });
    const client = new FakeOpenAIResponsesClient([{ output_text: 'Do not consume this.' }]);
    const bridge = bridgeFor(client);

    const result = await bridge.answerWithRecall({
      agentId: AGENT,
      scope: SCOPE,
      userMessage: 'Summarize conflicted memory.',
      recall: { limit: 5 },
      action: {
        classifiedAction: 'local_report',
        target: 'local summary',
      },
    });

    expect(result.recall.decision.outcome).toBe('conflict_boundary_packet');
    expect(result.action).toBeNull();
    expect(result.modelCalled).toBe(false);
    expect(client.calls).toHaveLength(0);
  });

  it('calls the model only after recall and tryAct both allow local shadow use', async () => {
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-openai-safe-answer' as MemoryId,
        status: 'verified',
        content: 'The user prefers concise Spanish progress updates.',
      }),
    );
    const client = new FakeOpenAIResponsesClient([
      { output_text: 'Respuesta local basada en mem-openai-safe-answer.' },
    ]);
    const bridge = bridgeFor(client);

    const result = await bridge.answerWithRecall({
      agentId: AGENT,
      scope: SCOPE,
      userMessage: 'Summarize my communication preference.',
      recall: { limit: 5 },
      action: {
        classifiedAction: 'local_report',
        target: 'local summary',
      },
    });

    expect(result.recall.decision.outcome).toBe('allow_local_shadow');
    expect(result.action?.decision.outcome).toBe('allow_local_shadow');
    expect(result.modelCalled).toBe(true);
    expect(result.answerText).toBe('Respuesta local basada en mem-openai-safe-answer.');
    expect(client.calls).toHaveLength(1);
    expect(client.calls[0]?.input).toContain('mem-openai-safe-answer');
  });

  it('extracts text from Responses output content when output_text is absent', () => {
    const text = textFromOpenAIResponse({
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: 'nested text' }],
        },
      ],
    });

    expect(text).toBe('nested text');
  });

  it('falls back to nested Responses content when output_text is empty', () => {
    const text = textFromOpenAIResponse({
      output_text: '  ',
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: 'nested fallback' }],
        },
      ],
    });

    expect(text).toBe('nested fallback');
  });
});

function bridgeFor(client: OpenAIResponsesClient): AletheiaOpenAIResponsesBridge {
  const authority = new AletheiaAuthority({
    eventLedger: stores.eventLedger,
    memoryStore: stores.memoryStore,
    conflictRegistry: stores.conflictRegistry,
    visibilityPolicy: staticVisibilityPolicy([VISIBILITY]),
    clock: { now: () => NOW },
  });
  return new AletheiaOpenAIResponsesBridge({
    client,
    authority,
    eventLedger: stores.eventLedger,
    model: 'openai-fixture',
    clock: { now: () => NOW },
  });
}

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: overrides.memoryId ?? ('mem-openai-default' as MemoryId),
    memoryType: overrides.memoryType ?? 'claim',
    content: overrides.content ?? 'Aletheia must preserve authority boundaries.',
    sourceAgentId: overrides.sourceAgentId ?? AGENT,
    sourceEventIds: overrides.sourceEventIds ?? ['evt-source' as EventId],
    sourceMemoryIds: overrides.sourceMemoryIds ?? [],
    scope: overrides.scope ?? SCOPE,
    visibility: overrides.visibility ?? VISIBILITY,
    status: overrides.status ?? 'verified',
    scores: overrides.scores ?? {
      confidence: 0.8,
      evidence: 0.9,
      authority: 0.9,
      freshness: 0.9,
      stability: 0.7,
      consensus: 0.5,
    },
    validFrom: overrides.validFrom ?? ('2026-05-01T00:00:00Z' as IsoTimestamp),
    validUntil: overrides.validUntil ?? null,
    lastConfirmedAt: overrides.lastConfirmedAt ?? null,
    links: overrides.links ?? [],
  };
}

class FakeOpenAIResponsesClient implements OpenAIResponsesClient {
  readonly calls: OpenAIResponsesCreateInput[] = [];

  constructor(private readonly queuedResponses: OpenAIResponse[]) {}

  readonly responses = {
    create: async (input: OpenAIResponsesCreateInput): Promise<OpenAIResponse> => {
      this.calls.push(input);
      return this.queuedResponses.shift() ?? { output_text: '' };
    },
  };
}
