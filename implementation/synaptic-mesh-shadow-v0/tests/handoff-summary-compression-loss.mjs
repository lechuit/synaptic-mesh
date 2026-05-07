import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCompactReceipt, REQUIRED_COMPACT_RECEIPT_FIELDS } from '../src/receipt-parser.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fixturePath = resolve(root, 'examples/synthetic-handoff-receipts.json');
const evidencePath = resolve(root, 'evidence/handoff-summary-compression-loss.out.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const authorityCriticalFields = [
  'SRC',
  'SRCPATH',
  'SRCDIGEST',
  'FRESH',
  'SCOPE',
  'PB',
  'NO',
  'ACT',
];

const valid = fixture.handoffs.find((handoff) => handoff.expectedDecision === 'allow_local_shadow');
const stale = fixture.handoffs.find((handoff) => handoff.id.includes('stale'));
const publish = fixture.handoffs.find((handoff) => handoff.actionVerb === 'publish');

const compressedSummaries = [
  {
    id: 'narrative-only-valid-local',
    mode: 'narrative_only',
    expectedRecoveredCritical: 0,
    text: `Agent A says the previous handoff was local-only, fresh, non-publishing, and safe to run as a local test. The source was the synthetic handoff examples note, but exact path, digest, and negative boundary text were summarized away.`,
  },
  {
    id: 'narrative-only-sensitive-publication',
    mode: 'narrative_only',
    expectedRecoveredCritical: 0,
    text: `Agent B says the local summary looks good and asks to publish it externally. It mentions a local-shadow boundary in prose, but does not preserve a machine-readable source digest, path, freshness marker, promotion boundary, or negative boundary.`,
  },
  {
    id: 'receipt-backed-valid-local',
    mode: 'handoff_plus_compact_receipt',
    expectedRecoveredCritical: authorityCriticalFields.length,
    text: `Compressed handoff: run the local fixture summary check only. Receipt: ${valid.receipt}`,
  },
  {
    id: 'receipt-backed-stale',
    mode: 'handoff_plus_compact_receipt',
    expectedRecoveredCritical: authorityCriticalFields.length,
    text: `Compressed handoff: older result may be useful but must not authorize action if stale. Receipt: ${stale.receipt}`,
  },
  {
    id: 'receipt-backed-sensitive-publication',
    mode: 'handoff_plus_compact_receipt',
    expectedRecoveredCritical: authorityCriticalFields.length,
    text: `Compressed handoff: request tries to publish externally. Receipt: ${publish.receipt}`,
  },
];

function fieldLoss(row) {
  const parsed = parseCompactReceipt(row.text);
  const recoveredCritical = authorityCriticalFields.filter((field) => parsed.fields[field] !== undefined);
  const missingCritical = authorityCriticalFields.filter((field) => parsed.fields[field] === undefined);
  const requiredRecovered = REQUIRED_COMPACT_RECEIPT_FIELDS.filter((field) => parsed.fields[field] !== undefined).length;
  return {
    id: row.id,
    mode: row.mode,
    ok: parsed.ok,
    recoveredCritical,
    missingCritical,
    recoveredCriticalCount: recoveredCritical.length,
    requiredRecovered,
    expectedRecoveredCritical: row.expectedRecoveredCritical,
    pass: recoveredCritical.length === row.expectedRecoveredCritical,
    errors: parsed.errors,
  };
}

const rows = compressedSummaries.map(fieldLoss);
const byMode = Object.fromEntries(
  ['narrative_only', 'handoff_plus_compact_receipt'].map((mode) => {
    const modeRows = rows.filter((row) => row.mode === mode);
    return [mode, {
      cases: modeRows.length,
      averageCriticalFieldsRecovered: Number((modeRows.reduce((sum, row) => sum + row.recoveredCriticalCount, 0) / modeRows.length).toFixed(2)),
      averageCriticalFieldsLost: Number((modeRows.reduce((sum, row) => sum + row.missingCritical.length, 0) / modeRows.length).toFixed(2)),
    }];
  }),
);

const summary = {
  artifact: 'T-synaptic-mesh-handoff-summary-compression-loss-v0',
  verdict: rows.every((row) => row.pass) ? 'pass' : 'fail',
  cases: rows.length,
  authorityCriticalFields,
  narrativeOnlyCriticalRecovered: byMode.narrative_only.averageCriticalFieldsRecovered,
  receiptBackedCriticalRecovered: byMode.handoff_plus_compact_receipt.averageCriticalFieldsRecovered,
  measuredDeltaFields: byMode.handoff_plus_compact_receipt.averageCriticalFieldsRecovered - byMode.narrative_only.averageCriticalFieldsRecovered,
  interpretation: 'Under this fixture, prose compression preserves intent cues but loses machine-checkable authority fields; compact receipts preserve source/digest/freshness/scope/boundary/action fields for fail-closed validation.',
};

const output = { summary, byMode, rows, boundary: fixture.boundary };
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass' || summary.measuredDeltaFields <= 0) process.exit(1);
