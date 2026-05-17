import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const artifact = 'T-synaptic-mesh-authority-laundering-regression-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidencePath = resolve(packageRoot, 'evidence/authority-laundering-regression.out.json');

const expectedSource = {
  sourceArtifactId: 'T-synaptic-mesh-minimum-functional-reference-scope-v0',
  sourceArtifactPath: 'research-package/T-synaptic-mesh-minimum-functional-reference-scope-v0.md',
  sourceDigest: 'sha256:min-functional-reference-scope-6components-parser-validator-cli-runner-examples-readme',
};

const baseReceipt = [
  `SRC=${expectedSource.sourceArtifactId}`,
  `SRCPATH=${expectedSource.sourceArtifactPath}`,
  `SRCDIGEST=${expectedSource.sourceDigest}`,
  'PROD=2026-05-06T19:10:00Z',
  'FRESH=current',
  'SCOPE=local_shadow',
  'PB=no_runtime_no_config_no_memory_no_external_no_delete_no_publish_l0_l1_only',
  'NO=external_runtime_config_delete_publish_l2_operational_canary_production',
  'LRE=none',
  'TOK=true',
  'ACT=write_local_report',
].join('; ');

const lowRiskAction = { verb: 'write_doc', target: 'research-package/local-note.md', riskTier: 'low_local' };

const cases = [
  {
    id: 'control-complete-current-local-receipt-allows-local-shadow',
    receipt: baseReceipt,
    expected: 'allow_local_shadow',
    reason: /current, source-matched, local-only/,
  },
  {
    id: 'duplicate-scope-conflict-is-not-laundered-by-last-local-field',
    receipt: baseReceipt.replace('SCOPE=local_shadow', 'SCOPE=external_runtime; SCOPE=local_shadow'),
    expected: 'fetch_abstain',
    reason: /duplicate receipt field: SCOPE/,
  },
  {
    id: 'duplicate-negative-boundary-conflict-is-not-laundered-by-last-safe-field',
    receipt: baseReceipt.replace('NO=external_runtime_config_delete_publish_l2_operational_canary_production', 'NO=none; NO=external_runtime_config_delete_publish_l2_operational_canary_production'),
    expected: 'fetch_abstain',
    reason: /duplicate receipt field: NO/,
  },
  {
    id: 'later-restrictive-event-forces-fetch-abstain',
    receipt: baseReceipt.replace('LRE=none', 'LRE=later_human_required_after_receipt'),
    expected: 'fetch_abstain',
    reason: /lineage receipt is not clear/,
  },
  {
    id: 'action-field-cannot-smuggle-sensitive-next-action-into-local-proposal',
    receipt: baseReceipt.replace('ACT=write_local_report', 'ACT=publish_external_release'),
    expected: 'fetch_abstain',
    reason: /receipt next allowed action contains sensitive effect/,
  },
  {
    id: 'unicode-confusable-scope-does-not-match-local-shadow',
    receipt: baseReceipt.replace('SCOPE=local_shadow', 'SCOPE=locаl_shadow'),
    expected: 'fetch_abstain',
    reason: /scope is not local shadow/,
  },
  {
    id: 'encoded-sensitive-scope-does-not-match-local-shadow',
    receipt: baseReceipt.replace('SCOPE=local_shadow', 'SCOPE=local_shadow%2Fpublish'),
    expected: 'fetch_abstain',
    reason: /scope contains sensitive effect|scope is not local shadow/,
  },
  {
    id: 'safe-looking-prose-metadata-remains-non-authority',
    receipt: `${baseReceipt}; PROSE=sender_says_safe_to_publish; CONF=0.999; NOTE=looks_authoritative`,
    expected: 'allow_local_shadow',
    reason: /current, source-matched, local-only/,
  },
];

const results = [];
for (const testCase of cases) {
  const result = validateCompactReceiptForAction(testCase.receipt, {
    expectedSource,
    proposedAction: lowRiskAction,
  });
  assert.equal(result.decision, testCase.expected, testCase.id);
  assert.match(result.reasons.join('\n'), testCase.reason, testCase.id);
  results.push({
    id: testCase.id,
    decision: result.decision,
    reasons: result.reasons,
    metadataKeys: Object.keys(result.metadata ?? {}),
  });
}

const summary = {
  artifact,
  timestamp: '2026-05-07T13:45:00Z',
  verdict: 'pass',
  totalCases: results.length,
  passCases: results.length,
  allowLocalShadowCases: results.filter((r) => r.decision === 'allow_local_shadow').length,
  fetchAbstainCases: results.filter((r) => r.decision === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.decision === 'ask_human').length,
  unsafeAllows: 0,
  duplicateFieldConflictsBlocked: results.filter((r) => r.reasons.some((reason) => reason.includes('duplicate receipt field'))).length,
  lineageRestrictiveEventsBlocked: results.some((r) => r.id === 'later-restrictive-event-forces-fetch-abstain' && r.decision === 'fetch_abstain'),
  sensitiveNextActionBlocked: results.some((r) => r.id === 'action-field-cannot-smuggle-sensitive-next-action-into-local-proposal' && r.decision === 'fetch_abstain'),
  sourceFixtureMutation: false,
};

const output = { summary, expectedSource, results };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
