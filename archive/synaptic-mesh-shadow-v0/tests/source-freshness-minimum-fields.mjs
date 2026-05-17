import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/source-freshness-minimum-fields.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-source-freshness-minimum-fields-v0';
const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const expectedSource = {
  sourceArtifactId: fixture.expectedSource.id,
  sourceArtifactPath: fixture.expectedSource.path,
  sourceDigest: fixture.expectedSource.digest,
};
const receiverFreshnessPolicy = {
  receiverNow: '2026-05-07T00:40:00Z',
  maxAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const fullSourcePolicy = {
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceMtime: '2026-05-06T19:50:00Z',
  sourceRunId: artifact,
  currentRunId: artifact,
  observedSourceDigest: fixture.expectedSource.digest,
};

const variants = [
  {
    id: 'mtime-only',
    policy: ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceMtime }) => ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceMtime }),
    expectation: 'minimum_useful_temporal_guard',
    expectedBenign: 'allow_local_shadow',
    expectedStale: 'fetch_abstain',
    expectedCrossRun: 'allow_local_shadow',
    expectedDigestMismatch: 'allow_local_shadow',
  },
  {
    id: 'run-id-only-without-mtime',
    policy: ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceRunId, currentRunId }) => ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceRunId, currentRunId }),
    expectation: 'brittle_missing_mtime_overblocks',
    expectedBenign: 'fetch_abstain',
    expectedStale: 'fetch_abstain',
    expectedCrossRun: 'fetch_abstain',
    expectedDigestMismatch: 'fetch_abstain',
  },
  {
    id: 'digest-only-without-mtime',
    policy: ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, observedSourceDigest }) => ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, observedSourceDigest }),
    expectation: 'brittle_missing_mtime_overblocks',
    expectedBenign: 'fetch_abstain',
    expectedStale: 'fetch_abstain',
    expectedCrossRun: 'fetch_abstain',
    expectedDigestMismatch: 'fetch_abstain',
  },
  {
    id: 'mtime-plus-run-id',
    policy: ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceMtime, sourceRunId, currentRunId }) => ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceMtime, sourceRunId, currentRunId }),
    expectation: 'temporal_plus_run_guard',
    expectedBenign: 'allow_local_shadow',
    expectedStale: 'fetch_abstain',
    expectedCrossRun: 'fetch_abstain',
    expectedDigestMismatch: 'allow_local_shadow',
  },
  {
    id: 'mtime-plus-digest',
    policy: ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceMtime, observedSourceDigest }) => ({ receiverNow, maxSourceAgeMs, allowedFutureSkewMs, sourceMtime, observedSourceDigest }),
    expectation: 'temporal_plus_content_guard',
    expectedBenign: 'allow_local_shadow',
    expectedStale: 'fetch_abstain',
    expectedCrossRun: 'allow_local_shadow',
    expectedDigestMismatch: 'fetch_abstain',
  },
  {
    id: 'mtime-plus-run-id-plus-digest',
    policy: (policy) => ({ ...policy }),
    expectation: 'full_receiver_observed_guard',
    expectedBenign: 'allow_local_shadow',
    expectedStale: 'fetch_abstain',
    expectedCrossRun: 'fetch_abstain',
    expectedDigestMismatch: 'fetch_abstain',
  },
];

const scenarios = [
  { key: 'benign', mutate: (policy) => policy },
  { key: 'stale', mutate: (policy) => ({ ...policy, sourceMtime: '2026-05-06T12:00:00Z' }) },
  { key: 'crossRun', mutate: (policy) => ({ ...policy, sourceRunId: 'older-run-2026-05-06' }) },
  { key: 'digestMismatch', mutate: (policy) => ({ ...policy, observedSourceDigest: 'sha256:observed-newer-digest' }) },
];

function run(sourceFreshnessPolicy) {
  const result = validateCompactReceiptForAction(valid.receipt, {
    expectedSource,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    receiverFreshnessPolicy,
    sourceFreshnessPolicy,
  });
  return { decision: result.decision, reasons: result.reasons };
}

const rows = variants.flatMap((variant) => scenarios.map((scenario) => {
  const fullMutated = scenario.mutate(fullSourcePolicy);
  const ablatedPolicy = variant.policy(fullMutated);
  const result = run(ablatedPolicy);
  const expected = variant[`expected${scenario.key[0].toUpperCase()}${scenario.key.slice(1)}`];
  const pass = result.decision === expected;
  return {
    variant: variant.id,
    scenario: scenario.key,
    expectation: variant.expectation,
    policyFields: Object.keys(ablatedPolicy).sort(),
    expectedDecision: expected,
    actualDecision: result.decision,
    pass,
    reasons: result.reasons,
    unsafeAllow: expected !== 'allow_local_shadow' && result.decision === 'allow_local_shadow',
    falseBenignBlock: scenario.key === 'benign' && expected === 'allow_local_shadow' && result.decision !== 'allow_local_shadow',
    missingMtimeBlock: result.reasons.some((reason) => /missing or invalid source artifact mtime/i.test(reason)),
  };
}));

const usableVariants = variants.map((variant) => {
  const subset = rows.filter((row) => row.variant === variant.id);
  return {
    variant: variant.id,
    expectation: variant.expectation,
    benignAllowed: subset.find((row) => row.scenario === 'benign')?.actualDecision === 'allow_local_shadow',
    staleBlocked: subset.find((row) => row.scenario === 'stale')?.actualDecision === 'fetch_abstain',
    crossRunBlocked: subset.find((row) => row.scenario === 'crossRun')?.actualDecision === 'fetch_abstain',
    digestMismatchBlocked: subset.find((row) => row.scenario === 'digestMismatch')?.actualDecision === 'fetch_abstain',
    missingMtimeOverblocks: subset.some((row) => row.scenario === 'benign' && row.missingMtimeBlock),
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-07T00:40:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  totalRows: rows.length,
  passRows: rows.filter((row) => row.pass).length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  falseBenignBlocks: rows.filter((row) => row.falseBenignBlock).length,
  missingMtimeOverblockVariants: usableVariants.filter((row) => row.missingMtimeOverblocks).map((row) => row.variant),
  minimumUsefulFields: ['receiverNow', 'maxSourceAgeMs', 'sourceMtime'],
  recommendedDefaultFields: ['receiverNow', 'maxSourceAgeMs', 'sourceMtime', 'sourceRunId', 'currentRunId', 'observedSourceDigest'],
  interpretation: 'A source freshness policy with sourceMtime is the minimum non-brittle temporal guard. Run-id or digest evidence without sourceMtime overblocks because the current validator treats an enabled source policy as requiring observed mtime. The full field set is still the safest default: mtime catches stale/future source age, run id catches cross-run laundering, and digest catches content disagreement.',
};

const output = {
  summary,
  expectedSource,
  receiverFreshnessPolicy,
  fullSourcePolicy,
  usableVariants,
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
