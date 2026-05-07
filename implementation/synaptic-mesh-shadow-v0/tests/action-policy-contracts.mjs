import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ACTION_POLICY_STRATEGIES,
  AMBIGUOUS_ACTION_VERBS,
  HUMAN_REQUIRED_VERBS,
  LOCAL_ACTION_VERBS,
  classifyReceiverAction,
} from '../src/types.mjs';

const artifact = 'T-synaptic-mesh-action-policy-contracts-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidencePath = resolve(packageRoot, 'evidence/action-policy-contracts.out.json');

const expectedStrategyIds = [
  'sensitive-verb',
  'ambiguous-framework-verb',
  'local-low-risk-verb',
  'unknown-or-sensitive-fallback',
];

const strategyIds = ACTION_POLICY_STRATEGIES.map((strategy) => strategy.id);
assert.deepEqual(strategyIds, expectedStrategyIds);
assert.equal(new Set(strategyIds).size, strategyIds.length, 'strategy ids must be stable and unique');

const ambiguousRows = [...AMBIGUOUS_ACTION_VERBS].map((verb) => {
  const result = classifyReceiverAction({ verb, riskTier: 'low_local' });
  assert.equal(result.strategyId, 'ambiguous-framework-verb', verb);
  assert.deepEqual(result.classification, { riskTier: 'ambiguous', requiresHuman: true }, verb);
  assert.match(result.humanReason, new RegExp(`verb is ambiguous: ${verb}`), verb);
  return { verb, strategyId: result.strategyId, classification: result.classification, humanReason: result.humanReason };
});

const sensitiveRows = [...HUMAN_REQUIRED_VERBS].map((verb) => {
  const result = classifyReceiverAction({ verb, riskTier: 'low_local' });
  assert.equal(result.strategyId, 'sensitive-verb', verb);
  assert.deepEqual(result.classification, { riskTier: 'sensitive', requiresHuman: true }, verb);
  assert.match(result.humanReason, new RegExp(`unknown/sensitive: ${verb}`), verb);
  return { verb, strategyId: result.strategyId, classification: result.classification };
});

const localRows = [...LOCAL_ACTION_VERBS].map((verb) => {
  const result = classifyReceiverAction({ verb, riskTier: 'low_local' });
  assert.equal(result.strategyId, 'local-low-risk-verb', verb);
  assert.deepEqual(result.classification, { riskTier: 'low_local', requiresHuman: false }, verb);
  assert.equal(result.humanReason, undefined, verb);
  return { verb, strategyId: result.strategyId, classification: result.classification };
});

for (const verb of AMBIGUOUS_ACTION_VERBS) {
  assert.equal(LOCAL_ACTION_VERBS.has(verb), false, `${verb} must not also be local`);
  assert.equal(HUMAN_REQUIRED_VERBS.has(verb), false, `${verb} must not also be sensitive`);
}

const sensitiveRiskLocalVerb = classifyReceiverAction({ verb: 'write_doc', riskTier: 'sensitive' });
assert.equal(sensitiveRiskLocalVerb.strategyId, 'unknown-or-sensitive-fallback');
assert.deepEqual(sensitiveRiskLocalVerb.classification, { riskTier: 'unknown', requiresHuman: true });

const unknownVerb = classifyReceiverAction({ verb: 'not_a_known_action', riskTier: 'low_local' });
assert.equal(unknownVerb.strategyId, 'unknown-or-sensitive-fallback');
assert.deepEqual(unknownVerb.classification, { riskTier: 'unknown', requiresHuman: true });

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T15:10:00.000Z',
    verdict: 'pass',
    strategyCount: strategyIds.length,
    ambiguousVerbCount: ambiguousRows.length,
    sensitiveVerbCount: sensitiveRows.length,
    localVerbCount: localRows.length,
    unsafeAllows: 0,
  },
  expectedStrategyIds,
  strategyIds,
  ambiguousRows,
  sensitiveRows,
  localRows,
  boundary: ['local_shadow_only', 'not_runtime_enforcement', 'not_framework_integration', 'not_config'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
