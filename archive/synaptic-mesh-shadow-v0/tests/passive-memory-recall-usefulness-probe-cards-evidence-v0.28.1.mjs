import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveMemoryRecallUsefulness } from '../src/passive-memory-recall-usefulness-probe.mjs';
import { passiveMemoryRecallInput } from './passive-memory-recall-usefulness-probe-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = scorePassiveMemoryRecallUsefulness(await passiveMemoryRecallInput());
assert.equal(artifact.probeStatus, 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE');
assert.equal(artifact.coverage.decision, 1);
assert.equal(artifact.coverage.project_rule, 1);
assert.equal(artifact.coverage.contradiction, 1);
assert.equal(artifact.coverage.stale_negative_context, 1);
assert.equal(artifact.metrics.cardCount, 4);
assert.equal(artifact.metrics.evidenceCount, 5);
assert.equal(artifact.metrics.sourceArtifactCount, 1);
assert.equal(artifact.policyDecision, null);
await writeFile(resolve('evidence/passive-memory-recall-usefulness-probe-cards-evidence-v0.28.1.out.json'), JSON.stringify({ coverage: artifact.coverage, metrics: artifact.metrics, cardSummaries: artifact.cardSummaries }, null, 2) + '\n');
console.log(JSON.stringify({ cardCount: artifact.metrics.cardCount, evidenceCount: artifact.metrics.evidenceCount }, null, 2));
