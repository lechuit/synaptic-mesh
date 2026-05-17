import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { operatorOutcomeValueScorecardProtocol } from '../src/operator-outcome-value-scorecard.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const protocol = operatorOutcomeValueScorecardProtocol();
assert.equal(protocol.releaseLayer, 'v0.25.0-alpha');
assert.equal(protocol.consumesOperatorReviewOutcomeCaptureArtifacts, true);
assert.equal(protocol.disabledByDefault, true);
for (const key of ['manualOperatorRunOnly','localOnly','passiveOnly','readOnly','oneShot','humanReadableOnly','nonAuthoritative','valueScorecardOnly','notPolicyArtifact']) assert.equal(protocol[key], true, key);
assert.equal(protocol.policyDecision, null);
for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','machineReadablePolicyDecision','runtimeAuthority']) assert.equal(protocol[key], false, key);
assert.deepEqual(protocol.recommendations, ['ADVANCE_OBSERVATION_ONLY','HOLD_FOR_MORE_EVIDENCE','DEGRADE_QUEUE_SIGNAL']);
await writeFile(resolve('evidence/operator-outcome-value-scorecard-protocol-v0.25.0-alpha.out.json'), JSON.stringify(protocol, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, releaseLayer: protocol.releaseLayer }, null, 2));
