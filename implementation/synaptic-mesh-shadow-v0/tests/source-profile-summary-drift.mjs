import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/source-profile-summary-drift.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-source-profile-summary-drift-v0';
const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const stale = fixture.handoffs.find((handoff) => handoff.id.includes('stale'));
const expectedSource = {
  sourceArtifactId: fixture.expectedSource.id,
  sourceArtifactPath: fixture.expectedSource.path,
  sourceDigest: fixture.expectedSource.digest,
};
const baseAction = { verb: 'run_local_test', riskTier: 'low_local' };
const receiverNow = '2026-05-06T20:30:00Z';
const currentRunId = 'run-2026-05-06-shadow';
const sourceRunId = currentRunId;
const observedSourceDigest = fixture.expectedSource.digest;

const receiverFreshnessPolicy = {
  receiverNow,
  maxAgeMs: 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const strictMtimePolicy = {
  profile: 'strict',
  receiverNow,
  maxSourceAgeMs: 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
  sourceMtime: '2026-05-06T20:00:00Z',
  sourceRunId,
  currentRunId,
  observedSourceDigest,
};
const diagnosticRunPolicy = {
  profile: 'diagnostic_optional',
  receiverNow,
  maxSourceAgeMs: 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
  sourceRunId,
  currentRunId,
};

const cases = [
  {
    id: 'exact-strict-profile-with-mtime-allows-benign-local',
    summaryProfileText: 'profile=strict; source mtime/run/digest preserved exactly',
    receipt: valid.receipt,
    sourceFreshnessPolicy: strictMtimePolicy,
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'positive_exact_profile',
  },
  {
    id: 'exact-diagnostic-optional-profile-with-run-pair-allows-local-diagnostic',
    summaryProfileText: 'profile=diagnostic_optional; run-id evidence preserved exactly',
    receipt: valid.receipt,
    sourceFreshnessPolicy: diagnosticRunPolicy,
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'positive_exact_profile',
  },
  {
    id: 'omitted-profile-with-run-pair-defaults-strict-and-fetch-abstains',
    summaryProfileText: 'summary says source evidence is current, but omits profile name',
    receipt: valid.receipt,
    sourceFreshnessPolicy: { ...diagnosticRunPolicy, profile: undefined },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'profile_omission_fails_closed',
    expectedReason: /missing or invalid source artifact mtime/,
  },
  {
    id: 'renamed-profile-token-fetch-abstains',
    summaryProfileText: 'profile=diagnostic optional (renamed by prose compaction)',
    receipt: valid.receipt,
    sourceFreshnessPolicy: { ...diagnosticRunPolicy, profile: 'diagnostic optional' },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'profile_rename_fails_closed',
    expectedReason: /unsupported profile/,
  },
  {
    id: 'overstated-narrative-optional-with-no-machine-profile-defaults-strict',
    summaryProfileText: 'prose says optional profile was approved, but machine tuple omits profile',
    receipt: valid.receipt,
    sourceFreshnessPolicy: { ...diagnosticRunPolicy, profile: undefined },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'narrative_overstatement_cannot_grant_profile',
    expectedReason: /missing or invalid source artifact mtime/,
  },
  {
    id: 'exact-diagnostic-optional-does-not-repair-stale-receipt',
    summaryProfileText: 'profile=diagnostic_optional preserved, but receipt freshness is stale',
    receipt: stale.receipt,
    sourceFreshnessPolicy: diagnosticRunPolicy,
    expectedDecision: 'fetch_abstain',
    expectationClass: 'profile_does_not_relax_receipt_freshness',
    expectedReason: /freshness is not current|exceeds receiver max age/,
  },
  {
    id: 'exact-diagnostic-optional-digest-disagreement-fetch-abstains',
    summaryProfileText: 'profile=diagnostic_optional preserved with observed digest disagreement',
    receipt: valid.receipt,
    sourceFreshnessPolicy: { ...diagnosticRunPolicy, observedSourceDigest: 'sha256:summary-drift-wrong-digest' },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'profile_does_not_relax_observed_disagreement',
    expectedReason: /receipt digest does not match observed source digest/,
  },
  {
    id: 'exact-diagnostic-optional-empty-evidence-fetch-abstains',
    summaryProfileText: 'profile=diagnostic_optional preserved but compaction lost all source evidence fields',
    receipt: valid.receipt,
    sourceFreshnessPolicy: {
      profile: 'diagnostic_optional',
      receiverNow,
      maxSourceAgeMs: 60 * 60 * 1000,
      allowedFutureSkewMs: 2 * 60 * 1000,
    },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'optional_without_evidence_fails_closed',
    expectedReason: /no observed source evidence/,
  },
];

const rows = cases.map((row) => {
  const result = validateCompactReceiptForAction(row.receipt, {
    expectedSource,
    proposedAction: baseAction,
    receiverFreshnessPolicy,
    sourceFreshnessPolicy: row.sourceFreshnessPolicy,
  });
  const reasonText = result.reasons.join('\n');
  const reasonMatches = row.expectedReason ? row.expectedReason.test(reasonText) : true;
  const pass = result.decision === row.expectedDecision && reasonMatches;
  return {
    id: row.id,
    expectationClass: row.expectationClass,
    summaryProfileText: row.summaryProfileText,
    effectiveProfile: row.sourceFreshnessPolicy.profile ?? 'strict(default)',
    sourceEvidenceFields: Object.fromEntries(Object.entries({
      sourceMtime: row.sourceFreshnessPolicy.sourceMtime,
      sourceRunId: row.sourceFreshnessPolicy.sourceRunId,
      currentRunId: row.sourceFreshnessPolicy.currentRunId,
      observedSourceDigest: row.sourceFreshnessPolicy.observedSourceDigest,
    }).filter(([, value]) => value !== undefined)),
    decision: result.decision,
    expectedDecision: row.expectedDecision,
    reasons: result.reasons,
    pass,
    unsafeAllow: result.decision === 'allow_local_shadow' && row.expectedDecision !== 'allow_local_shadow',
    falseBlockExactPositive: row.expectationClass === 'positive_exact_profile' && result.decision !== 'allow_local_shadow',
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-07T00:50:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  exactPositiveCases: rows.filter((row) => row.expectationClass === 'positive_exact_profile').length,
  profileDriftCases: rows.filter((row) => row.expectationClass !== 'positive_exact_profile').length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  falseBlockExactPositives: rows.filter((row) => row.falseBlockExactPositive).length,
  interpretation: 'Summary/profile compaction is safe only when the source policy profile is machine-explicit. Omissions default to strict, renamed profile strings are unsupported, prose overstatement cannot grant diagnostic_optional, and exact diagnostic_optional still does not relax stale receipt freshness, digest disagreement, or empty evidence.',
};

const output = {
  summary,
  expectedSource,
  receiverFreshnessPolicy,
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
