#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { AletheiaAnthropicBridge } from '../../packages/adapters-anthropic/dist/index.js';
import { AletheiaOpenAIResponsesBridge } from '../../packages/adapters-openai/dist/index.js';
import { AletheiaAuthority, staticVisibilityPolicy } from '../../packages/core/dist/index.js';
import { openSqliteStores } from '../../packages/store-sqlite/dist/index.js';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';

const agentId = 'agent-live-demo';
const scope = { kind: 'project', projectId: 'aletheia-live-demo' };
const visibility = { kind: 'private:user' };
const safeAction = { classifiedAction: 'local_report', target: 'local live demo report' };
const sensitiveAction = { classifiedAction: 'external_send', target: 'external live demo report' };

async function main() {
  const provider = selectProvider();
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

    await maybeWriteReport(report);
    console.info(JSON.stringify(report, null, 2));
    if (boundaryViolations.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    stores.close();
  }
}

function selectProvider() {
  const requested = (process.env.ALETHEIA_LIVE_PROVIDER ?? '').trim().toLowerCase();
  const openaiKey = envValue('OPENAI_API_KEY');
  const anthropicKey = envValue('ANTHROPIC_API_KEY');
  if (requested !== '' && requested !== 'openai' && requested !== 'anthropic') {
    throw new Error('ALETHEIA_LIVE_PROVIDER must be "openai" or "anthropic".');
  }

  if ((requested === 'openai' || requested === '') && openaiKey !== undefined) {
    const client = new OpenAIResponsesHttpClient({
      apiKey: openaiKey,
      baseUrl: envValue('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1',
    });
    const model = envValue('OPENAI_MODEL') ?? DEFAULT_OPENAI_MODEL;
    return {
      name: 'openai',
      model,
      callCount: () => client.callCount,
      bridge: ({ authority, eventLedger }) =>
        new AletheiaOpenAIResponsesBridge({
          client,
          authority,
          eventLedger,
          model,
        }),
    };
  }

  if ((requested === 'anthropic' || requested === '') && anthropicKey !== undefined) {
    const client = new AnthropicMessagesHttpClient({
      apiKey: anthropicKey,
      baseUrl: envValue('ANTHROPIC_BASE_URL') ?? 'https://api.anthropic.com/v1',
    });
    const model = envValue('ANTHROPIC_MODEL') ?? DEFAULT_ANTHROPIC_MODEL;
    return {
      name: 'anthropic',
      model,
      callCount: () => client.callCount,
      bridge: ({ authority, eventLedger }) =>
        new AletheiaAnthropicBridge({
          client,
          authority,
          eventLedger,
          model,
        }),
    };
  }

  throw new Error(
    [
      'No live provider key found. This demo does not use mocks.',
      'Set OPENAI_API_KEY for OpenAI Responses, or ANTHROPIC_API_KEY with ALETHEIA_LIVE_PROVIDER=anthropic.',
      'You can place those values in .env.local; this script loads it automatically.',
      'Build first with: pnpm -r run build',
    ].join('\n'),
  );
}

function envValue(name) {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return undefined;
  return value;
}

class OpenAIResponsesHttpClient {
  callCount = 0;

  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  responses = {
    create: async (input) => {
      this.callCount += 1;
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`OpenAI Responses API ${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  };
}

class AnthropicMessagesHttpClient {
  callCount = 0;

  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  messages = {
    create: async (input) => {
      this.callCount += 1;
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Anthropic Messages API ${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  };
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

async function maybeWriteReport(report) {
  const reportPath = process.env.ALETHEIA_LIVE_E2E_REPORT;
  if (reportPath === undefined || reportPath.trim() === '') return;
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function loadLocalEnv() {
  const envPath = process.env.ALETHEIA_ENV_FILE ?? '.env.local';
  let text;
  try {
    text = await readFile(envPath, 'utf8');
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') return;
    throw err;
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const equalsAt = line.indexOf('=');
    if (equalsAt <= 0) continue;
    const key = line.slice(0, equalsAt).trim();
    const value = unquoteEnvValue(line.slice(equalsAt + 1).trim());
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

loadLocalEnv()
  .then(main)
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
