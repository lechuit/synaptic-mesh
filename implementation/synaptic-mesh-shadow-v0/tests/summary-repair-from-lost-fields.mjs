import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCompactReceipt } from '../src/receipt-parser.mjs';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/summary-repair-from-lost-fields.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const expectedSource = {
  sourceArtifactId: fixture.expectedSource.id,
  sourceArtifactPath: fixture.expectedSource.path,
  sourceDigest: fixture.expectedSource.digest,
};

const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const stale = fixture.handoffs.find((handoff) => handoff.id.includes('stale'));
const publish = fixture.handoffs.find((handoff) => handoff.actionVerb === 'publish');

const cases = [
  {
    id: 'narrative-only-local-claim-missing-authority-fields',
    summaryMode: 'narrative_only',
    proposedAction: { verb: 'run_local_test', riskTier: 'low' },
    expectedDecision: 'fetch_abstain',
    expectedRepaired: false,
    text: 'Agent A says this is fresh, local-only and safe to run. The summary names no exact source path, digest, negative boundary, promotion boundary, or machine-readable action tuple.',
  },
  {
    id: 'narrative-only-stale-claim-missing-freshness-proof',
    summaryMode: 'narrative_only',
    proposedAction: { verb: 'run_local_test', riskTier: 'low' },
    expectedDecision: 'fetch_abstain',
    expectedRepaired: false,
    text: 'An older result might still be useful. The prose says it should probably be checked locally, but there is no compact freshness proof or source digest to validate.',
  },
  {
    id: 'narrative-only-publication-claim-missing-boundary-fields',
    summaryMode: 'narrative_only',
    proposedAction: { verb: 'publish', riskTier: 'sensitive' },
    expectedDecision: 'ask_human',
    expectedRepaired: false,
    text: 'The summary sounds good and suggests publishing externally. It keeps intent in prose but loses the negative boundary that would forbid publication.',
  },
  {
    id: 'receipt-backed-local-repairs-to-allow',
    summaryMode: 'handoff_plus_compact_receipt',
    proposedAction: { verb: 'run_local_test', riskTier: 'low' },
    expectedDecision: 'allow_local_shadow',
    expectedRepaired: true,
    text: `Compressed handoff says run the local fixture summary check only. Receipt: ${valid.receipt}`,
  },
  {
    id: 'receipt-backed-stale-repairs-to-fetch-abstain',
    summaryMode: 'handoff_plus_compact_receipt',
    proposedAction: { verb: 'run_local_test', riskTier: 'low' },
    expectedDecision: 'fetch_abstain',
    expectedRepaired: true,
    text: `Compressed handoff preserves stale evidence. Receipt: ${stale.receipt}`,
  },
  {
    id: 'receipt-backed-publication-repairs-to-ask-human',
    summaryMode: 'handoff_plus_compact_receipt',
    proposedAction: { verb: 'publish', riskTier: 'sensitive' },
    expectedDecision: 'ask_human',
    expectedRepaired: true,
    text: `Compressed handoff contains a sensitive publication proposal. Receipt: ${publish.receipt}`,
  },
];

function attemptSafeRepair(row) {
  const parsed = parseCompactReceipt(row.text);
  const validation = validateCompactReceiptForAction(parsed, {
    expectedSource,
    proposedAction: row.proposedAction,
  });

  return {
    id: row.id,
    summaryMode: row.summaryMode,
    parserOk: parsed.ok,
    repaired: parsed.ok,
    recoveredAuthorityFields: Object.keys(parsed.fields ?? {}).sort(),
    decision: validation.decision,
    expectedDecision: row.expectedDecision,
    reasons: validation.reasons,
    pass: parsed.ok === row.expectedRepaired && validation.decision === row.expectedDecision,
  };
}

const rows = cases.map(attemptSafeRepair);
const narrativeRows = rows.filter((row) => row.summaryMode === 'narrative_only');
const receiptRows = rows.filter((row) => row.summaryMode === 'handoff_plus_compact_receipt');
const unsafeNarrativeAllows = narrativeRows.filter((row) => row.decision === 'allow_local_shadow').length;
const receiptDecisionMatches = receiptRows.filter((row) => row.decision === row.expectedDecision).length;

const summary = {
  artifact: 'T-synaptic-mesh-summary-repair-from-lost-fields-v0',
  verdict: rows.every((row) => row.pass) && unsafeNarrativeAllows === 0 ? 'pass' : 'fail',
  totalCases: rows.length,
  narrativeOnlyCases: narrativeRows.length,
  receiptBackedCases: receiptRows.length,
  unsafeNarrativeAllows,
  receiptDecisionMatches,
  narrativeRepairPolicy: 'do not synthesize missing source/digest/freshness/boundary/action authority fields from prose; fetch-abstain or ask-human instead',
  interpretation: 'A receiver cannot safely reconstruct authority from narrative-only compression. Safe repair only means validating preserved compact receipts; missing authority fields remain a fetch-abstain boundary, and sensitive actions remain ask-human.',
};

const output = { summary, expectedSource, rows, boundary: fixture.boundary };
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
