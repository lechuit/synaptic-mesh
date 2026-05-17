import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cli = resolve(root, 'bin/validate-receipt.mjs');
const evidencePath = resolve(root, 'evidence/cli-validator.out.json');
const expectedSource = {
  id: 'T-synaptic-mesh-local-cli-validator-v0',
  path: 'research-package/T-synaptic-mesh-local-cli-validator-v0.md',
  digest: 'sha256:local-cli-v0',
};

const cases = [
  {
    id: 'valid-local-test',
    receipt: 'SRC=T-synaptic-mesh-local-cli-validator-v0; SRCPATH=research-package/T-synaptic-mesh-local-cli-validator-v0.md; SRCDIGEST=sha256:local-cli-v0; PROD=2026-05-06T19:28:00Z; FRESH=current; SCOPE=local_shadow; PB=no_promotion_without_human; NO=no_external_no_runtime_no_config_no_delete_no_publish_no_memory; LRE=lineage:local-fixture; TOK=low; ACT=run_local_test',
    actionVerb: 'run_local_test',
    expectedDecision: 'allow_local_shadow',
    expectedStatus: 0,
  },
  {
    id: 'missing-digest',
    receipt: 'SRC=T-synaptic-mesh-local-cli-validator-v0; SRCPATH=research-package/T-synaptic-mesh-local-cli-validator-v0.md; PROD=2026-05-06T19:28:00Z; FRESH=current; SCOPE=local_shadow; PB=no_promotion_without_human; NO=no_external_no_runtime_no_config_no_delete_no_publish_no_memory; LRE=lineage:local-fixture; TOK=low; ACT=run_local_test',
    actionVerb: 'run_local_test',
    expectedDecision: 'fetch_abstain',
    expectedStatus: 1,
  },
  {
    id: 'sensitive-action',
    receipt: 'SRC=T-synaptic-mesh-local-cli-validator-v0; SRCPATH=research-package/T-synaptic-mesh-local-cli-validator-v0.md; SRCDIGEST=sha256:local-cli-v0; PROD=2026-05-06T19:28:00Z; FRESH=current; SCOPE=local_shadow; PB=no_promotion_without_human; NO=no_external_no_runtime_no_config_no_delete_no_publish_no_memory; LRE=lineage:local-fixture; TOK=low; ACT=publish',
    actionVerb: 'publish',
    expectedDecision: 'ask_human',
    expectedStatus: 1,
  },
  {
    id: 'source-spoof',
    receipt: 'SRC=wrong-source; SRCPATH=research-package/T-synaptic-mesh-local-cli-validator-v0.md; SRCDIGEST=sha256:local-cli-v0; PROD=2026-05-06T19:28:00Z; FRESH=current; SCOPE=local_shadow; PB=no_promotion_without_human; NO=no_external_no_runtime_no_config_no_delete_no_publish_no_memory; LRE=lineage:local-fixture; TOK=low; ACT=run_local_test',
    actionVerb: 'run_local_test',
    expectedDecision: 'fetch_abstain',
    expectedStatus: 1,
  },
];

const rows = cases.map((testCase) => {
  const proc = spawnSync(process.execPath, [
    cli,
    '--receipt', testCase.receipt,
    '--source-id', expectedSource.id,
    '--source-path', expectedSource.path,
    '--source-digest', expectedSource.digest,
    '--action-verb', testCase.actionVerb,
  ], { encoding: 'utf8' });
  const parsed = JSON.parse(proc.stdout);
  return {
    id: testCase.id,
    status: proc.status,
    expectedStatus: testCase.expectedStatus,
    decision: parsed.decision,
    expectedDecision: testCase.expectedDecision,
    pass: proc.status === testCase.expectedStatus && parsed.decision === testCase.expectedDecision,
    reasons: parsed.reasons,
    unsafeAllow: parsed.decision === 'allow_local_shadow' && testCase.expectedDecision !== 'allow_local_shadow',
  };
});

const summary = {
  artifact: 'T-synaptic-mesh-local-cli-validator-v0',
  timestamp: '2026-05-06T19:28:00Z',
  verdict: rows.every((row) => row.pass) ? 'pass' : 'fail',
  cases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  allowLocalShadow: rows.filter((row) => row.decision === 'allow_local_shadow').length,
  fetchAbstain: rows.filter((row) => row.decision === 'fetch_abstain').length,
  askHuman: rows.filter((row) => row.decision === 'ask_human').length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
};

const output = { summary, rows, boundary: ['local_shadow_only', 'not_runtime', 'not_config', 'not_publication', 'not_enforcement'] };
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (summary.verdict !== 'pass' || summary.unsafeAllows !== 0) process.exit(1);
