import assert from 'node:assert/strict';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const artifact = 'T-synaptic-mesh-receipt-transform-regression-v0';
const expectedSource = {
  sourceArtifactId: 'T-synaptic-mesh-minimum-functional-reference-scope-v0',
  sourceArtifactPath: 'research-package/T-synaptic-mesh-minimum-functional-reference-scope-v0.md',
  sourceDigest: 'sha256:min-functional-reference-scope-6components-parser-validator-cli-runner-examples-readme',
};

const exactReceipt = [
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
  'NOTE=unknown_metadata_preserved',
].join('; ');

const lowRiskAction = { verb: 'write_doc', target: 'research-package/local-note.md', riskTier: 'low_local' };
const sensitiveActions = [
  { verb: 'send_external', target: 'telegram', riskTier: 'sensitive' },
  { verb: 'runtime_integrate', target: 'OpenClaw', riskTier: 'sensitive' },
  { verb: 'change_config', target: 'gateway', riskTier: 'sensitive' },
  { verb: 'delete', target: 'artifact', riskTier: 'sensitive' },
  { verb: 'publish', target: 'repo', riskTier: 'sensitive' },
  { verb: 'l2_operational_use', target: 'agent', riskTier: 'sensitive' },
];

const cases = [
  {
    id: 'exact-copied-receipt-valid-local',
    receipt: exactReceipt,
    action: lowRiskAction,
    expected: 'allow_local_shadow',
    expectedReason: /current, source-matched, local-only/,
  },
  {
    id: 'summary-drops-source-digest',
    receipt: exactReceipt.replace(`; SRCDIGEST=${expectedSource.sourceDigest}`, ''),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /SRCDIGEST|source digest mismatch/,
  },
  {
    id: 'summary-drops-negative-boundary',
    receipt: exactReceipt.replace('; NO=external_runtime_config_delete_publish_l2_operational_canary_production', ''),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /NO|negative boundary/,
  },
  {
    id: 'summary-drops-freshness',
    receipt: exactReceipt.replace('; FRESH=current', ''),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /FRESH|freshness/,
  },
  {
    id: 'summary-drops-source-path',
    receipt: exactReceipt.replace(`; SRCPATH=${expectedSource.sourceArtifactPath}`, ''),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /SRCPATH|source path mismatch/,
  },
  {
    id: 'transformed-stale-freshness',
    receipt: exactReceipt.replace('FRESH=current', 'FRESH=stale'),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /freshness is not current/,
  },
  {
    id: 'transformed-fuzzy-local-scope-with-expansion',
    receipt: exactReceipt.replace('SCOPE=local_shadow', 'SCOPE=local_shadow_externalish'),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /scope contains sensitive effect/,
  },
  {
    id: 'transformed-authority-inflation',
    receipt: exactReceipt.replace('PB=no_runtime_no_config_no_memory_no_external_no_delete_no_publish_l0_l1_only', 'PB=L0_L1_only_but_L2plus_approved_by_sender'),
    action: lowRiskAction,
    expected: 'fetch_abstain',
    expectedReason: /promotion boundary is not restrictive|L2/i,
  },
  {
    id: 'unknown-metadata-non-authority',
    receipt: `${exactReceipt}; CONF=0.99; PROSE=sender_says_safe; CHAIN=trusted-looking`,
    action: lowRiskAction,
    expected: 'allow_local_shadow',
    expectedReason: /current, source-matched, local-only/,
  },
  ...sensitiveActions.map((action) => ({
    id: `sensitive-action-${action.verb}`,
    receipt: exactReceipt,
    action,
    expected: 'ask_human',
    expectedReason: /action requires human/,
  })),
];

const results = [];
for (const testCase of cases) {
  const result = validateCompactReceiptForAction(testCase.receipt, {
    expectedSource,
    proposedAction: testCase.action,
  });
  assert.equal(result.decision, testCase.expected, testCase.id);
  assert.match(result.reasons.join('\n'), testCase.expectedReason, testCase.id);
  results.push({
    id: testCase.id,
    decision: result.decision,
    reasons: result.reasons,
    metadataKeys: Object.keys(result.metadata ?? {}),
  });
}

const summary = {
  artifact,
  timestamp: '2026-05-06T19:21:00Z',
  verdict: 'pass',
  totalCases: results.length,
  passCases: results.length,
  allowLocalShadowCases: results.filter((r) => r.decision === 'allow_local_shadow').length,
  fetchAbstainCases: results.filter((r) => r.decision === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.decision === 'ask_human').length,
  unsafeAllows: 0,
  unknownMetadataNonAuthority: results.find((r) => r.id === 'unknown-metadata-non-authority')?.metadataKeys.includes('CONF') === true,
  sourceFixtureMutation: false,
};

console.log(JSON.stringify({ summary, expectedSource, results }, null, 2));
