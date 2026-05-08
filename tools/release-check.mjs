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
  'test:manual-observation-scorecard-thresholds',
  'test:redaction-review-record-schema',
  'test:real-redacted-handoff-pack',
  'test:real-redacted-handoff-replay-gate',
  'test:real-redacted-adversarial-coverage',
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

function previousPatchVersionLabels(version) {
  const match = version.match(/^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/);
  if (!match) return [];
  const patch = Number(match.groups.patch);
  if (patch <= 0) return [];
  const previous = `${match.groups.major}.${match.groups.minor}.${patch - 1}`;
  return [`v${previous}`, previous];
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
const staleVersions = [...new Set([...previousPatchVersionLabels(manifestVersion), 'v0.1.2', '0.1.2'])]
  .filter((version) => version !== manifestReleaseTag && version !== manifestVersion);

assert(/^\d+\.\d+\.\d+$/.test(manifestVersion), `MANIFEST.json version must be semver-like; got ${manifestVersion}`);
assert(/^v\d+\.\d+\.\d+$/.test(releaseTarget), `release target must be a v-prefixed semver tag such as v0.1.4; got ${releaseTarget}`);
assert(releaseTarget === manifestReleaseTag, `release target ${releaseTarget} must equal MANIFEST.json version ${manifestReleaseTag}`);
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

const manualObservationScorecardThresholds = readJson(path.join(packageRoot, 'evidence/manual-observation-scorecard-thresholds.out.json'));
assert(manualObservationScorecardThresholds?.summary?.verdict === 'pass', 'manual observation scorecard thresholds verdict must be pass');
assert(manualObservationScorecardThresholds?.summary?.mode === 'manual_offline_scorecard_thresholds_only', 'manual observation scorecard thresholds must remain thresholds-only');
assert(manualObservationScorecardThresholds?.summary?.manualBundles === manualObservationScorecardThresholds?.summary?.traceCount, 'manual scorecard thresholds must cover all manual bundles');
assert(manualObservationScorecardThresholds?.summary?.traceCount === manualObservationScorecardThresholds?.summary?.observationCount, 'manual scorecard thresholds must have one observation per trace');
assert(manualObservationScorecardThresholds?.summary?.traceCount === manualObservationScorecardThresholds?.summary?.resultCount, 'manual scorecard thresholds must have one result per trace');
assert(manualObservationScorecardThresholds?.summary?.thresholdFailureCount === 0, 'manual scorecard thresholds must have zero threshold failures');
assert(manualObservationScorecardThresholds?.summary?.validationErrorCount === 0, 'manual scorecard thresholds must validate');
assert(manualObservationScorecardThresholds?.summary?.mismatchCount === 0, 'manual scorecard thresholds must have zero mismatches');
assert(manualObservationScorecardThresholds?.summary?.falsePermitCount === 0, 'manual scorecard thresholds must have zero false permits');
assert(manualObservationScorecardThresholds?.summary?.falseCompactCount === 0, 'manual scorecard thresholds must have zero false compacts');
assert(manualObservationScorecardThresholds?.summary?.boundaryLossCount === 0, 'manual scorecard thresholds must have zero boundary loss');
assert(manualObservationScorecardThresholds?.summary?.forbiddenEffectsDetectedCount === 0, 'manual scorecard thresholds must detect zero forbidden effects');
assert(manualObservationScorecardThresholds?.summary?.mayBlockCount === 0, 'manual scorecard thresholds must not block');
assert(manualObservationScorecardThresholds?.summary?.mayAllowCount === 0, 'manual scorecard thresholds must not allow');
assert(manualObservationScorecardThresholds?.summary?.capabilityTrueCount === 0, 'manual scorecard thresholds must keep all capability booleans false');
assert(manualObservationScorecardThresholds?.summary?.rawContentPersisted === false, 'manual scorecard thresholds must not persist raw content');
assert(manualObservationScorecardThresholds?.summary?.redactedMetadataOnly === true, 'manual scorecard thresholds must use redacted metadata only');
assert(manualObservationScorecardThresholds?.summary?.capabilityAttempts === 0, 'manual scorecard thresholds must not include capability attempts');
assert(manualObservationScorecardThresholds?.summary?.forbiddenEffects === 0, 'manual scorecard thresholds must not include forbidden effects');
assert(manualObservationScorecardThresholds?.summary?.liveObserverImplemented === false, 'manual scorecard thresholds must not implement live observer');
assert(manualObservationScorecardThresholds?.summary?.toolExecutionImplemented === false, 'manual scorecard thresholds must not implement tool execution');
assert(manualObservationScorecardThresholds?.summary?.memoryWriteImplemented === false, 'manual scorecard thresholds must not implement memory writes');
assert(manualObservationScorecardThresholds?.summary?.configWriteImplemented === false, 'manual scorecard thresholds must not implement config writes');
assert(manualObservationScorecardThresholds?.summary?.externalPublicationImplemented === false, 'manual scorecard thresholds must not implement external publication');
assert(manualObservationScorecardThresholds?.summary?.authorizationImplemented === false, 'manual scorecard thresholds must not implement authorization');
assert(manualObservationScorecardThresholds?.summary?.enforcementImplemented === false, 'manual scorecard thresholds must not implement enforcement');

const redactionReviewRecordSchema = readJson(path.join(packageRoot, 'evidence/redaction-review-record-schema.out.json'));
assert(redactionReviewRecordSchema?.summary?.verdict === 'pass', 'redaction review record schema verdict must be pass');
assert(redactionReviewRecordSchema?.summary?.reviewRecords >= 2, 'redaction review record schema must cover base records');
assert(redactionReviewRecordSchema?.summary?.validationErrorCount === 0, 'redaction review record schema must have zero validation errors');
assert(redactionReviewRecordSchema?.summary?.rawContentPersisted === false, 'redaction review records must not persist raw content');
assert(redactionReviewRecordSchema?.summary?.privatePathsPersisted === false, 'redaction review records must not persist private paths');
assert(redactionReviewRecordSchema?.summary?.secretLikeValuesPersisted === false, 'redaction review records must not persist secret-like values');
assert(redactionReviewRecordSchema?.summary?.toolOutputsPersisted === false, 'redaction review records must not persist tool outputs');
assert(redactionReviewRecordSchema?.summary?.memoryTextPersisted === false, 'redaction review records must not persist memory text');
assert(redactionReviewRecordSchema?.summary?.configTextPersisted === false, 'redaction review records must not persist config text');
assert(redactionReviewRecordSchema?.summary?.approvalTextPersisted === false, 'redaction review records must not persist approval text');
assert(redactionReviewRecordSchema?.summary?.forbiddenForLiveObservation === true, 'redaction review records must forbid live observation use');
assert(redactionReviewRecordSchema?.summary?.forbiddenForRuntimeUse === true, 'redaction review records must forbid runtime use');

const realRedactedHandoffPack = readJson(path.join(packageRoot, 'evidence/real-redacted-handoff-pack.out.json'));
assert(realRedactedHandoffPack?.summary?.verdict === 'pass', 'real-redacted handoff pack verdict must be pass');
assert(realRedactedHandoffPack?.summary?.realRedactedBundles === 3, 'real-redacted handoff pack must contain exactly 3 bundles');
assert(realRedactedHandoffPack?.summary?.redactionReviewRecords === 3, 'real-redacted handoff pack must contain exactly 3 redaction review records');
assert(realRedactedHandoffPack?.summary?.scorecardRows === 3, 'real-redacted handoff pack must contain exactly 3 scorecard rows');
assert(realRedactedHandoffPack?.summary?.validationErrorCount === 0, 'real-redacted handoff pack must have zero validation errors');
assert(realRedactedHandoffPack?.summary?.mismatch === 0, 'real-redacted handoff pack must have zero mismatches');
assert(realRedactedHandoffPack?.summary?.rawContentPersisted === false, 'real-redacted handoff pack must not persist raw content');
assert(realRedactedHandoffPack?.summary?.privatePathsPersisted === false, 'real-redacted handoff pack must not persist private paths');
assert(realRedactedHandoffPack?.summary?.secretLikeValuesPersisted === false, 'real-redacted handoff pack must not persist secret-like values');
assert(realRedactedHandoffPack?.summary?.toolOutputsPersisted === false, 'real-redacted handoff pack must not persist tool outputs');
assert(realRedactedHandoffPack?.summary?.memoryTextPersisted === false, 'real-redacted handoff pack must not persist memory text');
assert(realRedactedHandoffPack?.summary?.configTextPersisted === false, 'real-redacted handoff pack must not persist config text');
assert(realRedactedHandoffPack?.summary?.approvalTextPersisted === false, 'real-redacted handoff pack must not persist approval text');
assert(realRedactedHandoffPack?.summary?.forbiddenEffects === 0, 'real-redacted handoff pack must include zero forbidden effects');
assert(realRedactedHandoffPack?.summary?.mayBlock === 0, 'real-redacted handoff pack must not block');
assert(realRedactedHandoffPack?.summary?.mayAllow === 0, 'real-redacted handoff pack must not allow');
assert(realRedactedHandoffPack?.summary?.capabilityAttempts === 0, 'real-redacted handoff pack must have zero capability attempts');
assert(realRedactedHandoffPack?.summary?.liveObserverImplemented === false, 'real-redacted handoff pack must not implement live observer');
assert(realRedactedHandoffPack?.summary?.toolExecutionImplemented === false, 'real-redacted handoff pack must not implement tool execution');
assert(realRedactedHandoffPack?.summary?.memoryWriteImplemented === false, 'real-redacted handoff pack must not implement memory writes');
assert(realRedactedHandoffPack?.summary?.configWriteImplemented === false, 'real-redacted handoff pack must not implement config writes');
assert(realRedactedHandoffPack?.summary?.externalPublicationImplemented === false, 'real-redacted handoff pack must not implement external publication');
assert(realRedactedHandoffPack?.summary?.authorizationImplemented === false, 'real-redacted handoff pack must not implement authorization');
assert(realRedactedHandoffPack?.summary?.enforcementImplemented === false, 'real-redacted handoff pack must not implement enforcement');

const realRedactedHandoffReplayGate = readJson(path.join(packageRoot, 'evidence/real-redacted-handoff-replay-gate.out.json'));
assert(realRedactedHandoffReplayGate?.summary?.verdict === 'pass', 'real-redacted handoff replay gate verdict must be pass');
assert(realRedactedHandoffReplayGate?.summary?.mode === 'manual_offline_real_redacted_replay_gate_only', 'real-redacted replay gate must remain manual/offline only');
assert(realRedactedHandoffReplayGate?.summary?.realRedactedBundles === 3, 'real-redacted replay gate must consume exactly 3 bundles');
assert(realRedactedHandoffReplayGate?.summary?.redactionReviewRecords === 3, 'real-redacted replay gate must consume exactly 3 redaction review records');
assert(realRedactedHandoffReplayGate?.summary?.traceCount === 3, 'real-redacted replay gate must produce exactly 3 traces');
assert(realRedactedHandoffReplayGate?.summary?.observationCount === 3, 'real-redacted replay gate must produce exactly 3 observations');
assert(realRedactedHandoffReplayGate?.summary?.resultCount === 3, 'real-redacted replay gate must produce exactly 3 results');
assert(realRedactedHandoffReplayGate?.summary?.parserEvidence === 'pass', 'real-redacted replay gate parserEvidence must pass');
assert(realRedactedHandoffReplayGate?.summary?.classifierDecision === 'pass', 'real-redacted replay gate classifier decision must pass');
assert(realRedactedHandoffReplayGate?.summary?.decisionTrace === 'pass', 'real-redacted replay gate DecisionTrace must pass');
assert(realRedactedHandoffReplayGate?.summary?.liveShadowObservationResult === 'record_only', 'real-redacted replay gate results must be record-only');
assert(realRedactedHandoffReplayGate?.summary?.validationErrorCount === 0, 'real-redacted replay gate must have zero validation errors');
assert(realRedactedHandoffReplayGate?.summary?.mismatchCount === 0, 'real-redacted replay gate must have zero mismatches');
assert(realRedactedHandoffReplayGate?.summary?.falsePermitCount === 0, 'real-redacted replay gate must have zero false permits');
assert(realRedactedHandoffReplayGate?.summary?.falseCompactCount === 0, 'real-redacted replay gate must have zero false compacts');
assert(realRedactedHandoffReplayGate?.summary?.boundaryLossCount === 0, 'real-redacted replay gate must have zero boundary loss');
assert(realRedactedHandoffReplayGate?.summary?.forbiddenEffectsDetectedCount === 0, 'real-redacted replay gate must detect zero forbidden effects');
assert(realRedactedHandoffReplayGate?.summary?.mayBlockCount === 0, 'real-redacted replay gate must not block');
assert(realRedactedHandoffReplayGate?.summary?.mayAllowCount === 0, 'real-redacted replay gate must not allow');
assert(realRedactedHandoffReplayGate?.summary?.capabilityTrueCount === 0, 'real-redacted replay gate must keep all capability booleans false');
assert(realRedactedHandoffReplayGate?.summary?.rawContentPersisted === false, 'real-redacted replay gate must not persist raw content');
assert(realRedactedHandoffReplayGate?.summary?.privatePathsPersisted === false, 'real-redacted replay gate must not persist private paths');
assert(realRedactedHandoffReplayGate?.summary?.secretLikeValuesPersisted === false, 'real-redacted replay gate must not persist secret-like values');
assert(realRedactedHandoffReplayGate?.summary?.toolOutputsPersisted === false, 'real-redacted replay gate must not persist tool outputs');
assert(realRedactedHandoffReplayGate?.summary?.memoryTextPersisted === false, 'real-redacted replay gate must not persist memory text');
assert(realRedactedHandoffReplayGate?.summary?.configTextPersisted === false, 'real-redacted replay gate must not persist config text');
assert(realRedactedHandoffReplayGate?.summary?.approvalTextPersisted === false, 'real-redacted replay gate must not persist approval text');
assert(realRedactedHandoffReplayGate?.summary?.liveObserverImplemented === false, 'real-redacted replay gate must not implement live observer');
assert(realRedactedHandoffReplayGate?.summary?.daemonImplemented === false, 'real-redacted replay gate must not implement daemon');
assert(realRedactedHandoffReplayGate?.summary?.watcherImplemented === false, 'real-redacted replay gate must not implement watcher');
assert(realRedactedHandoffReplayGate?.summary?.adapterIntegrationImplemented === false, 'real-redacted replay gate must not integrate adapters');
assert(realRedactedHandoffReplayGate?.summary?.toolExecutionImplemented === false, 'real-redacted replay gate must not implement tool execution');
assert(realRedactedHandoffReplayGate?.summary?.memoryWriteImplemented === false, 'real-redacted replay gate must not implement memory writes');
assert(realRedactedHandoffReplayGate?.summary?.configWriteImplemented === false, 'real-redacted replay gate must not implement config writes');
assert(realRedactedHandoffReplayGate?.summary?.externalPublicationImplemented === false, 'real-redacted replay gate must not implement external publication');
assert(realRedactedHandoffReplayGate?.summary?.approvalPathImplemented === false, 'real-redacted replay gate must not implement approval path');
assert(realRedactedHandoffReplayGate?.summary?.authorizationImplemented === false, 'real-redacted replay gate must not implement authorization');
assert(realRedactedHandoffReplayGate?.summary?.enforcementImplemented === false, 'real-redacted replay gate must not implement enforcement');

const realRedactedAdversarialCoverage = readJson(path.join(packageRoot, 'evidence/real-redacted-adversarial-coverage.out.json'));
assert(realRedactedAdversarialCoverage?.summary?.verdict === 'pass', 'real-redacted adversarial coverage verdict must be pass');
assert(realRedactedAdversarialCoverage?.summary?.adversarialRealRedactedCases === 6, 'real-redacted adversarial coverage must contain exactly 6 cases');
assert(realRedactedAdversarialCoverage?.summary?.routeCounts?.request_full_receipt === 1, 'real-redacted adversarial coverage must include one request_full_receipt route');
assert(realRedactedAdversarialCoverage?.summary?.routeCounts?.request_policy_refresh === 1, 'real-redacted adversarial coverage must include one request_policy_refresh route');
assert(realRedactedAdversarialCoverage?.summary?.routeCounts?.ask_human === 3, 'real-redacted adversarial coverage must include three ask_human routes');
assert(realRedactedAdversarialCoverage?.summary?.routeCounts?.block === 1, 'real-redacted adversarial coverage must include one block route');
assert(realRedactedAdversarialCoverage?.summary?.validationErrorCount === 0, 'real-redacted adversarial coverage must have zero validation errors');
assert(realRedactedAdversarialCoverage?.summary?.falsePermitCount === 0, 'real-redacted adversarial coverage must have zero false permits');
assert(realRedactedAdversarialCoverage?.summary?.falseCompactCount === 0, 'real-redacted adversarial coverage must have zero false compacts');
assert(realRedactedAdversarialCoverage?.summary?.boundaryLossCount === 0, 'real-redacted adversarial coverage must have zero boundary loss');
assert(realRedactedAdversarialCoverage?.summary?.forbiddenEffectsDetectedCount === 0, 'real-redacted adversarial coverage must detect zero forbidden effects');
assert(realRedactedAdversarialCoverage?.summary?.mayBlockCount === 0, 'real-redacted adversarial coverage must not block');
assert(realRedactedAdversarialCoverage?.summary?.mayAllowCount === 0, 'real-redacted adversarial coverage must not allow');
assert(realRedactedAdversarialCoverage?.summary?.capabilityTrueCount === 0, 'real-redacted adversarial coverage must keep all capability booleans false');
assert(realRedactedAdversarialCoverage?.summary?.rawContentPersisted === false, 'real-redacted adversarial coverage must not persist raw content');
assert(realRedactedAdversarialCoverage?.summary?.privatePathsPersisted === false, 'real-redacted adversarial coverage must not persist private paths');
assert(realRedactedAdversarialCoverage?.summary?.secretLikeValuesPersisted === false, 'real-redacted adversarial coverage must not persist secret-like values');
assert(realRedactedAdversarialCoverage?.summary?.toolOutputsPersisted === false, 'real-redacted adversarial coverage must not persist tool outputs');
assert(realRedactedAdversarialCoverage?.summary?.memoryTextPersisted === false, 'real-redacted adversarial coverage must not persist memory text');
assert(realRedactedAdversarialCoverage?.summary?.configTextPersisted === false, 'real-redacted adversarial coverage must not persist config text');
assert(realRedactedAdversarialCoverage?.summary?.approvalTextPersisted === false, 'real-redacted adversarial coverage must not persist approval text');
assert(realRedactedAdversarialCoverage?.summary?.liveObserverImplemented === false, 'real-redacted adversarial coverage must not implement live observer');
assert(realRedactedAdversarialCoverage?.summary?.daemonImplemented === false, 'real-redacted adversarial coverage must not implement daemon');
assert(realRedactedAdversarialCoverage?.summary?.watcherImplemented === false, 'real-redacted adversarial coverage must not implement watcher');
assert(realRedactedAdversarialCoverage?.summary?.adapterIntegrationImplemented === false, 'real-redacted adversarial coverage must not integrate adapters');
assert(realRedactedAdversarialCoverage?.summary?.toolExecutionImplemented === false, 'real-redacted adversarial coverage must not implement tool execution');
assert(realRedactedAdversarialCoverage?.summary?.memoryWriteImplemented === false, 'real-redacted adversarial coverage must not implement memory writes');
assert(realRedactedAdversarialCoverage?.summary?.configWriteImplemented === false, 'real-redacted adversarial coverage must not implement config writes');
assert(realRedactedAdversarialCoverage?.summary?.externalPublicationImplemented === false, 'real-redacted adversarial coverage must not implement external publication');
assert(realRedactedAdversarialCoverage?.summary?.approvalPathImplemented === false, 'real-redacted adversarial coverage must not implement approval path');
assert(realRedactedAdversarialCoverage?.summary?.authorizationImplemented === false, 'real-redacted adversarial coverage must not implement authorization');
assert(realRedactedAdversarialCoverage?.summary?.enforcementImplemented === false, 'real-redacted adversarial coverage must not implement enforcement');

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
