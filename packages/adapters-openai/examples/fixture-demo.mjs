import { AletheiaAuthority, staticVisibilityPolicy } from '../../core/dist/index.js';
import { openSqliteStores } from '../../store-sqlite/dist/index.js';
import { AletheiaOpenAIResponsesBridge } from '../dist/index.js';

const AGENT = 'agent-openai-fixture';
const NOW = '2026-05-17T12:00:00Z';
const SCOPE = { kind: 'project', projectId: 'aletheia-openai-fixture' };
const VISIBILITY = { kind: 'private:user' };

class FixtureResponsesClient {
  calls = [];
  responses = [
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
    {
      output_text: 'Respuesta local basada en memoria gobernada.',
    },
  ];

  responsesApi = {
    create: async (input) => {
      this.calls.push(input);
      return this.responses.shift() ?? { output_text: '' };
    },
  };

  get responsesClient() {
    return { responses: this.responsesApi };
  }
}

const stores = openSqliteStores(':memory:');
try {
  const authority = new AletheiaAuthority({
    eventLedger: stores.eventLedger,
    memoryStore: stores.memoryStore,
    conflictRegistry: stores.conflictRegistry,
    visibilityPolicy: staticVisibilityPolicy([VISIBILITY]),
    clock: { now: () => NOW },
  });
  const fixture = new FixtureResponsesClient();
  const bridge = new AletheiaOpenAIResponsesBridge({
    client: fixture.responsesClient,
    authority,
    eventLedger: stores.eventLedger,
    model: 'openai-fixture',
    clock: { now: () => NOW },
  });

  const ingestion = await bridge.ingestConversation({
    agentId: AGENT,
    scope: SCOPE,
    visibility: VISIBILITY,
    episode: { episodeId: 'openai-fixture-session', kind: 'conversation' },
    turns: [{ role: 'user', content: 'Prefiero avances cortos en español.' }],
    eventId: 'evt-openai-fixture',
    occurredAt: NOW,
  });
  const atom = ingestion.proposalResults[0]?.atom;
  if (!atom) throw new Error('fixture proposal did not create an atom');
  const verification = await stores.memoryStore.transitionStatus(atom.memoryId, 'verified', {
    actor: AGENT,
    rationale: 'fixture: verify candidate before governed answer',
  });

  const answer = await bridge.answerWithRecall({
    agentId: AGENT,
    scope: SCOPE,
    userMessage: 'Resume mi preferencia de comunicación.',
    recall: { limit: 5 },
    action: {
      classifiedAction: 'local_report',
      target: 'local fixture report',
    },
  });

  const report = {
    proposedMemoryId: atom.memoryId,
    proposalOutcome: ingestion.proposalResults[0]?.decision.outcome,
    verificationOutcome: verification.kind,
    recallOutcome: answer.recall.decision.outcome,
    actionOutcome: answer.action?.decision.outcome ?? null,
    modelCallCount: fixture.calls.length,
    boundaryViolations:
      answer.recall.decision.outcome === 'allow_local_shadow' &&
      answer.action?.decision.outcome === 'allow_local_shadow' &&
      answer.modelCalled
        ? []
        : ['governed answer path did not reach allow_local_shadow'],
  };

  console.info(JSON.stringify(report, null, 2));
  if (report.boundaryViolations.length > 0) {
    process.exitCode = 1;
  }
} finally {
  stores.close();
}
