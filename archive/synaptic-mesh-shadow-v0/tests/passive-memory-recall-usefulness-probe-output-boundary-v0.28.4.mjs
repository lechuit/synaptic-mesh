import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveMemoryRecallUsefulness, validatePassiveMemoryRecallUsefulnessArtifact } from '../src/passive-memory-recall-usefulness-probe.mjs';
import { passiveMemoryRecallInput } from './passive-memory-recall-usefulness-probe-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = scorePassiveMemoryRecallUsefulness(await passiveMemoryRecallInput());
assert.equal(artifact.probeStatus, 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE');
assert.equal(artifact.policyDecision, null);
assert.equal(artifact.recommendationIsAuthority, false);
assert.deepEqual(validatePassiveMemoryRecallUsefulnessArtifact(artifact), []);
await writeFile(resolve('evidence/passive-memory-recall-usefulness-probe-output-boundary-v0.28.4.out.json'), JSON.stringify({ probeStatus: artifact.probeStatus, policyDecision: null, recommendationIsAuthority: false, validationIssues: [] }, null, 2) + '\n');
await writeFile(resolve('evidence/passive-memory-recall-usefulness-probe-report-v0.28.4.out.md'), artifact.reportMarkdown);
console.log(JSON.stringify({ probeStatus: artifact.probeStatus, policyDecision: artifact.policyDecision }, null, 2));
