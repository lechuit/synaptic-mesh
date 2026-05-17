import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { scorePassiveMemoryHandoffCandidates, validatePassiveMemoryHandoffCandidateArtifact } from '../src/passive-memory-handoff-candidate-scorecard.mjs';
import { passiveMemoryHandoffInput } from './passive-memory-handoff-candidate-scorecard-fixtures.mjs';

const artifact = scorePassiveMemoryHandoffCandidates(await passiveMemoryHandoffInput());
assert.equal(artifact.handoffStatus, 'MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE');
assert.equal(artifact.candidates.length, 4);
assert.equal(artifact.candidates.every((candidate) => candidate.sourceBound), true);
assert.equal(artifact.candidates.some((candidate) => candidate.treatment === 'carry_forward_candidate'), true);
assert.equal(artifact.candidates.some((candidate) => candidate.treatment === 'surface_contradiction_candidate'), true);
assert.equal(artifact.candidates.some((candidate) => candidate.treatment === 'stale_caution_candidate'), true);
assert.equal(artifact.candidates.find((candidate) => candidate.cardType === 'contradiction').contradictionFlagged, true);
assert.equal(artifact.candidates.find((candidate) => candidate.cardType === 'stale_negative_context').staleCautionFlagged, true);
assert.deepEqual(validatePassiveMemoryHandoffCandidateArtifact(artifact), []);
await mkdir('evidence', { recursive: true });
await writeFile('evidence/passive-memory-handoff-candidate-scorecard-candidates-v0.29.1.out.json', `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ handoffStatus: artifact.handoffStatus, candidates: artifact.candidates.length }, null, 2));
