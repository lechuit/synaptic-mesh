import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cli = resolve(root, 'bin/validate-receipt.mjs');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/receipt-freshness-policy-missing-clock-negative-control.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-receipt-freshness-policy-missing-clock-negative-control-v0';
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
const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const futureReceipt = valid.receipt.replace('PROD=2026-05-06T19:42:00Z', 'PROD=2026-05-06T20:40:00Z');
const oldReceipt = valid.receipt.replace('PROD=2026-05-06T19:42:00Z', 'PROD=2026-05-06T18:00:00Z');

const validPolicy = {
  receiverNow: '2026-05-06T20:30:00Z',
  maxAgeMs: 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};

const cases = [
  {
    id: 'valid-policy-control-allows-current-local',
    receipt: valid.receipt,
    policy: validPolicy,
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'benign_valid_policy_control',
  },
  {
    id: 'missing-receiver-now-fails-closed',
    receipt: valid.receipt,
    policy: { maxAgeMs: validPolicy.maxAgeMs, allowedFutureSkewMs: validPolicy.allowedFutureSkewMs },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'policy_ambiguity_fail_closed',
    expectedReason: /invalid receiverNow|missing receiverNow/i,
  },
  {
    id: 'invalid-receiver-now-fails-closed',
    receipt: valid.receipt,
    policy: { ...validPolicy, receiverNow: 'not-a-clock' },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'policy_ambiguity_fail_closed',
    expectedReason: /invalid receiverNow/i,
  },
  {
    id: 'missing-max-age-fails-closed',
    receipt: valid.receipt,
    policy: { receiverNow: validPolicy.receiverNow, allowedFutureSkewMs: validPolicy.allowedFutureSkewMs },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'policy_ambiguity_fail_closed',
    expectedReason: /invalid maxAgeMs/i,
  },
  {
    id: 'negative-max-age-fails-closed',
    receipt: valid.receipt,
    policy: { ...validPolicy, maxAgeMs: -1 },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'policy_ambiguity_fail_closed',
    expectedReason: /invalid maxAgeMs/i,
  },
  {
    id: 'negative-future-skew-fails-closed',
    receipt: valid.receipt,
    policy: { ...validPolicy, allowedFutureSkewMs: -1 },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'policy_ambiguity_fail_closed',
    expectedReason: /invalid future skew/i,
  },
  {
    id: 'excessive-future-skew-fails-closed-instead-of-allowing-future-prod',
    receipt: futureReceipt,
    policy: { ...validPolicy, allowedFutureSkewMs: 24 * 60 * 60 * 1000 },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'policy_ambiguity_fail_closed',
    expectedReason: /excessive future skew/i,
  },
  {
    id: 'invalid-receiver-now-does-not-rescue-old-prod',
    receipt: oldReceipt,
    policy: { ...validPolicy, receiverNow: 'not-a-clock' },
    expectedDecision: 'fetch_abstain',
    expectationClass: 'unsafe_policy_not_permission',
    expectedReason: /invalid receiverNow/i,
  },
];

function runDirect(row) {
  const result = validateCompactReceiptForAction(row.receipt, {
    expectedSource,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    receiverFreshnessPolicy: row.policy,
  });
  return { decision: result.decision, reasons: result.reasons, authority: result.authority };
}

function runCli(row) {
  const args = [
    cli,
    '--receipt', row.receipt,
    ...cliSourceArgs,
    '--action-verb', 'run_local_test',
  ];
  if (row.policy.receiverNow !== undefined) args.push('--receiver-now', String(row.policy.receiverNow));
  if (row.policy.maxAgeMs !== undefined) args.push('--max-age-ms', String(row.policy.maxAgeMs));
  if (row.policy.allowedFutureSkewMs !== undefined) args.push('--future-skew-ms', String(row.policy.allowedFutureSkewMs));
  const proc = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return JSON.parse(proc.stdout);
}

const rows = cases.map((row) => {
  const direct = runDirect(row);
  const cliResult = runCli(row);
  const directReasons = direct.reasons.join('\n');
  const cliReasons = cliResult.reasons.join('\n');
  const reasonMatches = row.expectedReason ? row.expectedReason.test(directReasons) && row.expectedReason.test(cliReasons) : true;
  const pass = direct.decision === row.expectedDecision && cliResult.decision === row.expectedDecision && reasonMatches;
  return {
    id: row.id,
    expectationClass: row.expectationClass,
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
  timestamp: '2026-05-06T23:48:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  validControlBlocked: rows.filter((row) => row.validControlBlocked).length,
  invalidPolicyCases: rows.filter((row) => row.expectationClass.includes('fail_closed') || row.expectationClass === 'unsafe_policy_not_permission').length,
  interpretation: 'Receiver freshness policy ambiguity is not permission: missing/invalid receiver clock, invalid max age, negative or excessive future skew fail closed in both direct validator and CLI paths. A valid policy control still allows the benign local receipt.',
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
