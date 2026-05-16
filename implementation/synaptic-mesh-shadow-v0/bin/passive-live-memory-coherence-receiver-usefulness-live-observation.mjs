#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput,
  scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation,
} from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json';
const input = await readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-usefulness-live-observation-report-v0.44.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ liveObservationStatus: artifact.liveObservationStatus, liveObservationItemCount: artifact.metrics.liveObservationItemCount, receiverUsefulnessRatio: artifact.metrics.receiverUsefulnessRatio }, null, 2));
