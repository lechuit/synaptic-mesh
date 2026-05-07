import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile, runNodeCommand, writeJsonEvidence } from '../src/adapters/review-local-io.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const radarRoot = resolve(packageRoot, '..', '..');
const evidencePath = resolve(packageRoot, 'evidence/review-local.out.json');

const commands = [
  {
    id: 'syntax-action-policy',
    args: ['--check', resolve(packageRoot, 'src/action-policy.mjs')],
  },
  {
    id: 'syntax-core-reference',
    args: ['--check', resolve(packageRoot, 'src/types.mjs')],
  },
  {
    id: 'syntax-action-policy-contracts',
    args: ['--check', resolve(packageRoot, 'tests/action-policy-contracts.mjs')],
  },
  {
    id: 'syntax-receipt-parser',
    args: ['--check', resolve(packageRoot, 'src/receipt-parser.mjs')],
  },
  {
    id: 'syntax-receipt-validator',
    args: ['--check', resolve(packageRoot, 'src/receipt-validator.mjs')],
  },
  {
    id: 'syntax-cli',
    args: ['--check', resolve(packageRoot, 'bin/validate-receipt.mjs')],
  },
  {
    id: 'action-policy-contract-tests',
    args: [resolve(packageRoot, 'tests/action-policy-contracts.mjs')],
  },
  {
    id: 'receipt-parser-validator-tests',
    args: [resolve(packageRoot, 'tests/receipt-parser-validator.mjs')],
  },
  {
    id: 'receipt-transform-regression-tests',
    args: [resolve(packageRoot, 'tests/receipt-transform-regression.mjs')],
  },
  {
    id: 'authority-laundering-regression-tests',
    args: [resolve(packageRoot, 'tests/authority-laundering-regression.mjs')],
  },
  {
    id: 'authority-claim-route-fixtures-tests',
    args: [resolve(packageRoot, 'tests/authority-claim-routes-fixtures.mjs')],
  },
  {
    id: 'route-decision-schema-tests',
    args: [resolve(packageRoot, 'tests/route-decision-schema.mjs')],
  },
  {
    id: 'threat-model-route-mapping-tests',
    args: [resolve(packageRoot, 'tests/threat-model-routes.mjs')],
  },
  {
    id: 'route-decision-wrong-routes-tests',
    args: [resolve(packageRoot, 'tests/route-decision-wrong-routes.mjs')],
  },
  {
    id: 'receiver-policy-adapter-contract-tests',
    args: [resolve(packageRoot, 'tests/receiver-policy-adapter-contracts.mjs')],
  },
  {
    id: 'cli-validator-tests',
    args: [resolve(packageRoot, 'tests/cli-validator.mjs')],
  },
  {
    id: 'synthetic-handoff-examples-tests',
    args: [resolve(packageRoot, 'tests/synthetic-handoff-examples.mjs')],
  },
  {
    id: 'partial-receipt-degrade-tests',
    args: [resolve(packageRoot, 'tests/partial-receipt-degrade.mjs')],
  },
  {
    id: 'authority-overhead-benchmark-tests',
    args: [resolve(packageRoot, 'tests/authority-overhead-benchmark.mjs')],
  },
  {
    id: 'adversarial-fixture-generator-tests',
    args: [resolve(packageRoot, 'tests/adversarial-fixture-generator.mjs')],
  },
  {
    id: 'raw-parser-adversarial-tests',
    args: [resolve(packageRoot, 'tests/raw-parser-adversarial.mjs')],
  },
  {
    id: 'parser-normalization-evidence-tests',
    args: [resolve(packageRoot, 'tests/parser-normalization-evidence.mjs')],
  },
  {
    id: 'real-flow-replay-tests',
    args: [resolve(packageRoot, 'tests/real-flow-replay.mjs')],
  },
  {
    id: 'route-classifier-shadow-tests',
    args: [resolve(packageRoot, 'tests/route-classifier-shadow.mjs')],
  },
  {
    id: 'real-flow-classifier-scorecard-tests',
    args: [resolve(packageRoot, 'tests/real-flow-classifier-scorecard.mjs')],
  },
  {
    id: 'fixture-parity-harness',
    args: [resolve(packageRoot, 'tests/fixture-parity.mjs')],
  },
  {
    id: 'normalized-summary-adapter',
    args: [resolve(packageRoot, 'tests/summary-normalizer.mjs')],
  },
];

const rows = commands.map((command) => runNodeCommand(command, { cwd: radarRoot, displayRoot: radarRoot }));

const readEvidenceJson = (relativePath) => readJsonFile(relativePath, { root: radarRoot });

