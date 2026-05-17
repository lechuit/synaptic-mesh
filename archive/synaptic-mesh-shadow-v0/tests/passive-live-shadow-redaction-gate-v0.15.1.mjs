import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { passiveObservationFromText } from '../src/passive-live-shadow.mjs';
const here=dirname(fileURLToPath(import.meta.url)); const pkg=resolve(here,'..'); const cases=JSON.parse(await readFile(resolve(pkg,'fixtures/passive-live-shadow-negative-controls-v0.15.1.json'),'utf8')).cases;
const observations=cases.map(c=>passiveObservationFromText(c.text,{sourcePath:c.id}));
for (const obs of observations){ assert.equal(obs.redaction.rawPrivateContentPersisted,false); assert.equal(obs.redaction.redactionStatus,'redacted-before-persistence'); assert.ok(!JSON.stringify(obs).includes('reviewer@example.com')); assert.ok(!JSON.stringify(obs).includes('hunter2')); assert.ok(!JSON.stringify(obs).includes('sk-private0000')); assert.ok(!JSON.stringify(obs).includes('sk-config0000')); }
const out={artifact:'T-synaptic-mesh-passive-live-shadow-redaction-gate-v0.15.1',timestamp:'2026-05-15T01:41:00.000Z',summary:{redactionGate:'pass',negativeControls:cases.length,rawPrivatePersisted:false,redactedBeforePersistence:true,hashesPresent:observations.every(o=>!!o.redaction.rawSha256),toolMemoryConfigApprovalTextRawPersisted:false}};
await mkdir(resolve(pkg,'evidence'),{recursive:true}); await writeFile(resolve(pkg,'evidence/passive-live-shadow-redaction-gate-v0.15.1.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
