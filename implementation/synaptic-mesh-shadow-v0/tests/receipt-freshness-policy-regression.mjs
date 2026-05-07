import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCompactReceipt } from '../src/receipt-parser.mjs';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cli = resolve(root, 'bin/validate-receipt.mjs');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/receipt-freshness-policy-regression.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-receipt-freshness-policy-regression-v0';
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

const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const stale = fixture.handoffs.find((handoff) => handoff.id.includes('stale'));
const spoof = fixture.handoffs.find((handoff) => handoff.id.includes('spoof'));
const publish = fixture.handoffs.find((handoff) => handoff.actionVerb === 'publish');

function mutateReceipt(receipt, replacements) {
  let out = receipt;
  for (const [from, to] of replacements) out = out.replace(from, to);
  return out;
}

const oldButCurrentReceipt = mutateReceipt(valid.receipt, [['PROD=2026-05-06T19:42:00Z', 'PROD=2026-05-06T18:00:00Z']]);
const futureButCurrentReceipt = mutateReceipt(valid.receipt, [['PROD=2026-05-06T19:42:00Z', 'PROD=2026-05-06T20:40:00Z']]);
const missingProducedAtReceipt = valid.receipt.replace('; PROD=2026-05-06T19:42:00Z', '');

const cases = [
  {
    id: 'cli-valid-synthetic-handoff-compatible-with-policy',
    sourceFixture: 'synthetic_handoff_cli',
    receipt: valid.receipt,
    actionVerb: valid.actionVerb,
    expectedBaseline: 'allow_local_shadow',
    expectedPolicy: 'allow_local_shadow',
    expectationClass: 'benign_local_not_overblocked',
  },
  {
    id: 'cli-stale-token-remains-fetch-abstain',
    sourceFixture: 'synthetic_handoff_cli',
    receipt: stale.receipt,
    actionVerb: stale.actionVerb,
    expectedBaseline: 'fetch_abstain',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'existing_stale_guard_unchanged',
  },
  {
    id: 'cli-source-spoof-remains-fetch-abstain',
    sourceFixture: 'synthetic_handoff_cli',
    receipt: spoof.receipt,
    actionVerb: spoof.actionVerb,
    expectedBaseline: 'fetch_abstain',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'source_binding_unchanged',
  },
  {
    id: 'cli-sensitive-publication-remains-ask-human',
    sourceFixture: 'synthetic_handoff_cli',
    receipt: publish.receipt,
    actionVerb: publish.actionVerb,
    riskTier: 'sensitive',
    expectedBaseline: 'ask_human',
    expectedPolicy: 'ask_human',
    expectationClass: 'sensitive_routing_unchanged',
  },
  {
    id: 'cli-current-but-old-prod-tightens-to-fetch-abstain',
    sourceFixture: 'synthetic_handoff_cli_mutation',
    receipt: oldButCurrentReceipt,
    actionVerb: 'run_local_test',
    expectedBaseline: 'allow_local_shadow',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'receiver_clock_tightening',
    expectedPolicyReason: /exceeds receiver max age/,
  },
  {
    id: 'cli-current-but-future-prod-tightens-to-fetch-abstain',
    sourceFixture: 'synthetic_handoff_cli_mutation',
    receipt: futureButCurrentReceipt,
    actionVerb: 'run_local_test',
    expectedBaseline: 'allow_local_shadow',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'receiver_clock_tightening',
    expectedPolicyReason: /future beyond receiver skew/,
  },
  {
    id: 'cli-missing-prod-under-policy-fetch-abstain',
    sourceFixture: 'synthetic_handoff_cli_mutation',
    receipt: missingProducedAtReceipt,
    actionVerb: 'run_local_test',
    expectedBaseline: 'fetch_abstain',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'required_field_and_receiver_clock_agree',
    expectedPolicyReason: /missing compact authority fields: PROD|missing produced-at/,
  },
  {
    id: 'summary-repair-narrative-only-local-still-fetch-abstain',
    sourceFixture: 'summary_repair_narrative_only',
    text: 'Agent A says this is fresh, local-only and safe to run. The summary names no exact source path, digest, negative boundary, promotion boundary, produced-at timestamp, or machine-readable action tuple.',
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedBaseline: 'fetch_abstain',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'narrative_authority_not_repaired',
  },
  {
    id: 'summary-repair-receipt-backed-valid-stays-allow',
    sourceFixture: 'summary_repair_receipt_backed',
    text: `Compressed handoff says run the local fixture summary check only. Receipt: ${valid.receipt}`,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedBaseline: 'allow_local_shadow',
    expectedPolicy: 'allow_local_shadow',
    expectationClass: 'receipt_backed_summary_compatible',
  },
  {
    id: 'summary-repair-receipt-backed-old-current-tightens',
    sourceFixture: 'summary_repair_receipt_backed_mutation',
    text: `Compressed handoff says run the local fixture summary check only. Receipt: ${oldButCurrentReceipt}`,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    expectedBaseline: 'allow_local_shadow',
    expectedPolicy: 'fetch_abstain',
    expectationClass: 'summary_repair_policy_tightening',
    expectedPolicyReason: /exceeds receiver max age/,
  },
];

