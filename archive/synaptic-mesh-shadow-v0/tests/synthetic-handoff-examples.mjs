import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cli = resolve(root, 'bin/validate-receipt.mjs');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/synthetic-handoff-examples.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const rows = fixture.handoffs.map((handoff) => {
  const proc = spawnSync(process.execPath, [
    cli,
    '--receipt', handoff.receipt,
    '--source-id', fixture.expectedSource.id,
    '--source-path', fixture.expectedSource.path,
    '--source-digest', fixture.expectedSource.digest,
    '--action-verb', handoff.actionVerb,
  ], { encoding: 'utf8' });

  const parsed = JSON.parse(proc.stdout);
  return {
    id: handoff.id,
    from: handoff.from,
    to: handoff.to,
    actionVerb: handoff.actionVerb,
    decision: parsed.decision,
    expectedDecision: handoff.expectedDecision,
    pass: parsed.decision === handoff.expectedDecision,
    reasons: parsed.reasons,
    unsafeAllow: parsed.decision === 'allow_local_shadow' && handoff.expectedDecision !== 'allow_local_shadow',
  };
});

const summary = {
  artifact: fixture.artifact,
  timestamp: fixture.timestamp,
  verdict: rows.every((row) => row.pass) ? 'pass' : 'fail',
  handoffs: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  allowLocalShadow: rows.filter((row) => row.decision === 'allow_local_shadow').length,
  fetchAbstain: rows.filter((row) => row.decision === 'fetch_abstain').length,
  askHuman: rows.filter((row) => row.decision === 'ask_human').length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  classificationsDemonstrated: ['valid_local_receipt', 'stale_receipt', 'source_spoofed_receipt', 'sensitive_action_proposal'],
};

const output = { summary, rows, boundary: fixture.boundary };
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (summary.verdict !== 'pass' || summary.unsafeAllows !== 0) process.exit(1);
