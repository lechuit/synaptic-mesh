import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseTinyPilotArgs, runTinyPilotLocalInput, TINY_PASSIVE_PILOT_UNSAFE_FLAGS } from '../src/tiny-operator-passive-pilot.mjs';
const sample=resolve('fixtures/tiny-operator-passive-pilot-sample-v0.16.1.txt');
const parsed=parseTinyPilotArgs(['--input',sample,'--stdout']); assert.equal(parsed.stdout,true);
const json=await runTinyPilotLocalInput(parsed); const packet=JSON.parse(json);
assert.equal(packet.summary.singleSampleOnly,true); assert.equal(packet.summary.rawPersisted,false); assert.equal(packet.summary.policyDecision,null);
let rejected=0; for (const flag of TINY_PASSIVE_PILOT_UNSAFE_FLAGS){ assert.throws(()=>parseTinyPilotArgs(['--input',sample,flag]),/rejects|unknown/); rejected+=1; }
assert.throws(()=>parseTinyPilotArgs(['--input',sample,'--input','other.txt']),/multi-input/); rejected+=1;
for (const flag of ['--batch','--inputs=list.json','--manifest','m.json','--input-list','l.json','--input-glob','*.json']) { assert.throws(()=>parseTinyPilotArgs(['--input',sample,...flag.split(' ')]),/rejects|unknown/); rejected+=1; }
const out={artifact:'T-synaptic-mesh-tiny-operator-passive-pilot-runner-v0.16.1',timestamp:'2026-05-15T02:11:00.000Z',summary:{runner:'pass',stdoutAllowed:true,evidenceJsonOnly:true,unsafeFlagsRejected:TINY_PASSIVE_PILOT_UNSAFE_FLAGS.length,multiInputBatchRejected:rejected-TINY_PASSIVE_PILOT_UNSAFE_FLAGS.length,network:false,toolExecution:false,enforcement:false},packet};
await mkdir(resolve('evidence'),{recursive:true}); await writeFile(resolve('evidence/tiny-operator-passive-pilot-runner-v0.16.1.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
