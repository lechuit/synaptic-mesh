#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { readPassiveLiveMemoryCoherenceObservationRehearsalInput, scorePassiveLiveMemoryCoherenceObservationRehearsal } from '../src/passive-live-memory-coherence-observation-rehearsal.mjs';
const inputPath = process.argv[2] ?? 'evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json';
mkdirSync('evidence', { recursive: true });
const input = await readPassiveLiveMemoryCoherenceObservationRehearsalInput(inputPath);
const out = scorePassiveLiveMemoryCoherenceObservationRehearsal(input);
await writeFile('evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json', JSON.stringify(out, null, 2) + '\n');
await writeFile('evidence/passive-live-memory-coherence-observation-rehearsal-report-v0.36.5.out.md', out.reportMarkdown + '\n');
console.log(JSON.stringify(out, null, 2));
