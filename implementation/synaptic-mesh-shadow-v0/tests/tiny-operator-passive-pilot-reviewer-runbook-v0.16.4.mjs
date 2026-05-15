import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const out={artifact:'T-synaptic-mesh-tiny-operator-passive-pilot-reviewer-runbook-v0.16.4',timestamp:'2026-05-15T02:14:00.000Z',summary:{reviewerRunbook:'pass',humanReviewBeforeSourceExpansion:true,operatorReviewRequired:true,singleSampleOnly:true,noEffects:true,noAgentConsumption:true,policyDecision:null,enforcement:false}};
assert.equal(out.summary.humanReviewBeforeSourceExpansion,true); assert.equal(out.summary.policyDecision,null);
await mkdir(resolve('evidence'),{recursive:true}); await writeFile(resolve('evidence/tiny-operator-passive-pilot-reviewer-runbook-v0.16.4.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
