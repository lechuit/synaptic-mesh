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
  'test:live-input-source-boundary-contracts',
  'test:passive-live-shadow-canary',
  'test:passive-live-shadow-canary-reproducibility',
  'test:passive-live-shadow-canary-source-boundary-stress',
  'test:passive-live-shadow-canary-source-boundary-expansion',
  'test:passive-live-shadow-canary-drift-scorecard',
  'test:passive-live-shadow-canary-expanded-pack',
  'test:passive-live-shadow-canary-advisory-report',
  'test:passive-live-shadow-canary-advisory-unicode-bidi-guard',
  'test:passive-live-shadow-canary-advisory-report-failure-catalog',
  'test:passive-live-shadow-canary-advisory-report-reproducibility',
  'test:live-shadow-synthetic-replay',
  'test:live-shadow-drift-scorecard',
  'test:manual-observation-bundle-schema',
  'test:manual-observation-redaction-fixtures',
  'test:manual-bundle-parser-evidence-replay',
  'test:manual-decisiontrace-live-shadow-replay',
  'test:manual-observation-scorecard-thresholds',
  'test:redaction-policy-schema',
  'test:redaction-scanner-minimal',
  'test:retention-policy-schema',
  'test:retention-negative-controls',
  'test:redaction-retention-executable-gates',
  'test:decision-counterfactual-checklist',
  'test:decision-counterfactual-reproducibility',
  'test:decision-counterfactual-failure-catalog',
  'test:redaction-review-record-schema',
  'test:real-redacted-handoff-pack',
  'test:real-redacted-handoff-replay-gate',
  'test:real-redacted-adversarial-coverage',
  'test:manual-dry-run-contracts',
  'test:manual-dry-run-cli',
  'test:manual-dry-run-cli-negative-controls',
  'test:manual-dry-run-cli-real-redacted-handoffs',
  'test:manual-dry-run-cli-real-redacted-pilot',
  'test:manual-dry-run-cli-pilot-failure-catalog',
  'test:manual-dry-run-cli-real-redacted-pilot-expanded',
  'test:manual-dry-run-cli-pilot-reproducibility',
  'test:manual-dry-run-cli-pilot-reproducibility-negative-controls',
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
  const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tokenPattern = new RegExp(`(?<![A-Za-z0-9.])${escaped}(?![A-Za-z0-9.])`);
  assert(!tokenPattern.test(text), `${label} must not include stale ${JSON.stringify(forbidden)}`);
}

function countLabel(passed, total) {
  return `${passed}/${total}`;
}

function previousPatchVersionLabels(version) {
  const match = version.match(/^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-[0-9A-Za-z.-]+)?$/);
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

