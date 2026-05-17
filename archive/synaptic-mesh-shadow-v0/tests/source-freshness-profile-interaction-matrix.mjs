import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const evidencePath = resolve(root, 'evidence/source-freshness-profile-interaction-matrix.out.json');
const artifact = 'T-synaptic-mesh-source-freshness-profile-interaction-matrix-v0';

const expectedSource = {
  sourceArtifactId: 'T-synaptic-mesh-synthetic-handoff-examples-v0',
  sourceArtifactPath: 'research-package/T-synaptic-mesh-synthetic-handoff-examples-v0.md',
  sourceDigest: 'sha256:synthetic-handoff-v0',
};
const receiverFreshnessPolicy = {
  receiverNow: '2026-05-07T01:00:00Z',
  maxAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const strictFullPolicy = {
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceMtime: '2026-05-06T20:31:00Z',
  sourceRunId: artifact,
  currentRunId: artifact,
  observedSourceDigest: expectedSource.sourceDigest,
};
const strictRunOnlyPolicy = {
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceRunId: artifact,
  currentRunId: artifact,
};
const optionalRunPolicy = { profile: 'diagnostic_optional', sourceRunId: artifact, currentRunId: artifact };
const optionalDigestPolicy = { profile: 'diagnostic_optional', observedSourceDigest: expectedSource.sourceDigest };
const optionalMtimePolicy = {
  profile: 'diagnostic_optional',
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceMtime: '2026-05-06T20:31:00Z',
};

function receipt(overrides = {}) {
  const fields = {
    SRC: expectedSource.sourceArtifactId,
    SRCPATH: expectedSource.sourceArtifactPath,
    SRCDIGEST: expectedSource.sourceDigest,
    PROD: '2026-05-06T20:31:00Z',
    FRESH: 'current',
    SCOPE: 'local_shadow',
    PB: 'no_promotion_without_human',
    NO: 'no_external_no_runtime_no_config_no_delete_no_publish_no_memory',
    LRE: 'lineage:profile-interaction-matrix',
    TOK: 'low',
    ACT: 'run_local_test',
    ...overrides,
  };
  return Object.entries(fields).map(([key, value]) => `${key}=${value}`).join('; ');
}

const independentGateScenarios = [
  {
    id: 'valid_current_local_receipt',
    receipt: receipt(),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'allow_local_shadow',
    expectedOptionalRun: 'allow_local_shadow',
    expectedOptionalDigest: 'allow_local_shadow',
    expectedOptionalMtime: 'allow_local_shadow',
    invariant: 'benign_current_local_may_allow',
  },
  {
    id: 'stale_receipt_freshness_field',
    receipt: receipt({ PROD: '2026-05-05T12:00:00Z', FRESH: 'stale' }),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'fetch_abstain',
    expectedOptionalRun: 'fetch_abstain',
    expectedOptionalDigest: 'fetch_abstain',
    expectedOptionalMtime: 'fetch_abstain',
    invariant: 'optional_source_profile_must_not_relax_receipt_freshness',
  },
  {
    id: 'future_receipt_prod_timestamp',
    receipt: receipt({ PROD: '2026-05-07T02:30:00Z' }),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'fetch_abstain',
    expectedOptionalRun: 'fetch_abstain',
    expectedOptionalDigest: 'fetch_abstain',
    expectedOptionalMtime: 'fetch_abstain',
    invariant: 'optional_source_profile_must_not_relax_receiver_clock_policy',
  },
  {
    id: 'source_id_spoof',
    receipt: receipt({ SRC: 'T-attacker-other-artifact' }),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'fetch_abstain',
    expectedOptionalRun: 'fetch_abstain',
    expectedOptionalDigest: 'fetch_abstain',
    expectedOptionalMtime: 'fetch_abstain',
    invariant: 'optional_source_profile_must_not_relax_expected_source_id',
  },
  {
    id: 'source_path_spoof',
    receipt: receipt({ SRCPATH: 'research-package/other-artifact.md' }),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'fetch_abstain',
    expectedOptionalRun: 'fetch_abstain',
    expectedOptionalDigest: 'fetch_abstain',
    expectedOptionalMtime: 'fetch_abstain',
    invariant: 'optional_source_profile_must_not_relax_expected_source_path',
  },
  {
    id: 'nonlocal_scope_external',
    receipt: receipt({ SCOPE: 'external_publish' }),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'fetch_abstain',
    expectedOptionalRun: 'fetch_abstain',
    expectedOptionalDigest: 'fetch_abstain',
    expectedOptionalMtime: 'fetch_abstain',
    invariant: 'optional_source_profile_must_not_relax_local_scope_gate',
  },
  {
    id: 'negative_boundary_lacks_sensitive_exclusions',
    receipt: receipt({ NO: 'no_memory' }),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedStrictFull: 'fetch_abstain',
    expectedOptionalRun: 'fetch_abstain',
    expectedOptionalDigest: 'fetch_abstain',
    expectedOptionalMtime: 'fetch_abstain',
    invariant: 'optional_source_profile_must_not_relax_negative_boundary_gate',
  },
  {
    id: 'sensitive_action_publish',
    receipt: receipt({ ACT: 'publish' }),
    action: { verb: 'publish', riskTier: 'sensitive' },
    expectedStrictFull: 'ask_human',
    expectedOptionalRun: 'ask_human',
    expectedOptionalDigest: 'ask_human',
    expectedOptionalMtime: 'ask_human',
    invariant: 'optional_source_profile_must_not_relax_sensitive_action_routing',
  },
];

const sourceEvidenceScenarios = [
  {
    id: 'strict_run_only_brittle_overblock_benign',
    receipt: receipt(),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    policy: strictRunOnlyPolicy,
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /missing or invalid source artifact mtime/i,
    invariant: 'strict_default_keeps_mtime_requirement',
  },
  {
    id: 'optional_run_only_relaxes_only_benign_missing_mtime',
    receipt: receipt(),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    policy: optionalRunPolicy,
    expectedDecision: 'allow_local_shadow',
    invariant: 'diagnostic_optional_can_reduce_brittle_missing_mtime_overblock_for_benign_current_local_receipt',
  },
  {
    id: 'optional_run_only_cross_run_blocks',
    receipt: receipt(),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    policy: { profile: 'diagnostic_optional', sourceRunId: 'older-run', currentRunId: artifact },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /run id is not current/i,
    invariant: 'optional_run_evidence_tightens_on_disagreement',
  },
  {
    id: 'optional_mtime_future_source_blocks',
    receipt: receipt(),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    policy: { ...optionalMtimePolicy, sourceMtime: '2026-05-07T02:00:00Z' },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /source artifact mtime is in the future/i,
    invariant: 'optional_mtime_evidence_tightens_on_future_source',
  },
  {
    id: 'optional_digest_mismatch_blocks',
    receipt: receipt(),
    action: { verb: 'run_local_test', riskTier: 'low_local' },
    policy: { profile: 'diagnostic_optional', observedSourceDigest: 'sha256:observed-different-digest' },
    expectedDecision: 'fetch_abstain',
    expectedReasonPattern: /digest does not match/i,
    invariant: 'optional_digest_evidence_tightens_on_disagreement',
  },
];

const profiles = [
  { key: 'strictFull', policy: strictFullPolicy, expectedKey: 'expectedStrictFull' },
  { key: 'optionalRun', policy: optionalRunPolicy, expectedKey: 'expectedOptionalRun' },
  { key: 'optionalDigest', policy: optionalDigestPolicy, expectedKey: 'expectedOptionalDigest' },
  { key: 'optionalMtime', policy: optionalMtimePolicy, expectedKey: 'expectedOptionalMtime' },
];

function run(testCase, policy) {
  const result = validateCompactReceiptForAction(testCase.receipt, {
    expectedSource,
    proposedAction: testCase.action,
    receiverFreshnessPolicy,
    sourceFreshnessPolicy: policy,
  });
  return { decision: result.decision, reasons: result.reasons };
}

const interactionRows = independentGateScenarios.flatMap((scenario) => profiles.map((profile) => {
  const result = run(scenario, profile.policy);
  const expectedDecision = scenario[profile.expectedKey];
  const pass = result.decision === expectedDecision;
  return {
    id: `${scenario.id}__${profile.key}`,
    scenario: scenario.id,
    profile: profile.key,
    invariant: scenario.invariant,
    expectedDecision,
    actualDecision: result.decision,
    pass,
    reasons: result.reasons,
    unsafeAllow: scenario.invariant !== 'benign_current_local_may_allow' && result.decision === 'allow_local_shadow',
  };
}));

const sourceEvidenceRows = sourceEvidenceScenarios.map((scenario) => {
  const result = run(scenario, scenario.policy);
  const reasonText = result.reasons.join(' | ');
  const reasonPass = scenario.expectedReasonPattern ? scenario.expectedReasonPattern.test(reasonText) : true;
  const pass = result.decision === scenario.expectedDecision && reasonPass;
  return {
    id: scenario.id,
    invariant: scenario.invariant,
    expectedDecision: scenario.expectedDecision,
    actualDecision: result.decision,
    reasonPass,
    pass,
    reasons: result.reasons,
    unsafeAllow: scenario.expectedDecision !== 'allow_local_shadow' && result.decision === 'allow_local_shadow',
  };
});

const rows = [...interactionRows, ...sourceEvidenceRows];
const independentUnsafeAllows = interactionRows.filter((row) => row.unsafeAllow).length;
const sourceUnsafeAllows = sourceEvidenceRows.filter((row) => row.unsafeAllow).length;
const summary = {
  artifact,
  timestamp: '2026-05-07T01:00:00Z',
  verdict: rows.every((row) => row.pass) && independentUnsafeAllows === 0 && sourceUnsafeAllows === 0 ? 'pass' : 'fail',
  interactionRows: interactionRows.length,
  sourceEvidenceRows: sourceEvidenceRows.length,
  totalRows: rows.length,
  passRows: rows.filter((row) => row.pass).length,
  independentUnsafeAllows,
  sourceUnsafeAllows,
  optionalRelaxationAllowedOnlyFor: ['benign_current_local_receipt_with_partial_agreeing_source_evidence'],
  interpretation: 'diagnostic_optional can reduce the strict profile missing-mtime overblock only for benign current local receipts with agreeing partial source evidence. It does not relax stale/future receipt freshness, source spoofing, non-local scope, incomplete negative boundary, sensitive action routing, or observed source disagreement.',
};

const output = {
  summary,
  expectedSource,
  receiverFreshnessPolicy,
  profiles: profiles.map((profile) => ({ key: profile.key, policyFields: Object.keys(profile.policy).sort() })),
  rows,
  boundary: ['fixture_only', 'local_shadow_only', 'no_runtime_integration', 'no_publication', 'no_external_effects', 'no_permanent_memory'],
};

mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (summary.verdict !== 'pass') process.exit(1);
