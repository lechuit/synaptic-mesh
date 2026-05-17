import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { controlledOperatorReviewQueueProtocol } from '../src/controlled-operator-review-queue.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const protocol = controlledOperatorReviewQueueProtocol();
assert.equal(protocol.releaseLayer, 'v0.23.0-alpha');
for (const key of ['disabledByDefault','manualOperatorRunOnly','localOnly','passiveOnly','readOnly','oneShot','redactedEvidenceOnly','humanReadableOnly','nonAuthoritative','queueIsPrioritizationArtifactOnly','notDecisionApprovalQueue']) assert.equal(protocol[key], true, key);
assert.equal(protocol.policyDecision, null);
for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrites','networkFetch','resourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','machineReadablePolicyDecision','runtimeAuthority']) assert.equal(protocol[key], false, key);
await writeFile(resolve('evidence/controlled-operator-review-queue-protocol-v0.23.0-alpha.out.json'), JSON.stringify(protocol, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, protocol: protocol.releaseLayer }, null, 2));
