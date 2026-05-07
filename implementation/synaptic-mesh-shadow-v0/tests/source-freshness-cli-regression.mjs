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
const evidencePath = resolve(root, 'evidence/source-freshness-cli-regression.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const artifact = 'T-synaptic-mesh-source-freshness-cli-regression-v0';
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
  receiverNow: '2026-05-07T00:30:00Z',
  maxAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: 2 * 60 * 1000,
};
const currentSourcePolicy = {
  receiverNow: receiverFreshnessPolicy.receiverNow,
  maxSourceAgeMs: 6 * 60 * 60 * 1000,
  allowedFutureSkewMs: receiverFreshnessPolicy.allowedFutureSkewMs,
  sourceMtime: '2026-05-06T19:50:00Z',
  sourceRunId: artifact,
  currentRunId: artifact,
  observedSourceDigest: fixture.expectedSource.digest,
};

const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const stale = fixture.handoffs.find((handoff) => handoff.id.includes('stale'));
const spoof = fixture.handoffs.find((handoff) => handoff.id.includes('spoof'));
const publish = fixture.handoffs.find((handoff) => handoff.actionVerb === 'publish');

const cases = [
  {
    id: 'cli-valid-remains-allow-with-current-source-policy',
    kind: 'cli',
    receipt: valid.receipt,
    actionVerb: valid.actionVerb,
    sourcePolicy: currentSourcePolicy,
    expectedBaseline: 'allow_local_shadow',
    expectedWithSource: 'allow_local_shadow',
    expectationClass: 'benign_local_not_overblocked',
  },
  {
    id: 'cli-stale-receipt-remains-fetch-with-current-source-policy',
    kind: 'cli',
    receipt: stale.receipt,
    actionVerb: stale.actionVerb,
    sourcePolicy: currentSourcePolicy,
    expectedBaseline: 'fetch_abstain',
    expectedWithSource: 'fetch_abstain',
    expectationClass: 'existing_receipt_stale_unchanged',
  },
  {
    id: 'cli-source-spoof-remains-fetch-with-current-source-policy',
    kind: 'cli',
    receipt: spoof.receipt,
    actionVerb: spoof.actionVerb,
    sourcePolicy: currentSourcePolicy,
    expectedBaseline: 'fetch_abstain',
    expectedWithSource: 'fetch_abstain',
    expectationClass: 'source_binding_unchanged',
  },
  {
    id: 'cli-sensitive-publish-remains-ask-human-with-current-source-policy',
    kind: 'cli',
    receipt: publish.receipt,
    actionVerb: publish.actionVerb,
    riskTier: 'sensitive',
    sourcePolicy: currentSourcePolicy,
    expectedBaseline: 'ask_human',
    expectedWithSource: 'ask_human',
    expectationClass: 'sensitive_routing_unchanged',
  },
  {
    id: 'cli-valid-receipt-stale-observed-source-tightens-to-fetch',
    kind: 'cli',
    receipt: valid.receipt,
    actionVerb: valid.actionVerb,
    sourcePolicy: { ...currentSourcePolicy, sourceMtime: '2026-05-06T12:00:00Z' },
    expectedBaseline: 'allow_local_shadow',
    expectedWithSource: 'fetch_abstain',
    expectationClass: 'source_policy_tightening',
    expectedPolicyReason: /source artifact mtime exceeds/i,
  },
  {
    id: 'summary-repair-receipt-backed-valid-remains-allow-with-current-source-policy',
    kind: 'direct',
    text: `Compressed handoff says run local validation only. Receipt: ${valid.receipt}`,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    sourcePolicy: currentSourcePolicy,
    expectedBaseline: 'allow_local_shadow',
    expectedWithSource: 'allow_local_shadow',
    expectationClass: 'summary_repair_receipt_backed_compatible',
  },
  {
    id: 'summary-repair-narrative-only-remains-fetch-with-current-source-policy',
    kind: 'direct',
    text: 'Agent says this is fresh and safe, but gives no labeled receipt tuples, exact source path, digest, produced-at timestamp, boundaries, or action tuple.',
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    sourcePolicy: currentSourcePolicy,
    expectedBaseline: 'fetch_abstain',
    expectedWithSource: 'fetch_abstain',
    expectationClass: 'narrative_authority_not_repaired',
  },
  {
    id: 'summary-repair-receipt-backed-digest-disagreement-tightens-to-fetch',
    kind: 'direct',
    text: `Compressed handoff says run local validation only. Receipt: ${valid.receipt}`,
    proposedAction: { verb: 'run_local_test', riskTier: 'low_local' },
    sourcePolicy: { ...currentSourcePolicy, observedSourceDigest: 'sha256:observed-newer-digest' },
    expectedBaseline: 'allow_local_shadow',
    expectedWithSource: 'fetch_abstain',
    expectationClass: 'source_policy_tightening',
    expectedPolicyReason: /digest does not match observed/i,
  },
];

