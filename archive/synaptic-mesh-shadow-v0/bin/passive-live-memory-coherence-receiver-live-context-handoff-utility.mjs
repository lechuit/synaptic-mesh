#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInput,
  scorePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtility,
} from '../src/passive-live-memory-coherence-receiver-live-context-handoff-utility.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json';
const input = await readPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtility(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-live-context-handoff-utility-report-v0.46.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ handoffUtilityStatus: artifact.handoffUtilityStatus, includedForLiveContextCount: artifact.metrics.includedForLiveContextCount, receiverUsefulnessRatio: artifact.metrics.receiverUsefulnessRatio }, null, 2));