const fixtureParity = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/fixture-parity.out.json');
const normalizedSummary = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/normalized-fixture-summary.out.json');
const transformRegression = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/receipt-transform-regression.out.json');
const cliValidator = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/cli-validator.out.json');
const authorityLaundering = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/authority-laundering-regression.out.json');
const authorityClaimRoutes = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/authority-claim-routes-fixtures.out.json');
const routeDecisionSchema = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/route-decision-schema.out.json');
const threatModelRoutes = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/threat-model-routes.out.json');
const routeDecisionWrongRoutes = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/route-decision-wrong-routes.out.json');
const receiverAdapterContracts = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/receiver-policy-adapter-contracts.out.json');
const actionPolicyContracts = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/action-policy-contracts.out.json');
const syntheticHandoff = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/synthetic-handoff-examples.out.json');
const partialDegrade = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/partial-receipt-degrade.out.json');
const authorityBenchmark = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/authority-overhead-benchmark.out.json');
const adversarialGenerator = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/adversarial-fixture-generator.out.json');
const rawParserAdversarial = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/raw-parser-adversarial.out.json');
const parserNormalizationEvidence = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/parser-normalization-evidence.out.json');
const realFlowReplay = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/real-flow-replay.out.json');
const routeClassifierShadow = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/route-classifier-shadow.out.json');
const realFlowClassifierScorecard = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/real-flow-classifier-scorecard.out.json');

