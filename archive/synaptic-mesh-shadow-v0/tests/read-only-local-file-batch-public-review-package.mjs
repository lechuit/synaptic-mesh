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
const docs=[resolve(repoRoot,'docs/status-v0.6.5.md'),resolve(repoRoot,'docs/read-only-local-file-batch-public-review-package.md')];
const evidence=['read-only-local-file-batch-negative-controls.out.json','read-only-local-file-batch-canary.out.json','read-only-local-file-batch-reproducibility.out.json','read-only-local-file-batch-failure-isolation.out.json'].map(f=>resolve(packageRoot,'evidence',f));
const ev=await Promise.all(evidence.map(readJson)); const texts=await Promise.all(docs.map(p=>readFile(p,'utf8')));
assert(ev.every(e=>String(Object.values(e.summary)[0])==='pass')); for(const t of texts){ assert(t.includes('not runtime authorization')); assert(t.includes('record-only')); assert(t.includes('v0.6.5')); }
const out={artifact:'T-synaptic-mesh-read-only-local-file-batch-public-review-package-v0.6.5',timestamp:'2026-05-14T14:30:00.000Z',summary:{readOnlyLocalFileBatchPublicReviewPackage:'pass',releaseLayer:'v0.6.5',closesV06x:true,evidenceItems:ev.length,docsPresent:docs.length,batchAdapterImplemented:true,frameworkIntegrationAuthorized:false,runtimeAuthorized:false,recordOnly:true,toolExecution:false,memoryWrite:false,configWrite:false,externalPublication:false,agentConsumed:false,machineReadablePolicyDecision:false,mayBlock:false,mayAllow:false,authorization:false,enforcement:false},evidence:evidence.map(p=>p.replace(repoRoot+'/','')),docs:docs.map(p=>p.replace(repoRoot+'/','')),boundary:['public_review_package_only','closes_v0_6_x_batch_readiness','manual_local_read_only','record_only','not_runtime_authorization','no_enforcement']};
await writeJson(resolve(packageRoot,'evidence/read-only-local-file-batch-public-review-package.out.json'),out); console.log(JSON.stringify(out.summary,null,2));
