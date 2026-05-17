import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cli = resolve(root, 'bin/validate-receipt.mjs');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/receipt-freshness-policy-source-clock-disagreement.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-receipt-freshness-policy-source-clock-disagreement-v0';
const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const expectedSource = {
  sourceArtifactId: fixture.expectedSource.id,
  sourceArtifactPath: fixture.expectedSource.path,
  sourceDigest: fixture.expectedSource.digest,
};
const cliSourceArgs = [
  '--source-id', fixture.expectedSource.id,
  '--source-path', fixture.expectedSource.path,
  '--source-digest', fixture.expectedSource.digest,
];
const receiverFreshnessPolicy = {
  receiverNow: '2026-05-06T20:30:00Z',
  maxAgeMs: 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const currentSourcePolicy = {
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 90 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceMtime: '2026-05-06T19:50:00Z',
  sourceRunId: artifact,
  currentRunId: artifact,
  observedSourceDigest: fixture.expectedSource.digest,
};

const cases = [
  {
    id: 'current-prod-current-source-allows-local-shadow',
    sourcePolicy: currentSourcePolicy,
    expectedDecision: 'allow_local_shadow',
    expectedReason: /compact receipt is current/i,
  },
  {
    id: 'current-prod-stale-source-mtime-fetches-source',
    sourcePolicy: { ...currentSourcePolicy, sourceMtime: '2026-05-06T15:00:00Z' },
    expectedDecision: 'fetch_abstain',
    expectedReason: /source artifact mtime exceeds/i,
  },
  {
    id: 'current-prod-cross-run-source-fetches-source',
    sourcePolicy: { ...currentSourcePolicy, sourceRunId: 'older-run-2026-05-05' },
    expectedDecision: 'fetch_abstain',
    expectedReason: /run id is not current/i,
  },
  {
    id: 'current-prod-observed-digest-disagreement-fetches-source',
    sourcePolicy: { ...currentSourcePolicy, observedSourceDigest: 'sha256:observed-newer-digest' },
    expectedDecision: 'fetch_abstain',
    expectedReason: /digest does not match observed/i,
  },
  {
    id: 'missing-source-mtime-under-policy-fetches-source',
    sourcePolicy: { ...currentSourcePolicy, sourceMtime: undefined },
    expectedDecision: 'fetch_abstain',
    expectedReason: /missing or invalid source artifact mtime/i,
  },
  {
    id: 'source-future-mtime-beyond-skew-fetches-source',
    sourcePolicy: { ...currentSourcePolicy, sourceMtime: '2026-05-06T20:40:00Z' },
    expectedDecision: 'fetch_abstain',
    expectedReason: /source artifact mtime is in the future/i,
  },
];

function runDirect(row) {
  const result = validateCompactReceiptForAction(valid.receipt, {
    expectedSource,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    receiverFreshnessPolicy,
    sourceFreshnessPolicy: row.sourcePolicy,
  });
  return { decision: result.decision, reasons: result.reasons, authority: result.authority };
}

function runCli(row) {
  const args = [
    cli,
    '--receipt', valid.receipt,
    ...cliSourceArgs,
    '--action-verb', 'run_local_test',
    '--receiver-now', receiverFreshnessPolicy.receiverNow,
    '--max-age-ms', String(receiverFreshnessPolicy.maxAgeMs),
    '--future-skew-ms', String(receiverFreshnessPolicy.allowedFutureSkewMs),
    '--max-source-age-ms', String(row.sourcePolicy.maxSourceAgeMs),
    '--source-run-id', String(row.sourcePolicy.sourceRunId),
    '--current-run-id', String(row.sourcePolicy.currentRunId),
    '--observed-source-digest', String(row.sourcePolicy.observedSourceDigest),
  ];
  if (row.sourcePolicy.sourceMtime !== undefined) args.push('--source-mtime', String(row.sourcePolicy.sourceMtime));
  const proc = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return JSON.parse(proc.stdout);
}

const rows = cases.map((row) => {
  const direct = runDirect(row);
  const cliResult = runCli(row);
  const directReasons = direct.reasons.join('\n');
  const cliReasons = cliResult.reasons.join('\n');
  const reasonMatches = row.expectedReason.test(directReasons) && row.expectedReason.test(cliReasons);
  const pass = direct.decision === row.expectedDecision && cliResult.decision === row.expectedDecision && reasonMatches;
  return {
    id: row.id,
    expectedDecision: row.expectedDecision,
    directDecision: direct.decision,
    cliDecision: cliResult.decision,
    pass,
    reasonMatches,
    directReasons: direct.reasons,
    cliReasons: cliResult.reasons,
    unsafeAllow: row.expectedDecision !== 'allow_local_shadow' && (direct.decision === 'allow_local_shadow' || cliResult.decision === 'allow_local_shadow'),
    validControlBlocked: row.expectedDecision === 'allow_local_shadow' && (direct.decision !== 'allow_local_shadow' || cliResult.decision !== 'allow_local_shadow'),
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-07T00:13:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  validControlBlocked: rows.filter((row) => row.validControlBlocked).length,
  sourceDisagreementBlocks: rows.filter((row) => row.expectedDecision === 'fetch_abstain' && row.pass).length,
  interpretation: 'Current-looking receipts are not enough when observed source evidence disagrees: stale source mtime, cross-run source id, missing mtime, future source mtime, or observed digest mismatch all fetch-abstain while a current source control remains allowed locally.',
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
