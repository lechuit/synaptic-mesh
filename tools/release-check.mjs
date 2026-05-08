#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const releaseGateScripts = [
  'verify:manifest',
  'check',
  'test:receiver-adapters',
  'review:local',
  'test:action-policy',
  'test:authority-routes',
  'test:authority-envelope',
  'test:route-decision-schema',
  'test:threat-model-routes',
  'test:route-decision-wrong-routes',
  'test:receipt-schema',
  'test:authority-benchmark',
  'test:adversarial-generator',
  'test:raw-parser-adversarial',
  'test:parser-normalization-evidence',
  'test:real-flow-replay',
  'test:route-classifier-shadow',
  'test:real-flow-classifier-scorecard',
  'test:decision-trace-schema',
  'test:real-flow-mutation-suite',
  'test:category-coverage-thresholds',
  'test:live-shadow-observation-schema',
  'test:live-shadow-observation-result-schema',
  'test:live-shadow-forbidden-effects',
  'test:live-shadow-synthetic-replay',
  'test:live-shadow-drift-scorecard',
  'test:manual-observation-bundle-schema',
  'test:manual-observation-redaction-fixtures',
  'test:manual-bundle-parser-evidence-replay',
  'test:manual-decisiontrace-live-shadow-replay',
];

function runGit(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...options }).trim();
}

function runNpmScript(scriptName, cwd) {
  console.log(`\n> release gate: npm run ${scriptName}`);
  execFileSync('npm', ['run', scriptName], { cwd, stdio: 'inherit' });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const parsed = { target: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--target') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--target requires a v-prefixed semver tag value');
      parsed.target = value;
      index += 1;
      continue;
    }
    if (arg.startsWith('--target=')) {
      parsed.target = arg.slice('--target='.length);
      if (!parsed.target) throw new Error('--target requires a v-prefixed semver tag value');
      continue;
    }
    throw new Error(`Unknown release:check argument: ${arg}`);
  }
  return parsed;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, expected, label) {
  assert(text.includes(expected), `${label} must include ${JSON.stringify(expected)}`);
}

function assertNotIncludes(text, forbidden, label) {
  assert(!text.includes(forbidden), `${label} must not include stale ${JSON.stringify(forbidden)}`);
}

function countLabel(passed, total) {
  return `${passed}/${total}`;
}

function assertOptionalCountMatches(text, pattern, expectedCount, label, description) {
  const match = text.match(pattern);
  if (!match) return;

  const actualCount = countLabel(Number(match.groups.passed), Number(match.groups.total));
  assert(
    actualCount === expectedCount,
    `${label} ${description} count ${actualCount} must match current evidence ${expectedCount}; remove the exact count if it is not intended to be release-pinned`,
  );
}

