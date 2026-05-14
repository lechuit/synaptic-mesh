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
const base=await readJson(resolve(packageRoot,'fixtures/read-only-local-file-batch-canary-manifest.json'));
const badDigest=JSON.parse(JSON.stringify(base)); badDigest.inputs[1].sourceArtifactDigest='sha256:'+'9'.repeat(64);
const badMissing=JSON.parse(JSON.stringify(base)); badMissing.inputs[2].sourceFilePath='implementation/synaptic-mesh-shadow-v0/fixtures/redacted/missing-batch-case.json';
const cases=[['digest-mismatch-at-index-1',badDigest,1],['missing-file-at-index-2',badMissing,2]];
const rows=[]; for(const [id,m,expectedReadsBeforeFailure] of cases){ const r=await runReadOnlyLocalFileBatchAdapter(m,{repoRoot}); rows.push({id,ok:r.ok,errors:r.errors,sourceFilesReadBeforeFailure:r.batchResult.sourceFilesRead,expectedReadsBeforeFailure,recordOnly:r.batchResult.recordOnly,forbiddenEffects:countTrue(r)}); }
assert(rows.every(r=>r.ok===false)); assert(rows.every(r=>r.recordOnly===true)); assert(rows.every(r=>r.forbiddenEffects===0)); assert.deepEqual(rows.map(r=>r.sourceFilesReadBeforeFailure),[1,2]);
const out={artifact:'T-synaptic-mesh-read-only-local-file-batch-failure-isolation-v0.6.4',timestamp:'2026-05-14T14:15:00.000Z',summary:{readOnlyLocalFileBatchFailureIsolation:'pass',releaseLayer:'v0.6.4',failureCases:rows.length,unexpectedAccepts:0,partialRowsPersisted:true,failedItemDoesNotAuthorizeBatch:true,sourceFilesReadBeforeFailure:[1,2],recordOnly:true,forbiddenEffects:0,capabilityTrueCount:0,authorization:false,enforcement:false},rows,boundary:['failure_isolation_only','fail_closed_on_first_bad_item','no_batch_authority_from_partial_success','record_only','no_authorization','no_enforcement']};
await writeJson(resolve(packageRoot,'evidence/read-only-local-file-batch-failure-isolation.out.json'),out); console.log(JSON.stringify(out.summary,null,2));
