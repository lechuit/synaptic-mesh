import { passiveLiveShadowCanarySuite } from './passive-live-shadow-canary.mjs';
import { readOnlyLocalFileAdapterSuite } from './read-only-local-file-adapter.mjs';
import { manualDryRunSuite } from './manual-dry-run.mjs';
import { frameworkShapedAdapterSuite } from './framework-shaped-adapter.mjs';
import { frameworkIntegrationReadinessSuite } from './framework-integration-readiness.mjs';
import { authorityConfusionBenchmarkSuite } from './authority-confusion-benchmark.mjs';
import { localHarnessLadderSuite } from './local-harness-ladder.mjs';
import { liveLikeShadowSandboxSuite } from './live-like-shadow-sandbox-ladder.mjs';
import { passiveLiveShadowLocalPilotSuite } from './passive-live-shadow-local-pilot.mjs';
import { tinyOperatorPassivePilotSuite } from './tiny-operator-passive-pilot.mjs';
import { limitedPassiveLiveCaptureReadinessSuite } from './limited-passive-live-capture-readiness.mjs';
import { liveReadGateSuite } from './live-read-gate.mjs';
import { liveAdapterShadowReadSuite } from './live-adapter-shadow-read.mjs';
import { boundedMultisourceShadowReadSuite } from './bounded-multisource-shadow-read.mjs';
import { positiveUtilityPassGateSuite } from './positive-utility-pass-gate.mjs';
import { observedUsefulnessNoiseScorecardSuite } from './observed-usefulness-noise-scorecard.mjs';
import { controlledOperatorReviewQueueSuite } from './controlled-operator-review-queue.mjs';
import { operatorReviewOutcomeCaptureSuite } from './operator-review-outcome-capture.mjs';
import { operatorOutcomeValueScorecardSuite } from './operator-outcome-value-scorecard.mjs';
import { passiveObservationWindowSuite } from './passive-observation-window.mjs';
import { passiveObservationRepeatabilityScorecardSuite } from './passive-observation-repeatability-scorecard.mjs';
import { passiveMemoryRecallUsefulnessProbeSuite } from './passive-memory-recall-usefulness-probe.mjs';
import { passiveMemoryHandoffCandidateScorecardSuite } from './passive-memory-handoff-candidate-scorecard.mjs';
import { passiveHandoffReceiverShadowRubricSuite } from './passive-handoff-receiver-shadow-rubric.mjs';
import { passiveSourceAuthorityConflictScorecardSuite } from './passive-source-authority-conflict-scorecard.mjs';
import { passiveContextAssemblyRehearsalScorecardSuite } from './passive-context-assembly-rehearsal-scorecard.mjs';
import { passiveContextAssemblyHardCasesSuite } from './passive-context-assembly-hard-cases.mjs';
import { passiveHardCaseOutcomeValueScorecardSuite } from './passive-hard-case-outcome-value-scorecard.mjs';
import { passiveHardCaseOutcomeRepeatabilityScorecardSuite } from './passive-hard-case-outcome-repeatability-scorecard.mjs';
import { passiveLiveMemoryCoherenceObservationRehearsalSuite } from './passive-live-memory-coherence-observation-rehearsal.mjs';
import { passiveLiveMemoryCoherenceRepeatabilityScorecardSuite } from './passive-live-memory-coherence-repeatability-scorecard.mjs';
import { passiveLiveMemoryCoherenceUsefulnessWindowSuite } from './passive-live-memory-coherence-usefulness-window.mjs';
import { passiveLiveMemoryCoherenceInvalidationWindowSuite } from './passive-live-memory-coherence-stale-contradiction-invalidation-window.mjs';
import { passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardSuite } from './passive-live-memory-coherence-invalidation-repeatability-scorecard.mjs';
import { passiveLiveMemoryCoherenceStableInvalidationReceiverPackageSuite } from './passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';
import { passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalSuite } from './passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs';
import { passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityScorecardSuite } from './passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard.mjs';
import { passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSuite } from './passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';

export const releaseCheckSuites = Object.freeze([
  passiveLiveShadowCanarySuite,
  readOnlyLocalFileAdapterSuite,
  manualDryRunSuite,
  frameworkShapedAdapterSuite,
  frameworkIntegrationReadinessSuite,
  authorityConfusionBenchmarkSuite,
  localHarnessLadderSuite,
  liveLikeShadowSandboxSuite,
  passiveLiveShadowLocalPilotSuite,
  tinyOperatorPassivePilotSuite,
  limitedPassiveLiveCaptureReadinessSuite,
  liveReadGateSuite,
  liveAdapterShadowReadSuite,
  boundedMultisourceShadowReadSuite,
  positiveUtilityPassGateSuite,
  observedUsefulnessNoiseScorecardSuite,
  controlledOperatorReviewQueueSuite,
  operatorReviewOutcomeCaptureSuite,
  operatorOutcomeValueScorecardSuite,
  passiveObservationWindowSuite,
  passiveObservationRepeatabilityScorecardSuite,
  passiveMemoryRecallUsefulnessProbeSuite,
  passiveMemoryHandoffCandidateScorecardSuite,
  passiveHandoffReceiverShadowRubricSuite,
  passiveSourceAuthorityConflictScorecardSuite,
  passiveContextAssemblyRehearsalScorecardSuite,
  passiveContextAssemblyHardCasesSuite,
  passiveHardCaseOutcomeValueScorecardSuite,
  passiveHardCaseOutcomeRepeatabilityScorecardSuite,
  passiveLiveMemoryCoherenceObservationRehearsalSuite,
  passiveLiveMemoryCoherenceRepeatabilityScorecardSuite,
  passiveLiveMemoryCoherenceUsefulnessWindowSuite,
  passiveLiveMemoryCoherenceInvalidationWindowSuite,
  passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardSuite,
  passiveLiveMemoryCoherenceStableInvalidationReceiverPackageSuite,
  passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalSuite,
  passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityScorecardSuite,
  passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSuite,
]);
