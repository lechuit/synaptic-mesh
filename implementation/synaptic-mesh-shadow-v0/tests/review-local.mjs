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
    id: 'decision-trace-schema-tests',
    args: [resolve(packageRoot, 'tests/decision-trace-schema.mjs')],
  },
  {
    id: 'real-flow-mutation-suite-tests',
    args: [resolve(packageRoot, 'tests/real-flow-mutation-suite.mjs')],
  },
  {
    id: 'category-coverage-thresholds-tests',
    args: [resolve(packageRoot, 'tests/category-coverage-thresholds.mjs')],
  },
  {
    id: 'redaction-review-record-schema-tests',
    args: [resolve(packageRoot, 'tests/redaction-review-record-schema.mjs')],
  },
  {
    id: 'real-redacted-handoff-pack-tests',
    args: [resolve(packageRoot, 'tests/real-redacted-handoff-pack.mjs')],
  },
  {
    id: 'real-redacted-handoff-replay-gate-tests',
    args: [resolve(packageRoot, 'tests/real-redacted-handoff-replay-gate.mjs')],
  },
  {
    id: 'real-redacted-adversarial-coverage-tests',
    args: [resolve(packageRoot, 'tests/real-redacted-adversarial-coverage.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-source-boundary-stress-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-source-boundary-stress.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-source-boundary-expansion-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-source-boundary-expansion.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-drift-scorecard-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-drift-scorecard.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-expanded-pack-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-expanded-pack.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-advisory-report-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-advisory-report.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-advisory-unicode-bidi-guard-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-advisory-unicode-bidi-guard.mjs')],
  },
  {
    id: 'passive-live-shadow-canary-advisory-report-failure-catalog-tests',
    args: [resolve(packageRoot, 'tests/passive-live-shadow-canary-advisory-report-failure-catalog.mjs')],
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
const decisionTraceSchema = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/decision-trace-schema.out.json');
const realFlowMutationSuite = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/real-flow-mutation-suite.out.json');
const categoryCoverageThresholds = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/category-coverage-thresholds.out.json');
const redactionReviewRecordSchema = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/redaction-review-record-schema.out.json');
const realRedactedHandoffPack = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/real-redacted-handoff-pack.out.json');
const realRedactedHandoffReplayGate = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/real-redacted-handoff-replay-gate.out.json');
const realRedactedAdversarialCoverage = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/real-redacted-adversarial-coverage.out.json');
const passiveCanarySourceBoundaryStress = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-stress.out.json');
const passiveCanarySourceBoundaryExpansion = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-expansion.out.json');
const passiveCanaryDriftScorecard = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-drift-scorecard.out.json');
const passiveCanaryExpandedPack = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-expanded-pack.out.json');
const passiveCanaryAdvisoryReport = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.json');
const passiveCanaryAdvisoryUnicodeBidiGuard = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json');
const passiveCanaryAdvisoryReportFailureCatalog = readEvidenceJson('implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json');

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
if (routeClassifierShadow?.summary?.verdict !== 'pass') unsafeAllowSignals.push('route-classifier-shadow');
if (Number(routeClassifierShadow?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('route-classifier-shadow-false-permit');
if (realFlowClassifierScorecard?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-flow-classifier-scorecard');
if (Number(realFlowClassifierScorecard?.summary?.flowCount ?? 0) < 20 || Number(realFlowClassifierScorecard?.summary?.flowCount ?? 0) > 30) unsafeAllowSignals.push('real-flow-classifier-scorecard-flow-count');
if (Number(realFlowClassifierScorecard?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-classifier-scorecard-false-permit');
if (Number(realFlowClassifierScorecard?.summary?.falseCompactRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-classifier-scorecard-false-compact');
if (realFlowClassifierScorecard?.summary?.scorecardCompares !== 'classifierDecision_vs_goldDecision') unsafeAllowSignals.push('real-flow-classifier-scorecard-wrong-comparison');
if (realFlowClassifierScorecard?.summary?.scorecardConsumesObservedDecision !== false) unsafeAllowSignals.push('real-flow-classifier-scorecard-observed-decision-consumption');
if (decisionTraceSchema?.summary?.verdict !== 'pass') unsafeAllowSignals.push('decision-trace-schema');
if (Number(decisionTraceSchema?.summary?.traceCount ?? 0) < 20 || Number(decisionTraceSchema?.summary?.traceCount ?? 0) > 30) unsafeAllowSignals.push('decision-trace-count');
if (Number(decisionTraceSchema?.summary?.mismatchCount ?? 0) !== 0) unsafeAllowSignals.push('decision-trace-mismatch');
if (Number(decisionTraceSchema?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('decision-trace-false-permit');
if (Number(decisionTraceSchema?.summary?.falseCompactRate ?? 0) !== 0) unsafeAllowSignals.push('decision-trace-false-compact');
if (realFlowMutationSuite?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-flow-mutation-suite');
if (Number(realFlowMutationSuite?.summary?.mutationCount ?? 0) < 15) unsafeAllowSignals.push('real-flow-mutation-count');
if (Number(realFlowMutationSuite?.summary?.mismatchCount ?? 0) !== 0) unsafeAllowSignals.push('real-flow-mutation-mismatch');
if (Number(realFlowMutationSuite?.summary?.duplicateMutationIdCount ?? 0) !== 0) unsafeAllowSignals.push('real-flow-mutation-duplicate-id');
if (Number(realFlowMutationSuite?.summary?.nonDegradedCount ?? 0) !== 0) unsafeAllowSignals.push('real-flow-mutation-non-degraded');
if (Number(realFlowMutationSuite?.summary?.falsePermitRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-mutation-false-permit');
if (Number(realFlowMutationSuite?.summary?.falseCompactRate ?? 0) !== 0) unsafeAllowSignals.push('real-flow-mutation-false-compact');
if (categoryCoverageThresholds?.summary?.verdict !== 'pass') unsafeAllowSignals.push('category-coverage-thresholds');
if (Number(categoryCoverageThresholds?.summary?.thresholdFailures ?? 1) !== 0) unsafeAllowSignals.push('category-coverage-threshold-failures');
if (redactionReviewRecordSchema?.summary?.verdict !== 'pass') unsafeAllowSignals.push('redaction-review-record-schema');
if (Number(redactionReviewRecordSchema?.summary?.validationErrorCount ?? 1) !== 0) unsafeAllowSignals.push('redaction-review-record-validation-errors');
if (redactionReviewRecordSchema?.summary?.rawContentPersisted !== false) unsafeAllowSignals.push('redaction-review-record-raw-content');
if (redactionReviewRecordSchema?.summary?.privatePathsPersisted !== false) unsafeAllowSignals.push('redaction-review-record-private-paths');
if (redactionReviewRecordSchema?.summary?.secretLikeValuesPersisted !== false) unsafeAllowSignals.push('redaction-review-record-secrets');
if (redactionReviewRecordSchema?.summary?.toolOutputsPersisted !== false) unsafeAllowSignals.push('redaction-review-record-tool-outputs');
if (redactionReviewRecordSchema?.summary?.memoryTextPersisted !== false) unsafeAllowSignals.push('redaction-review-record-memory-text');
if (redactionReviewRecordSchema?.summary?.configTextPersisted !== false) unsafeAllowSignals.push('redaction-review-record-config-text');
if (redactionReviewRecordSchema?.summary?.approvalTextPersisted !== false) unsafeAllowSignals.push('redaction-review-record-approval-text');
if (redactionReviewRecordSchema?.summary?.forbiddenForLiveObservation !== true) unsafeAllowSignals.push('redaction-review-record-live-observation-not-forbidden');
if (redactionReviewRecordSchema?.summary?.forbiddenForRuntimeUse !== true) unsafeAllowSignals.push('redaction-review-record-runtime-not-forbidden');
if (realRedactedHandoffPack?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-redacted-handoff-pack');
if (Number(realRedactedHandoffPack?.summary?.realRedactedBundles ?? 0) !== 3) unsafeAllowSignals.push('real-redacted-handoff-pack-count');
if (Number(realRedactedHandoffPack?.summary?.validationErrorCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-pack-validation-errors');
if (realRedactedHandoffPack?.summary?.rawContentPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-raw-content');
if (realRedactedHandoffPack?.summary?.privatePathsPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-private-paths');
if (realRedactedHandoffPack?.summary?.secretLikeValuesPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-secrets');
if (realRedactedHandoffPack?.summary?.toolOutputsPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-tool-outputs');
if (realRedactedHandoffPack?.summary?.memoryTextPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-memory-text');
if (realRedactedHandoffPack?.summary?.configTextPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-config-text');
if (realRedactedHandoffPack?.summary?.approvalTextPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-pack-approval-text');
if (Number(realRedactedHandoffPack?.summary?.forbiddenEffects ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-pack-forbidden-effects');
if (Number(realRedactedHandoffPack?.summary?.mayBlock ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-pack-may-block');
if (Number(realRedactedHandoffPack?.summary?.mayAllow ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-pack-may-allow');
if (Number(realRedactedHandoffPack?.summary?.capabilityAttempts ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-pack-capability-attempts');
if (Number(realRedactedHandoffPack?.summary?.mismatch ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-pack-mismatch');
if (realRedactedHandoffReplayGate?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-redacted-handoff-replay-gate');
if (Number(realRedactedHandoffReplayGate?.summary?.realRedactedBundles ?? 0) !== 3) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-count');
if (Number(realRedactedHandoffReplayGate?.summary?.redactionReviewRecords ?? 0) !== 3) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-review-count');
if (realRedactedHandoffReplayGate?.summary?.parserEvidence !== 'pass') unsafeAllowSignals.push('real-redacted-handoff-replay-gate-parser-evidence');
if (realRedactedHandoffReplayGate?.summary?.classifierDecision !== 'pass') unsafeAllowSignals.push('real-redacted-handoff-replay-gate-classifier');
if (realRedactedHandoffReplayGate?.summary?.decisionTrace !== 'pass') unsafeAllowSignals.push('real-redacted-handoff-replay-gate-decision-trace');
if (realRedactedHandoffReplayGate?.summary?.liveShadowObservationResult !== 'record_only') unsafeAllowSignals.push('real-redacted-handoff-replay-gate-result-not-record-only');
if (Number(realRedactedHandoffReplayGate?.summary?.validationErrorCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-validation-errors');
if (Number(realRedactedHandoffReplayGate?.summary?.mismatchCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-mismatch');
if (Number(realRedactedHandoffReplayGate?.summary?.falsePermitCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-false-permit');
if (Number(realRedactedHandoffReplayGate?.summary?.falseCompactCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-false-compact');
if (Number(realRedactedHandoffReplayGate?.summary?.boundaryLossCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-boundary-loss');
if (Number(realRedactedHandoffReplayGate?.summary?.forbiddenEffectsDetectedCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-forbidden-effects');
if (Number(realRedactedHandoffReplayGate?.summary?.mayBlockCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-may-block');
if (Number(realRedactedHandoffReplayGate?.summary?.mayAllowCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-may-allow');
if (Number(realRedactedHandoffReplayGate?.summary?.capabilityTrueCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-capability-true');
if (realRedactedHandoffReplayGate?.summary?.rawContentPersisted !== false) unsafeAllowSignals.push('real-redacted-handoff-replay-gate-raw-content');
if (realRedactedAdversarialCoverage?.summary?.verdict !== 'pass') unsafeAllowSignals.push('real-redacted-adversarial-coverage');
if (Number(realRedactedAdversarialCoverage?.summary?.adversarialRealRedactedCases ?? 0) !== 6) unsafeAllowSignals.push('real-redacted-adversarial-coverage-count');
if (Number(realRedactedAdversarialCoverage?.summary?.validationErrorCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-validation-errors');
if (Number(realRedactedAdversarialCoverage?.summary?.falsePermitCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-false-permit');
if (Number(realRedactedAdversarialCoverage?.summary?.falseCompactCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-false-compact');
if (Number(realRedactedAdversarialCoverage?.summary?.boundaryLossCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-boundary-loss');
if (Number(realRedactedAdversarialCoverage?.summary?.forbiddenEffectsDetectedCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-forbidden-effects');
if (Number(realRedactedAdversarialCoverage?.summary?.mayBlockCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-may-block');
if (Number(realRedactedAdversarialCoverage?.summary?.mayAllowCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-may-allow');
if (Number(realRedactedAdversarialCoverage?.summary?.capabilityTrueCount ?? 1) !== 0) unsafeAllowSignals.push('real-redacted-adversarial-coverage-capability-true');
if (realRedactedAdversarialCoverage?.summary?.rawContentPersisted !== false) unsafeAllowSignals.push('real-redacted-adversarial-coverage-raw-content');
if (passiveCanarySourceBoundaryStress?.summary?.verdict !== 'pass') unsafeAllowSignals.push('passive-canary-source-boundary-stress');
if (Number(passiveCanarySourceBoundaryStress?.summary?.unexpectedAccepts ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-source-boundary-stress-unexpected-accepts');
if (Number(passiveCanarySourceBoundaryStress?.summary?.unexpectedRejects ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-source-boundary-stress-unexpected-rejects');
if (Number(passiveCanarySourceBoundaryStress?.summary?.staleDigestRejects ?? 0) < 1) unsafeAllowSignals.push('passive-canary-source-boundary-stress-missing-stale-digest');
if (Number(passiveCanarySourceBoundaryStress?.summary?.missingMtimeRejects ?? 0) < 1) unsafeAllowSignals.push('passive-canary-source-boundary-stress-missing-mtime');
if (Number(passiveCanarySourceBoundaryStress?.summary?.wrongLaneRejects ?? 0) < 1) unsafeAllowSignals.push('passive-canary-source-boundary-stress-missing-wrong-lane');
if (Number(passiveCanarySourceBoundaryStress?.summary?.outputContainmentRejects ?? 0) < 1) unsafeAllowSignals.push('passive-canary-source-boundary-stress-missing-output-containment');
if (Number(passiveCanarySourceBoundaryStress?.summary?.passCapabilityTrueCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-source-boundary-stress-capability-true');
if (passiveCanarySourceBoundaryStress?.summary?.recordOnly !== true) unsafeAllowSignals.push('passive-canary-source-boundary-stress-not-record-only');
if (passiveCanarySourceBoundaryStress?.summary?.noEffects !== true) unsafeAllowSignals.push('passive-canary-source-boundary-stress-effects');
if (passiveCanarySourceBoundaryStress?.summary?.runtimeIntegrated !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-runtime');
if (passiveCanarySourceBoundaryStress?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-tools');
if (passiveCanarySourceBoundaryStress?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-memory');
if (passiveCanarySourceBoundaryStress?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-config');
if (passiveCanarySourceBoundaryStress?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-publication');
if (passiveCanarySourceBoundaryStress?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-approval');
if (passiveCanarySourceBoundaryStress?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-blocking');
if (passiveCanarySourceBoundaryStress?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-allowing');
if (passiveCanarySourceBoundaryStress?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-authorization');
if (passiveCanarySourceBoundaryStress?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-enforcement');
if (passiveCanarySourceBoundaryStress?.summary?.automaticAgentConsumptionImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-stress-automatic-agent-consumption');
if (passiveCanaryDriftScorecard?.summary?.verdict !== 'pass') unsafeAllowSignals.push('passive-canary-drift-scorecard');
if (Number(passiveCanaryDriftScorecard?.summary?.routeDriftCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-route-drift');
if (Number(passiveCanaryDriftScorecard?.summary?.reasonCodeDriftCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-reason-code-drift');
if (Number(passiveCanaryDriftScorecard?.summary?.boundaryVerdictDriftCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-boundary-verdict-drift');
if (Number(passiveCanaryDriftScorecard?.summary?.scorecardDriftCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-scorecard-drift');
if (Number(passiveCanaryDriftScorecard?.summary?.traceHashDriftCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-trace-hash-drift');
if (Number(passiveCanaryDriftScorecard?.summary?.normalizedOutputMismatchCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-normalized-output-mismatch');
if (Number(passiveCanaryDriftScorecard?.summary?.mayBlockCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-may-block');
if (Number(passiveCanaryDriftScorecard?.summary?.mayAllowCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-may-allow');
if (Number(passiveCanaryDriftScorecard?.summary?.capabilityTrueCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-capability-true');
if (Number(passiveCanaryDriftScorecard?.summary?.forbiddenEffects ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-drift-scorecard-forbidden-effects');
if (passiveCanaryDriftScorecard?.summary?.scorecardAuthority !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-authority');
if (passiveCanaryDriftScorecard?.summary?.consumedByAgent !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-agent-consumption');
if (passiveCanaryDriftScorecard?.summary?.automaticAgentConsumptionImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-automatic-agent-consumption');
if (passiveCanaryDriftScorecard?.summary?.runtimeIntegrated !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-runtime');
if (passiveCanaryDriftScorecard?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-tools');
if (passiveCanaryDriftScorecard?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-memory');
if (passiveCanaryDriftScorecard?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-config');
if (passiveCanaryDriftScorecard?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-publication');
if (passiveCanaryDriftScorecard?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-approval');
if (passiveCanaryDriftScorecard?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-blocking');
if (passiveCanaryDriftScorecard?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-allowing');
if (passiveCanaryDriftScorecard?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-authorization');
if (passiveCanaryDriftScorecard?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-drift-scorecard-enforcement');
if (passiveCanaryExpandedPack?.summary?.verdict !== 'pass') unsafeAllowSignals.push('passive-canary-expanded-pack');
if (Number(passiveCanaryExpandedPack?.summary?.totalCases ?? 0) < 10) unsafeAllowSignals.push('passive-canary-expanded-pack-too-small');
if (Number(passiveCanaryExpandedPack?.summary?.totalCases ?? 99) > 20) unsafeAllowSignals.push('passive-canary-expanded-pack-too-large');
if (Number(passiveCanaryExpandedPack?.summary?.coveredTargetCoverageCount ?? 0) !== 13) unsafeAllowSignals.push('passive-canary-expanded-pack-coverage');
if (Number(passiveCanaryExpandedPack?.summary?.unexpectedAccepts ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-expanded-pack-unexpected-accepts');
if (Number(passiveCanaryExpandedPack?.summary?.unexpectedRejects ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-expanded-pack-unexpected-rejects');
if (Number(passiveCanaryExpandedPack?.summary?.acceptedForbiddenEffectsDetectedCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-expanded-pack-accepted-forbidden-effects');
if (Number(passiveCanaryExpandedPack?.summary?.passCapabilityTrueCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-expanded-pack-pass-capability-true');
if (passiveCanaryExpandedPack?.summary?.manual !== true) unsafeAllowSignals.push('passive-canary-expanded-pack-not-manual');
if (passiveCanaryExpandedPack?.summary?.local !== true) unsafeAllowSignals.push('passive-canary-expanded-pack-not-local');
if (passiveCanaryExpandedPack?.summary?.optInRequired !== true) unsafeAllowSignals.push('passive-canary-expanded-pack-not-opt-in');
if (passiveCanaryExpandedPack?.summary?.alreadyRedactedOnly !== true) unsafeAllowSignals.push('passive-canary-expanded-pack-not-redacted');
if (passiveCanaryExpandedPack?.summary?.recordOnly !== true) unsafeAllowSignals.push('passive-canary-expanded-pack-not-record-only');
if (passiveCanaryExpandedPack?.summary?.noEffects !== true) unsafeAllowSignals.push('passive-canary-expanded-pack-effects');
if (passiveCanaryExpandedPack?.summary?.scorecardAuthority !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-authority');
if (passiveCanaryExpandedPack?.summary?.consumedByAgent !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-agent-consumption');
if (passiveCanaryExpandedPack?.summary?.automaticAgentConsumptionImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-automatic-agent-consumption');
if (passiveCanaryExpandedPack?.summary?.runtimeIntegrated !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-runtime');
if (passiveCanaryExpandedPack?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-tools');
if (passiveCanaryExpandedPack?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-memory');
if (passiveCanaryExpandedPack?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-config');
if (passiveCanaryExpandedPack?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-publication');
if (passiveCanaryExpandedPack?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-approval');
if (passiveCanaryExpandedPack?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-blocking');
if (passiveCanaryExpandedPack?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-allowing');
if (passiveCanaryExpandedPack?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-authorization');
if (passiveCanaryExpandedPack?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-expanded-pack-enforcement');
if (passiveCanarySourceBoundaryExpansion?.summary?.verdict !== 'pass') unsafeAllowSignals.push('passive-canary-source-boundary-expansion');
if (Number(passiveCanarySourceBoundaryExpansion?.summary?.coveredTargetCoverageCount ?? 0) !== 11) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-coverage');
if (Number(passiveCanarySourceBoundaryExpansion?.summary?.unexpectedAccepts ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-unexpected-accepts');
if (Number(passiveCanarySourceBoundaryExpansion?.summary?.unexpectedRejects ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-unexpected-rejects');
if (Number(passiveCanarySourceBoundaryExpansion?.summary?.passCapabilityTrueCount ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-pass-capability-true');
for (const [field, label] of [
  ['digestBindingMismatchRejects', 'digest binding mismatch'],
  ['futureMtimeRejects', 'future mtime'],
  ['invalidMtimeRejects', 'invalid mtime'],
  ['sourcePathTraversalRejects', 'source traversal'],
  ['sourceSymlinkRejects', 'source symlink'],
  ['sourceUnicodeControlRejects', 'source unicode control'],
  ['sourceLaneAliasRejects', 'source lane alias'],
  ['duplicateSourceArtifactIdRejects', 'duplicate source artifact id'],
  ['wrongLaneRejects', 'wrong lane'],
  ['outputSymlinkRejects', 'output symlink'],
  ['outputContainmentRejects', 'output containment'],
]) {
  if (Number(passiveCanarySourceBoundaryExpansion?.summary?.[field] ?? 0) < 1) unsafeAllowSignals.push(`passive-canary-source-boundary-expansion-missing-${label}`);
}
if (passiveCanarySourceBoundaryExpansion?.summary?.manual !== true) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-not-manual');
if (passiveCanarySourceBoundaryExpansion?.summary?.local !== true) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-not-local');
if (passiveCanarySourceBoundaryExpansion?.summary?.optInRequired !== true) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-not-opt-in');
if (passiveCanarySourceBoundaryExpansion?.summary?.alreadyRedactedOnly !== true) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-not-redacted');
if (passiveCanarySourceBoundaryExpansion?.summary?.recordOnly !== true) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-not-record-only');
if (passiveCanarySourceBoundaryExpansion?.summary?.noEffects !== true) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-effects');
if (passiveCanarySourceBoundaryExpansion?.summary?.readsLiveTraffic !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-live-traffic');
if (passiveCanarySourceBoundaryExpansion?.summary?.followsSourceSymlinkForAuthority !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-source-symlink-follow');
if (passiveCanarySourceBoundaryExpansion?.summary?.followsOutputSymlinkForAuthority !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-output-symlink-follow');
if (passiveCanarySourceBoundaryExpansion?.summary?.automaticAgentConsumptionImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-automatic-agent-consumption');
if (passiveCanarySourceBoundaryExpansion?.summary?.runtimeIntegrated !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-runtime');
if (passiveCanarySourceBoundaryExpansion?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-tools');
if (passiveCanarySourceBoundaryExpansion?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-memory');
if (passiveCanarySourceBoundaryExpansion?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-config');
if (passiveCanarySourceBoundaryExpansion?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-publication');
if (passiveCanarySourceBoundaryExpansion?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-approval');
if (passiveCanarySourceBoundaryExpansion?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-blocking');
if (passiveCanarySourceBoundaryExpansion?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-allowing');
if (passiveCanarySourceBoundaryExpansion?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-authorization');
if (passiveCanarySourceBoundaryExpansion?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-source-boundary-expansion-enforcement');
if (passiveCanaryAdvisoryReport?.summary?.verdict !== 'pass') unsafeAllowSignals.push('passive-canary-advisory-report');
if (passiveCanaryAdvisoryReport?.summary?.advisoryOnly !== true) unsafeAllowSignals.push('passive-canary-advisory-report-not-advisory');
if (passiveCanaryAdvisoryReport?.summary?.humanReadableOnly !== true) unsafeAllowSignals.push('passive-canary-advisory-report-not-human-readable-only');
if (passiveCanaryAdvisoryReport?.summary?.nonAuthoritative !== true) unsafeAllowSignals.push('passive-canary-advisory-report-authority');
if (passiveCanaryAdvisoryReport?.summary?.machineReadablePolicyDecision !== false) unsafeAllowSignals.push('passive-canary-advisory-report-policy-decision');
if (passiveCanaryAdvisoryReport?.summary?.consumedByAgent !== false) unsafeAllowSignals.push('passive-canary-advisory-report-agent-consumption');
if (passiveCanaryAdvisoryReport?.summary?.automaticAgentConsumptionImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-automatic-agent-consumption');
if (passiveCanaryAdvisoryReport?.summary?.runtimeIntegrated !== false) unsafeAllowSignals.push('passive-canary-advisory-report-runtime');
if (passiveCanaryAdvisoryReport?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-tools');
if (passiveCanaryAdvisoryReport?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-memory');
if (passiveCanaryAdvisoryReport?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-config');
if (passiveCanaryAdvisoryReport?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-publication');
if (passiveCanaryAdvisoryReport?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-approval');
if (passiveCanaryAdvisoryReport?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-blocking');
if (passiveCanaryAdvisoryReport?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-allowing');
if (passiveCanaryAdvisoryReport?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-authorization');
if (passiveCanaryAdvisoryReport?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-enforcement');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.verdict !== 'pass') unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-guard');
if (Number(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.textFindings ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-text-findings');
if (Number(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.machineReadableFindings ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-machine-readable-findings');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.reasonCodeAsciiTokenRequired !== true) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-reason-code-guard');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.sourcePathAsciiRequired !== true) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-source-path-ascii');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.sourcePathConfusableGuard !== true) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-confusable-guard');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.hiddenBidiControlsForbidden !== true) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-hidden-controls');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.advisoryOnly !== true) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-not-advisory');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.nonAuthoritative !== true) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-authority');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.automaticAgentConsumptionImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-agent-consumption');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.runtimeIntegrated !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-runtime');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-tools');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-memory');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-config');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-publication');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-approval');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-blocking');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-allowing');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-authorization');
if (passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-unicode-bidi-enforcement');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.advisoryReportFailureCatalog !== 'pass') unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog');
if (Number(passiveCanaryAdvisoryReportFailureCatalog?.summary?.unexpectedAccepts ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-unexpected-accepts');
if (Number(passiveCanaryAdvisoryReportFailureCatalog?.summary?.expectedReasonCodeMisses ?? 1) !== 0) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-reason-misses');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.machineReadablePolicyDecision !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-machine-policy');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.consumedByAgent !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-agent-consumption');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.authoritative !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-authority');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayBlock !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-may-block');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayAllow !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-may-allow');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.toolExecutionImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-tools');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.memoryWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-memory');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.configWriteImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-config');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.externalPublicationImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-publication');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.approvalPathImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-approval');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.blockingImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-blocking');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.allowingImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-allowing');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.authorizationImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-authorization');
if (passiveCanaryAdvisoryReportFailureCatalog?.summary?.enforcementImplemented !== false) unsafeAllowSignals.push('passive-canary-advisory-report-failure-catalog-enforcement');

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
  realFlowReplayObservedDecisionDeprecated: realFlowReplay?.summary?.observedDecisionDeprecated ?? null,
  realFlowReplayScorecardsConsumeObservedDecision: realFlowReplay?.summary?.scorecardsConsumeObservedDecision ?? null,
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
  realFlowClassifierScorecardCompares: realFlowClassifierScorecard?.summary?.scorecardCompares ?? null,
  realFlowClassifierScorecardConsumesObservedDecision: realFlowClassifierScorecard?.summary?.scorecardConsumesObservedDecision ?? null,
  decisionTraceSchemaVerdict: decisionTraceSchema?.summary?.verdict ?? null,
  decisionTraceCount: decisionTraceSchema?.summary?.traceCount ?? null,
  decisionTraceMismatchCount: decisionTraceSchema?.summary?.mismatchCount ?? null,
  decisionTraceFalsePermitRate: decisionTraceSchema?.summary?.falsePermitRate ?? null,
  decisionTraceFalseCompactRate: decisionTraceSchema?.summary?.falseCompactRate ?? null,
  realFlowMutationSuiteVerdict: realFlowMutationSuite?.summary?.verdict ?? null,
  realFlowMutationCount: realFlowMutationSuite?.summary?.mutationCount ?? null,
  realFlowMutationMismatchCount: realFlowMutationSuite?.summary?.mismatchCount ?? null,
  realFlowMutationDuplicateIdCount: realFlowMutationSuite?.summary?.duplicateMutationIdCount ?? null,
  realFlowMutationNonDegradedCount: realFlowMutationSuite?.summary?.nonDegradedCount ?? null,
  realFlowMutationFalsePermitRate: realFlowMutationSuite?.summary?.falsePermitRate ?? null,
  realFlowMutationFalseCompactRate: realFlowMutationSuite?.summary?.falseCompactRate ?? null,
  categoryCoverageThresholdsVerdict: categoryCoverageThresholds?.summary?.verdict ?? null,
  categoryCoverageThresholdFailures: categoryCoverageThresholds?.summary?.thresholdFailures ?? null,
  redactionReviewRecordSchemaVerdict: redactionReviewRecordSchema?.summary?.verdict ?? null,
  redactionReviewRecordCount: redactionReviewRecordSchema?.summary?.reviewRecords ?? null,
  redactionReviewRecordValidationErrors: redactionReviewRecordSchema?.summary?.validationErrorCount ?? null,
  redactionReviewRecordNegativeControls: redactionReviewRecordSchema?.summary?.negativeControlCount ?? null,
  redactionReviewRecordRawContentPersisted: redactionReviewRecordSchema?.summary?.rawContentPersisted ?? null,
  redactionReviewRecordPrivatePathsPersisted: redactionReviewRecordSchema?.summary?.privatePathsPersisted ?? null,
  redactionReviewRecordSecretLikeValuesPersisted: redactionReviewRecordSchema?.summary?.secretLikeValuesPersisted ?? null,
  redactionReviewRecordToolOutputsPersisted: redactionReviewRecordSchema?.summary?.toolOutputsPersisted ?? null,
  redactionReviewRecordMemoryTextPersisted: redactionReviewRecordSchema?.summary?.memoryTextPersisted ?? null,
  redactionReviewRecordConfigTextPersisted: redactionReviewRecordSchema?.summary?.configTextPersisted ?? null,
  redactionReviewRecordApprovalTextPersisted: redactionReviewRecordSchema?.summary?.approvalTextPersisted ?? null,
  redactionReviewRecordForbiddenForLiveObservation: redactionReviewRecordSchema?.summary?.forbiddenForLiveObservation ?? null,
  redactionReviewRecordForbiddenForRuntimeUse: redactionReviewRecordSchema?.summary?.forbiddenForRuntimeUse ?? null,
  realRedactedHandoffPackVerdict: realRedactedHandoffPack?.summary?.verdict ?? null,
  realRedactedHandoffPackBundleCount: realRedactedHandoffPack?.summary?.realRedactedBundles ?? null,
  realRedactedHandoffPackReviewRecordCount: realRedactedHandoffPack?.summary?.redactionReviewRecords ?? null,
  realRedactedHandoffPackScorecardRows: realRedactedHandoffPack?.summary?.scorecardRows ?? null,
  realRedactedHandoffPackValidationErrors: realRedactedHandoffPack?.summary?.validationErrorCount ?? null,
  realRedactedHandoffPackRawContentPersisted: realRedactedHandoffPack?.summary?.rawContentPersisted ?? null,
  realRedactedHandoffPackForbiddenEffects: realRedactedHandoffPack?.summary?.forbiddenEffects ?? null,
  realRedactedHandoffPackMayBlock: realRedactedHandoffPack?.summary?.mayBlock ?? null,
  realRedactedHandoffPackMayAllow: realRedactedHandoffPack?.summary?.mayAllow ?? null,
  realRedactedHandoffPackCapabilityAttempts: realRedactedHandoffPack?.summary?.capabilityAttempts ?? null,
  realRedactedHandoffPackMismatch: realRedactedHandoffPack?.summary?.mismatch ?? null,
  realRedactedHandoffReplayGateVerdict: realRedactedHandoffReplayGate?.summary?.verdict ?? null,
  realRedactedHandoffReplayGateBundleCount: realRedactedHandoffReplayGate?.summary?.realRedactedBundles ?? null,
  realRedactedHandoffReplayGateReviewRecordCount: realRedactedHandoffReplayGate?.summary?.redactionReviewRecords ?? null,
  realRedactedHandoffReplayGateTraceCount: realRedactedHandoffReplayGate?.summary?.traceCount ?? null,
  realRedactedHandoffReplayGateObservationCount: realRedactedHandoffReplayGate?.summary?.observationCount ?? null,
  realRedactedHandoffReplayGateResultCount: realRedactedHandoffReplayGate?.summary?.resultCount ?? null,
  realRedactedHandoffReplayGateMismatchCount: realRedactedHandoffReplayGate?.summary?.mismatchCount ?? null,
  realRedactedHandoffReplayGateForbiddenEffectsDetectedCount: realRedactedHandoffReplayGate?.summary?.forbiddenEffectsDetectedCount ?? null,
  realRedactedHandoffReplayGateMayBlockCount: realRedactedHandoffReplayGate?.summary?.mayBlockCount ?? null,
  realRedactedHandoffReplayGateMayAllowCount: realRedactedHandoffReplayGate?.summary?.mayAllowCount ?? null,
  realRedactedHandoffReplayGateCapabilityTrueCount: realRedactedHandoffReplayGate?.summary?.capabilityTrueCount ?? null,
  realRedactedAdversarialCoverageVerdict: realRedactedAdversarialCoverage?.summary?.verdict ?? null,
  realRedactedAdversarialCoverageCaseCount: realRedactedAdversarialCoverage?.summary?.adversarialRealRedactedCases ?? null,
  realRedactedAdversarialCoverageRouteCounts: realRedactedAdversarialCoverage?.summary?.routeCounts ?? null,
  realRedactedAdversarialCoverageValidationErrors: realRedactedAdversarialCoverage?.summary?.validationErrorCount ?? null,
  realRedactedAdversarialCoverageFalsePermitCount: realRedactedAdversarialCoverage?.summary?.falsePermitCount ?? null,
  realRedactedAdversarialCoverageFalseCompactCount: realRedactedAdversarialCoverage?.summary?.falseCompactCount ?? null,
  realRedactedAdversarialCoverageBoundaryLossCount: realRedactedAdversarialCoverage?.summary?.boundaryLossCount ?? null,
  realRedactedAdversarialCoverageForbiddenEffectsDetectedCount: realRedactedAdversarialCoverage?.summary?.forbiddenEffectsDetectedCount ?? null,
  realRedactedAdversarialCoverageMayBlockCount: realRedactedAdversarialCoverage?.summary?.mayBlockCount ?? null,
  realRedactedAdversarialCoverageMayAllowCount: realRedactedAdversarialCoverage?.summary?.mayAllowCount ?? null,
  realRedactedAdversarialCoverageCapabilityTrueCount: realRedactedAdversarialCoverage?.summary?.capabilityTrueCount ?? null,
  passiveCanarySourceBoundaryStressVerdict: passiveCanarySourceBoundaryStress?.summary?.verdict ?? null,
  passiveCanarySourceBoundaryStressMalformedSourceTupleRejects: passiveCanarySourceBoundaryStress?.summary?.malformedSourceTupleRejects ?? null,
  passiveCanarySourceBoundaryStressStaleDigestRejects: passiveCanarySourceBoundaryStress?.summary?.staleDigestRejects ?? null,
  passiveCanarySourceBoundaryStressMissingMtimeRejects: passiveCanarySourceBoundaryStress?.summary?.missingMtimeRejects ?? null,
  passiveCanarySourceBoundaryStressWrongLaneRejects: passiveCanarySourceBoundaryStress?.summary?.wrongLaneRejects ?? null,
  passiveCanarySourceBoundaryStressOutputContainmentRejects: passiveCanarySourceBoundaryStress?.summary?.outputContainmentRejects ?? null,
  passiveCanarySourceBoundaryStressPassCapabilityTrueCount: passiveCanarySourceBoundaryStress?.summary?.passCapabilityTrueCount ?? null,
  passiveCanarySourceBoundaryStressAutomaticAgentConsumptionImplemented: passiveCanarySourceBoundaryStress?.summary?.automaticAgentConsumptionImplemented ?? null,
  passiveCanaryDriftScorecardVerdict: passiveCanaryDriftScorecard?.summary?.verdict ?? null,
  passiveCanaryDriftScorecardComparedRows: passiveCanaryDriftScorecard?.summary?.comparedRows ?? null,
  passiveCanaryDriftScorecardRouteDriftCount: passiveCanaryDriftScorecard?.summary?.routeDriftCount ?? null,
  passiveCanaryDriftScorecardReasonCodeDriftCount: passiveCanaryDriftScorecard?.summary?.reasonCodeDriftCount ?? null,
  passiveCanaryDriftScorecardBoundaryVerdictDriftCount: passiveCanaryDriftScorecard?.summary?.boundaryVerdictDriftCount ?? null,
  passiveCanaryDriftScorecardScorecardDriftCount: passiveCanaryDriftScorecard?.summary?.scorecardDriftCount ?? null,
  passiveCanaryDriftScorecardTraceHashDriftCount: passiveCanaryDriftScorecard?.summary?.traceHashDriftCount ?? null,
  passiveCanaryDriftScorecardNormalizedOutputMismatchCount: passiveCanaryDriftScorecard?.summary?.normalizedOutputMismatchCount ?? null,
  passiveCanaryDriftScorecardMayBlockCount: passiveCanaryDriftScorecard?.summary?.mayBlockCount ?? null,
  passiveCanaryDriftScorecardMayAllowCount: passiveCanaryDriftScorecard?.summary?.mayAllowCount ?? null,
  passiveCanaryDriftScorecardCapabilityTrueCount: passiveCanaryDriftScorecard?.summary?.capabilityTrueCount ?? null,
  passiveCanaryDriftScorecardForbiddenEffects: passiveCanaryDriftScorecard?.summary?.forbiddenEffects ?? null,
  passiveCanaryDriftScorecardAutomaticAgentConsumptionImplemented: passiveCanaryDriftScorecard?.summary?.automaticAgentConsumptionImplemented ?? null,
  passiveCanaryExpandedPackVerdict: passiveCanaryExpandedPack?.summary?.verdict ?? null,
  passiveCanaryExpandedPackTotalCases: passiveCanaryExpandedPack?.summary?.totalCases ?? null,
  passiveCanaryExpandedPackPassCases: passiveCanaryExpandedPack?.summary?.passCases ?? null,
  passiveCanaryExpandedPackRejectCases: passiveCanaryExpandedPack?.summary?.rejectCases ?? null,
  passiveCanaryExpandedPackCoveredTargetCoverageCount: passiveCanaryExpandedPack?.summary?.coveredTargetCoverageCount ?? null,
  passiveCanaryExpandedPackUnexpectedAccepts: passiveCanaryExpandedPack?.summary?.unexpectedAccepts ?? null,
  passiveCanaryExpandedPackUnexpectedRejects: passiveCanaryExpandedPack?.summary?.unexpectedRejects ?? null,
  passiveCanaryExpandedPackAcceptedForbiddenEffectsDetectedCount: passiveCanaryExpandedPack?.summary?.acceptedForbiddenEffectsDetectedCount ?? null,
  passiveCanaryExpandedPackPassCapabilityTrueCount: passiveCanaryExpandedPack?.summary?.passCapabilityTrueCount ?? null,
  passiveCanaryExpandedPackAutomaticAgentConsumptionImplemented: passiveCanaryExpandedPack?.summary?.automaticAgentConsumptionImplemented ?? null,
  passiveCanarySourceBoundaryExpansionVerdict: passiveCanarySourceBoundaryExpansion?.summary?.verdict ?? null,
  passiveCanarySourceBoundaryExpansionRejectCases: passiveCanarySourceBoundaryExpansion?.summary?.rejectCases ?? null,
  passiveCanarySourceBoundaryExpansionCoveredTargetCoverageCount: passiveCanarySourceBoundaryExpansion?.summary?.coveredTargetCoverageCount ?? null,
  passiveCanarySourceBoundaryExpansionDigestBindingMismatchRejects: passiveCanarySourceBoundaryExpansion?.summary?.digestBindingMismatchRejects ?? null,
  passiveCanarySourceBoundaryExpansionFutureMtimeRejects: passiveCanarySourceBoundaryExpansion?.summary?.futureMtimeRejects ?? null,
  passiveCanarySourceBoundaryExpansionSourcePathTraversalRejects: passiveCanarySourceBoundaryExpansion?.summary?.sourcePathTraversalRejects ?? null,
  passiveCanarySourceBoundaryExpansionSourceSymlinkRejects: passiveCanarySourceBoundaryExpansion?.summary?.sourceSymlinkRejects ?? null,
  passiveCanarySourceBoundaryExpansionSourceUnicodeControlRejects: passiveCanarySourceBoundaryExpansion?.summary?.sourceUnicodeControlRejects ?? null,
  passiveCanarySourceBoundaryExpansionAutomaticAgentConsumptionImplemented: passiveCanarySourceBoundaryExpansion?.summary?.automaticAgentConsumptionImplemented ?? null,
  passiveCanaryAdvisoryReportVerdict: passiveCanaryAdvisoryReport?.summary?.verdict ?? null,
  passiveCanaryAdvisoryReportAdvisoryOnly: passiveCanaryAdvisoryReport?.summary?.advisoryOnly ?? null,
  passiveCanaryAdvisoryReportHumanReadableOnly: passiveCanaryAdvisoryReport?.summary?.humanReadableOnly ?? null,
  passiveCanaryAdvisoryReportNonAuthoritative: passiveCanaryAdvisoryReport?.summary?.nonAuthoritative ?? null,
  passiveCanaryAdvisoryReportMachineReadablePolicyDecision: passiveCanaryAdvisoryReport?.summary?.machineReadablePolicyDecision ?? null,
  passiveCanaryAdvisoryReportAutomaticAgentConsumptionImplemented: passiveCanaryAdvisoryReport?.summary?.automaticAgentConsumptionImplemented ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardVerdict: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.verdict ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardTextFindings: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.textFindings ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardMachineReadableFindings: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.machineReadableFindings ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardReasonCodeAsciiTokenRequired: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.reasonCodeAsciiTokenRequired ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardSourcePathAsciiRequired: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.sourcePathAsciiRequired ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardSourcePathConfusableGuard: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.sourcePathConfusableGuard ?? null,
  passiveCanaryAdvisoryUnicodeBidiGuardAutomaticAgentConsumptionImplemented: passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.automaticAgentConsumptionImplemented ?? null,
  passiveCanaryAdvisoryReportFailureCatalogVerdict: passiveCanaryAdvisoryReportFailureCatalog?.summary?.advisoryReportFailureCatalog ?? null,
  passiveCanaryAdvisoryReportFailureCatalogExpectedRejects: passiveCanaryAdvisoryReportFailureCatalog?.summary?.expectedRejects ?? null,
  passiveCanaryAdvisoryReportFailureCatalogUnexpectedAccepts: passiveCanaryAdvisoryReportFailureCatalog?.summary?.unexpectedAccepts ?? null,
  passiveCanaryAdvisoryReportFailureCatalogMachineReadablePolicyDecision: passiveCanaryAdvisoryReportFailureCatalog?.summary?.machineReadablePolicyDecision ?? null,
  passiveCanaryAdvisoryReportFailureCatalogConsumedByAgent: passiveCanaryAdvisoryReportFailureCatalog?.summary?.consumedByAgent ?? null,
  passiveCanaryAdvisoryReportFailureCatalogMayBlock: passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayBlock ?? null,
  passiveCanaryAdvisoryReportFailureCatalogMayAllow: passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayAllow ?? null,
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
