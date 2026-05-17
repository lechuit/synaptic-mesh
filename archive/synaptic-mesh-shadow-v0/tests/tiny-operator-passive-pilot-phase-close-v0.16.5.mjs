import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runTinyPilotLocalInput } from '../src/tiny-operator-passive-pilot.mjs';
const packet=JSON.parse(await runTinyPilotLocalInput({input:resolve('fixtures/tiny-operator-passive-pilot-sample-v0.16.1.txt'),stdout:true}));
assert.equal(packet.summary.tinyOperatorRunPassivePilotReadiness,'pass'); assert.equal(packet.summary.unexpectedPermits,0); assert.equal(packet.summary.externalEffects,false); assert.equal(packet.summary.enforcement,false);
const out={artifact:'T-synaptic-mesh-tiny-operator-passive-pilot-phase-close-v0.16.5',timestamp:'2026-05-15T02:15:00.000Z',summary:{phaseClose:'pass',tinyOperatorRunPassivePilotReadiness:true,nextStep:'v0.17 limited passive live capture design only if gates/reviews pass',noEffects:true,noEnforcement:true,noAuthorization:true,noToolExecution:true,noNetwork:true,noWatcherDaemon:true,noAutonomousLiveMode:true,noFrameworkSdkAdapter:true,externalEffects:false},packet};
await mkdir(resolve('evidence'),{recursive:true}); await writeFile(resolve('evidence/tiny-operator-passive-pilot-phase-close-v0.16.5.out.json'),JSON.stringify(out,null,2)+'\n'); await writeFile(resolve('evidence/tiny-operator-passive-pilot-v0.16.5.out.json'),JSON.stringify(packet,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