function tagCommit(tag) {
  try {
    return execFileSync('git', ['rev-parse', '--verify', `${tag}^{commit}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
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
const filesManifest = readJson(path.join(repoRoot, 'MANIFEST.files.json'));
const manifestFilePaths = new Set((filesManifest.files ?? []).map((file) => file.path));
const packageJson = readJson(path.join(packageRoot, 'package.json'));
const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
const releaseNotes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
const releaseChecklist = readFileSync(path.join(repoRoot, 'docs/release-checklist.md'), 'utf8');
const shadowReadme = readFileSync(path.join(packageRoot, 'README.md'), 'utf8');

const manifestVersion = manifest.version;
const manifestReleaseTag = `v${manifestVersion}`;
const releaseTarget = args.target ?? manifestReleaseTag;
const publishedRelease = currentPublishedRelease();
const releaseTargetCommit = tagCommit(releaseTarget);
const headCommit = runGit(['rev-parse', 'HEAD']);
const staleVersions = [...new Set([...previousPatchVersionLabels(manifestVersion), 'v0.1.2', '0.1.2'])]
  .filter((version) => version !== manifestReleaseTag && version !== manifestVersion);

assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifestVersion), `MANIFEST.json version must be semver-like, optionally with prerelease suffix; got ${manifestVersion}`);
assert(/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(releaseTarget), `release target must be a v-prefixed semver/prerelease tag such as v0.2.0-alpha; got ${releaseTarget}`);
assert(releaseTarget === manifestReleaseTag, `release target ${releaseTarget} must equal MANIFEST.json version ${manifestReleaseTag}`);
if (!args.target) {
  console.warn(`release:check defaulting --target to MANIFEST.json version ${manifestReleaseTag}; pass -- --target vX.Y.Z[-prerelease] for release/tag verification.`);
}
assert(
  !releaseTargetCommit || releaseTargetCommit === headCommit,
  `release target ${releaseTarget} already exists at ${releaseTargetCommit}; current HEAD ${headCommit} differs. Do not add new release-candidate evidence to an already-published target; use the next unreleased version, or check out the exact tagged commit for post-release verification.`,
);
assert(packageJson.private === true, 'shadow package must remain private for release checks');
assert(packageJson.version === '0.0.0-local', 'shadow package version must remain 0.0.0-local unless publication scope changes');
assert(packageJson.scripts?.['release:check'] === 'node ../../tools/release-check.mjs', 'package.json must wire npm run release:check to ../../tools/release-check.mjs');
if (manifestReleaseTag === 'v0.3.3') {
  assertIncludes(manifest.reproducibility, 'advisory_report_reproducibility', 'MANIFEST.json reproducibility');
  assertIncludes(manifest.reproducibility, 'runs_2', 'MANIFEST.json reproducibility');
  assertIncludes(manifest.reproducibility, 'mismatches_0', 'MANIFEST.json reproducibility');
  assertIncludes(manifest.reproducibility, 'expected_rejects_6', 'MANIFEST.json reproducibility');
  assertNotIncludes(manifest.reproducibility, 'expected_rejects_10', 'MANIFEST.json reproducibility');
  assertNotIncludes(manifest.reproducibility, 'expected_rejects_12', 'MANIFEST.json reproducibility');
}

assertIncludes(readme, `# Synaptic Mesh ${manifestReleaseTag}`, 'README.md');
assertIncludes(readme, `public review release \`${manifestReleaseTag}\``, 'README.md');
assertIncludes(readme, `Current ${manifestReleaseTag} status is narrower`, 'README.md');
assertIncludes(releaseNotes, `# Release Notes — Synaptic Mesh ${manifestReleaseTag}`, 'RELEASE_NOTES.md');
assertIncludes(releaseChecklist, 'npm run release:check', 'docs/release-checklist.md');
assertIncludes(releaseChecklist, 'no runtime integration', 'docs/release-checklist.md');
assertIncludes(releaseChecklist, 'no production, canary, enforcement, or safety-certification claims', 'docs/release-checklist.md');

for (const staleVersion of staleVersions) {
  assertNotIncludes(readme, staleVersion, 'README.md');
}

for (const requiredManifestPath of [
  'docs/status-v0.3.3.md',
  'docs/status-v0.3.2.md',
  'docs/status-v0.3.1.md',
  'docs/status-v0.3.0-alpha.md',
  'docs/status-v0.2.6.md',
  'docs/status-v0.2.5.md',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-expanded-pack.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-expanded-pack.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-expanded-pack.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-source-boundary-expansion.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-source-boundary-expansion.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-expansion.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-report.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.md',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-unicode-bidi-guard.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-unicode-bidi-guard.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-report-failure-catalog.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-report-failure-catalog.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-report-reproducibility.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-report-reproducibility.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report-reproducibility.out.json',
]) {
  assert(manifestFilePaths.has(requiredManifestPath), `MANIFEST.files.json must include ${requiredManifestPath}`);
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

const passiveLiveShadowCanary = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary.out.json'));
const passiveCanaryReproducibility = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-reproducibility.out.json'));
const passiveCanarySourceBoundaryStress = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-source-boundary-stress.out.json'));
const passiveCanarySourceBoundaryExpansion = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-source-boundary-expansion.out.json'));
const passiveCanaryDriftScorecard = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-drift-scorecard.out.json'));
const passiveCanaryExpandedPack = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-expanded-pack.out.json'));
const passiveCanaryAdvisoryReport = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.json'));
const passiveCanaryAdvisoryReportText = readFileSync(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.md'), 'utf8');
const passiveCanaryAdvisoryUnicodeBidiGuard = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json'));
const passiveCanaryAdvisoryReportFailureCatalog = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json'));
const passiveCanaryAdvisoryReportReproducibility = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-reproducibility.out.json'));
const liveInputSourceBoundaryContracts = readJson(path.join(packageRoot, 'evidence/live-input-source-boundary-contracts.out.json'));
assert(liveInputSourceBoundaryContracts?.summary?.verdict === 'pass', 'live input/source boundary contracts verdict must be pass');
assert(liveInputSourceBoundaryContracts?.summary?.passCases === 2, 'live input/source boundary contracts must keep 2 positive controls');
assert(liveInputSourceBoundaryContracts?.summary?.expectedRejects === 9, 'live input/source boundary contracts must keep 9 expected rejects');
assert(liveInputSourceBoundaryContracts?.summary?.unexpectedPasses === 0, 'live input/source boundary contracts must have zero unexpected passes');
assert(liveInputSourceBoundaryContracts?.summary?.unexpectedRejects === 0, 'live input/source boundary contracts must have zero unexpected rejects');
for (const reasonCode of ['LIVE_INPUT_SOURCE_KIND_FORBIDDEN', 'LIVE_INPUT_ALREADY_REDACTED_REQUIRED', 'LIVE_INPUT_RAW_PERSISTENCE_FORBIDDEN', 'SOURCE_DIGEST_REQUIRED', 'SOURCE_MTIME_REQUIRED', 'LIVE_OUTPUT_RECORD_ONLY_REQUIRED', 'FORBIDDEN_EFFECT_TUPLE_INCOMPLETE', 'LIVE_OBSERVER_FORBIDDEN', 'RUNTIME_INTEGRATION_FORBIDDEN', 'DAEMON_FORBIDDEN', 'WATCHER_FORBIDDEN', 'PUBLICATION_AUTOMATION_FORBIDDEN', 'DELETION_FORBIDDEN', 'RETENTION_SCHEDULER_FORBIDDEN']) {
  assert(liveInputSourceBoundaryContracts?.summary?.coveredReasonCodes?.includes(reasonCode), `live input/source boundary contracts must cover ${reasonCode}`);
}
assert(liveInputSourceBoundaryContracts?.summary?.liveInputRead === false, 'live input/source boundary contracts must not read live input');
assert(liveInputSourceBoundaryContracts?.summary?.rawInputPersisted === false, 'live input/source boundary contracts must not persist raw input');
assert(liveInputSourceBoundaryContracts?.summary?.liveObserverImplemented === false, 'live input/source boundary contracts must not implement live observer');
assert(liveInputSourceBoundaryContracts?.summary?.runtimeIntegrationImplemented === false, 'live input/source boundary contracts must not implement runtime integration');
assert(liveInputSourceBoundaryContracts?.summary?.daemonImplemented === false, 'live input/source boundary contracts must not implement daemon');
assert(liveInputSourceBoundaryContracts?.summary?.watcherImplemented === false, 'live input/source boundary contracts must not implement watcher');
assert(liveInputSourceBoundaryContracts?.summary?.adapterIntegrationImplemented === false, 'live input/source boundary contracts must not implement adapter integration');
assert(liveInputSourceBoundaryContracts?.summary?.toolExecutionImplemented === false, 'live input/source boundary contracts must not implement tool execution');
assert(liveInputSourceBoundaryContracts?.summary?.memoryWriteImplemented === false, 'live input/source boundary contracts must not implement memory writes');
assert(liveInputSourceBoundaryContracts?.summary?.configWriteImplemented === false, 'live input/source boundary contracts must not implement config writes');
assert(liveInputSourceBoundaryContracts?.summary?.externalPublicationImplemented === false, 'live input/source boundary contracts must not implement external publication');
assert(liveInputSourceBoundaryContracts?.summary?.publicationAutomationImplemented === false, 'live input/source boundary contracts must not implement publication automation');
assert(liveInputSourceBoundaryContracts?.summary?.approvalPathImplemented === false, 'live input/source boundary contracts must not implement approval paths');
assert(liveInputSourceBoundaryContracts?.summary?.blockingImplemented === false, 'live input/source boundary contracts must not implement blocking');
assert(liveInputSourceBoundaryContracts?.summary?.allowingImplemented === false, 'live input/source boundary contracts must not implement allowing');
assert(liveInputSourceBoundaryContracts?.summary?.authorizationImplemented === false, 'live input/source boundary contracts must not implement authorization');
assert(liveInputSourceBoundaryContracts?.summary?.deletionImplemented === false, 'live input/source boundary contracts must not implement deletion');
assert(liveInputSourceBoundaryContracts?.summary?.retentionSchedulerImplemented === false, 'live input/source boundary contracts must not implement retention scheduling');
assert(liveInputSourceBoundaryContracts?.summary?.enforcementImplemented === false, 'live input/source boundary contracts must not implement enforcement');

assert(passiveLiveShadowCanary?.summary?.verdict === 'pass', 'passive live-shadow canary verdict must be pass');
assert(passiveLiveShadowCanary?.summary?.releaseLayer === 'v0.2.3', 'passive live-shadow canary release layer must remain v0.2.3 baseline evidence');
assert(passiveLiveShadowCanary?.summary?.dependsOn === 'v0.1.22-passive-live-shadow-simulator', 'passive canary must depend on v0.1.22 simulator layer');
assert(passiveLiveShadowCanary?.summary?.manual === true, 'passive canary must be manual');
assert(passiveLiveShadowCanary?.summary?.local === true, 'passive canary must be local');
assert(passiveLiveShadowCanary?.summary?.optInRequired === true, 'passive canary must require opt-in');
assert(passiveLiveShadowCanary?.summary?.recordOnly === true, 'passive canary must be record-only');
assert(passiveLiveShadowCanary?.summary?.noEffects === true, 'passive canary must be no-effects');
assert(passiveLiveShadowCanary?.summary?.unexpectedAccepts === 0, 'passive canary must have zero unexpected accepts');
assert(passiveLiveShadowCanary?.summary?.unexpectedRejects === 0, 'passive canary must have zero unexpected rejects');
assert(passiveLiveShadowCanary?.summary?.passCapabilityTrueCount === 0, 'passive canary pass cases must keep capability booleans false');
assert(passiveLiveShadowCanary?.summary?.liveTrafficRead === false, 'passive canary must not read live traffic');
assert(passiveLiveShadowCanary?.summary?.rawInputPersisted === false, 'passive canary must not persist raw input');
assert(passiveLiveShadowCanary?.summary?.publicationAutomationImplemented === false, 'passive canary must not automate publication');
assert(passiveLiveShadowCanary?.summary?.agentInstructionWriteImplemented === false, 'passive canary must not write agent instructions');
assert(passiveLiveShadowCanary?.summary?.runtimeIntegrated === false, 'passive canary must not integrate runtime');
assert(passiveLiveShadowCanary?.summary?.daemonImplemented === false, 'passive canary must not implement daemon');
assert(passiveLiveShadowCanary?.summary?.watcherImplemented === false, 'passive canary must not implement watcher');
assert(passiveLiveShadowCanary?.summary?.toolExecutionImplemented === false, 'passive canary must not execute tools');
assert(passiveLiveShadowCanary?.summary?.memoryWriteImplemented === false, 'passive canary must not write memory');
assert(passiveLiveShadowCanary?.summary?.configWriteImplemented === false, 'passive canary must not write config');
assert(passiveLiveShadowCanary?.summary?.externalPublicationImplemented === false, 'passive canary must not publish externally');
assert(passiveLiveShadowCanary?.summary?.approvalPathImplemented === false, 'passive canary must not enter approval path');
assert(passiveLiveShadowCanary?.summary?.blockingImplemented === false, 'passive canary must not block');
assert(passiveLiveShadowCanary?.summary?.allowingImplemented === false, 'passive canary must not allow');
assert(passiveLiveShadowCanary?.summary?.authorizationImplemented === false, 'passive canary must not authorize');
assert(passiveLiveShadowCanary?.summary?.deletionImplemented === false, 'passive canary must not delete');
assert(passiveLiveShadowCanary?.summary?.retentionSchedulerImplemented === false, 'passive canary must not implement retention scheduler');
assert(passiveLiveShadowCanary?.summary?.enforcementImplemented === false, 'passive canary must not enforce');

assert(passiveCanaryReproducibility?.passiveCanaryReproducibility === 'pass', 'passive canary reproducibility verdict must be pass');
assert(passiveCanaryReproducibility?.runs === 2, 'passive canary reproducibility must run twice');
assert(passiveCanaryReproducibility?.passCases === 2, 'passive canary reproducibility must cover 2 pass cases');
assert(passiveCanaryReproducibility?.rejectCases === 8, 'passive canary reproducibility must cover 8 reject cases');
assert(passiveCanaryReproducibility?.normalizedOutputMismatches === 0, 'passive canary reproducibility must have zero normalized output mismatches');
assert(passiveCanaryReproducibility?.reasonSetMismatches === 0, 'passive canary reproducibility must have zero reason-set mismatches');
assert(passiveCanaryReproducibility?.scorecardMismatches === 0, 'passive canary reproducibility must have zero scorecard mismatches');
assert(passiveCanaryReproducibility?.boundaryVerdictMismatches === 0, 'passive canary reproducibility must have zero boundary verdict mismatches');
assert(passiveCanaryReproducibility?.capabilityTrueCount === 0, 'passive canary reproducibility pass cases must keep capability true count zero');
assert(passiveCanaryReproducibility?.forbiddenEffects === 0, 'passive canary reproducibility pass cases must keep forbidden effects zero');

assert(passiveCanarySourceBoundaryStress?.summary?.verdict === 'pass', 'passive canary source-boundary stress verdict must be pass');
assert(passiveCanarySourceBoundaryStress?.summary?.releaseLayer === 'v0.2.3', 'passive canary source-boundary stress release layer must remain v0.2.3 baseline evidence');
assert(passiveCanarySourceBoundaryStress?.summary?.passCases === 1, 'passive canary source-boundary stress must keep 1 positive control');
assert(passiveCanarySourceBoundaryStress?.summary?.rejectCases === 5, 'passive canary source-boundary stress must keep 5 expected rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.unexpectedAccepts === 0, 'passive canary source-boundary stress must have zero unexpected accepts');
assert(passiveCanarySourceBoundaryStress?.summary?.unexpectedRejects === 0, 'passive canary source-boundary stress must have zero unexpected rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.malformedSourceTupleRejects >= 1, 'passive canary source-boundary stress must cover malformed source tuple rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.staleDigestRejects >= 1, 'passive canary source-boundary stress must cover stale digest rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.missingMtimeRejects >= 1, 'passive canary source-boundary stress must cover missing mtime rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.wrongLaneRejects >= 1, 'passive canary source-boundary stress must cover wrong source lane rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.outputContainmentRejects >= 1, 'passive canary source-boundary stress must cover output containment rejects');
assert(passiveCanarySourceBoundaryStress?.summary?.passCapabilityTrueCount === 0, 'passive canary source-boundary stress pass cases must keep capability true count zero');
assert(passiveCanarySourceBoundaryStress?.summary?.recordOnly === true, 'passive canary source-boundary stress must remain record-only');
assert(passiveCanarySourceBoundaryStress?.summary?.noEffects === true, 'passive canary source-boundary stress must remain no-effects');
assert(passiveCanarySourceBoundaryStress?.summary?.runtimeIntegrated === false, 'passive canary source-boundary stress must not integrate runtime');
assert(passiveCanarySourceBoundaryStress?.summary?.toolExecutionImplemented === false, 'passive canary source-boundary stress must not execute tools');
assert(passiveCanarySourceBoundaryStress?.summary?.memoryWriteImplemented === false, 'passive canary source-boundary stress must not write memory');
assert(passiveCanarySourceBoundaryStress?.summary?.configWriteImplemented === false, 'passive canary source-boundary stress must not write config');
assert(passiveCanarySourceBoundaryStress?.summary?.externalPublicationImplemented === false, 'passive canary source-boundary stress must not publish externally');
assert(passiveCanarySourceBoundaryStress?.summary?.approvalPathImplemented === false, 'passive canary source-boundary stress must not enter approval path');
assert(passiveCanarySourceBoundaryStress?.summary?.blockingImplemented === false, 'passive canary source-boundary stress must not block');
assert(passiveCanarySourceBoundaryStress?.summary?.allowingImplemented === false, 'passive canary source-boundary stress must not allow');
assert(passiveCanarySourceBoundaryStress?.summary?.authorizationImplemented === false, 'passive canary source-boundary stress must not authorize');
assert(passiveCanarySourceBoundaryStress?.summary?.enforcementImplemented === false, 'passive canary source-boundary stress must not enforce');
assert(passiveCanarySourceBoundaryStress?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary source-boundary stress must not be consumed automatically by agents');

assert(passiveCanarySourceBoundaryExpansion?.summary?.verdict === 'pass', 'passive canary source-boundary expansion verdict must be pass');
assert(passiveCanarySourceBoundaryExpansion?.summary?.releaseLayer === 'v0.2.6', 'passive canary source-boundary expansion release layer must remain v0.2.6 baseline evidence');
assert(passiveCanarySourceBoundaryExpansion?.summary?.dependsOn === 'v0.2.5-expanded-passive-canary-pack', 'passive canary source-boundary expansion must depend on v0.2.5 expanded pack');
assert(passiveCanarySourceBoundaryExpansion?.summary?.mode === 'manual_local_opt_in_passive_record_only_source_boundary_expansion', 'passive canary source-boundary expansion mode must remain record-only');
assert(passiveCanarySourceBoundaryExpansion?.summary?.targetCoverageCount === 11, 'passive canary source-boundary expansion must track 11 target coverage labels');
assert(passiveCanarySourceBoundaryExpansion?.summary?.coveredTargetCoverageCount === 11, 'passive canary source-boundary expansion must cover all target labels');
assert(passiveCanarySourceBoundaryExpansion?.summary?.unexpectedAccepts === 0, 'passive canary source-boundary expansion must have zero unexpected accepts');
assert(passiveCanarySourceBoundaryExpansion?.summary?.unexpectedRejects === 0, 'passive canary source-boundary expansion must have zero unexpected rejects');
assert(passiveCanarySourceBoundaryExpansion?.summary?.passCapabilityTrueCount === 0, 'passive canary source-boundary expansion pass rows must keep capability true count zero');
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
  assert(passiveCanarySourceBoundaryExpansion?.summary?.[field] >= 1, `passive canary source-boundary expansion must cover ${label}`);
}
assert(passiveCanarySourceBoundaryExpansion?.summary?.manual === true, 'passive canary source-boundary expansion must be manual');
assert(passiveCanarySourceBoundaryExpansion?.summary?.local === true, 'passive canary source-boundary expansion must be local');
assert(passiveCanarySourceBoundaryExpansion?.summary?.optInRequired === true, 'passive canary source-boundary expansion must require opt-in');
assert(passiveCanarySourceBoundaryExpansion?.summary?.alreadyRedactedOnly === true, 'passive canary source-boundary expansion must remain already-redacted only');
assert(passiveCanarySourceBoundaryExpansion?.summary?.recordOnly === true, 'passive canary source-boundary expansion must be record-only');
assert(passiveCanarySourceBoundaryExpansion?.summary?.noEffects === true, 'passive canary source-boundary expansion must be no-effects');
assert(passiveCanarySourceBoundaryExpansion?.summary?.readsLiveTraffic === false, 'passive canary source-boundary expansion must not read live traffic');
assert(passiveCanarySourceBoundaryExpansion?.summary?.followsSourceSymlinkForAuthority === false, 'passive canary source-boundary expansion must not follow source symlinks for authority');
assert(passiveCanarySourceBoundaryExpansion?.summary?.followsOutputSymlinkForAuthority === false, 'passive canary source-boundary expansion must not follow output symlinks for authority');
assert(passiveCanarySourceBoundaryExpansion?.summary?.runtimeIntegrated === false, 'passive canary source-boundary expansion must not integrate runtime');
assert(passiveCanarySourceBoundaryExpansion?.summary?.toolExecutionImplemented === false, 'passive canary source-boundary expansion must not execute tools');
assert(passiveCanarySourceBoundaryExpansion?.summary?.memoryWriteImplemented === false, 'passive canary source-boundary expansion must not write memory');
assert(passiveCanarySourceBoundaryExpansion?.summary?.configWriteImplemented === false, 'passive canary source-boundary expansion must not write config');
assert(passiveCanarySourceBoundaryExpansion?.summary?.externalPublicationImplemented === false, 'passive canary source-boundary expansion must not publish externally');
assert(passiveCanarySourceBoundaryExpansion?.summary?.approvalPathImplemented === false, 'passive canary source-boundary expansion must not enter approval path');
assert(passiveCanarySourceBoundaryExpansion?.summary?.blockingImplemented === false, 'passive canary source-boundary expansion must not block');
assert(passiveCanarySourceBoundaryExpansion?.summary?.allowingImplemented === false, 'passive canary source-boundary expansion must not allow');
assert(passiveCanarySourceBoundaryExpansion?.summary?.authorizationImplemented === false, 'passive canary source-boundary expansion must not authorize');
assert(passiveCanarySourceBoundaryExpansion?.summary?.enforcementImplemented === false, 'passive canary source-boundary expansion must not enforce');
assert(passiveCanarySourceBoundaryExpansion?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary source-boundary expansion must not implement automatic agent consumption');

assert(passiveCanaryDriftScorecard?.summary?.verdict === 'pass', 'passive canary drift scorecard verdict must be pass');
assert(passiveCanaryDriftScorecard?.summary?.releaseLayer === 'v0.2.4', 'passive canary drift scorecard release layer must remain v0.2.4 baseline evidence');
assert(passiveCanaryDriftScorecard?.summary?.dependsOn === 'v0.2.3-canary-source-boundary-stress', 'passive canary drift scorecard must depend on v0.2.3 source-boundary stress');
assert(passiveCanaryDriftScorecard?.summary?.mode === 'manual_local_opt_in_passive_drift_scorecard_record_only', 'passive canary drift scorecard mode must remain record-only');
assert(passiveCanaryDriftScorecard?.summary?.comparedRows === 6, 'passive canary drift scorecard must compare 6 source-boundary rows');
assert(passiveCanaryDriftScorecard?.summary?.routeDriftCount === 0, 'passive canary drift scorecard routeDriftCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.reasonCodeDriftCount === 0, 'passive canary drift scorecard reasonCodeDriftCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.boundaryVerdictDriftCount === 0, 'passive canary drift scorecard boundaryVerdictDriftCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.scorecardDriftCount === 0, 'passive canary drift scorecard scorecardDriftCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.traceHashDriftCount === 0, 'passive canary drift scorecard traceHashDriftCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.normalizedOutputMismatchCount === 0, 'passive canary drift scorecard normalizedOutputMismatchCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.mayBlockCount === 0, 'passive canary drift scorecard mayBlockCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.mayAllowCount === 0, 'passive canary drift scorecard mayAllowCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.capabilityTrueCount === 0, 'passive canary drift scorecard capabilityTrueCount must be 0');
assert(passiveCanaryDriftScorecard?.summary?.forbiddenEffects === 0, 'passive canary drift scorecard forbiddenEffects must be 0');
assert(passiveCanaryDriftScorecard?.summary?.scorecardAuthority === false, 'passive canary drift scorecard must not be authority');
assert(passiveCanaryDriftScorecard?.summary?.consumedByAgent === false, 'passive canary drift scorecard must not be consumed by agents');
assert(passiveCanaryDriftScorecard?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary drift scorecard must not implement automatic agent consumption');
assert(passiveCanaryDriftScorecard?.summary?.runtimeIntegrated === false, 'passive canary drift scorecard must not integrate runtime');
assert(passiveCanaryDriftScorecard?.summary?.toolExecutionImplemented === false, 'passive canary drift scorecard must not execute tools');
assert(passiveCanaryDriftScorecard?.summary?.memoryWriteImplemented === false, 'passive canary drift scorecard must not write memory');
assert(passiveCanaryDriftScorecard?.summary?.configWriteImplemented === false, 'passive canary drift scorecard must not write config');
assert(passiveCanaryDriftScorecard?.summary?.externalPublicationImplemented === false, 'passive canary drift scorecard must not publish externally');
assert(passiveCanaryDriftScorecard?.summary?.approvalPathImplemented === false, 'passive canary drift scorecard must not enter approval path');
assert(passiveCanaryDriftScorecard?.summary?.blockingImplemented === false, 'passive canary drift scorecard must not block');
assert(passiveCanaryDriftScorecard?.summary?.allowingImplemented === false, 'passive canary drift scorecard must not allow');
assert(passiveCanaryDriftScorecard?.summary?.authorizationImplemented === false, 'passive canary drift scorecard must not authorize');
assert(passiveCanaryDriftScorecard?.summary?.enforcementImplemented === false, 'passive canary drift scorecard must not enforce');

assert(passiveCanaryExpandedPack?.summary?.verdict === 'pass', 'passive canary expanded pack verdict must be pass');
assert(passiveCanaryExpandedPack?.summary?.releaseLayer === 'v0.2.5', 'passive canary expanded pack release layer must remain v0.2.5 baseline evidence');
assert(passiveCanaryExpandedPack?.summary?.dependsOn === 'v0.2.4-passive-canary-drift-scorecard', 'passive canary expanded pack must depend on v0.2.4 drift scorecard');
assert(passiveCanaryExpandedPack?.summary?.mode === 'manual_local_opt_in_passive_expanded_canary_pack_record_only', 'passive canary expanded pack mode must remain record-only');
assert(passiveCanaryExpandedPack?.summary?.totalCases >= 10 && passiveCanaryExpandedPack?.summary?.totalCases <= 20, 'passive canary expanded pack must include 10-20 rows');
assert(passiveCanaryExpandedPack?.summary?.targetCoverageCount === 13, 'passive canary expanded pack must track 13 target coverage labels');
assert(passiveCanaryExpandedPack?.summary?.coveredTargetCoverageCount === 13, 'passive canary expanded pack must cover all target labels');
assert(passiveCanaryExpandedPack?.summary?.unexpectedAccepts === 0, 'passive canary expanded pack must have zero unexpected accepts');
assert(passiveCanaryExpandedPack?.summary?.unexpectedRejects === 0, 'passive canary expanded pack must have zero unexpected rejects');
assert(passiveCanaryExpandedPack?.summary?.acceptedForbiddenEffectsDetectedCount === 0, 'passive canary expanded pack accepted rows must have zero forbidden effects');
assert(passiveCanaryExpandedPack?.summary?.passCapabilityTrueCount === 0, 'passive canary expanded pack pass rows must keep capability true count zero');
for (const [field, label] of [
  ['optInRejects', 'missing opt-in'],
  ['rawInputRejects', 'raw input pressure'],
  ['runtimeRejects', 'runtime pressure'],
  ['memoryWriteRejects', 'memory pressure'],
  ['configWriteRejects', 'config pressure'],
  ['publicationRejects', 'publication pressure'],
  ['wrongLaneRejects', 'wrong lane'],
  ['staleDigestRejects', 'stale digest'],
  ['missingMtimeRejects', 'missing mtime'],
  ['malformedTupleRejects', 'malformed tuple'],
  ['outputContainmentRejects', 'output containment'],
  ['agentConsumptionPressureRejects', 'agent consumption pressure'],
]) {
  assert(passiveCanaryExpandedPack?.summary?.[field] >= 1, `passive canary expanded pack must cover ${label}`);
}
assert(passiveCanaryExpandedPack?.summary?.manual === true, 'passive canary expanded pack must be manual');
assert(passiveCanaryExpandedPack?.summary?.local === true, 'passive canary expanded pack must be local');
assert(passiveCanaryExpandedPack?.summary?.optInRequired === true, 'passive canary expanded pack must require opt-in');
assert(passiveCanaryExpandedPack?.summary?.alreadyRedactedOnly === true, 'passive canary expanded pack must remain already-redacted only');
assert(passiveCanaryExpandedPack?.summary?.recordOnly === true, 'passive canary expanded pack must be record-only');
assert(passiveCanaryExpandedPack?.summary?.noEffects === true, 'passive canary expanded pack must be no-effects');
assert(passiveCanaryExpandedPack?.summary?.scorecardAuthority === false, 'passive canary expanded pack must not be authority');
assert(passiveCanaryExpandedPack?.summary?.consumedByAgent === false, 'passive canary expanded pack must not be consumed by agents');
assert(passiveCanaryExpandedPack?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary expanded pack must not implement automatic agent consumption');
assert(passiveCanaryExpandedPack?.summary?.runtimeIntegrated === false, 'passive canary expanded pack must not integrate runtime');
assert(passiveCanaryExpandedPack?.summary?.toolExecutionImplemented === false, 'passive canary expanded pack must not execute tools');
assert(passiveCanaryExpandedPack?.summary?.memoryWriteImplemented === false, 'passive canary expanded pack must not write memory');
assert(passiveCanaryExpandedPack?.summary?.configWriteImplemented === false, 'passive canary expanded pack must not write config');
assert(passiveCanaryExpandedPack?.summary?.externalPublicationImplemented === false, 'passive canary expanded pack must not publish externally');
assert(passiveCanaryExpandedPack?.summary?.approvalPathImplemented === false, 'passive canary expanded pack must not enter approval path');
assert(passiveCanaryExpandedPack?.summary?.blockingImplemented === false, 'passive canary expanded pack must not block');
assert(passiveCanaryExpandedPack?.summary?.allowingImplemented === false, 'passive canary expanded pack must not allow');
assert(passiveCanaryExpandedPack?.summary?.authorizationImplemented === false, 'passive canary expanded pack must not authorize');
assert(passiveCanaryExpandedPack?.summary?.enforcementImplemented === false, 'passive canary expanded pack must not enforce');

assert(passiveCanaryAdvisoryReport?.summary?.verdict === 'pass', 'passive canary advisory report verdict must be pass');
assert(passiveCanaryAdvisoryReport?.summary?.releaseLayer === 'v0.3.0-alpha', 'passive canary advisory report release layer must remain v0.3.0-alpha baseline evidence');
assert(passiveCanaryAdvisoryReport?.summary?.dependsOn === 'v0.2.6-source-boundary-stress-expansion', 'passive canary advisory report must depend on v0.2.6 source-boundary expansion');
assert(passiveCanaryAdvisoryReport?.summary?.mode === 'human_readable_advisory_only_non_authoritative_record_only', 'passive canary advisory report mode must remain advisory-only');
assert(passiveCanaryAdvisoryReport?.summary?.sourceEvidenceCount === 4, 'passive canary advisory report must summarize 4 source evidence artifacts');
assert(passiveCanaryAdvisoryReport?.summary?.reportBytes === Buffer.byteLength(passiveCanaryAdvisoryReportText), 'passive canary advisory report byte count must match markdown evidence');
assert(passiveCanaryAdvisoryReport?.summary?.advisoryOnly === true, 'passive canary advisory report must be advisory-only');
assert(passiveCanaryAdvisoryReport?.summary?.humanReadableOnly === true, 'passive canary advisory report must be human-readable only');
assert(passiveCanaryAdvisoryReport?.summary?.nonAuthoritative === true, 'passive canary advisory report must be non-authoritative');
assert(passiveCanaryAdvisoryReport?.summary?.machineReadablePolicyDecision === false, 'passive canary advisory report must not be a machine-readable policy decision');
assert(passiveCanaryAdvisoryReport?.summary?.consumedByAgent === false, 'passive canary advisory report must not be consumed by agents');
assert(passiveCanaryAdvisoryReport?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary advisory report must not implement automatic agent consumption');
assert(passiveCanaryAdvisoryReport?.summary?.runtimeIntegrated === false, 'passive canary advisory report must not integrate runtime');
assert(passiveCanaryAdvisoryReport?.summary?.toolExecutionImplemented === false, 'passive canary advisory report must not execute tools');
assert(passiveCanaryAdvisoryReport?.summary?.memoryWriteImplemented === false, 'passive canary advisory report must not write memory');
assert(passiveCanaryAdvisoryReport?.summary?.configWriteImplemented === false, 'passive canary advisory report must not write config');
assert(passiveCanaryAdvisoryReport?.summary?.externalPublicationImplemented === false, 'passive canary advisory report must not publish externally');
assert(passiveCanaryAdvisoryReport?.summary?.approvalPathImplemented === false, 'passive canary advisory report must not enter approval path');
assert(passiveCanaryAdvisoryReport?.summary?.blockingImplemented === false, 'passive canary advisory report must not block');
assert(passiveCanaryAdvisoryReport?.summary?.allowingImplemented === false, 'passive canary advisory report must not allow');
assert(passiveCanaryAdvisoryReport?.summary?.authorizationImplemented === false, 'passive canary advisory report must not authorize');
assert(passiveCanaryAdvisoryReport?.summary?.enforcementImplemented === false, 'passive canary advisory report must not enforce');
assertIncludes(passiveCanaryAdvisoryReportText, 'ADVISORY ONLY', 'passive canary advisory report');
assertIncludes(passiveCanaryAdvisoryReportText, 'Advisory no es authority', 'passive canary advisory report');
assertIncludes(passiveCanaryAdvisoryReportText, 'not automatically consumed by agents', 'passive canary advisory report');
assertNotIncludes(passiveCanaryAdvisoryReportText, 'approved for execution', 'passive canary advisory report');
assertNotIncludes(passiveCanaryAdvisoryReportText, 'permission granted', 'passive canary advisory report');
assertNotIncludes(passiveCanaryAdvisoryReportText, 'automatic consumption enabled', 'passive canary advisory report');

assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.verdict === 'pass', 'passive canary advisory unicode/bidi guard verdict must be pass');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.releaseLayer === 'v0.3.1', 'passive canary advisory unicode/bidi guard release layer must remain v0.3.1 baseline evidence');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.dependsOn === 'v0.3.0-alpha-advisory-report', 'passive canary advisory unicode/bidi guard must depend on v0.3.0-alpha advisory report');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.mode === 'manual_local_advisory_unicode_bidi_guard_record_only', 'passive canary advisory unicode/bidi guard mode must remain record-only');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.positiveControls >= 1, 'passive canary advisory unicode/bidi guard must include positive controls');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.negativeControls >= 4, 'passive canary advisory unicode/bidi guard must include negative controls');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.textFindings === 0, 'passive canary advisory unicode/bidi guard must have zero text findings');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.machineReadableFindings === 0, 'passive canary advisory unicode/bidi guard must have zero machine-readable findings');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.reasonCodeAsciiTokenRequired === true, 'passive canary advisory unicode/bidi guard must require ASCII reason-code tokens');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.sourcePathAsciiRequired === true, 'passive canary advisory unicode/bidi guard must require ASCII source/output paths');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.sourcePathConfusableGuard === true, 'passive canary advisory unicode/bidi guard must detect path confusables');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.hiddenBidiControlsForbidden === true, 'passive canary advisory unicode/bidi guard must forbid hidden/bidi controls');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.advisoryOnly === true, 'passive canary advisory unicode/bidi guard must be advisory-only');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.nonAuthoritative === true, 'passive canary advisory unicode/bidi guard must be non-authoritative');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary advisory unicode/bidi guard must not implement automatic agent consumption');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.runtimeIntegrated === false, 'passive canary advisory unicode/bidi guard must not integrate runtime');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.toolExecutionImplemented === false, 'passive canary advisory unicode/bidi guard must not execute tools');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.memoryWriteImplemented === false, 'passive canary advisory unicode/bidi guard must not write memory');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.configWriteImplemented === false, 'passive canary advisory unicode/bidi guard must not write config');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.externalPublicationImplemented === false, 'passive canary advisory unicode/bidi guard must not publish externally');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.approvalPathImplemented === false, 'passive canary advisory unicode/bidi guard must not enter approval path');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.blockingImplemented === false, 'passive canary advisory unicode/bidi guard must not block');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.allowingImplemented === false, 'passive canary advisory unicode/bidi guard must not allow');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.authorizationImplemented === false, 'passive canary advisory unicode/bidi guard must not authorize');
assert(passiveCanaryAdvisoryUnicodeBidiGuard?.summary?.enforcementImplemented === false, 'passive canary advisory unicode/bidi guard must not enforce');

assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.advisoryReportFailureCatalog === 'pass', 'passive canary advisory report failure catalog verdict must be pass');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.releaseLayer === 'v0.3.2', 'passive canary advisory report failure catalog release layer must remain v0.3.2 baseline evidence');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.dependsOn === 'v0.3.1-advisory-unicode-bidi-guard', 'passive canary advisory report failure catalog must depend on v0.3.1 guard');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mode === 'manual_local_advisory_report_failure_catalog_record_only', 'passive canary advisory report failure catalog mode must remain record-only');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.expectedRejects === 12, 'passive canary advisory report failure catalog must keep 12 expected rejects');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.unexpectedAccepts === 0, 'passive canary advisory report failure catalog must have zero unexpected accepts');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.expectedReasonCodeMisses === 0, 'passive canary advisory report failure catalog must have zero expected reason-code misses');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.machineReadablePolicyDecision === false, 'passive canary advisory report failure catalog must not become machine-readable policy');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.consumedByAgent === false, 'passive canary advisory report failure catalog must not be agent-consumed');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.authoritative === false, 'passive canary advisory report failure catalog must not be authoritative');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayApprove === false, 'passive canary advisory report failure catalog must not approve');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayBlock === false, 'passive canary advisory report failure catalog must not block');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayAllow === false, 'passive canary advisory report failure catalog must not allow');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayAuthorize === false, 'passive canary advisory report failure catalog must not authorize');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayEnforce === false, 'passive canary advisory report failure catalog must not enforce');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayExecuteTool === false, 'passive canary advisory report failure catalog must not execute tools');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayWriteMemory === false, 'passive canary advisory report failure catalog must not write memory');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayWriteConfig === false, 'passive canary advisory report failure catalog must not write config');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayPublishExternally === false, 'passive canary advisory report failure catalog must not publish externally');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.mayMutateAgentInstruction === false, 'passive canary advisory report failure catalog must not mutate agent instructions');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.runtimeIntegrated === false, 'passive canary advisory report failure catalog must not integrate runtime');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.toolExecutionImplemented === false, 'passive canary advisory report failure catalog must not execute tools');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.memoryWriteImplemented === false, 'passive canary advisory report failure catalog must not write memory');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.configWriteImplemented === false, 'passive canary advisory report failure catalog must not write config');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.externalPublicationImplemented === false, 'passive canary advisory report failure catalog must not publish externally');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.approvalPathImplemented === false, 'passive canary advisory report failure catalog must not enter approval path');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.blockingImplemented === false, 'passive canary advisory report failure catalog must not block');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.allowingImplemented === false, 'passive canary advisory report failure catalog must not allow');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.authorizationImplemented === false, 'passive canary advisory report failure catalog must not authorize');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.enforcementImplemented === false, 'passive canary advisory report failure catalog must not enforce');
assert(passiveCanaryAdvisoryReportFailureCatalog?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary advisory report failure catalog must not be consumed automatically by agents');

assert(passiveCanaryAdvisoryReportReproducibility?.summary?.advisoryReportReproducibility === 'pass', 'passive canary advisory report reproducibility verdict must be pass');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.releaseLayer === 'v0.3.3', 'passive canary advisory report reproducibility release layer must remain v0.3.3 baseline evidence');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.dependsOn === 'v0.3.2-advisory-report-failure-catalog', 'passive canary advisory report reproducibility must depend on v0.3.2 failure catalog');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.mode === 'manual_local_advisory_report_reproducibility_drift_record_only', 'passive canary advisory report reproducibility mode must remain record-only');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.runs === 2, 'passive canary advisory report reproducibility must run twice');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.normalizedOutputMismatches === 0, 'passive canary advisory report reproducibility must have zero normalized output mismatches');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.committedMarkdownBytes === passiveCanaryAdvisoryReportReproducibility?.summary?.advisorySummaryReportBytes, 'passive canary advisory report reproducibility byte counts must match');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.expectedRejects === 6, 'passive canary advisory report reproducibility must keep 6 expected rejects');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.unexpectedAccepts === 0, 'passive canary advisory report reproducibility must have zero unexpected accepts');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.expectedReasonCodeMisses === 0, 'passive canary advisory report reproducibility must have zero expected reason-code misses');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.machineReadablePolicyDecision === false, 'passive canary advisory report reproducibility must not become machine-readable policy');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.consumedByAgent === false, 'passive canary advisory report reproducibility must not be agent-consumed');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.authoritative === false, 'passive canary advisory report reproducibility must not be authoritative');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.mayApprove === false, 'passive canary advisory report reproducibility must not approve');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.mayBlock === false, 'passive canary advisory report reproducibility must not block');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.mayAllow === false, 'passive canary advisory report reproducibility must not allow');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.mayAuthorize === false, 'passive canary advisory report reproducibility must not authorize');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.mayEnforce === false, 'passive canary advisory report reproducibility must not enforce');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.runtimeIntegrated === false, 'passive canary advisory report reproducibility must not integrate runtime');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.toolExecutionImplemented === false, 'passive canary advisory report reproducibility must not execute tools');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.memoryWriteImplemented === false, 'passive canary advisory report reproducibility must not write memory');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.configWriteImplemented === false, 'passive canary advisory report reproducibility must not write config');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.externalPublicationImplemented === false, 'passive canary advisory report reproducibility must not publish externally');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.approvalPathImplemented === false, 'passive canary advisory report reproducibility must not enter approval path');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.blockingImplemented === false, 'passive canary advisory report reproducibility must not block');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.allowingImplemented === false, 'passive canary advisory report reproducibility must not allow');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.authorizationImplemented === false, 'passive canary advisory report reproducibility must not authorize');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.enforcementImplemented === false, 'passive canary advisory report reproducibility must not enforce');
assert(passiveCanaryAdvisoryReportReproducibility?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary advisory report reproducibility must not be consumed automatically by agents');

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

const redactionPolicySchema = readJson(path.join(packageRoot, 'evidence/redaction-policy-schema.out.json'));
assert(redactionPolicySchema?.summary?.verdict === 'pass', 'redaction policy schema verdict must be pass');
assert(redactionPolicySchema?.summary?.redactionGate === 'reject_sensitive_persistence', 'redaction policy schema must be reject-sensitive-persistence');
assert(redactionPolicySchema?.summary?.sensitiveFieldClasses === 9, 'redaction policy schema must cover 9 sensitive field classes');
assert(redactionPolicySchema?.summary?.requiredOutputFlags === 7, 'redaction policy schema must require 7 output flags');
assert(redactionPolicySchema?.summary?.rawContentPersisted === false, 'redaction policy schema must not persist raw content');
assert(redactionPolicySchema?.summary?.secretLikePersisted === false, 'redaction policy schema must not persist secret-like values');
assert(redactionPolicySchema?.summary?.privatePathPersisted === false, 'redaction policy schema must not persist private paths');
assert(redactionPolicySchema?.summary?.toolOutputPersisted === false, 'redaction policy schema must not persist tool output');
assert(redactionPolicySchema?.summary?.memoryTextPersisted === false, 'redaction policy schema must not persist memory text');
assert(redactionPolicySchema?.summary?.configTextPersisted === false, 'redaction policy schema must not persist config text');
assert(redactionPolicySchema?.summary?.approvalTextPersisted === false, 'redaction policy schema must not persist approval text');
assert(redactionPolicySchema?.summary?.longRawPromptPersisted === false, 'redaction policy schema must not persist long raw prompt text');
assert(redactionPolicySchema?.summary?.unknownSensitiveFieldPersisted === false, 'redaction policy schema must reject unknown sensitive fields');
assert(redactionPolicySchema?.summary?.liveObserverImplemented === false, 'redaction policy schema must not implement live observer');
assert(redactionPolicySchema?.summary?.toolExecutionImplemented === false, 'redaction policy schema must not implement tool execution');
assert(redactionPolicySchema?.summary?.memoryWriteImplemented === false, 'redaction policy schema must not implement memory writes');
assert(redactionPolicySchema?.summary?.configWriteImplemented === false, 'redaction policy schema must not implement config writes');
assert(redactionPolicySchema?.summary?.externalPublicationImplemented === false, 'redaction policy schema must not implement external publication');
assert(redactionPolicySchema?.summary?.authorizationImplemented === false, 'redaction policy schema must not implement authorization');
assert(redactionPolicySchema?.summary?.enforcementImplemented === false, 'redaction policy schema must not implement enforcement');

const redactionScannerMinimal = readJson(path.join(packageRoot, 'evidence/redaction-scanner-minimal.out.json'));
assert(redactionScannerMinimal?.summary?.verdict === 'pass', 'redaction scanner minimal verdict must be pass');
assert(redactionScannerMinimal?.summary?.redactionGate === 'pass', 'redaction scanner minimal pass summary must pass');
assert(redactionScannerMinimal?.summary?.blockCases >= 9, 'redaction scanner minimal must cover at least 9 blocking classes');
assert(redactionScannerMinimal?.summary?.rejectedBlockCases === redactionScannerMinimal?.summary?.blockCases, 'redaction scanner minimal must reject every block case');
assert(redactionScannerMinimal?.summary?.unexpectedPasses === 0, 'redaction scanner minimal must have zero unexpected passes');
assert(redactionScannerMinimal?.summary?.unexpectedRejects === 0, 'redaction scanner minimal must have zero unexpected rejects');
for (const reasonClass of ['raw_content', 'secret_like_value', 'private_path', 'tool_output', 'memory_text', 'config_text', 'approval_text', 'long_raw_prompt', 'unknown_sensitive_field']) {
  assert(redactionScannerMinimal?.summary?.coveredReasonClasses?.includes(reasonClass), `redaction scanner minimal must cover ${reasonClass}`);
}
assert(redactionScannerMinimal?.summary?.rawPersisted === false, 'redaction scanner pass output must report rawPersisted false');
assert(redactionScannerMinimal?.summary?.secretLikePersisted === false, 'redaction scanner pass output must report secretLikePersisted false');
assert(redactionScannerMinimal?.summary?.privatePathPersisted === false, 'redaction scanner pass output must report privatePathPersisted false');
assert(redactionScannerMinimal?.summary?.toolOutputPersisted === false, 'redaction scanner pass output must report toolOutputPersisted false');
assert(redactionScannerMinimal?.summary?.memoryTextPersisted === false, 'redaction scanner pass output must report memoryTextPersisted false');
assert(redactionScannerMinimal?.summary?.configTextPersisted === false, 'redaction scanner pass output must report configTextPersisted false');
assert(redactionScannerMinimal?.summary?.approvalTextPersisted === false, 'redaction scanner pass output must report approvalTextPersisted false');
assert(redactionScannerMinimal?.summary?.liveObserverImplemented === false, 'redaction scanner minimal must not implement live observer');
assert(redactionScannerMinimal?.summary?.toolExecutionImplemented === false, 'redaction scanner minimal must not implement tool execution');
assert(redactionScannerMinimal?.summary?.memoryWriteImplemented === false, 'redaction scanner minimal must not implement memory writes');
assert(redactionScannerMinimal?.summary?.configWriteImplemented === false, 'redaction scanner minimal must not implement config writes');
assert(redactionScannerMinimal?.summary?.externalPublicationImplemented === false, 'redaction scanner minimal must not implement external publication');
assert(redactionScannerMinimal?.summary?.authorizationImplemented === false, 'redaction scanner minimal must not implement authorization');
assert(redactionScannerMinimal?.summary?.enforcementImplemented === false, 'redaction scanner minimal must not implement enforcement');

const retentionPolicySchema = readJson(path.join(packageRoot, 'evidence/retention-policy-schema.out.json'));
assert(retentionPolicySchema?.summary?.verdict === 'pass', 'retention policy schema verdict must be pass');
assert(retentionPolicySchema?.summary?.retentionGate === 'validate_metadata_retention_ceiling', 'retention policy schema must validate metadata retention ceilings');
assert(retentionPolicySchema?.summary?.artifactClasses === 5, 'retention policy schema must cover 5 artifact classes');
assert(retentionPolicySchema?.summary?.rawLiveInputRetentionDays === 0, 'retention policy schema must keep raw live input retention at 0 days');
assert(retentionPolicySchema?.summary?.redactedObservationRetentionDays <= 7, 'retention policy schema observation ceiling must be <= 7 days');
assert(retentionPolicySchema?.summary?.redactedResultRetentionDays <= 7, 'retention policy schema result ceiling must be <= 7 days');
assert(retentionPolicySchema?.summary?.aggregateScorecardRetentionDays <= 90, 'retention policy schema aggregate scorecard ceiling must be <= 90 days');
assert(retentionPolicySchema?.summary?.rawContentPersisted === false, 'retention policy schema must not persist raw content');
assert(retentionPolicySchema?.summary?.retentionSchedulerImplemented === false, 'retention policy schema must not implement retention scheduler');
assert(retentionPolicySchema?.summary?.deletionImplemented === false, 'retention policy schema must not implement deletion');
assert(retentionPolicySchema?.summary?.liveObserverImplemented === false, 'retention policy schema must not implement live observer');
assert(retentionPolicySchema?.summary?.toolExecutionImplemented === false, 'retention policy schema must not implement tool execution');
assert(retentionPolicySchema?.summary?.memoryWriteImplemented === false, 'retention policy schema must not implement memory writes');
assert(retentionPolicySchema?.summary?.configWriteImplemented === false, 'retention policy schema must not implement config writes');
assert(retentionPolicySchema?.summary?.externalPublicationImplemented === false, 'retention policy schema must not implement external publication');
assert(retentionPolicySchema?.summary?.authorizationImplemented === false, 'retention policy schema must not implement authorization');
assert(retentionPolicySchema?.summary?.enforcementImplemented === false, 'retention policy schema must not implement enforcement');

const retentionNegativeControls = readJson(path.join(packageRoot, 'evidence/retention-negative-controls.out.json'));
assert(retentionNegativeControls?.summary?.verdict === 'pass', 'retention negative controls verdict must be pass');
assert(retentionNegativeControls?.summary?.negativeControls >= 13, 'retention negative controls must cover at least 13 cases');
assert(retentionNegativeControls?.summary?.rejectedNegativeControls === retentionNegativeControls?.summary?.negativeControls, 'retention negative controls must reject every negative control');
assert(retentionNegativeControls?.summary?.unexpectedPasses === 0, 'retention negative controls must have zero unexpected passes');
assert(retentionNegativeControls?.summary?.unexpectedRejects === 0, 'retention negative controls must have zero unexpected rejects');
for (const reasonCode of ['RETENTION_RAW_LIVE_INPUT_MUST_BE_ZERO_DAY', 'RETENTION_CEILING_EXCEEDED', 'RETENTION_UNKNOWN_CLASS_REJECTED', 'RETENTION_RAW_CONTENT_PERSISTED', 'RETENTION_REDACTION_STATUS_REQUIRED', 'RETENTION_AGGREGATE_ONLY_REQUIRED', 'RETENTION_PUBLIC_EVIDENCE_MUST_BE_SYNTHETIC_OR_NON_SENSITIVE', 'RETENTION_SCHEDULER_FORBIDDEN', 'RETENTION_DELETION_IMPLEMENTATION_FORBIDDEN', 'RETENTION_LIVE_OBSERVER_FORBIDDEN', 'RETENTION_RUNTIME_INTEGRATION_FORBIDDEN']) {
  assert(retentionNegativeControls?.summary?.coveredReasonCodes?.includes(reasonCode), `retention negative controls must cover ${reasonCode}`);
}
assert(retentionNegativeControls?.summary?.rawLiveInputRetentionDays === 0, 'retention negative controls must keep raw live input retention at 0 days');
assert(retentionNegativeControls?.summary?.rawContentPersisted === false, 'retention negative controls must not persist raw content');
assert(retentionNegativeControls?.summary?.retentionSchedulerImplemented === false, 'retention negative controls must not implement retention scheduler');
assert(retentionNegativeControls?.summary?.deletionImplemented === false, 'retention negative controls must not implement deletion');
assert(retentionNegativeControls?.summary?.liveObserverImplemented === false, 'retention negative controls must not implement live observer');
assert(retentionNegativeControls?.summary?.toolExecutionImplemented === false, 'retention negative controls must not implement tool execution');
assert(retentionNegativeControls?.summary?.memoryWriteImplemented === false, 'retention negative controls must not implement memory writes');
assert(retentionNegativeControls?.summary?.configWriteImplemented === false, 'retention negative controls must not implement config writes');
assert(retentionNegativeControls?.summary?.externalPublicationImplemented === false, 'retention negative controls must not implement external publication');
assert(retentionNegativeControls?.summary?.authorizationImplemented === false, 'retention negative controls must not implement authorization');
assert(retentionNegativeControls?.summary?.enforcementImplemented === false, 'retention negative controls must not implement enforcement');

const redactionRetentionExecutableGates = readJson(path.join(packageRoot, 'evidence/redaction-retention-executable-gates.out.json'));
assert(redactionRetentionExecutableGates?.summary?.verdict === 'pass', 'redaction/retention executable gates verdict must be pass');
assert(redactionRetentionExecutableGates?.summary?.passCases === 3, 'redaction/retention executable gates must keep 3 positive controls');
assert(redactionRetentionExecutableGates?.summary?.expectedRejects === 7, 'redaction/retention executable gates must keep 7 expected rejects');
assert(redactionRetentionExecutableGates?.summary?.unexpectedPasses === 0, 'redaction/retention executable gates must have zero unexpected passes');
assert(redactionRetentionExecutableGates?.summary?.unexpectedRejects === 0, 'redaction/retention executable gates must have zero unexpected rejects');
assert(redactionRetentionExecutableGates?.summary?.redactionRejectedBeforeRetention === 2, 'redaction/retention executable gates must prove two redaction-first rejects');
assert(redactionRetentionExecutableGates?.summary?.retentionRejectedAfterRedactionPass === 5, 'redaction/retention executable gates must prove five retention rejects after redaction passes');
for (const reasonCode of ['REDACTION_SECRET_LIKE_VALUE_PERSISTED', 'REDACTION_PRIVATE_PATH_PERSISTED', 'RETENTION_CEILING_EXCEEDED', 'RETENTION_REDACTION_STATUS_REQUIRED', 'RETENTION_UNKNOWN_CLASS_REJECTED', 'RETENTION_SCHEDULER_FORBIDDEN', 'RETENTION_DELETION_IMPLEMENTATION_FORBIDDEN', 'RETENTION_RUNTIME_INTEGRATION_FORBIDDEN', 'RETENTION_LIVE_OBSERVER_FORBIDDEN']) {
  assert(redactionRetentionExecutableGates?.summary?.coveredReasonCodes?.includes(reasonCode), `redaction/retention executable gates must cover ${reasonCode}`);
}
assert(redactionRetentionExecutableGates?.summary?.rawPersistedInPassOutput === false, 'redaction/retention executable gates must not persist raw output in pass cases');
assert(redactionRetentionExecutableGates?.summary?.secretLikePersistedInPassOutput === false, 'redaction/retention executable gates must not persist secret-like output in pass cases');
assert(redactionRetentionExecutableGates?.summary?.privatePathPersistedInPassOutput === false, 'redaction/retention executable gates must not persist private paths in pass cases');
assert(redactionRetentionExecutableGates?.summary?.retentionSchedulerImplemented === false, 'redaction/retention executable gates must not implement retention scheduler');
assert(redactionRetentionExecutableGates?.summary?.deletionImplemented === false, 'redaction/retention executable gates must not implement deletion');
assert(redactionRetentionExecutableGates?.summary?.liveObserverImplemented === false, 'redaction/retention executable gates must not implement live observer');
assert(redactionRetentionExecutableGates?.summary?.toolExecutionImplemented === false, 'redaction/retention executable gates must not implement tool execution');
assert(redactionRetentionExecutableGates?.summary?.memoryWriteImplemented === false, 'redaction/retention executable gates must not implement memory writes');
assert(redactionRetentionExecutableGates?.summary?.configWriteImplemented === false, 'redaction/retention executable gates must not implement config writes');
assert(redactionRetentionExecutableGates?.summary?.externalPublicationImplemented === false, 'redaction/retention executable gates must not implement external publication');
assert(redactionRetentionExecutableGates?.summary?.publicationAutomationImplemented === false, 'redaction/retention executable gates must not implement publication automation');
assert(redactionRetentionExecutableGates?.summary?.approvalPathImplemented === false, 'redaction/retention executable gates must not implement approval paths');
assert(redactionRetentionExecutableGates?.summary?.blockingImplemented === false, 'redaction/retention executable gates must not implement blocking');
assert(redactionRetentionExecutableGates?.summary?.allowingImplemented === false, 'redaction/retention executable gates must not implement allowing');
assert(redactionRetentionExecutableGates?.summary?.authorizationImplemented === false, 'redaction/retention executable gates must not implement authorization');
assert(redactionRetentionExecutableGates?.summary?.enforcementImplemented === false, 'redaction/retention executable gates must not implement enforcement');

const decisionCounterfactualChecklist = readJson(path.join(packageRoot, 'evidence/decision-counterfactual-checklist.out.json'));
assert(decisionCounterfactualChecklist?.summary?.verdict === 'pass', 'decision-counterfactual checklist verdict must be pass');
assert(decisionCounterfactualChecklist?.summary?.fixtureCount === 16, 'decision-counterfactual checklist must contain exactly 16 fixtures');
assert(decisionCounterfactualChecklist?.summary?.passCount === 16, 'decision-counterfactual checklist must pass 16 fixtures');
assert(decisionCounterfactualChecklist?.summary?.unsafeAllows === 0, 'decision-counterfactual checklist must have zero unsafe allows');
assert(decisionCounterfactualChecklist?.summary?.negativeControlCount >= 8, 'decision-counterfactual checklist must cover at least 8 negative controls');
assert(decisionCounterfactualChecklist?.summary?.reasonCodesCovered >= 15, 'decision-counterfactual checklist must cover at least 15 reason codes');
assert(decisionCounterfactualChecklist?.summary?.coreAllowTupleRequired === true, 'decision-counterfactual checklist must require the core allow tuple for allow_local_advisory cases');
assert(decisionCounterfactualChecklist?.summary?.memoryWriteImplemented === false, 'decision-counterfactual checklist must not implement memory writes');
assert(decisionCounterfactualChecklist?.summary?.memoryAtomImplemented === false, 'decision-counterfactual checklist must not implement MemoryAtom');
assert(decisionCounterfactualChecklist?.summary?.runtimeImplemented === false, 'decision-counterfactual checklist must not implement runtime');
assert(decisionCounterfactualChecklist?.summary?.liveObserverImplemented === false, 'decision-counterfactual checklist must not implement live observer');
assert(decisionCounterfactualChecklist?.summary?.adapterIntegrationImplemented === false, 'decision-counterfactual checklist must not implement adapter integration');
assert(decisionCounterfactualChecklist?.summary?.toolAuthorizationImplemented === false, 'decision-counterfactual checklist must not implement tool authorization');
assert(decisionCounterfactualChecklist?.summary?.externalPublicationImplemented === false, 'decision-counterfactual checklist must not implement external publication');
assert(decisionCounterfactualChecklist?.summary?.enforcementImplemented === false, 'decision-counterfactual checklist must not implement enforcement');

const decisionCounterfactualReproducibility = readJson(path.join(packageRoot, 'evidence/decision-counterfactual-reproducibility.out.json'));
assert(decisionCounterfactualReproducibility?.summary?.decisionCounterfactualReproducibility === 'pass', 'decision-counterfactual reproducibility gate must pass');
assert(decisionCounterfactualReproducibility?.summary?.runs === 2, 'decision-counterfactual reproducibility must run twice');
assert(decisionCounterfactualReproducibility?.summary?.fixtures === 16, 'decision-counterfactual reproducibility must reuse 16 fixtures');
assert(decisionCounterfactualReproducibility?.summary?.normalizedOutputMismatches === 0, 'decision-counterfactual reproducibility must have zero normalized output mismatches');
assert(decisionCounterfactualReproducibility?.summary?.unsafeAllows === 0, 'decision-counterfactual reproducibility must have zero unsafe allows');
assert(decisionCounterfactualReproducibility?.summary?.coreAllowTupleRequired === true, 'decision-counterfactual reproducibility must preserve the core allow tuple requirement');
assert(decisionCounterfactualReproducibility?.summary?.memoryWriteImplemented === false, 'decision-counterfactual reproducibility must not implement memory writes');
assert(decisionCounterfactualReproducibility?.summary?.memoryAtomImplemented === false, 'decision-counterfactual reproducibility must not implement MemoryAtom');
assert(decisionCounterfactualReproducibility?.summary?.runtimeImplemented === false, 'decision-counterfactual reproducibility must not implement runtime');
assert(decisionCounterfactualReproducibility?.summary?.liveObserverImplemented === false, 'decision-counterfactual reproducibility must not implement live observer');
assert(decisionCounterfactualReproducibility?.summary?.adapterIntegrationImplemented === false, 'decision-counterfactual reproducibility must not implement adapter integration');
assert(decisionCounterfactualReproducibility?.summary?.toolAuthorizationImplemented === false, 'decision-counterfactual reproducibility must not implement tool authorization');
assert(decisionCounterfactualReproducibility?.summary?.externalPublicationImplemented === false, 'decision-counterfactual reproducibility must not implement external publication');
assert(decisionCounterfactualReproducibility?.summary?.enforcementImplemented === false, 'decision-counterfactual reproducibility must not implement enforcement');

const decisionCounterfactualFailureCatalog = readJson(path.join(packageRoot, 'evidence/decision-counterfactual-failure-catalog.out.json'));
assert(decisionCounterfactualFailureCatalog?.summary?.decisionCounterfactualFailureCatalog === 'pass', 'decision-counterfactual failure catalog must pass');
assert(decisionCounterfactualFailureCatalog?.summary?.expectedRejects === 10, 'decision-counterfactual failure catalog must cover 10 expected rejects');
assert(decisionCounterfactualFailureCatalog?.summary?.unexpectedAllows === 0, 'decision-counterfactual failure catalog must have zero unexpected allows');
assert(decisionCounterfactualFailureCatalog?.summary?.unsafeAllows === 0, 'decision-counterfactual failure catalog must have zero unsafe allows');
assert(decisionCounterfactualFailureCatalog?.summary?.coreAllowTupleRequired === true, 'decision-counterfactual failure catalog must preserve the core allow tuple requirement');
assert(decisionCounterfactualFailureCatalog?.summary?.memoryWriteImplemented === false, 'decision-counterfactual failure catalog must not implement memory writes');
assert(decisionCounterfactualFailureCatalog?.summary?.memoryAtomImplemented === false, 'decision-counterfactual failure catalog must not implement MemoryAtom');
assert(decisionCounterfactualFailureCatalog?.summary?.runtimeImplemented === false, 'decision-counterfactual failure catalog must not implement runtime');
assert(decisionCounterfactualFailureCatalog?.summary?.liveObserverImplemented === false, 'decision-counterfactual failure catalog must not implement live observer');
assert(decisionCounterfactualFailureCatalog?.summary?.adapterIntegrationImplemented === false, 'decision-counterfactual failure catalog must not implement adapter integration');
assert(decisionCounterfactualFailureCatalog?.summary?.toolAuthorizationImplemented === false, 'decision-counterfactual failure catalog must not implement tool authorization');
assert(decisionCounterfactualFailureCatalog?.summary?.externalPublicationImplemented === false, 'decision-counterfactual failure catalog must not implement external publication');
assert(decisionCounterfactualFailureCatalog?.summary?.enforcementImplemented === false, 'decision-counterfactual failure catalog must not implement enforcement');

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

const manualDryRunCli = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli.out.json'));
assert(manualDryRunCli?.summary?.verdict === 'pass', 'manual dry-run CLI evidence verdict must be pass');
assert(manualDryRunCli?.summary?.recordOnly === true, 'manual dry-run CLI must remain record-only');
assert(manualDryRunCli?.summary?.validationErrorCount === 0, 'manual dry-run CLI must validate generated artifacts');
assert(manualDryRunCli?.summary?.forbiddenEffectsDetected === 0, 'manual dry-run CLI must detect zero forbidden effects');
assert(manualDryRunCli?.summary?.capabilityTrueCount === 0, 'manual dry-run CLI must keep capabilities false');
assert(manualDryRunCli?.summary?.rawUnredactedInputRead === false, 'manual dry-run CLI must not read raw unredacted input');
assert(manualDryRunCli?.summary?.liveInputRead === false, 'manual dry-run CLI must not read live input');
assert(manualDryRunCli?.summary?.networkUsed === false, 'manual dry-run CLI must not use network');
assert(manualDryRunCli?.summary?.toolExecuted === false, 'manual dry-run CLI must not execute tools');
assert(manualDryRunCli?.summary?.memoryWritten === false, 'manual dry-run CLI must not write memory');
assert(manualDryRunCli?.summary?.configWritten === false, 'manual dry-run CLI must not write config');
assert(manualDryRunCli?.summary?.publishedExternally === false, 'manual dry-run CLI must not publish externally');
assert(manualDryRunCli?.summary?.approvalEntered === false, 'manual dry-run CLI must not enter approval path');
assert(manualDryRunCli?.summary?.blocked === false, 'manual dry-run CLI must not block');
assert(manualDryRunCli?.summary?.allowed === false, 'manual dry-run CLI must not allow');
assert(manualDryRunCli?.summary?.enforced === false, 'manual dry-run CLI must not enforce');

const manualDryRunNegativeControls = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-negative-controls.out.json'));
assert(manualDryRunNegativeControls?.summary?.verdict === 'pass', 'manual dry-run CLI negative controls verdict must be pass');
assert(manualDryRunNegativeControls?.summary?.forbiddenCliFlagCases === manualDryRunNegativeControls?.summary?.forbiddenCliFlagRejections, 'manual dry-run CLI must reject all forbidden flags');
assert(manualDryRunNegativeControls?.summary?.forbiddenInputCases === manualDryRunNegativeControls?.summary?.forbiddenInputRejections, 'manual dry-run CLI must reject all forbidden input claims');
assert(manualDryRunNegativeControls?.summary?.symlinkOutputRejected === true, 'manual dry-run CLI must reject symlink outputs');
assert(manualDryRunNegativeControls?.summary?.symlinkEscapeTargetWritten === false, 'manual dry-run CLI must not write through output symlinks');
assert(manualDryRunNegativeControls?.summary?.outsideEvidenceDirRejected === true, 'manual dry-run CLI must reject outside evidence outputs');
assert(manualDryRunNegativeControls?.summary?.outsideEvidenceDirCreated === false, 'manual dry-run CLI must not create outside evidence dirs');
assert(manualDryRunNegativeControls?.summary?.symlinkParentRejected === true, 'manual dry-run CLI must reject symlinked output parents');
assert(manualDryRunNegativeControls?.summary?.symlinkParentNestedCreated === false, 'manual dry-run CLI must not create nested dirs through symlinked parents');
assert(manualDryRunNegativeControls?.summary?.recordOnly === true, 'manual dry-run CLI negative controls must remain record-only');
assert(manualDryRunNegativeControls?.summary?.networkUsed === false, 'manual dry-run CLI negative controls must not use network');
assert(manualDryRunNegativeControls?.summary?.toolExecuted === false, 'manual dry-run CLI negative controls must not execute tools');
assert(manualDryRunNegativeControls?.summary?.memoryWritten === false, 'manual dry-run CLI negative controls must not write memory');
assert(manualDryRunNegativeControls?.summary?.configWritten === false, 'manual dry-run CLI negative controls must not write config');
assert(manualDryRunNegativeControls?.summary?.publishedExternally === false, 'manual dry-run CLI negative controls must not publish externally');
assert(manualDryRunNegativeControls?.summary?.approvalEntered === false, 'manual dry-run CLI negative controls must not enter approval path');
assert(manualDryRunNegativeControls?.summary?.blocked === false, 'manual dry-run CLI negative controls must not block');
assert(manualDryRunNegativeControls?.summary?.allowed === false, 'manual dry-run CLI negative controls must not allow');
assert(manualDryRunNegativeControls?.summary?.enforced === false, 'manual dry-run CLI negative controls must not enforce');

const manualDryRunRealRedacted = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-real-redacted-handoffs.out.json'));
assert(manualDryRunRealRedacted?.summary?.verdict === 'pass', 'manual dry-run CLI real-redacted evidence verdict must be pass');
assert(manualDryRunRealRedacted?.summary?.realRedactedHandoffCount === 3, 'manual dry-run CLI real-redacted gate must cover exactly 3 handoffs');
assert(manualDryRunRealRedacted?.summary?.recordOnlyCount === 3, 'manual dry-run CLI real-redacted outputs must all be record-only');
assert(manualDryRunRealRedacted?.summary?.validationErrorCount === 0, 'manual dry-run CLI real-redacted outputs must validate');
assert(manualDryRunRealRedacted?.summary?.forbiddenEffectsDetectedCount === 0, 'manual dry-run CLI real-redacted outputs must detect zero forbidden effects');
assert(manualDryRunRealRedacted?.summary?.capabilityTrueCount === 0, 'manual dry-run CLI real-redacted outputs must keep capabilities false');
assert(manualDryRunRealRedacted?.summary?.falsePermitCount === 0, 'manual dry-run CLI real-redacted outputs must have zero false permits');
assert(manualDryRunRealRedacted?.summary?.falseCompactCount === 0, 'manual dry-run CLI real-redacted outputs must have zero false compacts');
assert(manualDryRunRealRedacted?.summary?.boundaryLossCount === 0, 'manual dry-run CLI real-redacted outputs must have zero boundary loss');
assert(manualDryRunRealRedacted?.summary?.rawUnredactedInputReadCount === 0, 'manual dry-run CLI real-redacted gate must not read raw unredacted input');
assert(manualDryRunRealRedacted?.summary?.liveInputReadCount === 0, 'manual dry-run CLI real-redacted gate must not read live input');
assert(manualDryRunRealRedacted?.summary?.networkUsedCount === 0, 'manual dry-run CLI real-redacted gate must not use network');
assert(manualDryRunRealRedacted?.summary?.toolExecutedCount === 0, 'manual dry-run CLI real-redacted gate must not execute tools');
assert(manualDryRunRealRedacted?.summary?.memoryWrittenCount === 0, 'manual dry-run CLI real-redacted gate must not write memory');
assert(manualDryRunRealRedacted?.summary?.configWrittenCount === 0, 'manual dry-run CLI real-redacted gate must not write config');
assert(manualDryRunRealRedacted?.summary?.publishedExternallyCount === 0, 'manual dry-run CLI real-redacted gate must not publish externally');
assert(manualDryRunRealRedacted?.summary?.approvalEnteredCount === 0, 'manual dry-run CLI real-redacted gate must not enter approval path');
assert(manualDryRunRealRedacted?.summary?.blockedCount === 0, 'manual dry-run CLI real-redacted gate must not block');
assert(manualDryRunRealRedacted?.summary?.allowedCount === 0, 'manual dry-run CLI real-redacted gate must not allow');
assert(manualDryRunRealRedacted?.summary?.enforcedCount === 0, 'manual dry-run CLI real-redacted gate must not enforce');

const manualDryRunRealRedactedPilot = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-real-redacted-pilot.out.json'));
assert(manualDryRunRealRedactedPilot?.summary?.verdict === 'pass', 'manual dry-run CLI real-redacted pilot verdict must be pass');
assert(manualDryRunRealRedactedPilot?.summary?.realRedactedPilotCount === 6, 'manual dry-run CLI real-redacted pilot must cover exactly 6 cases');
assert(manualDryRunRealRedactedPilot?.summary?.recordOnlyCount === 6, 'manual dry-run CLI real-redacted pilot outputs must all be record-only');
assert(manualDryRunRealRedactedPilot?.summary?.validationErrorCount === 0, 'manual dry-run CLI real-redacted pilot outputs must validate');
assert(manualDryRunRealRedactedPilot?.summary?.forbiddenEffectsDetectedCount === 0, 'manual dry-run CLI real-redacted pilot outputs must detect zero forbidden effects');
assert(manualDryRunRealRedactedPilot?.summary?.capabilityTrueCount === 0, 'manual dry-run CLI real-redacted pilot outputs must keep capabilities false');
assert(manualDryRunRealRedactedPilot?.summary?.falsePermitCount === 0, 'manual dry-run CLI real-redacted pilot outputs must have zero false permits');
assert(manualDryRunRealRedactedPilot?.summary?.falseCompactCount === 0, 'manual dry-run CLI real-redacted pilot outputs must have zero false compacts');
assert(manualDryRunRealRedactedPilot?.summary?.boundaryLossCount === 0, 'manual dry-run CLI real-redacted pilot outputs must have zero boundary loss');
assert(manualDryRunRealRedactedPilot?.summary?.rawUnredactedInputReadCount === 0, 'manual dry-run CLI real-redacted pilot must not read raw unredacted input');
assert(manualDryRunRealRedactedPilot?.summary?.liveInputReadCount === 0, 'manual dry-run CLI real-redacted pilot must not read live input');
assert(manualDryRunRealRedactedPilot?.summary?.networkUsedCount === 0, 'manual dry-run CLI real-redacted pilot must not use network');
assert(manualDryRunRealRedactedPilot?.summary?.toolExecutedCount === 0, 'manual dry-run CLI real-redacted pilot must not execute tools');
assert(manualDryRunRealRedactedPilot?.summary?.memoryWrittenCount === 0, 'manual dry-run CLI real-redacted pilot must not write memory');
assert(manualDryRunRealRedactedPilot?.summary?.configWrittenCount === 0, 'manual dry-run CLI real-redacted pilot must not write config');
assert(manualDryRunRealRedactedPilot?.summary?.publishedExternallyCount === 0, 'manual dry-run CLI real-redacted pilot must not publish externally');
assert(manualDryRunRealRedactedPilot?.summary?.approvalEnteredCount === 0, 'manual dry-run CLI real-redacted pilot must not enter approval path');
assert(manualDryRunRealRedactedPilot?.summary?.blockedCount === 0, 'manual dry-run CLI real-redacted pilot must not block');
assert(manualDryRunRealRedactedPilot?.summary?.allowedCount === 0, 'manual dry-run CLI real-redacted pilot must not allow');
assert(manualDryRunRealRedactedPilot?.summary?.enforcedCount === 0, 'manual dry-run CLI real-redacted pilot must not enforce');

const manualDryRunPilotFailureCatalog = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-pilot-failure-catalog.out.json'));
assert(manualDryRunPilotFailureCatalog?.pilotFailureCatalog === 'pass', 'manual dry-run pilot failure catalog verdict must be pass');
assert(manualDryRunPilotFailureCatalog?.failureCases === 14, 'manual dry-run pilot failure catalog must cover 14 cases');
assert(manualDryRunPilotFailureCatalog?.expectedRejects === 14, 'manual dry-run pilot failure catalog must reject all 14 cases');
assert(manualDryRunPilotFailureCatalog?.unexpectedAccepts === 0, 'manual dry-run pilot failure catalog must have zero unexpected accepts');
assert(manualDryRunPilotFailureCatalog?.successEvidenceWrittenForRejectedCases === 0, 'manual dry-run pilot failure catalog must write zero success evidence for rejected cases');
assert(manualDryRunPilotFailureCatalog?.forbiddenEffects === 0, 'manual dry-run pilot failure catalog must have zero forbidden effects');
assert(manualDryRunPilotFailureCatalog?.capabilityTrueCount === 0, 'manual dry-run pilot failure catalog must keep capabilities false');
assert(manualDryRunPilotFailureCatalog?.summary?.liveObserverImplemented === false, 'manual dry-run pilot failure catalog must not implement live observer');
assert(manualDryRunPilotFailureCatalog?.summary?.runtimeIntegrationImplemented === false, 'manual dry-run pilot failure catalog must not implement runtime integration');
assert(manualDryRunPilotFailureCatalog?.summary?.toolExecutionImplemented === false, 'manual dry-run pilot failure catalog must not implement tool execution');
assert(manualDryRunPilotFailureCatalog?.summary?.memoryWriteImplemented === false, 'manual dry-run pilot failure catalog must not implement memory writes');
assert(manualDryRunPilotFailureCatalog?.summary?.configWriteImplemented === false, 'manual dry-run pilot failure catalog must not implement config writes');
assert(manualDryRunPilotFailureCatalog?.summary?.approvalPathImplemented === false, 'manual dry-run pilot failure catalog must not implement approval path');
assert(manualDryRunPilotFailureCatalog?.summary?.blockingImplemented === false, 'manual dry-run pilot failure catalog must not implement blocking');
assert(manualDryRunPilotFailureCatalog?.summary?.allowingImplemented === false, 'manual dry-run pilot failure catalog must not implement allowing');
assert(manualDryRunPilotFailureCatalog?.summary?.authorizationImplemented === false, 'manual dry-run pilot failure catalog must not implement authorization');
assert(manualDryRunPilotFailureCatalog?.summary?.enforcementImplemented === false, 'manual dry-run pilot failure catalog must not implement enforcement');

const manualDryRunRealRedactedPilotExpanded = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-real-redacted-pilot-expanded.out.json'));
assert(manualDryRunRealRedactedPilotExpanded?.realRedactedPilotExpanded === 'pass', 'manual dry-run CLI expanded real-redacted pilot verdict must be pass');
assert(manualDryRunRealRedactedPilotExpanded?.cases >= 12, 'manual dry-run CLI expanded real-redacted pilot must cover at least 12 cases');
assert(manualDryRunRealRedactedPilotExpanded?.redactionReviewRecords === manualDryRunRealRedactedPilotExpanded?.cases, 'manual dry-run CLI expanded real-redacted pilot must have one redaction review record per case');
assert(manualDryRunRealRedactedPilotExpanded?.recordOnly === manualDryRunRealRedactedPilotExpanded?.cases, 'manual dry-run CLI expanded real-redacted pilot outputs must all be record-only');
assert(manualDryRunRealRedactedPilotExpanded?.validationErrors === 0, 'manual dry-run CLI expanded real-redacted pilot outputs must validate');
assert(manualDryRunRealRedactedPilotExpanded?.mismatches === 0, 'manual dry-run CLI expanded real-redacted pilot must have zero mismatches');
assert(manualDryRunRealRedactedPilotExpanded?.forbiddenEffects === 0, 'manual dry-run CLI expanded real-redacted pilot must have zero forbidden effects');
assert(manualDryRunRealRedactedPilotExpanded?.capabilityTrueCount === 0, 'manual dry-run CLI expanded real-redacted pilot must keep capabilities false');
assert(manualDryRunRealRedactedPilotExpanded?.falsePermits === 0, 'manual dry-run CLI expanded real-redacted pilot must have zero false permits');
assert(manualDryRunRealRedactedPilotExpanded?.falseCompacts === 0, 'manual dry-run CLI expanded real-redacted pilot must have zero false compacts');
assert(manualDryRunRealRedactedPilotExpanded?.boundaryLoss === 0, 'manual dry-run CLI expanded real-redacted pilot must have zero boundary loss');
assert(manualDryRunRealRedactedPilotExpanded?.rawContentPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist raw content');
assert(manualDryRunRealRedactedPilotExpanded?.privatePathsPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist private paths');
assert(manualDryRunRealRedactedPilotExpanded?.secretLikeValuesPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist secrets');
assert(manualDryRunRealRedactedPilotExpanded?.toolOutputsPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist tool outputs');
assert(manualDryRunRealRedactedPilotExpanded?.memoryTextPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist memory text');
assert(manualDryRunRealRedactedPilotExpanded?.configTextPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist config text');
assert(manualDryRunRealRedactedPilotExpanded?.approvalTextPersisted === false, 'manual dry-run CLI expanded real-redacted pilot must not persist approval text');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.liveObserverImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement live observer');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.runtimeIntegrationImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement runtime integration');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.toolExecutionImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement tool execution');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.memoryWriteImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement memory writes');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.configWriteImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement config writes');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.publicationImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement publication');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.approvalPathImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement approval path');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.blockingImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement blocking');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.allowingImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement allowing');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.authorizationImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement authorization');
assert(manualDryRunRealRedactedPilotExpanded?.summary?.enforcementImplemented === false, 'manual dry-run CLI expanded real-redacted pilot must not implement enforcement');

const manualDryRunPilotReproducibility = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-pilot-reproducibility.out.json'));
assert(manualDryRunPilotReproducibility?.pilotReproducibility === 'pass', 'manual dry-run CLI pilot reproducibility verdict must be pass');
assert(manualDryRunPilotReproducibility?.cases >= 12, 'manual dry-run CLI pilot reproducibility must cover at least 12 cases');
assert(manualDryRunPilotReproducibility?.runsPerCase === 2, 'manual dry-run CLI pilot reproducibility must run each case twice');
assert(manualDryRunPilotReproducibility?.canonicalOutputsCompared === manualDryRunPilotReproducibility?.cases, 'manual dry-run CLI pilot reproducibility must compare one canonical output per case');
assert(manualDryRunPilotReproducibility?.recordOnly === manualDryRunPilotReproducibility?.cases, 'manual dry-run CLI pilot reproducibility outputs must all be record-only');
assert(manualDryRunPilotReproducibility?.returnWriteMismatches === 0, 'manual dry-run CLI pilot reproducibility must have zero return/write mismatches');
assert(manualDryRunPilotReproducibility?.normalizedOutputMismatches === 0, 'manual dry-run CLI pilot reproducibility must have zero normalized output mismatches');
assert(manualDryRunPilotReproducibility?.committedEvidenceMismatches === 0, 'manual dry-run CLI pilot reproducibility must have zero committed evidence mismatches');
assert(manualDryRunPilotReproducibility?.decisionTraceHashMismatches === 0, 'manual dry-run CLI pilot reproducibility must have zero DecisionTrace hash mismatches');
assert(manualDryRunPilotReproducibility?.scorecardMismatches === 0, 'manual dry-run CLI pilot reproducibility must have zero scorecard mismatches');
assert(manualDryRunPilotReproducibility?.inputMutations === 0, 'manual dry-run CLI pilot reproducibility must not mutate inputs');
assert(manualDryRunPilotReproducibility?.forbiddenEffects === 0, 'manual dry-run CLI pilot reproducibility must have zero forbidden effects');
assert(manualDryRunPilotReproducibility?.capabilityTrueCount === 0, 'manual dry-run CLI pilot reproducibility must keep capabilities false');
assert(manualDryRunPilotReproducibility?.falsePermits === 0, 'manual dry-run CLI pilot reproducibility must have zero false permits');
assert(manualDryRunPilotReproducibility?.falseCompacts === 0, 'manual dry-run CLI pilot reproducibility must have zero false compacts');
assert(manualDryRunPilotReproducibility?.boundaryLoss === 0, 'manual dry-run CLI pilot reproducibility must have zero boundary loss');
assert(manualDryRunPilotReproducibility?.rawContentPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist raw content');
assert(manualDryRunPilotReproducibility?.privatePathsPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist private paths');
assert(manualDryRunPilotReproducibility?.secretLikeValuesPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist secrets');
assert(manualDryRunPilotReproducibility?.toolOutputsPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist tool outputs');
assert(manualDryRunPilotReproducibility?.memoryTextPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist memory text');
assert(manualDryRunPilotReproducibility?.configTextPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist config text');
assert(manualDryRunPilotReproducibility?.approvalTextPersisted === false, 'manual dry-run CLI pilot reproducibility must not persist approval text');
assert(manualDryRunPilotReproducibility?.summary?.liveObserverImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement live observer');
assert(manualDryRunPilotReproducibility?.summary?.runtimeIntegrationImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement runtime integration');
assert(manualDryRunPilotReproducibility?.summary?.toolExecutionImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement tool execution');
assert(manualDryRunPilotReproducibility?.summary?.memoryWriteImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement memory writes');
assert(manualDryRunPilotReproducibility?.summary?.configWriteImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement config writes');
assert(manualDryRunPilotReproducibility?.summary?.publicationImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement publication');
assert(manualDryRunPilotReproducibility?.summary?.approvalPathImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement approval path');
assert(manualDryRunPilotReproducibility?.summary?.blockingImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement blocking');
assert(manualDryRunPilotReproducibility?.summary?.allowingImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement allowing');
assert(manualDryRunPilotReproducibility?.summary?.authorizationImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement authorization');
assert(manualDryRunPilotReproducibility?.summary?.enforcementImplemented === false, 'manual dry-run CLI pilot reproducibility must not implement enforcement');

const manualDryRunPilotReproducibilityNegativeControls = readJson(path.join(packageRoot, 'evidence/manual-dry-run-cli-pilot-reproducibility-negative-controls.out.json'));
assert(manualDryRunPilotReproducibilityNegativeControls?.pilotReproducibilityNegativeControls === 'pass', 'manual dry-run CLI pilot reproducibility negative controls verdict must be pass');
assert(manualDryRunPilotReproducibilityNegativeControls?.negativeControls >= 8, 'manual dry-run CLI pilot reproducibility negative controls must cover at least 8 cases');
assert(manualDryRunPilotReproducibilityNegativeControls?.expectedRejects === manualDryRunPilotReproducibilityNegativeControls?.negativeControls, 'manual dry-run CLI pilot reproducibility negative controls must expect all controls to reject');
assert(manualDryRunPilotReproducibilityNegativeControls?.unexpectedAccepts === 0, 'manual dry-run CLI pilot reproducibility negative controls must have zero unexpected accepts');
assert(manualDryRunPilotReproducibilityNegativeControls?.expectedReasonCodeMisses === 0, 'manual dry-run CLI pilot reproducibility negative controls must match expected reason codes');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('NORMALIZED_OUTPUT_MISMATCH'), 'manual dry-run CLI pilot reproducibility negative controls must cover normalized output mismatch');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('COMMITTED_EVIDENCE_MISMATCH'), 'manual dry-run CLI pilot reproducibility negative controls must cover committed evidence mismatch');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('DECISION_TRACE_HASH_MISMATCH'), 'manual dry-run CLI pilot reproducibility negative controls must cover DecisionTrace hash mismatch');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('SCORECARD_MISMATCH'), 'manual dry-run CLI pilot reproducibility negative controls must cover scorecard mismatch');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('INPUT_MUTATION_DETECTED'), 'manual dry-run CLI pilot reproducibility negative controls must cover input mutation');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('FORBIDDEN_EFFECT_DETECTED'), 'manual dry-run CLI pilot reproducibility negative controls must cover forbidden effect');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('CAPABILITY_TRUE_DETECTED'), 'manual dry-run CLI pilot reproducibility negative controls must cover capability true');
assert(manualDryRunPilotReproducibilityNegativeControls?.coveredReasonCodes?.includes('BOUNDARY_LOSS_DETECTED'), 'manual dry-run CLI pilot reproducibility negative controls must cover boundary loss');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.liveObserverImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement live observer');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.runtimeIntegrationImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement runtime integration');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.toolExecutionImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement tool execution');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.memoryWriteImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement memory writes');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.configWriteImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement config writes');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.publicationImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement publication');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.approvalPathImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement approval path');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.blockingImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement blocking');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.allowingImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement allowing');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.authorizationImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement authorization');
assert(manualDryRunPilotReproducibilityNegativeControls?.summary?.enforcementImplemented === false, 'manual dry-run CLI pilot reproducibility negative controls must not implement enforcement');

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
  releaseTargetCommit,
  headCommit,
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