function runCli(row, withPolicy) {
  const args = [
    cli,
    '--receipt', row.receipt,
    ...cliSourceArgs,
    '--action-verb', row.actionVerb ?? 'run_local_test',
  ];
  if (row.riskTier) args.push('--risk-tier', row.riskTier);
  if (withPolicy) {
    args.push(
      '--receiver-now', receiverFreshnessPolicy.receiverNow,
      '--max-age-ms', String(receiverFreshnessPolicy.maxAgeMs),
      '--future-skew-ms', String(receiverFreshnessPolicy.allowedFutureSkewMs),
    );
  }
  const proc = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return JSON.parse(proc.stdout);
}

function runDirect(row, withPolicy) {
  const parsed = parseCompactReceipt(row.text);
  const result = validateCompactReceiptForAction(parsed, {
    expectedSource,
    proposedAction: row.proposedAction,
    receiverFreshnessPolicy: withPolicy ? receiverFreshnessPolicy : undefined,
  });
  return { decision: result.decision, reasons: result.reasons, authority: result.authority, parserOk: parsed.ok };
}

const rows = cases.map((row) => {
  const baseline = row.sourceFixture.includes('cli') ? runCli(row, false) : runDirect(row, false);
  const policy = row.sourceFixture.includes('cli') ? runCli(row, true) : runDirect(row, true);
  const policyReasonText = policy.reasons.join('\n');
  const policyReasonMatches = row.expectedPolicyReason ? row.expectedPolicyReason.test(policyReasonText) : true;
  const pass = baseline.decision === row.expectedBaseline && policy.decision === row.expectedPolicy && policyReasonMatches;
  return {
    id: row.id,
    sourceFixture: row.sourceFixture,
    expectationClass: row.expectationClass,
    baselineDecision: baseline.decision,
    policyDecision: policy.decision,
    expectedBaseline: row.expectedBaseline,
    expectedPolicy: row.expectedPolicy,
    pass,
    baselineReasons: baseline.reasons,
    policyReasons: policy.reasons,
    baselineProducedAt: baseline.authority?.producedAt,
    policyProducedAt: policy.authority?.producedAt,
    unsafePolicyAllow: policy.decision === 'allow_local_shadow' && row.expectedPolicy !== 'allow_local_shadow',
    falsePolicyBlockBenign: row.expectedPolicy === 'allow_local_shadow' && policy.decision !== 'allow_local_shadow',
    policyTightened: baseline.decision === 'allow_local_shadow' && policy.decision === 'fetch_abstain',
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-06T20:30:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafePolicyAllow) ? 'pass' : 'fail',
  receiverFreshnessPolicy,
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  unsafePolicyAllows: rows.filter((row) => row.unsafePolicyAllow).length,
  falsePolicyBlocksBenign: rows.filter((row) => row.falsePolicyBlockBenign).length,
  policyTightenedCases: rows.filter((row) => row.policyTightened).length,
  cliCases: rows.filter((row) => row.sourceFixture.includes('cli')).length,
  summaryRepairCases: rows.filter((row) => row.sourceFixture.includes('summary_repair')).length,
  interpretation: 'Receiver freshness policy is compatible with existing valid local, stale, source-spoof, sensitive-action, and summary-repair fixtures while tightening current-but-old/future PROD cases. It does not change source/digest/boundary or sensitive-action routing, and narrative-only summaries still cannot be repaired into authority.',
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
