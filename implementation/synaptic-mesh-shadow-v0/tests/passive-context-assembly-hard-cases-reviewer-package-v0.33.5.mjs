import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { canonicalInput } from './passive-context-assembly-hard-cases-fixtures.mjs';
import { scorePassiveContextAssemblyHardCases } from '../src/passive-context-assembly-hard-cases.mjs';
const out=scorePassiveContextAssemblyHardCases(canonicalInput());
assert.equal(out.hardCaseStatus,'PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE'); assert.equal(out.metrics.hardCaseCount,5); assert.equal(out.metrics.boundaryViolationCount,0); assert.equal(out.policyDecision,null);
mkdirSync('evidence',{recursive:true}); writeFileSync('evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json', JSON.stringify(out,null,2)+'\n'); writeFileSync('evidence/passive-context-assembly-hard-cases-report-v0.33.5.out.md', out.reportMarkdown);
