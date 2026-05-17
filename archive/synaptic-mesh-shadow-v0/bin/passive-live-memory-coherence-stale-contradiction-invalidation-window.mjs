#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { readPassiveLiveMemoryCoherenceInvalidationWindowInput, scorePassiveLiveMemoryCoherenceInvalidationWindow, passiveLiveMemoryCoherenceInvalidationWindowReport } from '../src/passive-live-memory-coherence-stale-contradiction-invalidation-window.mjs';

const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json';
await mkdir('evidence', { recursive: true });
const input = await readPassiveLiveMemoryCoherenceInvalidationWindowInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceInvalidationWindow(input);
artifact.reportMarkdown = passiveLiveMemoryCoherenceInvalidationWindowReport(artifact);
await writeFile('evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json', JSON.stringify(artifact, null, 2) + '\n');
await writeFile('evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-report-v0.39.5.out.md', artifact.reportMarkdown + '\n');
console.log(JSON.stringify({ status: artifact.invalidationWindowStatus, metrics: artifact.metrics, recommendation: artifact.recommendation, policyDecision: artifact.policyDecision }, null, 2));
