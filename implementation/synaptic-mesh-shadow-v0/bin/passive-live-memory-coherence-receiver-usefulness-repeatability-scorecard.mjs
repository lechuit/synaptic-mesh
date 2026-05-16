#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput,
  scorePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatability,
} from '../src/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json';
const input = await readPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatability(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-report-v0.43.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ repeatabilityStatus: artifact.repeatabilityStatus, stableCandidateCount: artifact.metrics.stableCandidateCount, receiverUsefulnessRepeatabilityRatio: artifact.metrics.receiverUsefulnessRepeatabilityRatio }, null, 2));
