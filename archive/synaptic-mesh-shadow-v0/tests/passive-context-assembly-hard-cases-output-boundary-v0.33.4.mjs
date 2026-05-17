import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { canonicalInput } from './passive-context-assembly-hard-cases-fixtures.mjs';
import { scorePassiveContextAssemblyHardCases, validatePassiveContextAssemblyHardCasesArtifact } from '../src/passive-context-assembly-hard-cases.mjs';
const out=scorePassiveContextAssemblyHardCases(canonicalInput());
assert.equal(out.policyDecision,null); assert.equal(out.recommendationIsAuthority,false); assert.equal(out.agentConsumedOutput,false); assert.equal(out.noMemoryWrites,true); assert.equal(out.noRuntimeIntegration,true);
assert.ok(out.hardCases.every(i=>i.policyDecision===null && i.precedenceSuggestionIsAuthority===false && i.promoteToMemory===false && i.agentConsumedOutput===false));
assert.deepEqual(validatePassiveContextAssemblyHardCasesArtifact(out), []);
mkdirSync('evidence',{recursive:true}); writeFileSync('evidence/passive-context-assembly-hard-cases-output-boundary-v0.33.4.out.json', JSON.stringify({hardCaseStatus:out.hardCaseStatus,policyDecision:out.policyDecision,recommendationIsAuthority:out.recommendationIsAuthority,agentConsumedOutput:out.agentConsumedOutput,boundaryViolationCount:out.metrics.boundaryViolationCount},null,2)+'\n');
