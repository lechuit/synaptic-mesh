import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveLiveShadowCanaryGateScripts = Object.freeze([
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
  'test:passive-live-shadow-canary-advisory-reviewer-runbook',
  'test:passive-live-shadow-canary-advisory-public-review-package',
]);

export const passiveLiveShadowCanaryRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-shadow-canary.mjs',
  'docs/status-v0.3.5.md',
  'docs/advisory-public-review-package.md',
  'docs/status-v0.3.4.md',
  'docs/advisory-report-reviewer-runbook.md',
  'docs/status-v0.3.3.md',
  'docs/status-v0.3.2.md',
  'docs/status-v0.3.1.md',
  'docs/status-v0.3.0-alpha.md',
  'docs/status-v0.2.6.md',
  'docs/status-v0.2.5.md',
  'implementation/synaptic-mesh-shadow-v0/tests/live-input-source-boundary-contracts.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/live-input-source-boundary-contracts.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-input-source-boundary-contracts.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-reproducibility.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-reproducibility.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-source-boundary-stress.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-source-boundary-stress.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-stress.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-drift-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-drift-scorecard.out.json',
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
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-reviewer-runbook.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-reviewer-runbook.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-reviewer-runbook.out.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-public-review-package.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-public-review-package.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-public-review-package.out.json',
]);

export function assertPassiveLiveShadowCanaryManifestMetadata({ manifest, manifestReleaseTag, assertIncludes, assertNotIncludes }) {
  if (manifestReleaseTag === 'v0.3.5') {
    assertIncludes(manifest.reproducibility, 'advisory_public_review_package', 'MANIFEST.json reproducibility');
    assertIncludes(manifest.reproducibility, 'evidence_6', 'MANIFEST.json reproducibility');
    assertIncludes(manifest.reproducibility, 'docs_7', 'MANIFEST.json reproducibility');
    assertIncludes(manifest.reproducibility, 'missing_0', 'MANIFEST.json reproducibility');
    assertIncludes(manifest.reproducibility, 'forbidden_0', 'MANIFEST.json reproducibility');
    assertNotIncludes(manifest.reproducibility, 'expected_rejects_10', 'MANIFEST.json reproducibility');
    assertNotIncludes(manifest.reproducibility, 'expected_rejects_12', 'MANIFEST.json reproducibility');
  }


}

