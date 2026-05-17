import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { scorePassiveMemoryHandoffCandidates, validatePassiveMemoryHandoffCandidateArtifact } from '../src/passive-memory-handoff-candidate-scorecard.mjs';
import { passiveMemoryHandoffInput } from './passive-memory-handoff-candidate-scorecard-fixtures.mjs';

const artifact = scorePassiveMemoryHandoffCandidates(await passiveMemoryHandoffInput());
assert.deepEqual(validatePassiveMemoryHandoffCandidateArtifact(artifact), []);
assert.equal(artifact.policyDecision, null);
assert.equal(artifact.recommendationIsAuthority, false);
assert.equal(artifact.agentConsumedOutput, false);
assert.equal(artifact.notRuntimeInstruction, true);
assert.equal(artifact.noMemoryWrites, true);
assert.equal(artifact.noRuntimeIntegration, true);
assert.equal(artifact.rawPersisted, false);
assert.equal(/raw source|sourceText|toolExecution: true|networkFetch: true|memoryWrite: true|runtimeIntegration: true/i.test(artifact.reportMarkdown), false);
await mkdir('evidence', { recursive: true });
await writeFile('evidence/passive-memory-handoff-candidate-scorecard-output-boundary-v0.29.4.out.json', `${JSON.stringify({ handoffStatus: artifact.handoffStatus, policyDecision: artifact.policyDecision }, null, 2)}\n`);
await writeFile('evidence/passive-memory-handoff-candidate-scorecard-report-v0.29.4.out.md', artifact.reportMarkdown);
console.log(JSON.stringify({ handoffStatus: artifact.handoffStatus, policyDecision: artifact.policyDecision }, null, 2));
