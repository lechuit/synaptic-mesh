#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { readPassiveHardCaseOutcomeValueScorecardInput, scorePassiveHardCaseOutcomeValueScorecard } from '../src/passive-hard-case-outcome-value-scorecard.mjs';
const inputPath = process.argv[2] ?? 'evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json';
mkdirSync('evidence', { recursive: true });
const input = await readPassiveHardCaseOutcomeValueScorecardInput(inputPath);
const out = scorePassiveHardCaseOutcomeValueScorecard(input);
await writeFile('evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json', JSON.stringify(out, null, 2) + '\n');
await writeFile('evidence/passive-hard-case-outcome-value-scorecard-report-v0.34.5.out.md', out.reportMarkdown + '\n');
console.log(JSON.stringify(out, null, 2));
