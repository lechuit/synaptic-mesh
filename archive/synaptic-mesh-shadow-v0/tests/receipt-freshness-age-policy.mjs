import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const evidencePath = resolve(root, 'evidence/receipt-freshness-age-policy.out.json');

const artifact = 'T-synaptic-mesh-receipt-freshness-age-policy-v0';
const expectedSource = {
  sourceArtifactId: artifact,
  sourceArtifactPath: 'research-package/T-synaptic-mesh-receipt-freshness-age-policy-v0.md',
  sourceDigest: 'sha256:receipt-freshness-age-policy-v0',
};
const policy = {
  receiverNow: '2026-05-06T20:30:00Z',
  maxAgeMs: 30 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const lowRiskAction = { verb: 'run_local_test', target: 'implementation/synaptic-mesh-shadow-v0/tests/receipt-freshness-age-policy.mjs', riskTier: 'low_local' };

function receipt(overrides = {}) {
  const fields = {
    SRC: expectedSource.sourceArtifactId,
    SRCPATH: expectedSource.sourceArtifactPath,
    SRCDIGEST: expectedSource.sourceDigest,
    PROD: '2026-05-06T20:20:00Z',
    FRESH: 'current',
    SCOPE: 'local_shadow',
    PB: 'no_runtime_no_config_no_memory_no_external_no_delete_no_publish_l0_l1_only',
    NO: 'external_runtime_config_delete_publish_l2_operational_canary_production_memory',
    LRE: 'lineage:receipt-freshness-age-policy-v0',
    TOK: 'low',
    ACT: 'run_local_test',
    ...overrides,
  };
  return Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

const cases = [
  {
    id: 'recent-produced-at-current-freshness-valid-local-control',
    receipt: receipt(),
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'valid_control',
  },
  {
    id: 'old-produced-at-current-freshness-overridden-by-receiver-clock',
    receipt: receipt({ PROD: '2026-05-06T18:00:00Z' }),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'sender_freshness_overridden',
    expectedReason: /exceeds receiver max age/,
  },
  {
    id: 'future-produced-at-current-freshness-fetch-abstain',
    receipt: receipt({ PROD: '2026-05-06T20:40:00Z' }),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'future_timestamp',
    expectedReason: /future beyond receiver skew/,
  },
  {
    id: 'missing-produced-at-current-freshness-fetch-abstain',
    receipt: receipt({ PROD: undefined }),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'missing_timestamp',
    expectedReason: /missing produced-at/,
  },
  {
    id: 'within-explicit-age-window-accepted',
    receipt: receipt({ PROD: '2026-05-06T20:00:00Z' }),
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'receiver_window_boundary',
  },
  {
    id: 'just-outside-explicit-age-window-fetch-abstain',
    receipt: receipt({ PROD: '2026-05-06T19:59:59Z' }),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'receiver_window_boundary',
    expectedReason: /exceeds receiver max age/,
  },
  {
    id: 'sensitive-action-with-fresh-receipt-still-asks-human',
    receipt: receipt({ ACT: 'publish' }),
    proposedAction: { verb: 'publish', target: 'external', riskTier: 'sensitive' },
    expectedDecision: 'ask_human',
    expectationClass: 'sensitive_action_overrides_freshness',
    expectedReason: /action requires human/,
  },
];

const rows = cases.map((testCase) => {
  const result = validateCompactReceiptForAction(testCase.receipt, {
    expectedSource,
    proposedAction: testCase.proposedAction ?? lowRiskAction,
    receiverFreshnessPolicy: policy,
  });
  const reasonText = result.reasons.join('\n');
  const reasonMatches = testCase.expectedReason ? testCase.expectedReason.test(reasonText) : true;
  const pass = result.decision === testCase.expectedDecision && reasonMatches;
  return {
    id: testCase.id,
    expectationClass: testCase.expectationClass,
    decision: result.decision,
    expectedDecision: testCase.expectedDecision,
    pass,
    reasons: result.reasons,
    producedAt: result.authority.producedAt,
    unsafeAllow: result.decision === 'allow_local_shadow' && testCase.expectedDecision !== 'allow_local_shadow',
    falseBlockValidLocal: testCase.expectedDecision === 'allow_local_shadow' && result.decision !== 'allow_local_shadow',
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-06T20:30:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  policy,
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  allowLocalShadow: rows.filter((row) => row.decision === 'allow_local_shadow').length,
  fetchAbstain: rows.filter((row) => row.decision === 'fetch_abstain').length,
  askHuman: rows.filter((row) => row.decision === 'ask_human').length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  falseBlocksForValidLocal: rows.filter((row) => row.falseBlockValidLocal).length,
  receiverFreshnessOverridesSenderFreshness: rows.find((row) => row.id === 'old-produced-at-current-freshness-overridden-by-receiver-clock')?.decision === 'fetch_abstain',
  interpretation: 'Receiver-side freshness policy now treats sender FRESH=current as insufficient by itself. Missing, old, invalid or future PROD timestamps fetch-abstain under a local clock/max-age policy; sensitive actions still ask human even with fresh receipts.',
};

const output = {
  summary,
  expectedSource,
  rows,
  boundary: [
    'fixture_only',
    'local_shadow_only',
    'no_runtime_integration',
    'no_publication',
    'no_external_effects',
    'no_permanent_memory',
  ],
};

mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
