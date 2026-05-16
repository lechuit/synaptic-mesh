import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { canonicalInput } from './passive-context-assembly-rehearsal-scorecard-fixtures.mjs';
import { scorePassiveContextAssemblyRehearsalScorecard, validatePassiveContextAssemblyArtifact } from '../src/passive-context-assembly-rehearsal-scorecard.mjs';
const out=scorePassiveContextAssemblyRehearsalScorecard(canonicalInput());
assert.equal(out.policyDecision,null); assert.equal(out.recommendationIsAuthority,false); assert.equal(out.agentConsumedOutput,false); assert.equal(out.noMemoryWrites,true); assert.equal(out.noRuntimeIntegration,true);
assert.ok(out.assemblyItems.every(i=>i.policyDecision===null && i.precedenceSuggestionIsAuthority===false && i.promoteToMemory===false && i.agentConsumedOutput===false));
assert.deepEqual(validatePassiveContextAssemblyArtifact(out), []);
mkdirSync('evidence',{recursive:true}); writeFileSync('evidence/passive-context-assembly-rehearsal-scorecard-output-boundary-v0.32.4.out.json', JSON.stringify({assemblyStatus:out.assemblyStatus,policyDecision:out.policyDecision,recommendationIsAuthority:out.recommendationIsAuthority,agentConsumedOutput:out.agentConsumedOutput,boundaryViolationCount:out.metrics.boundaryViolationCount},null,2)+'\n');
