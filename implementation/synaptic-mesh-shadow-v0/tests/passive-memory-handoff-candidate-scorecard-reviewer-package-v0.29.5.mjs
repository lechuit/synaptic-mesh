import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { scorePassiveMemoryHandoffCandidates } from '../src/passive-memory-handoff-candidate-scorecard.mjs';
import { passiveMemoryHandoffInput } from './passive-memory-handoff-candidate-scorecard-fixtures.mjs';

const artifact = scorePassiveMemoryHandoffCandidates(await passiveMemoryHandoffInput());
assert.equal(artifact.handoffStatus, 'MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE');
assert.equal(artifact.metrics.candidateCount, 4);
assert.equal(artifact.metrics.sourceBoundCandidateRatio, 1);
assert.equal(artifact.metrics.noiseSuppressionRatio, 1);
await mkdir('evidence', { recursive: true });
await writeFile('evidence/passive-memory-handoff-candidate-scorecard-reviewer-package-v0.29.5.out.json', `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile('evidence/passive-memory-handoff-candidate-scorecard-report-v0.29.5.out.md', artifact.reportMarkdown);
console.log(JSON.stringify({ handoffStatus: artifact.handoffStatus, candidates: artifact.candidates.length }, null, 2));
