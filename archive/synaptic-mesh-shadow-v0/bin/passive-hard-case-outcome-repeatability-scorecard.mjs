#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { readPassiveHardCaseOutcomeRepeatabilityScorecardInput, scorePassiveHardCaseOutcomeRepeatabilityScorecard } from '../src/passive-hard-case-outcome-repeatability-scorecard.mjs';
const inputPath = process.argv[2] ?? 'evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json';
mkdirSync('evidence', { recursive: true });
const input = await readPassiveHardCaseOutcomeRepeatabilityScorecardInput(inputPath);
const out = scorePassiveHardCaseOutcomeRepeatabilityScorecard(input);
await writeFile('evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json', JSON.stringify(out, null, 2) + '\n');
await writeFile('evidence/passive-hard-case-outcome-repeatability-scorecard-report-v0.35.5.out.md', out.reportMarkdown + '\n');
console.log(JSON.stringify(out, null, 2));
