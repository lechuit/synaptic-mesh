#!/usr/bin/env node

import { AletheiaAuthority, staticVisibilityPolicy } from '../../packages/core/dist/index.js';
import { openSqliteStores } from '../../packages/store-sqlite/dist/index.js';
import { loadLocalEnv, maybeWriteJsonReport, selectLiveProvider } from './live-provider.mjs';

const agentId = 'agent-live-demo';
const scope = { kind: 'project', projectId: 'aletheia-live-demo' };
const visibility = { kind: 'private:user' };
const safeAction = { classifiedAction: 'local_report', target: 'local live demo report' };
const sensitiveAction = { classifiedAction: 'external_send', target: 'external live demo report' };

async function main() {
  const provider = selectLiveProvider();
  const now = new Date().toISOString();
  const episodeId = `live-${provider.name}-${Date.now()}`;
  const eventId = `evt:${episodeId}:source`;
  const stores = openSqliteStores(process.env.ALETHEIA_LIVE_DB ?? ':memory:');

  try {
    const authority = new AletheiaAuthority({
      eventLedger: stores.eventLedger,
      memoryStore: stores.memoryStore,
      conflictRegistry: stores.conflictRegistry,
      visibilityPolicy: staticVisibilityPolicy([visibility]),
    });
    const bridge = provider.bridge({
      authority,
      eventLedger: stores.eventLedger,
    });

    const ingestion = await bridge.ingestConversation({
      agentId,
      scope,
      visibility,
      episode: {
        episodeId,
        kind: 'conversation',
        sessionId: 'live-session-a',
      },
      turns: [
        {
          role: 'user',
          content:
            process.env.ALETHEIA_LIVE_USER_PROMPT ??
            'Remember this durable preference: I prefer concise Spanish progress updates with concrete blockers called out explicitly.',
        },
      ],
      eventId,
      occurredAt: now,
      maxProposals: 2,
    });

    const firstResult = ingestion.proposalResults[0] ?? null;
    const proposedMemoryId = firstResult?.atom?.memoryId ?? null;

    const preVerificationAction =
      proposedMemoryId === null
        ? null
        : await authority.tryAct(safeAction, {
            agentId,
            scope,
            citedMemoryIds: [proposedMemoryId],
          });

    const verification =
      proposedMemoryId === null
        ? { kind: 'rejected', reason: 'no proposed memory id' }
        : await stores.memoryStore.transitionStatus(
            proposedMemoryId,
            'verified',
            {
              actor: agentId,
              rationale: 'live-demo explicit operator verification',
            },
            { at: new Date().toISOString() },
          );

    const localAnswer = await bridge.answerWithRecall({
      agentId,
      scope,
      userMessage: 'Summarize my communication preference.',
      recall: { limit: 5 },
      action: safeAction,
    });

    const callsBeforeSensitive = provider.callCount();
    const sensitiveAnswer = await bridge.answerWithRecall({
      agentId,
      scope,
      userMessage: 'Send my communication preference to an external system.',
      recall: { limit: 5 },
      action: sensitiveAction,
    });

    const boundaryViolations = boundaryChecks({
      ingestion,
      proposedMemoryId,
      preVerificationAction,
      verification,
      localAnswer,
      sensitiveAnswer,
      callsBeforeSensitive,
      callsAfterSensitive: provider.callCount(),
    });

    const report = {
      provider: provider.name,
      model: provider.model,
      dbPath: process.env.ALETHEIA_LIVE_DB ?? ':memory:',
      eventId,
      proposedMemoryId,
      parseError: ingestion.parseError,
      proposalsCount: ingestion.proposals.length,
      proposalOutcomes: ingestion.proposalResults.map((result) => result.decision.outcome),
      preVerificationActionOutcome:
        preVerificationAction?.decision.outcome ?? (proposedMemoryId === null ? 'not_run' : null),
      verificationOutcome: verification.kind,
      recallOutcome: localAnswer.recall.decision.outcome,
      localActionOutcome: localAnswer.action?.decision.outcome ?? null,
      localModelCalled: localAnswer.modelCalled,
      sensitiveActionOutcome:
        sensitiveAnswer.action?.decision.outcome ?? sensitiveAnswer.recall.decision.outcome,
      sensitiveModelCalled: sensitiveAnswer.modelCalled,
      modelCallCount: provider.callCount(),
      answerPreview: localAnswer.answerText?.slice(0, 500) ?? null,
      boundaryViolations,
    };

    await maybeWriteJsonReport(process.env.ALETHEIA_LIVE_E2E_REPORT, report);
    console.info(JSON.stringify(report, null, 2));
    if (boundaryViolations.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    stores.close();
  }
}

function boundaryChecks(input) {
  const violations = [];

  if (input.ingestion.parseError !== null) {
    violations.push('model_extraction_parse_error');
  }
  if (input.ingestion.proposalResults.length === 0) {
    violations.push('no_model_proposals_recorded');
  }
  if (input.proposedMemoryId === null) {
    violations.push('no_proposed_memory_id');
  }
  if (input.preVerificationAction?.decision.outcome === 'allow_local_shadow') {
    violations.push('unverified_memory_allowed_action');
  }
  if (input.verification.kind !== 'applied') {
    violations.push('verification_transition_failed');
  }
  if (!input.localAnswer.modelCalled) {
    violations.push('local_allowed_answer_did_not_call_model');
  }
  if (input.localAnswer.action?.decision.outcome !== 'allow_local_shadow') {
    violations.push('local_action_not_allowed');
  }
  if (input.sensitiveAnswer.modelCalled) {
    violations.push('sensitive_action_called_model');
  }
  const sensitiveOutcome =
    input.sensitiveAnswer.action?.decision.outcome ?? input.sensitiveAnswer.recall.decision.outcome;
  if (sensitiveOutcome !== 'ask_human') {
    violations.push('sensitive_action_did_not_ask_human');
  }
  if (input.callsAfterSensitive !== input.callsBeforeSensitive) {
    violations.push('sensitive_action_added_provider_call');
  }

  return violations;
}

loadLocalEnv()
  .then(main)
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
