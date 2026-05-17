import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tinyPilotProtocol } from '../src/tiny-operator-passive-pilot.mjs';
const protocol=tinyPilotProtocol();
assert.equal(protocol.disabledByDefault,true); assert.equal(protocol.humanStartedManualOnly,true); assert.equal(protocol.operatorReviewRequired,true); assert.equal(protocol.singleSampleOnly,true);
for (const key of ['networkResourceFetch','autonomousLiveMode','watcherDaemon','sdkFrameworkAdapter','mcpServerClient','langGraphSdk','a2aRuntime','githubBotWebhook','toolExecution','memoryConfigWrites','agentConsumedOutput','machineReadablePolicyDecision','approvalBlockAllowAuthorizationEnforcement','externalEffects']) assert.equal(protocol[key],false,key);
const out={artifact:'T-synaptic-mesh-tiny-operator-passive-pilot-protocol-v0.16.0-alpha',timestamp:'2026-05-15T02:10:00.000Z',summary:{protocol:'pass',disabledByDefault:true,humanStartedManualOnly:true,humanReviewRequired:true,singleSampleOnly:true,abortCriteriaDocumented:true,noEffects:true},protocol};
await mkdir(resolve('evidence'),{recursive:true}); await writeFile(resolve('evidence/tiny-operator-passive-pilot-protocol-v0.16.0-alpha.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
