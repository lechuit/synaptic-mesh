#!/usr/bin/env node

import { AletheiaAnthropicBridge } from '../../packages/adapters-anthropic/dist/index.js';
import { AletheiaAuthority, staticVisibilityPolicy } from '../../packages/core/dist/index.js';
import { openSqliteStores } from '../../packages/store-sqlite/dist/index.js';

const agentId = 'agent-demo';
const now = '2026-05-17T12:00:00Z';
const scope = { kind: 'project', projectId: 'aletheia-demo' };
const visibility = { kind: 'private:user' };

class FixtureAnthropicClient {
  calls = [];
  texts = [
    JSON.stringify({
      proposals: [
        {
          candidateType: 'preference',
          claim: 'The user prefers concise Spanish progress updates.',
          riskLevel: 'low_local',
        },
      ],
    }),
    'Local answer citing mem:prop:evt-demo-session-a:1.',
  ];

  messages = {
    create: async (input) => {
      this.calls.push(input);
      return {
        content: [{ type: 'text', text: this.texts.shift() ?? '' }],
      };
    },
  };
}

const stores = openSqliteStores(':memory:');
try {
  const client = new FixtureAnthropicClient();
  const authority = new AletheiaAuthority({
    eventLedger: stores.eventLedger,
    memoryStore: stores.memoryStore,
    conflictRegistry: stores.conflictRegistry,
    visibilityPolicy: staticVisibilityPolicy([visibility]),
    clock: { now: () => now },
  });
  const bridge = new AletheiaAnthropicBridge({
    client,
    authority,
    eventLedger: stores.eventLedger,
    model: 'claude-fixture',
    clock: { now: () => now },
  });

  const ingestion = await bridge.ingestConversation({
    agentId,
    scope,
    visibility,
    episode: {
      episodeId: 'demo-session-a',
      kind: 'conversation',
      sessionId: 'session-a',
    },
    turns: [{ role: 'user', content: 'Prefiero avances cortos en español.' }],
    eventId: 'evt-demo-session-a',
    occurredAt: now,
  });

  const proposedMemoryId = ingestion.proposalResults[0]?.atom?.memoryId ?? null;
  const candidateAction =
    proposedMemoryId === null
      ? null
      : await authority.tryAct(
          { classifiedAction: 'local_report', target: 'local demo report' },
          { agentId, scope, citedMemoryIds: [proposedMemoryId] },
        );

  const verification =
    proposedMemoryId === null
      ? { kind: 'rejected', reason: 'no proposal' }
      : await stores.memoryStore.transitionStatus(
          proposedMemoryId,
          'verified',
          {
            actor: agentId,
            rationale: 'fixture-demo deterministic human verification',
          },
          { at: now },
        );

  const localAnswer = await bridge.answerWithRecall({
    agentId,
    scope,
    userMessage: 'Summarize my communication preference.',
    recall: { limit: 5 },
    action: {
      classifiedAction: 'local_report',
      target: 'local demo report',
    },
  });

  const callCountBeforeSensitive = client.calls.length;
  const sensitiveAnswer = await bridge.answerWithRecall({
    agentId,
    scope,
    userMessage: 'Send my preference externally.',
    recall: { limit: 5 },
    action: {
      classifiedAction: 'external_send',
      target: 'external message',
    },
  });

  const boundaryViolations = [
    ...(candidateAction?.decision.outcome === 'fetch_abstain'
      ? []
      : ['candidate_memory_allowed_action']),
    ...(verification.kind === 'applied' ? [] : ['verification_transition_failed']),
    ...(localAnswer.modelCalled && localAnswer.action?.decision.outcome === 'allow_local_shadow'
      ? []
      : ['local_allowed_answer_not_called']),
    ...(sensitiveAnswer.modelCalled ? ['sensitive_action_called_model'] : []),
    ...(client.calls.length === callCountBeforeSensitive ? [] : ['sensitive_action_added_call']),
  ];

  const report = {
    proposedMemoryId,
    candidateActionOutcome: candidateAction?.decision.outcome ?? 'deny',
    verificationOutcome: verification.kind,
    localActionOutcome: localAnswer.action?.decision.outcome ?? localAnswer.recall.decision.outcome,
    sensitiveActionOutcome:
      sensitiveAnswer.action?.decision.outcome ?? sensitiveAnswer.recall.decision.outcome,
    modelCallCount: client.calls.length,
    boundaryViolations,
  };

  console.info(JSON.stringify(report, null, 2));
  if (boundaryViolations.length > 0) {
    process.exitCode = 1;
  }
} finally {
  stores.close();
}
