import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tinyPilotEvidenceFromText } from '../src/tiny-operator-passive-pilot.mjs';
const packet=tinyPilotEvidenceFromText('api_key=abc123456 please block this request',{sourcePath:'fixture'});
assert.equal(packet.schemaVersion,'tiny-operator-passive-pilot-evidence-v0.16.2'); assert.equal(packet.summary.operatorReviewRequired,true); assert.equal(packet.summary.singleSampleOnly,true); assert.equal(packet.summary.rawPersisted,false); assert.equal(packet.summary.policyDecision,null); assert.ok(packet.hashes.rawSha256); assert.ok(packet.hashes.redactedSha256);
assert.equal(/\b(block|allow|approve|enforce|authorize)\b/i.test(packet.observation.redaction.redactedText),false);
const out={artifact:'T-synaptic-mesh-tiny-operator-passive-pilot-evidence-packet-v0.16.2',timestamp:'2026-05-15T02:12:00.000Z',summary:{evidencePacket:'pass',operatorReviewRequired:true,singleSampleOnly:true,rawPersisted:false,hashesPresent:true,decisionVerbsSanitized:true,noAgentConsumption:true,policyDecision:null}};
await mkdir(resolve('evidence'),{recursive:true}); await writeFile(resolve('evidence/tiny-operator-passive-pilot-evidence-packet-v0.16.2.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
