import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/source-freshness-optional-policy-contract.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-source-freshness-optional-policy-contract-v0';
const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const expectedSource = {
  sourceArtifactId: fixture.expectedSource.id,
  sourceArtifactPath: fixture.expectedSource.path,
  sourceDigest: fixture.expectedSource.digest,
};
const receiverFreshnessPolicy = {
  receiverNow: '2026-05-07T00:50:00Z',
  maxAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const baseSourcePolicy = {
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceMtime: '2026-05-06T20:31:00Z',
  sourceRunId: artifact,
  currentRunId: artifact,
  observedSourceDigest: fixture.expectedSource.digest,
};

function validate(sourceFreshnessPolicy) {
  const result = validateCompactReceiptForAction(valid.receipt, {
    expectedSource,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    receiverFreshnessPolicy,
    sourceFreshnessPolicy,
  });
  return { decision: result.decision, reasons: result.reasons };
}

const cases = [
  {
    id: 'strict_default_full_source_evidence_allows',
    policy: { ...baseSourcePolicy },
    expectedDecision: 'allow_local_shadow',
    contractPoint: 'strict_default_requires_and_accepts_full_source_evidence',
  },
  {
    id: 'strict_default_run_id_only_overblocks_without_mtime',
    policy: {
      receiverNow: baseSourcePolicy.receiverNow,
      maxSourceAgeMs: baseSourcePolicy.maxSourceAgeMs,
      allowedFutureSkewMs: baseSourcePolicy.allowedFutureSkewMs,
      sourceRunId: artifact,
      currentRunId: artifact,
    },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /missing or invalid source artifact mtime/i,
    contractPoint: 'default_profile_remains_strict_when_source_freshness_is_enabled',
  },
  {
    id: 'diagnostic_optional_run_id_pair_allows_current_without_clock',
    policy: { profile: 'diagnostic_optional', sourceRunId: artifact, currentRunId: artifact },
    expectedDecision: 'allow_local_shadow',
    contractPoint: 'diagnostic_optional_can_use_partial_run_evidence_without_brittle_mtime_requirement',
  },
  {
    id: 'diagnostic_optional_run_id_pair_blocks_cross_run',
    policy: { profile: 'diagnostic_optional', sourceRunId: 'older-run', currentRunId: artifact },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /run id is not current/i,
    contractPoint: 'partial_run_evidence_still_tightens_when_it_disagrees',
  },
  {
    id: 'diagnostic_optional_digest_only_allows_match_without_clock',
    policy: { profile: 'diagnostic_optional', observedSourceDigest: fixture.expectedSource.digest },
    expectedDecision: 'allow_local_shadow',
    contractPoint: 'diagnostic_optional_can_use_partial_digest_evidence_without_brittle_mtime_requirement',
  },
  {
    id: 'diagnostic_optional_digest_only_blocks_mismatch',
    policy: { profile: 'diagnostic_optional', observedSourceDigest: 'sha256:newer-observed-source-digest' },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /digest does not match/i,
    contractPoint: 'partial_digest_evidence_still_tightens_when_it_disagrees',
  },
  {
    id: 'diagnostic_optional_mtime_only_allows_current_source',
    policy: {
      profile: 'diagnostic_optional',
      receiverNow: baseSourcePolicy.receiverNow,
      maxSourceAgeMs: baseSourcePolicy.maxSourceAgeMs,
      allowedFutureSkewMs: baseSourcePolicy.allowedFutureSkewMs,
      sourceMtime: baseSourcePolicy.sourceMtime,
    },
    expectedDecision: 'allow_local_shadow',
    contractPoint: 'diagnostic_optional_mtime_only_is_minimum_temporal_guard',
  },
  {
    id: 'diagnostic_optional_mtime_only_blocks_stale_source',
    policy: {
      profile: 'diagnostic_optional',
      receiverNow: baseSourcePolicy.receiverNow,
      maxSourceAgeMs: baseSourcePolicy.maxSourceAgeMs,
      allowedFutureSkewMs: baseSourcePolicy.allowedFutureSkewMs,
      sourceMtime: '2026-05-06T12:00:00Z',
    },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /mtime exceeds/i,
    contractPoint: 'partial_mtime_evidence_still_tightens_when_stale',
  },
  {
    id: 'diagnostic_optional_no_observed_source_evidence_blocks',
    policy: { profile: 'diagnostic_optional' },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /no observed source evidence/i,
    contractPoint: 'diagnostic_optional_must_be_intentional_not_empty_claim_of_source_checking',
  },
  {
    id: 'unsupported_profile_blocks_closed',
    policy: { profile: 'optimistic_optional', observedSourceDigest: fixture.expectedSource.digest },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /unsupported profile/i,
    contractPoint: 'unknown_policy_profiles_fail_closed',
  },
];

const rows = cases.map((testCase) => {
  const result = validate(testCase.policy);
  const reasonText = result.reasons.join(' | ');
  const reasonPass = testCase.expectedReasonPattern ? testCase.expectedReasonPattern.test(reasonText) : true;
  const pass = result.decision === testCase.expectedDecision && reasonPass;
  return {
    id: testCase.id,
    contractPoint: testCase.contractPoint,
    policyFields: Object.keys(testCase.policy).sort(),
    expectedDecision: testCase.expectedDecision,
    actualDecision: result.decision,
    reasonPass,
    pass,
    reasons: result.reasons,
    unsafeAllow: testCase.expectedDecision !== 'allow_local_shadow' && result.decision === 'allow_local_shadow',
    brittleOverblock: /missing or invalid source artifact mtime/i.test(reasonText) && testCase.policy.profile === 'diagnostic_optional',
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-07T00:50:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) && rows.every((row) => !row.brittleOverblock) ? 'pass' : 'fail',
  totalRows: rows.length,
  passRows: rows.filter((row) => row.pass).length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  diagnosticBrittleMtimeOverblocks: rows.filter((row) => row.brittleOverblock).map((row) => row.id),
  contract: {
    strictDefault: 'When sourceFreshnessPolicy is enabled without profile=diagnostic_optional, sourceMtime remains required and full observed evidence is recommended.',
    diagnosticOptional: 'Partial observed source evidence may be used intentionally: sourceMtime, sourceRunId+currentRunId, or observedSourceDigest. Provided evidence tightens on disagreement; missing evidence not claimed by the profile is not a brittle blocker.',
    emptyOptional: 'An optional diagnostic policy with no observed source evidence fails closed so it cannot masquerade as a source check.',
  },
  interpretation: 'The receiver can separate strict/default source freshness from diagnostic optional source checks. This preserves the safer default while allowing local shadow diagnostics to ask narrower questions (mtime-only, run-pair-only, or digest-only) without accidental missing-mtime overblocking. Any observed disagreement still fetch-abstains.',
};

const output = {
  summary,
  expectedSource,
  receiverFreshnessPolicy,
  baseSourcePolicy,
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