export function assertPassiveLiveShadowCanaryRelease({ packageRoot, readJson, assert, assertIncludes, assertNotIncludes }) {
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
  const passiveCanaryAdvisoryReviewerRunbook = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-reviewer-runbook.out.json'));
  const passiveCanaryAdvisoryPublicReviewPackage = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-canary-advisory-public-review-package.out.json'));
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

  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.advisoryReviewerRunbook === 'pass', 'passive canary advisory reviewer runbook verdict must be pass');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.releaseLayer === 'v0.3.4', 'passive canary advisory reviewer runbook release layer must remain v0.3.4 baseline evidence');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.dependsOn === 'v0.3.3-advisory-report-reproducibility', 'passive canary advisory reviewer runbook must depend on v0.3.3 reproducibility');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.mode === 'manual_local_advisory_reviewer_runbook_record_only', 'passive canary advisory reviewer runbook mode must remain record-only');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.requiredPhrases === 10, 'passive canary advisory reviewer runbook must keep 10 required phrases');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.missingRequiredPhrases === 0, 'passive canary advisory reviewer runbook must have zero missing required phrases');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.requiredSections === 6, 'passive canary advisory reviewer runbook must keep 6 required sections');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.missingRequiredSections === 0, 'passive canary advisory reviewer runbook must have zero missing sections');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.forbiddenPhraseFindings === 0, 'passive canary advisory reviewer runbook must have zero forbidden phrase findings');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.requiredCommands === 6, 'passive canary advisory reviewer runbook must keep 6 required commands');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.missingCommands === 0, 'passive canary advisory reviewer runbook must have zero missing commands');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.failureCatalogExpectedRejects === 12, 'passive canary advisory reviewer runbook must preserve v0.3.2 failure catalog count');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.failureCatalogUnexpectedAccepts === 0, 'passive canary advisory reviewer runbook must preserve zero failure catalog unexpected accepts');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.reproducibilityRuns === 2, 'passive canary advisory reviewer runbook must preserve v0.3.3 run count');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.reproducibilityMismatches === 0, 'passive canary advisory reviewer runbook must preserve zero reproducibility mismatches');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.unicodeTextFindings === 0, 'passive canary advisory reviewer runbook must preserve zero unicode text findings');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.unicodeMachineReadableFindings === 0, 'passive canary advisory reviewer runbook must preserve zero unicode machine-readable findings');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.machineReadablePolicyDecision === false, 'passive canary advisory reviewer runbook must not become machine-readable policy');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.consumedByAgent === false, 'passive canary advisory reviewer runbook must not be agent-consumed');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.authoritative === false, 'passive canary advisory reviewer runbook must not be authoritative');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.mayApprove === false, 'passive canary advisory reviewer runbook must not approve');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.mayBlock === false, 'passive canary advisory reviewer runbook must not block');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.mayAllow === false, 'passive canary advisory reviewer runbook must not allow');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.mayAuthorize === false, 'passive canary advisory reviewer runbook must not authorize');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.mayEnforce === false, 'passive canary advisory reviewer runbook must not enforce');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.runtimeIntegrated === false, 'passive canary advisory reviewer runbook must not integrate runtime');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.toolExecutionImplemented === false, 'passive canary advisory reviewer runbook must not execute tools');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.memoryWriteImplemented === false, 'passive canary advisory reviewer runbook must not write memory');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.configWriteImplemented === false, 'passive canary advisory reviewer runbook must not write config');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.externalPublicationImplemented === false, 'passive canary advisory reviewer runbook must not publish externally');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.approvalPathImplemented === false, 'passive canary advisory reviewer runbook must not enter approval path');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.blockingImplemented === false, 'passive canary advisory reviewer runbook must not block');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.allowingImplemented === false, 'passive canary advisory reviewer runbook must not allow');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.authorizationImplemented === false, 'passive canary advisory reviewer runbook must not authorize');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.enforcementImplemented === false, 'passive canary advisory reviewer runbook must not enforce');
  assert(passiveCanaryAdvisoryReviewerRunbook?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary advisory reviewer runbook must not be consumed automatically by agents');

  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.advisoryPublicReviewPackage === 'pass', 'passive canary advisory public review package verdict must be pass');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.releaseLayer === 'v0.3.5', 'passive canary advisory public review package release layer must remain v0.3.5 baseline evidence');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.dependsOn === 'v0.3.4-advisory-reviewer-runbook', 'passive canary advisory public review package must depend on v0.3.4 runbook');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.mode === 'manual_local_advisory_public_review_package_record_only', 'passive canary advisory public review package mode must remain record-only');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.requiredEvidence === 6, 'passive canary advisory public review package must keep 6 evidence entries');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.missingEvidence === 0, 'passive canary advisory public review package must have zero missing evidence');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.requiredDocs === 7, 'passive canary advisory public review package must keep 7 doc entries');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.missingDocs === 0, 'passive canary advisory public review package must have zero missing docs');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.requiredPhrases === 10, 'passive canary advisory public review package must keep 10 required phrases');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.missingRequiredPhrases === 0, 'passive canary advisory public review package must have zero missing phrases');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.forbiddenPhraseFindings === 0, 'passive canary advisory public review package must have zero forbidden phrase findings');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.failureCatalogExpectedRejects === 12, 'passive canary advisory public review package must preserve v0.3.2 failure catalog count');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.failureCatalogUnexpectedAccepts === 0, 'passive canary advisory public review package must preserve zero failure catalog unexpected accepts');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.reproducibilityRuns === 2, 'passive canary advisory public review package must preserve v0.3.3 run count');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.reproducibilityMismatches === 0, 'passive canary advisory public review package must preserve zero reproducibility mismatches');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.runbookRequiredPhrases === 10, 'passive canary advisory public review package must preserve v0.3.4 required phrase count');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.runbookRequiredSections === 6, 'passive canary advisory public review package must preserve v0.3.4 section count');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.runbookRequiredCommands === 6, 'passive canary advisory public review package must preserve v0.3.4 command count');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.unicodeTextFindings === 0, 'passive canary advisory public review package must preserve zero unicode text findings');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.unicodeMachineReadableFindings === 0, 'passive canary advisory public review package must preserve zero unicode machine-readable findings');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.machineReadablePolicyDecision === false, 'passive canary advisory public review package must not become machine-readable policy');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.consumedByAgent === false, 'passive canary advisory public review package must not be agent-consumed');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.authoritative === false, 'passive canary advisory public review package must not be authoritative');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.mayApprove === false, 'passive canary advisory public review package must not approve');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.mayBlock === false, 'passive canary advisory public review package must not block');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.mayAllow === false, 'passive canary advisory public review package must not allow');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.mayAuthorize === false, 'passive canary advisory public review package must not authorize');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.mayEnforce === false, 'passive canary advisory public review package must not enforce');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.runtimeIntegrated === false, 'passive canary advisory public review package must not integrate runtime');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.toolExecutionImplemented === false, 'passive canary advisory public review package must not execute tools');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.memoryWriteImplemented === false, 'passive canary advisory public review package must not write memory');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.configWriteImplemented === false, 'passive canary advisory public review package must not write config');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.externalPublicationImplemented === false, 'passive canary advisory public review package must not publish externally');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.approvalPathImplemented === false, 'passive canary advisory public review package must not enter approval path');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.blockingImplemented === false, 'passive canary advisory public review package must not block');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.allowingImplemented === false, 'passive canary advisory public review package must not allow');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.authorizationImplemented === false, 'passive canary advisory public review package must not authorize');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.enforcementImplemented === false, 'passive canary advisory public review package must not enforce');
  assert(passiveCanaryAdvisoryPublicReviewPackage?.summary?.automaticAgentConsumptionImplemented === false, 'passive canary advisory public review package must not be consumed automatically by agents');

}

export const passiveLiveShadowCanarySuite = Object.freeze({
  name: 'passive-live-shadow-canary',
  gatePhase: 'pre-live-shadow-synthetic',
  assertReleasePhase: 'pre-live-shadow-synthetic',
  gateScripts: passiveLiveShadowCanaryGateScripts,
  requiredManifestPaths: passiveLiveShadowCanaryRequiredManifestPaths,
  assertManifestMetadata: assertPassiveLiveShadowCanaryManifestMetadata,
  assertRelease: assertPassiveLiveShadowCanaryRelease,
});