const unsafeAllowSignals = [
  ...(fixtureParity?.summary?.nonRegressionUnsafeAllowFixtures ?? []),
  ...((normalizedSummary?.summary?.nonRegressionUnsafeAllowFixtures ?? [])),
];
if (Number(transformRegression?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('receipt-transform-regression');
if (Number(cliValidator?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('cli-validator');
if (Number(authorityLaundering?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('authority-laundering-regression');
if (Number(authorityClaimRoutes?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('authority-claim-routes-fixtures');
if (routeDecisionSchema?.summary?.verdict !== 'pass') unsafeAllowSignals.push('route-decision-schema');
if (threatModelRoutes?.summary?.verdict !== 'pass') unsafeAllowSignals.push('threat-model-routes');
if (routeDecisionWrongRoutes?.summary?.verdict !== 'pass') unsafeAllowSignals.push('route-decision-wrong-routes');
if (Number(receiverAdapterContracts?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('receiver-policy-adapter-contracts');
if (Number(actionPolicyContracts?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('action-policy-contracts');
if (Number(syntheticHandoff?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('synthetic-handoff-examples');
if (Number(partialDegrade?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('partial-receipt-degrade');
if (authorityBenchmark?.summary?.verdict !== 'pass') unsafeAllowSignals.push('authority-overhead-benchmark');
if (adversarialGenerator?.summary?.verdict !== 'pass') unsafeAllowSignals.push('adversarial-fixture-generator');
if (rawParserAdversarial?.summary?.verdict !== 'pass') unsafeAllowSignals.push('raw-parser-adversarial');
if (parserNormalizationEvidence?.summary?.verdict !== 'pass') unsafeAllowSignals.push('parser-normalization-evidence');
if (realFlowReplay?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-flow-replay');
if (Number(realFlowReplay?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-replay-false-permit');
if (routeClassifierShadow?.summary?.verdict !== 'pass') unsafeAllowSignals.push('route-classifier-shadow');
if (Number(routeClassifierShadow?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('route-classifier-shadow-false-permit');
if (realFlowClassifierScorecard?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-flow-classifier-scorecard');
if (Number(realFlowClassifierScorecard?.summary?.flowCount ?? 0) < 20 || Number(realFlowClassifierScorecard?.summary?.flowCount ?? 0) > 30) unsafeAllowSignals.push('real-flow-classifier-scorecard-flow-count');
if (Number(realFlowClassifierScorecard?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-classifier-scorecard-false-permit');
if (Number(realFlowClassifierScorecard?.summary?.falseCompactRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-classifier-scorecard-false-compact');

const summary = {
  artifact: 'T-synaptic-mesh-review-local-runner-v0',
  timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T15:05:00.000Z',
  verdict: rows.every((row) => row.pass) && unsafeAllowSignals.length === 0 ? 'pass' : 'fail',
  commands: rows.length,
  passCommands: rows.filter((row) => row.pass).length,
  failedCommands: rows.filter((row) => !row.pass).map((row) => row.id),
  fixtureCount: fixtureParity?.summary?.fixtureCount ?? null,
  fixtureParityVerdict: fixtureParity?.summary?.verdict ?? null,
  normalizedFixtureCount: normalizedSummary?.summary?.normalizedFixtureCount ?? null,
  transformRegressionVerdict: transformRegression?.summary?.verdict ?? null,
  cliValidatorVerdict: cliValidator?.summary?.verdict ?? null,
  authorityLaunderingVerdict: authorityLaundering?.summary?.verdict ?? null,
  authorityClaimRoutesVerdict: authorityClaimRoutes?.summary?.verdict ?? null,
  authorityClaimRouteCount: authorityClaimRoutes?.summary?.routeCount ?? null,
  authorityBoundaryCount: authorityClaimRoutes?.summary?.boundaryCount ?? null,
  routeDecisionSchemaVerdict: routeDecisionSchema?.summary?.verdict ?? null,
  routeDecisionSchemaValidCount: routeDecisionSchema?.summary?.validCount ?? null,
  threatModelRoutesVerdict: threatModelRoutes?.summary?.verdict ?? null,
  threatModelRouteMappingCount: threatModelRoutes?.summary?.mappingCount ?? null,
  threatModelKnownGapCount: threatModelRoutes?.summary?.knownGapCount ?? null,
  routeDecisionWrongRoutesVerdict: routeDecisionWrongRoutes?.summary?.verdict ?? null,
  routeDecisionWrongRouteFixtureCount: routeDecisionWrongRoutes?.summary?.wrongRouteFixtures ?? null,
  receiverAdapterContractsVerdict: receiverAdapterContracts?.summary?.verdict ?? null,
  actionPolicyContractsVerdict: actionPolicyContracts?.summary?.verdict ?? null,
  syntheticHandoffVerdict: syntheticHandoff?.summary?.verdict ?? null,
  partialReceiptDegradeVerdict: partialDegrade?.summary?.verdict ?? null,
  authorityOverheadBenchmarkVerdict: authorityBenchmark?.summary?.verdict ?? null,
  authorityOverheadBenchmarkCaseCount: authorityBenchmark?.summary?.caseCount ?? null,
  authorityOverheadBenchmarkModes: authorityBenchmark?.summary?.modes ?? null,
  adversarialFixtureGeneratorVerdict: adversarialGenerator?.summary?.verdict ?? null,
  adversarialGeneratedFixtureCount: adversarialGenerator?.summary?.generatedFixtures ?? null,
  rawParserAdversarialVerdict: rawParserAdversarial?.summary?.verdict ?? null,
  rawParserAdversarialFixtureCount: rawParserAdversarial?.summary?.fixtureCount ?? null,
  parserNormalizationEvidenceVerdict: parserNormalizationEvidence?.summary?.verdict ?? null,
  parserNormalizationEvidenceFixtureCount: parserNormalizationEvidence?.summary?.fixtureCount ?? null,
  parserNormalizationEvidenceHashBoundRate: parserNormalizationEvidence?.summary?.routeDecisionInputHashBoundRate ?? null,
  realFlowReplayVerdict: realFlowReplay?.summary?.verdict ?? null,
  realFlowReplayFlowCount: realFlowReplay?.summary?.flowCount ?? null,
  realFlowReplayFalsePermitRate: realFlowReplay?.summary?.falsePermitRate ?? null,
  realFlowReplayFalseCompactRate: realFlowReplay?.summary?.falseCompactRate ?? null,
  routeClassifierShadowVerdict: routeClassifierShadow?.summary?.verdict ?? null,
  routeClassifierShadowFixtureCount: routeClassifierShadow?.summary?.fixtureCount ?? null,
  routeClassifierShadowMismatchCount: routeClassifierShadow?.summary?.mismatchCount ?? null,
  routeClassifierShadowFalsePermitRate: routeClassifierShadow?.summary?.falsePermitRate ?? null,
  routeClassifierShadowFalseCompactRate: routeClassifierShadow?.summary?.falseCompactRate ?? null,
  realFlowClassifierScorecardVerdict: realFlowClassifierScorecard?.summary?.verdict ?? null,
  realFlowClassifierScorecardFlowCount: realFlowClassifierScorecard?.summary?.flowCount ?? null,
  realFlowClassifierScorecardMismatchCount: realFlowClassifierScorecard?.summary?.mismatchCount ?? null,
  realFlowClassifierScorecardFalsePermitRate: realFlowClassifierScorecard?.summary?.falsePermitRate ?? null,
  realFlowClassifierScorecardFalseCompactRate: realFlowClassifierScorecard?.summary?.falseCompactRate ?? null,
  realFlowClassifierScorecardObservedDecisionIsClassifierOutput: realFlowClassifierScorecard?.summary?.observedDecisionIsClassifierOutput ?? null,
  unsafeAllowSignals,
  sourceFixtureMutation: false,
};

const output = {
  summary,
  rows,
  boundary: [
    'local_review_only',
    'not_runtime_integration',
    'not_config',
    'not_publication',
    'not_enforcement',
    'no_external_effects',
  ],
};

writeJsonEvidence(evidencePath, output);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
