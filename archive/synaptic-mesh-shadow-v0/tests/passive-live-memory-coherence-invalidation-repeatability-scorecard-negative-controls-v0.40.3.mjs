import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { canonicalInput, clone } from './passive-live-memory-coherence-invalidation-repeatability-scorecard-fixtures.mjs';
import { validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput, scorePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecard, validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardArtifact } from '../src/passive-live-memory-coherence-invalidation-repeatability-scorecard.mjs';

const base = canonicalInput();
function c(){ return clone(base); }
function reject(name, mutate){
  const input = c();
  mutate(input);
  const validationIssues = validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput(input);
  assert.ok(validationIssues.length > 0, `${name} should reject`);
  return { name, validationIssues };
}
const controls = [
  { name:'malformed-null', run:()=>({ name:'malformed-null', validationIssues: validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput(null) }) },
  { name:'unknown-top-level-field', mutate:(i)=>{ i.unexpected = true; } },
  { name:'traversal-parent-path', mutate:(i)=>{ i.invalidationArtifactPath = '../evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json'; } },
  { name:'traversal-repo-shaped-path', mutate:(i)=>{ i.invalidationArtifactPath = '../../implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json'; } },
  { name:'absolute-path-not-pinned', mutate:(i)=>{ i.invalidationArtifactPath = '/tmp/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json'; } },
  { name:'digest-wrong', mutate:(i)=>{ i.invalidationArtifactSha256 = '0'.repeat(64); } },
  { name:'object-digest-mismatch', mutate:(i)=>{ i.invalidationArtifact.releaseLayer = 'v0.39.4'; } },
  { name:'artifact-name-wrong', mutate:(i)=>{ i.invalidationArtifact.artifact = 'wrong'; } },
  { name:'schema-wrong', mutate:(i)=>{ i.invalidationArtifact.schemaVersion = 'wrong'; } },
  { name:'status-degraded', mutate:(i)=>{ i.invalidationArtifact.invalidationWindowStatus = 'DEGRADED'; } },
  { name:'report-digest-mismatch', mutate:(i)=>{ i.invalidationArtifact.reportMarkdown += '\nextra'; } },
  { name:'prior-validation-issue', mutate:(i)=>{ i.invalidationArtifact.validationIssues = ['prior_issue']; } },
  { name:'candidate-count-missing', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates = i.invalidationArtifact.invalidationCandidates.slice(0,4); } },
  { name:'candidate-unknown', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].candidateId = 'candidate-unknown'; } },
  { name:'candidate-extra-field', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].extra = true; } },
  { name:'candidate-source-unbound', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].sourceBound = false; } },
  { name:'candidate-stable-source-false', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].stableSourceSignal = false; } },
  { name:'candidate-redaction-false', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].redactedBeforePersist = false; } },
  { name:'candidate-raw-persisted', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].rawPersisted = true; } },
  { name:'candidate-not-human-review', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].humanReviewOnly = false; } },
  { name:'candidate-promotes-memory', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].promoteToMemory = true; } },
  { name:'candidate-agent-consumed', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].agentConsumedOutput = true; } },
  { name:'candidate-recommendation-authority', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].recommendationIsAuthority = true; } },
  { name:'candidate-policy-decision', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].policyDecision = 'allow'; } },
  { name:'stale-not-stale', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-stale-prior-release-anchor').stale = false; } },
  { name:'stale-not-invalidated', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-stale-prior-release-anchor').invalidated = false; } },
  { name:'stale-treatment-wrong', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-stale-prior-release-anchor').invalidationTreatment = 'carry_forward_valid'; } },
  { name:'contradiction-not-contradiction', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-contradictory-boundary-claim').contradictsActiveBoundary = false; } },
  { name:'contradiction-human-treatment-wrong', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-contradictory-boundary-claim').humanTreatment = 'include_for_human_handoff'; } },
  { name:'contradiction-invalidated', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-contradictory-boundary-claim').invalidated = true; } },
  { name:'valid-carry-forward-not-carried', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].validCarryForward = false; } },
  { name:'valid-carry-forward-invalidated', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].invalidated = true; } },
  { name:'valid-carry-forward-stale', mutate:(i)=>{ i.invalidationArtifact.invalidationCandidates[0].stale = true; } },
  { name:'metric-candidate-count-wrong', mutate:(i)=>{ i.invalidationArtifact.metrics.candidateSignalCount = 4; } },
  { name:'metric-stale-count-wrong', mutate:(i)=>{ i.invalidationArtifact.metrics.staleSignalCount = 0; } },
  { name:'metric-contradiction-count-wrong', mutate:(i)=>{ i.invalidationArtifact.metrics.contradictionSignalCount = 0; } },
  { name:'metric-policy-decision', mutate:(i)=>{ i.invalidationArtifact.metrics.policyDecision = 'allow'; } },
  { name:'external-effect-request', mutate:(i)=>{ i.externalEffects = true; } },
  { name:'tool-execution-request', mutate:(i)=>{ i.toolExecution = true; } },
  { name:'memory-write-request', mutate:(i)=>{ i.memoryWrite = true; } },
  { name:'config-write-request', mutate:(i)=>{ i.configWrite = true; } },
  { name:'runtime-integration-request', mutate:(i)=>{ i.runtimeIntegration = true; } },
  { name:'daemon-request', mutate:(i)=>{ i.daemon = true; } },
  { name:'raw-output-request', mutate:(i)=>{ i.rawOutput = true; } },
];
const rejectedNegativeControls = controls.map((control)=>control.run ? control.run() : reject(control.name, control.mutate));
assert.ok(rejectedNegativeControls.every((control)=>control.validationIssues.length > 0));
assert.ok(rejectedNegativeControls.length >= 40);

const driftInput = c();
driftInput.invalidationArtifact.invalidationCandidates.find((x)=>x.candidateId === 'candidate-stale-prior-release-anchor').invalidationTreatment = 'carry_forward_valid';
const driftOut = scorePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecard(driftInput);
assert.equal(driftOut.recommendation, 'HOLD_FOR_MORE_EVIDENCE');
assert.ok(driftOut.validationIssues.length > 0);

const artifact = scorePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecard(base);
const artifactMutation = clone(artifact);
artifactMutation.repeatabilityItems[0].agentConsumedOutput = true;
assert.ok(validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardArtifact(artifactMutation).length > 0);

mkdirSync('evidence',{recursive:true});
writeFileSync('evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-negative-controls-v0.40.3.out.json', JSON.stringify({ rejectedNegativeControls, driftStatus: driftOut.repeatabilityStatus, driftRecommendation: driftOut.recommendation, artifactMutationRejected: true }, null, 2)+'\n');
