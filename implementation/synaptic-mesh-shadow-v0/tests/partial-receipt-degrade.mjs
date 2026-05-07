import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const evidencePath = resolve(root, 'evidence/partial-receipt-degrade.out.json');

const artifact = 'T-synaptic-mesh-partial-receipt-degrade-gracefully-v0';
const expectedSource = {
  sourceArtifactId: artifact,
  sourceArtifactPath: 'research-package/T-synaptic-mesh-partial-receipt-degrade-gracefully-v0.md',
  sourceDigest: 'sha256:partial-receipt-degrade-v0',
};

const completeReceipt = [
  `SRC=${expectedSource.sourceArtifactId}`,
  `SRCPATH=${expectedSource.sourceArtifactPath}`,
  `SRCDIGEST=${expectedSource.sourceDigest}`,
  'PROD=2026-05-06T20:08:00Z',
  'FRESH=current',
  'SCOPE=local_shadow',
  'PB=no_runtime_no_config_no_memory_no_external_no_delete_no_publish_l0_l1_only',
  'NO=external_runtime_config_delete_publish_l2_operational_canary_production_memory',
  'LRE=lineage:partial-receipt-degrade-v0',
  'TOK=low',
  'ACT=run_local_test',
].join('; ');

const lowRiskAction = { verb: 'run_local_test', target: 'implementation/synaptic-mesh-shadow-v0/tests/partial-receipt-degrade.mjs', riskTier: 'low_local' };

const cases = [
  {
    id: 'complete-valid-local-control',
    receipt: completeReceipt,
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'valid_control',
  },
  {
    id: 'source-id-without-digest',
    receipt: completeReceipt.replace(`; SRCDIGEST=${expectedSource.sourceDigest}`, ''),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'missing_mandatory_field',
    expectedReason: /SRCDIGEST|source digest mismatch/,
  },
  {
    id: 'digest-without-source-path',
    receipt: completeReceipt.replace(`; SRCPATH=${expectedSource.sourceArtifactPath}`, ''),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'missing_mandatory_field',
    expectedReason: /SRCPATH|source path mismatch/,
  },
  {
    id: 'freshness-without-negative-boundary',
    receipt: completeReceipt.replace('; NO=external_runtime_config_delete_publish_l2_operational_canary_production_memory', ''),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'missing_boundary',
    expectedReason: /NO|negative boundary/,
  },
  {
    id: 'action-without-scope',
    receipt: completeReceipt.replace('; SCOPE=local_shadow', ''),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'missing_mandatory_field',
    expectedReason: /SCOPE/,
  },
  {
    id: 'mixed-stale-fresh-current-token',
    receipt: completeReceipt.replace('FRESH=current', 'FRESH=stale').replace('TOK=low', 'TOK=current_token_budget_claim'),
    expectedDecision: 'fetch_abstain',
    expectationClass: 'conflicting_freshness',
    expectedReason: /freshness is not current/,
  },
  {
    id: 'stale-production-current-freshness-still-allowed-shadow',
    receipt: completeReceipt.replace('PROD=2026-05-06T20:08:00Z', 'PROD=2026-05-01T00:00:00Z'),
    expectedDecision: 'allow_local_shadow',
    expectationClass: 'known_gap_production_time_not_enforced',
    note: 'Current validator treats FRESH as receiver freshness and does not enforce wall-clock age on PROD. This is acceptable for this shadow test but should be hardened before operational use.',
  },
  {
    id: 'sensitive-action-with-complete-receipt',
    receipt: completeReceipt.replace('ACT=run_local_test', 'ACT=publish'),
    proposedAction: { verb: 'publish', target: 'external', riskTier: 'sensitive' },
    expectedDecision: 'ask_human',
    expectationClass: 'sensitive_action_overrides_receipt',
    expectedReason: /action requires human/,
  },
  {
    id: 'partial-receipt-plus-confidence-metadata',
    receipt: `${completeReceipt.replace(`; SRCDIGEST=${expectedSource.sourceDigest}`, '')}; CONF=1.0; PROSE=sender_says_digest_known`,
    expectedDecision: 'fetch_abstain',
    expectationClass: 'metadata_non_authority',
    expectedReason: /SRCDIGEST|source digest mismatch/,
  },
];

const rows = cases.map((testCase) => {
  const result = validateCompactReceiptForAction(testCase.receipt, {
    expectedSource,
    proposedAction: testCase.proposedAction ?? lowRiskAction,
  });
  const reasonText = result.reasons.join('\n');
  const reasonMatches = testCase.expectedReason ? testCase.expectedReason.test(reasonText) : true;
  const pass = result.decision === testCase.expectedDecision && reasonMatches;
  return {
    id: testCase.id,
    expectationClass: testCase.expectationClass,
    decision: result.decision,
    expectedDecision: testCase.expectedDecision,
    pass,
    reasons: result.reasons,
    missingAuthorityFields: Object.entries(result.fieldAliases)
      .filter(([compactKey, authorityKey]) => result.authority[authorityKey] === undefined)
      .map(([compactKey]) => compactKey),
    metadataKeys: Object.keys(result.metadata ?? {}),
    unsafeAllow: result.decision === 'allow_local_shadow' && testCase.expectedDecision !== 'allow_local_shadow',
    falseBlockValidLocal: testCase.expectedDecision === 'allow_local_shadow' && result.decision !== 'allow_local_shadow',
    note: testCase.note,
  };
});

const mandatoryFieldCases = rows.filter((row) => row.expectedDecision === 'fetch_abstain');
const summary = {
  artifact,
  timestamp: '2026-05-06T20:08:00Z',
  verdict: rows.every((row) => row.pass) && rows.every((row) => !row.unsafeAllow) ? 'pass' : 'fail',
  totalCases: rows.length,
  passCases: rows.filter((row) => row.pass).length,
  allowLocalShadow: rows.filter((row) => row.decision === 'allow_local_shadow').length,
  fetchAbstain: rows.filter((row) => row.decision === 'fetch_abstain').length,
  askHuman: rows.filter((row) => row.decision === 'ask_human').length,
  unsafeAllows: rows.filter((row) => row.unsafeAllow).length,
  falseBlocksForValidLocal: rows.filter((row) => row.falseBlockValidLocal).length,
  missingMandatoryFieldsFetchAbstain: mandatoryFieldCases.every((row) => row.decision === 'fetch_abstain'),
  metadataNonAuthority: rows.find((row) => row.id === 'partial-receipt-plus-confidence-metadata')?.metadataKeys.includes('CONF') === true,
  knownGaps: [
    'PROD is parsed but not wall-clock validated; validator relies on FRESH=current/stale as receiver freshness in this shadow harness.',
  ],
  interpretation: 'Partial compact receipts degrade safely for missing source/digest/path/scope/boundary and mixed stale/current claims: they fetch-abstain instead of allowing local action. Unknown confidence/prose metadata remains non-authority. Sensitive actions still ask human.',
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