function sourcePolicyArgs(policy) {
  const args = [
    '--max-source-age-ms', String(policy.maxSourceAgeMs),
    '--source-run-id', String(policy.sourceRunId),
    '--current-run-id', String(policy.currentRunId),
    '--observed-source-digest', String(policy.observedSourceDigest),
  ];
  if (policy.sourceMtime !== undefined) args.push('--source-mtime', String(policy.sourceMtime));
  return args;
}

function runCli(row, withSourcePolicy) {
  const args = [
    cli,
    '--receipt', row.receipt,
    ...cliSourceArgs,
    '--action-verb', row.actionVerb ?? 'run_local_test',
    '--receiver-now', receiverFreshnessPolicy.receiverNow,
    '--max-age-ms', String(receiverFreshnessPolicy.maxAgeMs),
    '--future-skew-ms', String(receiverFreshnessPolicy.allowedFutureSkewMs),
  ];
  if (row.riskTier) args.push('--risk-tier', row.riskTier);
  if (withSourcePolicy) args.push(...sourcePolicyArgs(row.sourcePolicy));
  const proc = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return JSON.parse(proc.stdout);
}

function runDirect(row, withSourcePolicy) {
  const parsed = parseCompactReceipt(row.text);
  const result = validateCompactReceiptForAction(parsed, {
    expectedSource,
    proposedAction: row.proposedAction,
    receiverFreshnessPolicy,
    sourceFreshnessPolicy: withSourcePolicy ? row.sourcePolicy : undefined,
  });
  return { decision: result.decision, reasons: result.reasons, authority: result.authority, parserOk: parsed.ok };
}

const rows = cases.map((row) => {
  const baseline = row.kind === 'cli' ? runCli(row, false) : runDirect(row, false);
  const withSource = row.kind === 'cli' ? runCli(row, true) : runDirect(row, true);
  const policyReasonText = withSource.reasons.join('\n');
  const reasonMatches = row.expectedPolicyReason ? row.expectedPolicyReason.test(policyReasonText) : true;
  const pass = baseline.decision === row.expectedBaseline && withSource.decision === row.expectedWithSource && reasonMatches;
  return {
    id: row.id,
    kind: row.kind,
    expectationClass: row.expectationClass,
    baselineDecision: baseline.decision,
    sourcePolicyDecision: withSource.decision,
    expectedBaseline: row.expectedBaseline,
    expectedWithSource: row.expectedWithSource,
    pass,
    baselineReasons: baseline.reasons,
    sourcePolicyReasons: withSource.reasons,
    unsafeSourceAllow: row.expectedWithSource !== 'allow_local_shadow' && withSource.decision === 'allow_local_shadow',
    falseSourceBlockBenign: row.expectedWithSource === 'allow_local_shadow' && withSource.decision !== 'allow_local_shadow',
    sourcePolicyTightened: baseline.decision === 'allow_local_shadow' && withSource.decision === 'fetch_abstain',
  };
});

const summary = {
  artifact,
  timestamp: '2026-05-07T00:30:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeSourceAllow) ? 'pass' : 'fail',
  receiverFreshnessPolicy,
  currentSourcePolicy,
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  cliCases: rows.filter((row) => row.kind === 'cli').length,
  summaryRepairCases: rows.filter((row) => row.kind === 'direct').length,
  unsafeSourceAllows: rows.filter((row) => row.unsafeSourceAllow).length,
  falseSourceBlocksBenign: rows.filter((row) => row.falseSourceBlockBenign).length,
  sourcePolicyTightenedCases: rows.filter((row) => row.sourcePolicyTightened).length,
  interpretation: 'Source freshness policy is compatible with existing CLI and summary-repair fixtures: current observed source evidence does not overblock benign local receipts or change stale/source-spoof/sensitive/narrative routing, while stale observed source mtime and observed digest disagreement tighten valid-looking receipts to fetch_abstain.',
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
