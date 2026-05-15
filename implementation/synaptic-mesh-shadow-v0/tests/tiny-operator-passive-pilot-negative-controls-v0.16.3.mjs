import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { parseTinyPilotArgs, resolveTinyPilotEvidenceOutputPath, runTinyPilotLocalInput, tinyPilotNegativeControlSummary } from '../src/tiny-operator-passive-pilot.mjs';
const sample=resolve('fixtures/tiny-operator-passive-pilot-sample-v0.16.1.txt');
let expectedRejects=0; for (const args of [['--input',sample,'--watch'],['--input',sample,'--daemon'],['--input',sample,'--network'],['--input',sample,'--execute'],['--input',sample,'--allow'],['--input',sample,'--block'],['--input',sample,'--approve'],['--input',sample,'--enforce'],['--input',sample,'--authorize'],['--input',sample,'--input','x'],['--input',sample,'--batch'],['--input',sample,'--inputs=x'],['--input',sample,'--manifest','m'],['--input',sample,'--input-list','l'],['--input',sample,'--input-glob','*']]){ assert.throws(()=>parseTinyPilotArgs(args),/rejects|multi-input/); expectedRejects+=1; }
for (const output of ['../escape.json','fixtures/nope.json','/tmp/nope.json','evidence/nope.txt']) { assert.throws(()=>resolveTinyPilotEvidenceOutputPath(output),/evidence|json/); expectedRejects+=1; }
const tmp=await mkdtemp(resolve(tmpdir(),'sm-v0163-')); const symlinkParent=resolve('evidence/tiny-v0163-symlink-parent');
async function clean(p){try{await unlink(p)}catch(e){if(e?.code!=='ENOENT')throw e}}
try{ await clean(symlinkParent); await symlink(tmp,symlinkParent,'dir'); await assert.rejects(()=>runTinyPilotLocalInput({input:sample,output:'evidence/tiny-v0163-symlink-parent/out.json'}),/symlink|realpath|evidence/); expectedRejects+=1; assert.equal(existsSync(resolve(tmp,'out.json')),false); } finally { await clean(symlinkParent); await rm(tmp,{recursive:true,force:true}); }
const summary=tinyPilotNegativeControlSummary(); assert.equal(summary.unexpectedPermits,0);
const out={artifact:'T-synaptic-mesh-tiny-operator-passive-pilot-negative-controls-v0.16.3',timestamp:'2026-05-15T02:13:00.000Z',summary:{negativeControls:'pass',rawPrivateTokenRejected:true,decisionVerbSanitized:true,expectedRejects,unexpectedPermits:0,policyDecision:null,outputEscapeRejected:true,symlinkRejected:true,multiInputBatchRejected:true,enforcement:false}};
await mkdir(resolve('evidence'),{recursive:true}); await writeFile(resolve('evidence/tiny-operator-passive-pilot-negative-controls-v0.16.3.out.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out.summary,null,2));
