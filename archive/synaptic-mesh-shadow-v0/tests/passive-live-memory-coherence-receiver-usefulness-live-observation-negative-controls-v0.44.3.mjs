import assert from 'node:assert/strict';
import {
  assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInputPathPinned,
  assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSourcePathPinned,
  scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation,
  validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput,
} from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';
import { receiverUsefulnessLiveObservationInputFixture } from './passive-live-memory-coherence-receiver-usefulness-live-observation-fixtures.mjs';

const input = await receiverUsefulnessLiveObservationInputFixture();
const cases = [
  { ...input, sourceArtifactPath: '../evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json' },
  { ...input, sourceArtifactSha256: 'bad' },
  { ...input, sourceArtifact: { ...input.sourceArtifact, releaseLayer: 'v0.43.4' } },
  { ...input, sourceArtifact: { ...input.sourceArtifact, metrics: { ...input.sourceArtifact.metrics, stableCandidateCount: 4 } } },
  { ...input, sourceArtifact: { ...input.sourceArtifact, stableUsefulnessJudgements: input.sourceArtifact.stableUsefulnessJudgements.slice(0, 4) } },
  { ...input, liveSourcePacks: input.liveSourcePacks.slice(0, 3) },
  { ...input, liveSourcePacks: [{ ...input.liveSourcePacks[0], path: 'docs/status-v0.42.5.md' }, ...input.liveSourcePacks.slice(1)] },
  { ...input, liveSourcePacks: [{ ...input.liveSourcePacks[0], path: '../../docs/status-v0.43.5.md' }, ...input.liveSourcePacks.slice(1)] },
  { ...input, liveSourcePacks: [{ ...input.liveSourcePacks[0], sha256: 'bad' }, ...input.liveSourcePacks.slice(1)] },
  { ...input, liveSourcePacks: [{ ...input.liveSourcePacks[0], rawPersisted: true }, ...input.liveSourcePacks.slice(1)] },
  { ...input, liveSourcePacks: [{ ...input.liveSourcePacks[0], repoLocalSource: false }, ...input.liveSourcePacks.slice(1)] },
  { ...input, externalEffects: true },
  { ...input, toolExecution: true },
  { ...input, memoryWrite: true },
  { ...input, runtimeIntegration: true },
  { ...input, rawOutput: true },
  { ...input, sourceArtifact: { ...input.sourceArtifact, policyDecision: 'approve' } },
];
const rejected = cases.map((c) => validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput(c)).filter((issues) => issues.length > 0);
assert.equal(rejected.length, cases.length);
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInputPathPinned('../evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json'));
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSourcePathPinned('../../docs/status-v0.42.5.md'));
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSourcePathPinned('../../docs/status-v0.43.5.md'));
const degraded = scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation({ ...input, sourceArtifactSha256: 'bad' });
assert.equal(degraded.liveObservationStatus, 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION');
assert.equal(degraded.recommendation, 'HOLD_FOR_MORE_EVIDENCE');
console.log(JSON.stringify({ rejectedNegativeControls: rejected.length, preReadPathPinningControls: 3 }));
