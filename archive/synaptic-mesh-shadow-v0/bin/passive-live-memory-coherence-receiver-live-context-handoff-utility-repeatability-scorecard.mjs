#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput,
  scorePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatability,
} from '../src/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json';
const input = await readPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatability(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-report-v0.47.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ repeatabilityStatus: artifact.repeatabilityStatus, stableHandoffItemCount: artifact.metrics.stableHandoffItemCount, receiverUsefulnessRepeatabilityRatio: artifact.metrics.receiverUsefulnessRepeatabilityRatio }, null, 2));
