#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput,
  scorePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsal,
} from '../src/passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs';

const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json';
const input = await readPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsal(input);
await mkdir('evidence', { recursive: true });
await writeFile('evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json', `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile('evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-report-v0.42.5.out.md', `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ rehearsalStatus: artifact.rehearsalStatus, receiverUsefulnessRatio: artifact.metrics.receiverUsefulnessRatio, rawSignalUsefulnessRatio: artifact.metrics.rawSignalUsefulnessRatio, scorecardUsefulnessRatio: artifact.metrics.scorecardUsefulnessRatio, policyDecision: artifact.policyDecision }, null, 2));
