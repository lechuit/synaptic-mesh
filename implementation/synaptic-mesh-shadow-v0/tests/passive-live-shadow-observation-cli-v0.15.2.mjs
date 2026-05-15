import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)); const pkg=resolve(here,'..'); const bin=resolve(pkg,'bin/passive-live-shadow-observe.mjs'); const input=resolve(pkg,'fixtures/passive-live-shadow-sample-input-v0.15.2.txt');
const packet=JSON.parse(execFileSync(process.execPath,[bin,'--input',input,'--stdout'],{encoding:'utf8'}));
assert.equal(packet.summary.manualInvocationOnly,true); assert.equal(packet.summary.localInputPathOnly,true); assert.equal(packet.summary.network,false); assert.equal(packet.summary.toolExecution,false); assert.equal(packet.summary.enforcement,false); assert.equal(packet.observation.redaction.rawPrivateContentPersisted,false); assert.ok(!JSON.stringify(packet).includes('reviewer@example.com'));
const unsafe=['--watch','--daemon','--network','--execute','--allow','--block','--enforce','--approve']; for (const flag of unsafe){ const r=spawnSync(process.execPath,[bin,flag,'--input',input,'--stdout'],{encoding:'utf8'}); assert.notEqual(r.status,0, flag); assert.ok((r.stderr+r.stdout).includes('rejects unsafe flags'), flag);}
const out={artifact:'T-synaptic-mesh-passive-live-shadow-observation-cli-v0.15.2',timestamp:'2026-05-15T01:41:00.000Z',summary:{observationCli:'pass',manualInvocationOnly:true,localInputPathOnly:true,unsafeFlagsRejected:unsafe.length,watcherDaemon:false,network:false,toolExecution:false,runtimeAuthority:false,enforcement:false}};
await mkdir(resolve(pkg,'evidence'),{recursive:true}); await writeFile(resolve(pkg,'evidence/passive-live-shadow-observation-cli-v0.15.2.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