function currentPublishedRelease() {
  try {
    const tag = runGit(['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*']);
    return tag || null;
  } catch {
    return null;
  }
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = runGit(['rev-parse', '--show-toplevel']);
const expectedPackageRoot = path.join(repoRoot, 'implementation/synaptic-mesh-shadow-v0');
const packageRoot = process.cwd();

assert(
  path.resolve(packageRoot) === path.resolve(expectedPackageRoot),
  `release:check must be run from implementation/synaptic-mesh-shadow-v0; got ${packageRoot}`,
);

const manifest = readJson(path.join(repoRoot, 'MANIFEST.json'));
const packageJson = readJson(path.join(packageRoot, 'package.json'));
const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
const releaseNotes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
const releaseChecklist = readFileSync(path.join(repoRoot, 'docs/release-checklist.md'), 'utf8');
const shadowReadme = readFileSync(path.join(packageRoot, 'README.md'), 'utf8');

const manifestVersion = manifest.version;
const manifestReleaseTag = `v${manifestVersion}`;
const releaseTarget = args.target ?? manifestReleaseTag;
const publishedRelease = currentPublishedRelease();
const staleVersions = ['v0.1.2', '0.1.2'].filter((version) => version !== manifestReleaseTag && version !== manifestVersion);

assert(/^\d+\.\d+\.\d+$/.test(manifestVersion), `MANIFEST.json version must be semver-like; got ${manifestVersion}`);
assert(/^v\d+\.\d+\.\d+$/.test(releaseTarget), `release target must be a v-prefixed semver tag such as v0.1.4; got ${releaseTarget}`);
if (!args.target) {
  console.warn(`release:check defaulting --target to MANIFEST.json version ${manifestReleaseTag}; pass -- --target vX.Y.Z for release/tag verification.`);
}
assert(packageJson.private === true, 'shadow package must remain private for release checks');
assert(packageJson.version === '0.0.0-local', 'shadow package version must remain 0.0.0-local unless publication scope changes');
assert(packageJson.scripts?.['release:check'] === 'node ../../tools/release-check.mjs', 'package.json must wire npm run release:check to ../../tools/release-check.mjs');

assertIncludes(readme, `# Synaptic Mesh ${manifestReleaseTag}`, 'README.md');
assertIncludes(readme, `release candidate \`${manifestReleaseTag}\``, 'README.md');
assertIncludes(readme, `Current ${manifestReleaseTag} status is narrower`, 'README.md');
assertIncludes(releaseNotes, `# Release Notes — Synaptic Mesh ${manifestReleaseTag}`, 'RELEASE_NOTES.md');
assertIncludes(releaseChecklist, 'npm run release:check', 'docs/release-checklist.md');
assertIncludes(releaseChecklist, 'no runtime integration', 'docs/release-checklist.md');
assertIncludes(releaseChecklist, 'no production, canary, enforcement, or safety-certification claims', 'docs/release-checklist.md');

for (const staleVersion of staleVersions) {
  assertNotIncludes(readme, staleVersion, 'README.md');
}

for (const scriptName of releaseGateScripts) {
  runNpmScript(scriptName, packageRoot);
}

const reviewEvidence = readJson(path.join(packageRoot, 'evidence/review-local.out.json'));
assert(reviewEvidence?.summary?.verdict === 'pass', 'review-local evidence verdict must be pass');
assert(reviewEvidence?.summary?.sourceFixtureMutation === false, 'review-local evidence must report sourceFixtureMutation: false');
assert((reviewEvidence?.summary?.unsafeAllowSignals ?? []).length === 0, 'review-local evidence must report zero unsafe allow signals');

const receiverAdapterEvidence = readJson(path.join(packageRoot, 'evidence/receiver-policy-adapter-contracts.out.json'));
const realFlowReplayEvidence = readJson(path.join(packageRoot, 'evidence/real-flow-replay.out.json'));
const realFlowClassifierScorecard = readJson(path.join(packageRoot, 'evidence/real-flow-classifier-scorecard.out.json'));
const decisionTraceSchema = readJson(path.join(packageRoot, 'evidence/decision-trace-schema.out.json'));
const realFlowMutationSuite = readJson(path.join(packageRoot, 'evidence/real-flow-mutation-suite.out.json'));
const categoryCoverageThresholds = readJson(path.join(packageRoot, 'evidence/category-coverage-thresholds.out.json'));
assert(receiverAdapterEvidence?.summary?.verdict === 'pass', 'receiver adapter evidence verdict must be pass');
assert(receiverAdapterEvidence?.summary?.unsafeAllows === 0, 'receiver adapter evidence must report unsafeAllows: 0');
assert(realFlowReplayEvidence?.summary?.flowCount >= 20 && realFlowReplayEvidence?.summary?.flowCount <= 30, 'v0.1.6 real-flow replay must have 20–30 cases');
assert(realFlowReplayEvidence?.summary?.goldDecisionCount >= 20 && realFlowReplayEvidence?.summary?.goldDecisionCount <= 30, 'real-flow replay must expose 20–30 goldDecision records');
assert(realFlowReplayEvidence?.summary?.observedDecisionDeprecated === true, 'real-flow replay must deprecate observedDecision');
assert(realFlowReplayEvidence?.summary?.scorecardsConsumeObservedDecision === false, 'real-flow replay scorecards must not consume observedDecision');
assert(realFlowClassifierScorecard?.summary?.verdict === 'pass', 'real-flow classifier scorecard verdict must be pass');
assert(realFlowClassifierScorecard?.summary?.flowCount >= 20 && realFlowClassifierScorecard?.summary?.flowCount <= 30, 'classifier scorecard must cover 20–30 real-flow cases');
assert(realFlowClassifierScorecard?.summary?.mismatchCount === 0, 'classifier scorecard mismatchCount must be 0');
assert(realFlowClassifierScorecard?.summary?.falsePermitRate === 0, 'classifier scorecard falsePermitRate must be 0');
assert(realFlowClassifierScorecard?.summary?.falseCompactRate === 0, 'classifier scorecard falseCompactRate must be 0');
assert(realFlowClassifierScorecard?.summary?.scorecardCompares === 'classifierDecision_vs_goldDecision', 'scorecard must compare classifierDecision vs goldDecision');
assert(realFlowClassifierScorecard?.summary?.scorecardConsumesObservedDecision === false, 'scorecard must not consume observedDecision');
assert(decisionTraceSchema?.summary?.verdict === 'pass', 'decision trace schema verdict must be pass');
assert(decisionTraceSchema?.summary?.traceCount >= 20 && decisionTraceSchema?.summary?.traceCount <= 30, 'decision trace schema must cover 20–30 traces');
assert(decisionTraceSchema?.summary?.mismatchCount === 0, 'decision trace schema mismatchCount must be 0');
assert(decisionTraceSchema?.summary?.falsePermitRate === 0, 'decision trace schema falsePermitRate must be 0');
assert(decisionTraceSchema?.summary?.falseCompactRate === 0, 'decision trace schema falseCompactRate must be 0');
assert(decisionTraceSchema?.summary?.runtimeEnforcementImplemented === false, 'decision trace schema must not implement runtime enforcement');
assert(decisionTraceSchema?.summary?.liveShadowObserverImplemented === false, 'decision trace schema must not implement live shadow observer');
assert(realFlowMutationSuite?.summary?.verdict === 'pass', 'real-flow mutation suite verdict must be pass');
assert(realFlowMutationSuite?.summary?.mutationCount >= 15, 'real-flow mutation suite must cover at least 15 mutations');
assert(realFlowMutationSuite?.summary?.mismatchCount === 0, 'real-flow mutation suite mismatchCount must be 0');
assert(realFlowMutationSuite?.summary?.duplicateMutationIdCount === 0, 'real-flow mutation suite duplicateMutationIdCount must be 0');
assert(realFlowMutationSuite?.summary?.nonDegradedCount === 0, 'real-flow mutation suite nonDegradedCount must be 0');
assert(realFlowMutationSuite?.summary?.falsePermitRate === 0, 'real-flow mutation suite falsePermitRate must be 0');
assert(realFlowMutationSuite?.summary?.falseCompactRate === 0, 'real-flow mutation suite falseCompactRate must be 0');
assert(realFlowMutationSuite?.summary?.runtimeEnforcementImplemented === false, 'real-flow mutation suite must not implement runtime enforcement');
assert(realFlowMutationSuite?.summary?.liveShadowObserverImplemented === false, 'real-flow mutation suite must not implement live shadow observer');
assert(categoryCoverageThresholds?.summary?.verdict === 'pass', 'category coverage thresholds verdict must be pass');
assert(categoryCoverageThresholds?.summary?.thresholdFailures === 0, 'category coverage thresholds must have zero failures');
assert(categoryCoverageThresholds?.summary?.runtimeEnforcementImplemented === false, 'category coverage thresholds must not implement runtime enforcement');
assert(categoryCoverageThresholds?.summary?.liveShadowObserverImplemented === false, 'category coverage thresholds must not implement live shadow observer');

const liveShadowObservationSchema = readJson(path.join(packageRoot, 'evidence/live-shadow-observation-schema.out.json'));
const liveShadowObservationResultSchema = readJson(path.join(packageRoot, 'evidence/live-shadow-observation-result-schema.out.json'));
const liveShadowForbiddenEffects = readJson(path.join(packageRoot, 'evidence/live-shadow-forbidden-effects.out.json'));
assert(liveShadowObservationSchema?.summary?.verdict === 'pass', 'live-shadow observation schema verdict must be pass');
assert(liveShadowObservationSchema?.summary?.observerImplemented === false, 'live-shadow observation schema must not implement an observer');
assert(liveShadowObservationSchema?.summary?.liveTrafficRead === false, 'live-shadow observation schema must not read live traffic');
assert(liveShadowObservationResultSchema?.summary?.verdict === 'pass', 'live-shadow observation result schema verdict must be pass');
assert(liveShadowObservationResultSchema?.summary?.mayBlockCount === 0, 'live-shadow observation result must not block');
assert(liveShadowObservationResultSchema?.summary?.mayAllowCount === 0, 'live-shadow observation result must not allow');
assert(liveShadowForbiddenEffects?.summary?.verdict === 'pass', 'live-shadow forbidden-effects gate verdict must be pass');
assert(liveShadowForbiddenEffects?.summary?.violationCount === 0, 'live-shadow forbidden-effects gate must have zero violations');
assert(liveShadowForbiddenEffects?.summary?.toolExecutionImplemented === false, 'live-shadow forbidden-effects gate must not implement tool execution');
assert(liveShadowForbiddenEffects?.summary?.memoryWriteImplemented === false, 'live-shadow forbidden-effects gate must not implement memory writes');
assert(liveShadowForbiddenEffects?.summary?.configWriteImplemented === false, 'live-shadow forbidden-effects gate must not implement config writes');
assert(liveShadowForbiddenEffects?.summary?.externalPublicationImplemented === false, 'live-shadow forbidden-effects gate must not implement external publication');

const liveShadowSyntheticReplay = readJson(path.join(packageRoot, 'evidence/live-shadow-synthetic-replay.out.json'));
assert(liveShadowSyntheticReplay?.summary?.verdict === 'pass', 'live-shadow synthetic replay verdict must be pass');
assert(liveShadowSyntheticReplay?.summary?.mode === 'synthetic_offline_replay_only', 'live-shadow synthetic replay must remain offline-only');
assert(liveShadowSyntheticReplay?.summary?.observerImplemented === false, 'live-shadow synthetic replay must not implement an observer');
assert(liveShadowSyntheticReplay?.summary?.liveTrafficRead === false, 'live-shadow synthetic replay must not read live traffic');
assert(liveShadowSyntheticReplay?.summary?.daemonImplemented === false, 'live-shadow synthetic replay must not implement a daemon');
assert(liveShadowSyntheticReplay?.summary?.adapterIntegrationImplemented === false, 'live-shadow synthetic replay must not integrate adapters');
assert(liveShadowSyntheticReplay?.summary?.forbiddenEffectsDetectedCount === 0, 'live-shadow synthetic replay must detect zero forbidden effects');
assert(liveShadowSyntheticReplay?.summary?.mayBlockCount === 0, 'live-shadow synthetic replay must not block');
assert(liveShadowSyntheticReplay?.summary?.mayAllowCount === 0, 'live-shadow synthetic replay must not allow');
assert(liveShadowSyntheticReplay?.summary?.capabilityTrueCount === 0, 'live-shadow synthetic replay must not set capability fields true');
assert(liveShadowSyntheticReplay?.summary?.toolExecutionImplemented === false, 'live-shadow synthetic replay must not implement tool execution');
assert(liveShadowSyntheticReplay?.summary?.memoryWriteImplemented === false, 'live-shadow synthetic replay must not implement memory writes');
assert(liveShadowSyntheticReplay?.summary?.configWriteImplemented === false, 'live-shadow synthetic replay must not implement config writes');
assert(liveShadowSyntheticReplay?.summary?.externalPublicationImplemented === false, 'live-shadow synthetic replay must not implement external publication');
assert(liveShadowSyntheticReplay?.summary?.enforcementImplemented === false, 'live-shadow synthetic replay must not implement enforcement');

const liveShadowDriftScorecard = readJson(path.join(packageRoot, 'evidence/live-shadow-drift-scorecard-shape.out.json'));
assert(liveShadowDriftScorecard?.summary?.verdict === 'pass', 'live-shadow drift scorecard verdict must be pass');
assert(liveShadowDriftScorecard?.summary?.mode === 'offline_scorecard_shape_only', 'live-shadow drift scorecard must remain offline scorecard shape only');
assert(liveShadowDriftScorecard?.summary?.observerImplemented === false, 'live-shadow drift scorecard must not implement an observer');
assert(liveShadowDriftScorecard?.summary?.liveTrafficRead === false, 'live-shadow drift scorecard must not read live traffic');
assert(liveShadowDriftScorecard?.summary?.forbiddenEffectCount === 0, 'live-shadow drift scorecard must have zero forbidden effects');
assert(liveShadowDriftScorecard?.summary?.capabilityAttemptCount === 0, 'live-shadow drift scorecard must have zero capability attempts');
assert(liveShadowDriftScorecard?.summary?.capabilityTrueCount === 0, 'live-shadow drift scorecard must not set capability fields true');
assert(liveShadowDriftScorecard?.summary?.rawContentPersisted === false, 'live-shadow drift scorecard must not persist raw content');
assert(liveShadowDriftScorecard?.summary?.redactionImplementationAdded === false, 'live-shadow drift scorecard must not implement redaction code');
assert(liveShadowDriftScorecard?.summary?.retentionSchedulerImplemented === false, 'live-shadow drift scorecard must not implement retention scheduling');
assert(liveShadowDriftScorecard?.summary?.toolExecutionImplemented === false, 'live-shadow drift scorecard must not implement tool execution');
assert(liveShadowDriftScorecard?.summary?.memoryWriteImplemented === false, 'live-shadow drift scorecard must not implement memory writes');
assert(liveShadowDriftScorecard?.summary?.configWriteImplemented === false, 'live-shadow drift scorecard must not implement config writes');
assert(liveShadowDriftScorecard?.summary?.externalPublicationImplemented === false, 'live-shadow drift scorecard must not implement external publication');
assert(liveShadowDriftScorecard?.summary?.enforcementImplemented === false, 'live-shadow drift scorecard must not implement enforcement');

const manualObservationBundleSchema = readJson(path.join(packageRoot, 'evidence/manual-observation-bundle-schema.out.json'));
assert(manualObservationBundleSchema?.summary?.verdict === 'pass', 'manual observation bundle schema verdict must be pass');
assert(manualObservationBundleSchema?.summary?.mode === 'manual_offline_bundle_schema_only', 'manual observation bundle schema must remain manual/offline/schema-only');
assert(manualObservationBundleSchema?.summary?.humanReviewRequiredForCapture === true, 'manual observation bundle capture must require human review');
assert(manualObservationBundleSchema?.summary?.rawContentPersisted === false, 'manual observation bundle must not persist raw content');
assert(manualObservationBundleSchema?.summary?.secretLikeValuePersisted === false, 'manual observation bundle must not persist secret-like values');
assert(manualObservationBundleSchema?.summary?.toolOutputPersisted === false, 'manual observation bundle must not persist tool output');
assert(manualObservationBundleSchema?.summary?.memoryTextPersisted === false, 'manual observation bundle must not persist memory text');
assert(manualObservationBundleSchema?.summary?.configTextPersisted === false, 'manual observation bundle must not persist config text');
assert(manualObservationBundleSchema?.summary?.approvalTextPersisted === false, 'manual observation bundle must not persist approval text');
assert(manualObservationBundleSchema?.summary?.privatePathPersisted === false, 'manual observation bundle must not persist private paths');
assert(manualObservationBundleSchema?.summary?.capabilityAttempts === 0, 'manual observation bundle must not include capability attempts');
assert(manualObservationBundleSchema?.summary?.forbiddenEffects === 0, 'manual observation bundle must not include forbidden effects');
assert(manualObservationBundleSchema?.summary?.liveObserverImplemented === false, 'manual observation bundle must not implement live observer');
assert(manualObservationBundleSchema?.summary?.daemonImplemented === false, 'manual observation bundle must not implement daemon');
assert(manualObservationBundleSchema?.summary?.watcherImplemented === false, 'manual observation bundle must not implement watcher');
assert(manualObservationBundleSchema?.summary?.toolExecutionImplemented === false, 'manual observation bundle must not implement tool execution');
assert(manualObservationBundleSchema?.summary?.memoryWriteImplemented === false, 'manual observation bundle must not implement memory writes');
assert(manualObservationBundleSchema?.summary?.configWriteImplemented === false, 'manual observation bundle must not implement config writes');
assert(manualObservationBundleSchema?.summary?.externalPublicationImplemented === false, 'manual observation bundle must not implement external publication');
assert(manualObservationBundleSchema?.summary?.enforcementImplemented === false, 'manual observation bundle must not implement enforcement');

const manualObservationRedactionFixtures = readJson(path.join(packageRoot, 'evidence/manual-observation-redaction-fixtures.out.json'));
assert(manualObservationRedactionFixtures?.summary?.verdict === 'pass', 'manual observation redaction fixtures verdict must be pass');
assert(manualObservationRedactionFixtures?.summary?.mode === 'manual_offline_redaction_fixture_pack_only', 'manual redaction fixtures must remain fixture-pack only');
assert(manualObservationRedactionFixtures?.summary?.humanReviewRequiredForCapture === true, 'manual redaction fixtures capture must require human review');
assert(manualObservationRedactionFixtures?.summary?.redactionFailures === 0, 'manual redaction fixtures must have zero redaction failures');
assert(manualObservationRedactionFixtures?.summary?.rawContentPersisted === false, 'manual redaction fixtures must not persist raw content');
assert(manualObservationRedactionFixtures?.summary?.privatePathPersisted === false, 'manual redaction fixtures must not persist private paths');
assert(manualObservationRedactionFixtures?.summary?.secretLikeValuePersisted === false, 'manual redaction fixtures must not persist secret-like values');
assert(manualObservationRedactionFixtures?.summary?.toolOutputPersisted === false, 'manual redaction fixtures must not persist tool output');
assert(manualObservationRedactionFixtures?.summary?.memoryTextPersisted === false, 'manual redaction fixtures must not persist memory text');
assert(manualObservationRedactionFixtures?.summary?.configTextPersisted === false, 'manual redaction fixtures must not persist config text');
assert(manualObservationRedactionFixtures?.summary?.approvalTextPersisted === false, 'manual redaction fixtures must not persist approval text');
assert(manualObservationRedactionFixtures?.summary?.capabilityAttempts === 0, 'manual redaction fixtures must not include capability attempts');
assert(manualObservationRedactionFixtures?.summary?.forbiddenEffects === 0, 'manual redaction fixtures must not include forbidden effects');
assert(manualObservationRedactionFixtures?.summary?.liveObserverImplemented === false, 'manual redaction fixtures must not implement live observer');
assert(manualObservationRedactionFixtures?.summary?.toolExecutionImplemented === false, 'manual redaction fixtures must not implement tool execution');
assert(manualObservationRedactionFixtures?.summary?.memoryWriteImplemented === false, 'manual redaction fixtures must not implement memory writes');
assert(manualObservationRedactionFixtures?.summary?.configWriteImplemented === false, 'manual redaction fixtures must not implement config writes');
assert(manualObservationRedactionFixtures?.summary?.externalPublicationImplemented === false, 'manual redaction fixtures must not implement external publication');
assert(manualObservationRedactionFixtures?.summary?.enforcementImplemented === false, 'manual redaction fixtures must not implement enforcement');

const manualBundleParserEvidenceReplay = readJson(path.join(packageRoot, 'evidence/manual-bundle-parser-evidence-replay.out.json'));
assert(manualBundleParserEvidenceReplay?.summary?.verdict === 'pass', 'manual bundle parserEvidence replay verdict must be pass');
assert(manualBundleParserEvidenceReplay?.summary?.mode === 'manual_offline_parser_evidence_replay_only', 'manual parserEvidence replay must remain replay-only');
assert(manualBundleParserEvidenceReplay?.summary?.parserEvidenceValidCount === manualBundleParserEvidenceReplay?.summary?.manualBundles, 'manual parserEvidence replay must validate all manual bundles');
assert(manualBundleParserEvidenceReplay?.summary?.routeDecisionInputHashBound === true, 'manual parserEvidence replay must hash-bind routeDecisionInput');
assert(manualBundleParserEvidenceReplay?.summary?.rawContentPersisted === false, 'manual parserEvidence replay must not persist raw content');
assert(manualBundleParserEvidenceReplay?.summary?.capabilityAttempts === 0, 'manual parserEvidence replay must not include capability attempts');
assert(manualBundleParserEvidenceReplay?.summary?.forbiddenEffects === 0, 'manual parserEvidence replay must not include forbidden effects');
assert(manualBundleParserEvidenceReplay?.summary?.humanReviewRequiredForCapture === true, 'manual parserEvidence replay must require human-reviewed capture');
assert(manualBundleParserEvidenceReplay?.summary?.classifierDecisionComputed === false, 'manual parserEvidence replay must not compute classifier decisions');
assert(manualBundleParserEvidenceReplay?.summary?.decisionTraceGenerated === false, 'manual parserEvidence replay must not generate DecisionTrace records');
assert(manualBundleParserEvidenceReplay?.summary?.liveObserverImplemented === false, 'manual parserEvidence replay must not implement live observer');
assert(manualBundleParserEvidenceReplay?.summary?.toolExecutionImplemented === false, 'manual parserEvidence replay must not implement tool execution');
assert(manualBundleParserEvidenceReplay?.summary?.memoryWriteImplemented === false, 'manual parserEvidence replay must not implement memory writes');
assert(manualBundleParserEvidenceReplay?.summary?.configWriteImplemented === false, 'manual parserEvidence replay must not implement config writes');
assert(manualBundleParserEvidenceReplay?.summary?.externalPublicationImplemented === false, 'manual parserEvidence replay must not implement external publication');
assert(manualBundleParserEvidenceReplay?.summary?.enforcementImplemented === false, 'manual parserEvidence replay must not implement enforcement');

const manualDecisionTraceLiveShadowReplay = readJson(path.join(packageRoot, 'evidence/manual-decisiontrace-live-shadow-replay.out.json'));
assert(manualDecisionTraceLiveShadowReplay?.summary?.verdict === 'pass', 'manual DecisionTrace live-shadow replay verdict must be pass');
assert(manualDecisionTraceLiveShadowReplay?.summary?.mode === 'manual_offline_decisiontrace_live_shadow_replay_only', 'manual DecisionTrace live-shadow replay must remain replay-only');
assert(manualDecisionTraceLiveShadowReplay?.summary?.manualBundles === manualDecisionTraceLiveShadowReplay?.summary?.traceCount, 'manual DecisionTrace replay must cover all manual bundles');
assert(manualDecisionTraceLiveShadowReplay?.summary?.traceCount === manualDecisionTraceLiveShadowReplay?.summary?.observationCount, 'manual live-shadow replay must produce one observation per trace');
assert(manualDecisionTraceLiveShadowReplay?.summary?.traceCount === manualDecisionTraceLiveShadowReplay?.summary?.resultCount, 'manual live-shadow replay must produce one result per trace');
assert(manualDecisionTraceLiveShadowReplay?.summary?.validationErrorCount === 0, 'manual DecisionTrace live-shadow replay must validate all records');
assert(manualDecisionTraceLiveShadowReplay?.summary?.mismatchCount === 0, 'manual DecisionTrace live-shadow replay must have zero mismatches');
assert(manualDecisionTraceLiveShadowReplay?.summary?.falsePermitCount === 0, 'manual DecisionTrace live-shadow replay must have zero false permits');
assert(manualDecisionTraceLiveShadowReplay?.summary?.falseCompactCount === 0, 'manual DecisionTrace live-shadow replay must have zero false compacts');
assert(manualDecisionTraceLiveShadowReplay?.summary?.boundaryLossCount === 0, 'manual DecisionTrace live-shadow replay must have zero boundary loss');
assert(manualDecisionTraceLiveShadowReplay?.summary?.forbiddenEffectsDetectedCount === 0, 'manual live-shadow replay must detect zero forbidden effects');
assert(manualDecisionTraceLiveShadowReplay?.summary?.mayBlockCount === 0, 'manual live-shadow replay must not block');
assert(manualDecisionTraceLiveShadowReplay?.summary?.mayAllowCount === 0, 'manual live-shadow replay must not allow');
assert(manualDecisionTraceLiveShadowReplay?.summary?.capabilityTrueCount === 0, 'manual live-shadow replay must keep all capability booleans false');
assert(manualDecisionTraceLiveShadowReplay?.summary?.redactedMetadataOnly === true, 'manual DecisionTrace live-shadow replay must use redacted metadata only');
assert(manualDecisionTraceLiveShadowReplay?.summary?.rawContentPersisted === false, 'manual DecisionTrace live-shadow replay must not persist raw content');
assert(manualDecisionTraceLiveShadowReplay?.summary?.capabilityAttempts === 0, 'manual DecisionTrace live-shadow replay must not include capability attempts');
assert(manualDecisionTraceLiveShadowReplay?.summary?.forbiddenEffects === 0, 'manual DecisionTrace live-shadow replay must not include forbidden effects');
assert(manualDecisionTraceLiveShadowReplay?.summary?.liveObserverImplemented === false, 'manual DecisionTrace live-shadow replay must not implement live observer');
assert(manualDecisionTraceLiveShadowReplay?.summary?.toolExecutionImplemented === false, 'manual DecisionTrace live-shadow replay must not implement tool execution');
assert(manualDecisionTraceLiveShadowReplay?.summary?.memoryWriteImplemented === false, 'manual DecisionTrace live-shadow replay must not implement memory writes');
assert(manualDecisionTraceLiveShadowReplay?.summary?.configWriteImplemented === false, 'manual DecisionTrace live-shadow replay must not implement config writes');
assert(manualDecisionTraceLiveShadowReplay?.summary?.externalPublicationImplemented === false, 'manual DecisionTrace live-shadow replay must not implement external publication');
assert(manualDecisionTraceLiveShadowReplay?.summary?.enforcementImplemented === false, 'manual DecisionTrace live-shadow replay must not implement enforcement');

const reviewLocalCount = countLabel(reviewEvidence.summary.passCommands, reviewEvidence.summary.commands);
const receiverAdapterCount = countLabel(receiverAdapterEvidence.summary.passCases, receiverAdapterEvidence.summary.totalCases);

assertOptionalCountMatches(
  readme,
  /Expected current result:\s*(?<passed>\d+)\/(?<total>\d+) commands pass/,
  reviewLocalCount,
  'README.md',
  'review-local',
);
assertOptionalCountMatches(
  releaseNotes,
  /review-local:\s*pass\s+(?<passed>\d+)\/(?<total>\d+)/,
  reviewLocalCount,
  'RELEASE_NOTES.md',
  'review-local',
);
assertOptionalCountMatches(
  shadowReadme,
  /commands:\s*`(?<passed>\d+)\/(?<total>\d+)` passing/,
  reviewLocalCount,
  'implementation/synaptic-mesh-shadow-v0/README.md',
  'review-local',
);
assertOptionalCountMatches(
  readme,
  /Expected current result:\s*(?<passed>\d+)\/(?<total>\d+) cases pass/,
  receiverAdapterCount,
  'README.md',
  'receiver adapter contracts',
);
assertOptionalCountMatches(
  releaseNotes,
  /receiver adapter contracts:\s*pass\s+(?<passed>\d+)\/(?<total>\d+)/,
  receiverAdapterCount,
  'RELEASE_NOTES.md',
  'receiver adapter contracts',
);

console.log(JSON.stringify({
  status: 'pass',
  currentPublishedRelease: publishedRelease,
  releaseTarget,
  manifestReleaseTarget: manifestReleaseTag,
  packageRoot: path.relative(repoRoot, packageRoot),
  gates: releaseGateScripts,
  boundary: [
    'local_shadow_only',
    'no_runtime_integration',
    'no_tool_execution',
    'no_external_publication',
    'no_production_safety_claim',
  ],
}, null, 2));
