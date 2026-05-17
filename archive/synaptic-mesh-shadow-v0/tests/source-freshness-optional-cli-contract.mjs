import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cli = resolve(root, 'bin/validate-receipt.mjs');
const evidencePath = resolve(root, 'evidence/source-freshness-optional-cli-contract.out.json');
const artifact = 'T-synaptic-mesh-source-freshness-optional-cli-contract-v0';
const expectedSource = {
  id: 'T-synaptic-mesh-synthetic-handoff-examples-v0',
  path: 'research-package/T-synaptic-mesh-synthetic-handoff-examples-v0.md',
  digest: 'sha256:synthetic-handoff-v0',
};
const receipt = 'SRC=T-synaptic-mesh-synthetic-handoff-examples-v0; SRCPATH=research-package/T-synaptic-mesh-synthetic-handoff-examples-v0.md; SRCDIGEST=sha256:synthetic-handoff-v0; PROD=2026-05-06T19:42:00Z; FRESH=current; SCOPE=local_shadow; PB=no_promotion_without_human; NO=no_external_no_runtime_no_config_no_delete_no_publish_no_memory; LRE=lineage:optional-cli-contract; TOK=low; ACT=run_local_test';
const clockArgs = ['--receiver-now', '2026-05-07T00:55:00Z', '--max-age-ms', String(6 * 60 * 60 * 1000), '--future-skew-ms', String(2 * 60 * 1000)];

const baseArgs = [
  '--receipt', receipt,
  '--source-id', expectedSource.id,
  '--source-path', expectedSource.path,
  '--source-digest', expectedSource.digest,
  '--action-verb', 'run_local_test',
];

const cases = [
  {
    id: 'strict_default_full_source_evidence_allows_cli',
    args: [...clockArgs, '--max-source-age-ms', String(6 * 60 * 60 * 1000), '--source-mtime', '2026-05-06T20:31:00Z', '--source-run-id', artifact, '--current-run-id', artifact, '--observed-source-digest', expectedSource.digest],
    expectedDecision: 'allow_local_shadow',
    expectedStatus: 0,
  },
  {
    id: 'strict_default_run_pair_without_mtime_fetches_cli',
    args: [...clockArgs, '--max-source-age-ms', String(6 * 60 * 60 * 1000), '--source-run-id', artifact, '--current-run-id', artifact],
    expectedDecision: 'fetch_abstain',
    expectedStatus: 1,
    expectedReasonPattern: /missing or invalid source artifact mtime/i,
  },
  {
    id: 'diagnostic_optional_run_pair_allows_cli',
    args: ['--source-policy-profile', 'diagnostic_optional', '--source-run-id', artifact, '--current-run-id', artifact],
    expectedDecision: 'allow_local_shadow',
    expectedStatus: 0,
  },
  {
    id: 'diagnostic_optional_digest_mismatch_fetches_cli',
    args: ['--source-policy-profile', 'diagnostic_optional', '--observed-source-digest', 'sha256:observed-different-digest'],
    expectedDecision: 'fetch_abstain',
    expectedStatus: 1,
    expectedReasonPattern: /digest does not match/i,
  },
  {
    id: 'diagnostic_optional_empty_profile_fetches_cli',
    args: ['--source-policy-profile', 'diagnostic_optional'],
    expectedDecision: 'fetch_abstain',
    expectedStatus: 1,
    expectedReasonPattern: /no observed source evidence/i,
  },
  {
    id: 'unsupported_profile_fetches_cli',
    args: ['--source-policy-profile', 'optimistic_optional', '--observed-source-digest', expectedSource.digest],
    expectedDecision: 'fetch_abstain',
    expectedStatus: 1,
    expectedReasonPattern: /unsupported profile/i,
  },
];

const rows = cases.map((testCase) => {
  const proc = spawnSync(process.execPath, [cli, ...baseArgs, ...testCase.args], { encoding: 'utf8' });
  let parsed;
  try {
    parsed = JSON.parse(proc.stdout);
  } catch (error) {
    parsed = { parseError: error.message, stdout: proc.stdout, stderr: proc.stderr };
  }
  const reasons = parsed.reasons ?? [];
  const reasonPass = testCase.expectedReasonPattern ? testCase.expectedReasonPattern.test(reasons.join(' | ')) : true;
  const pass = proc.status === testCase.expectedStatus && parsed.decision === testCase.expectedDecision && reasonPass;
  return {
    id: testCase.id,
    status: proc.status,
    expectedStatus: testCase.expectedStatus,
    decision: parsed.decision,
    expectedDecision: testCase.expectedDecision,
    reasonPass,
    pass,
    reasons,
    stderr: proc.stderr,
    unsafeAllow: parsed.decision === 'allow_local_shadow' && testCase.expectedDecision !== 'allow_local_shadow',
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-07T00:55:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  cases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  interpretation: 'The CLI now exposes source policy profiles without changing strict/default behavior: strict partial source evidence still requires mtime, while diagnostic_optional accepts intentional partial evidence and fails closed for empty/unsupported profiles or observed disagreements.',
};

const output = { summary, rows, boundary: ['local_shadow_only', 'not_runtime', 'not_config', 'not_publication', 'not_enforcement'] };
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (summary.verdict !== 'pass') process.exit(1);
