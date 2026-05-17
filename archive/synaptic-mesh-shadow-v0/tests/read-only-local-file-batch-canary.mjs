import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { runReadOnlyLocalFileBatchAdapter, validateBatchManifest } from '../src/adapters/read-only-local-file-batch-adapter.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const readJson = async p => JSON.parse(await readFile(p, 'utf8'));
const writeJson = async (p,o)=>{await mkdir(dirname(p), {recursive:true}); await writeFile(p, JSON.stringify(o,null,2)+'\n');};
const h = v => 'sha256:'+createHash('sha256').update(JSON.stringify(v)).digest('hex');
const falseFlags=['toolExecution','memoryWrite','configWrite','externalPublication','approvalEmission','machineReadablePolicyDecision','agentConsumed','mayBlock','mayAllow','authorization','enforcement'];
function countTrue(o){let n=0; const walk=x=>{if(!x||typeof x!=='object')return; for(const [k,v] of Object.entries(x)){ if(falseFlags.includes(k)&&v===true)n++; walk(v); }}; walk(o); return n;}
const manifest=await readJson(resolve(packageRoot,'fixtures/read-only-local-file-batch-canary-manifest.json'));
const result=await runReadOnlyLocalFileBatchAdapter(manifest,{repoRoot});
assert.equal(result.ok,true); assert.equal(result.batchResult.inputCount,3); assert.equal(result.batchResult.sourceFilesRead,3); assert.equal(result.batchResult.recordOnly,true); assert.equal(countTrue(result),0);
const out={artifact:'T-synaptic-mesh-read-only-local-file-batch-canary-v0.6.2',timestamp:'2026-05-14T13:45:00.000Z',summary:{readOnlyLocalFileBatchCanary:'pass',releaseLayer:'v0.6.2',batchAdapterImplemented:true,batchBehaviorAuthorized:'manual_canary_only',positiveCases:1,inputCount:3,sourceFilesRead:3,recordOnly:true,explicitInputListOnly:true,directoryDiscovery:false,globAllowed:false,watcherAllowed:false,daemonAllowed:false,networkAllowed:false,liveTrafficAllowed:false,forbiddenEffects:0,capabilityTrueCount:0,adapterDecidesAuthority:false,machineReadablePolicyDecision:false,agentConsumed:false,mayBlock:false,mayAllow:false,authorization:false,enforcement:false},batchResult:result.batchResult,rows:result.rows,boundary:result.boundary};
await writeJson(resolve(packageRoot,'evidence/read-only-local-file-batch-canary.out.json'),out); console.log(JSON.stringify(out.summary,null,2));
