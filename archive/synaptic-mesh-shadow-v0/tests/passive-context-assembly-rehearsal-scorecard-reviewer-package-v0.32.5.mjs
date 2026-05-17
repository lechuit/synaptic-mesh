import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { canonicalInput } from './passive-context-assembly-rehearsal-scorecard-fixtures.mjs';
import { scorePassiveContextAssemblyRehearsalScorecard } from '../src/passive-context-assembly-rehearsal-scorecard.mjs';
const out=scorePassiveContextAssemblyRehearsalScorecard(canonicalInput());
assert.equal(out.assemblyStatus,'PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE');
assert.equal(out.metrics.assemblyItemCount,4); assert.equal(out.metrics.boundaryViolationCount,0); assert.equal(out.policyDecision,null);
mkdirSync('evidence',{recursive:true}); writeFileSync('evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json', JSON.stringify(out,null,2)+'\n'); writeFileSync('evidence/passive-context-assembly-rehearsal-scorecard-report-v0.32.5.out.md', out.reportMarkdown);
