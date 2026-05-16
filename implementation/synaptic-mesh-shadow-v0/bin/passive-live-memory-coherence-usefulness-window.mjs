#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { readPassiveLiveMemoryCoherenceUsefulnessWindowInput, scorePassiveLiveMemoryCoherenceUsefulnessWindow } from '../src/passive-live-memory-coherence-usefulness-window.mjs';
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json';
mkdirSync('evidence', { recursive: true });
const input = await readPassiveLiveMemoryCoherenceUsefulnessWindowInput(inputPath);
const out = scorePassiveLiveMemoryCoherenceUsefulnessWindow(input);
await writeFile('evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json', JSON.stringify(out, null, 2) + '\n');
await writeFile('evidence/passive-live-memory-coherence-usefulness-window-report-v0.38.5.out.md', out.reportMarkdown + '\n');
console.log(JSON.stringify(out, null, 2));
