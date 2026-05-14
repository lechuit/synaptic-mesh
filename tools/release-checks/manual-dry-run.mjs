import path from 'node:path';

export const manualDryRunGateScripts = Object.freeze([
  'test:manual-dry-run-contracts',
  'test:manual-dry-run-cli',
  'test:manual-dry-run-cli-negative-controls',
  'test:manual-dry-run-cli-real-redacted-handoffs',
  'test:manual-dry-run-cli-real-redacted-pilot',
  'test:manual-dry-run-cli-pilot-failure-catalog',
  'test:manual-dry-run-cli-real-redacted-pilot-expanded',
  'test:manual-dry-run-cli-pilot-reproducibility',
  'test:manual-dry-run-cli-pilot-reproducibility-negative-controls',
]);

export const manualDryRunRequiredManifestPaths = Object.freeze([
  'tools/release-checks/manual-dry-run.mjs',
  'implementation/synaptic-mesh-shadow-v0/src/manual-dry-run.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/manual-dry-run.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-contracts.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-negative-controls.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-real-redacted-handoffs.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-real-redacted-pilot.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-pilot-failure-catalog.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-real-redacted-pilot-expanded.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-pilot-reproducibility.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/manual-dry-run-cli-pilot-reproducibility-negative-controls.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-contracts.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-negative-controls.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-real-redacted-handoffs.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-real-redacted-pilot.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-pilot-failure-catalog.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-real-redacted-pilot-expanded.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-pilot-reproducibility.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli-pilot-reproducibility-negative-controls.out.json',
]);

export function assertManualDryRunRelease({ packageRoot, readJson, assert }) {
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

}

export const manualDryRunSuite = Object.freeze({
  name: 'manual-dry-run',
  gatePhase: 'post-real-redacted',
  assertReleasePhase: 'post-real-redacted',
  gateScripts: manualDryRunGateScripts,
  requiredManifestPaths: manualDryRunRequiredManifestPaths,
  assertRelease: assertManualDryRunRelease,
});
