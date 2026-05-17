#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInput,
  scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatability,
} from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json';
const input = await readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatability(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-report-v0.45.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ repeatabilityStatus: artifact.repeatabilityStatus, stableObservationCount: artifact.metrics.stableObservationCount, receiverUsefulnessRepeatabilityRatio: artifact.metrics.receiverUsefulnessRepeatabilityRatio }, null, 2));
