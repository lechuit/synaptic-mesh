import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { passiveContextAssemblyHardCasesProtocol } from '../src/passive-context-assembly-hard-cases.mjs';
const p=passiveContextAssemblyHardCasesProtocol();
assert.equal(p.releaseLayer,'v0.33.0-alpha'); assert.equal(p.barrierCrossed,'passive_context_assembly_hard_cases_for_long_continuity'); assert.equal(p.acceptsOnlyPinnedCompletedContextAssemblyArtifact,true); assert.equal(p.humanReadableReportOnly,true); assert.equal(p.nonAuthoritative,true); assert.equal(p.policyDecision,null); assert.equal(p.noMemoryWrites,true); assert.equal(p.noRuntimeIntegration,true); assert.equal(p.agentConsumedOutput,false);
mkdirSync('evidence',{recursive:true}); writeFileSync('evidence/passive-context-assembly-hard-cases-protocol-v0.33.0-alpha.out.json', JSON.stringify(p,null,2)+'\n');
