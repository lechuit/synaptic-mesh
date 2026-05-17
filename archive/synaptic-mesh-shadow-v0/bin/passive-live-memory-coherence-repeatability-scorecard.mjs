#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { readPassiveLiveMemoryCoherenceRepeatabilityScorecardInput, scorePassiveLiveMemoryCoherenceRepeatabilityScorecard } from '../src/passive-live-memory-coherence-repeatability-scorecard.mjs';
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json';
mkdirSync('evidence', { recursive: true });
const input = await readPassiveLiveMemoryCoherenceRepeatabilityScorecardInput(inputPath);
const out = scorePassiveLiveMemoryCoherenceRepeatabilityScorecard(input);
await writeFile('evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json', JSON.stringify(out, null, 2) + '\n');
await writeFile('evidence/passive-live-memory-coherence-repeatability-scorecard-report-v0.37.5.out.md', out.reportMarkdown + '\n');
console.log(JSON.stringify(out, null, 2));
