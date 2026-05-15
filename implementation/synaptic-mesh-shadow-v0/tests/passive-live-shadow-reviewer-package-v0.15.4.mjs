import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises'; import { resolve, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)); const pkg=resolve(here,'..'); const repo=resolve(pkg,'../..'); const doc=await readFile(resolve(repo,'docs/passive-live-shadow-reviewer-package-v0.15.4.md'),'utf8');
for (const p of ['Human review package','tiny local operator-run pilot','no autonomous live mode','no enforcement','no tool execution','no authorization','no daemon/watcher']) assert.ok(doc.includes(p),p);
const out={artifact:'T-synaptic-mesh-passive-live-shadow-reviewer-package-v0.15.4',timestamp:'2026-05-15T01:41:00.000Z',summary:{reviewerPackage:'pass',humanReviewRequired:true,tinyLocalOperatorRunPilotMayBeConsideredNext:true,autonomousLiveMode:false,enforcement:false,toolExecution:false,authorization:false,daemonWatcher:false}};
await mkdir(resolve(pkg,'evidence'),{recursive:true}); await writeFile(resolve(pkg,'evidence/passive-live-shadow-reviewer-package-v0.15.4.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
