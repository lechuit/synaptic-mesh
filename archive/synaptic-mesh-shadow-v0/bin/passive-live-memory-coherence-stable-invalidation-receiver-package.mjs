#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned, readPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput, scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage, passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport } from '../src/passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';

const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json';
assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned(inputPath);
await mkdir('evidence', { recursive: true });
const input = await readPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage(input);
artifact.reportMarkdown = passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport(artifact);
await writeFile('evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json', JSON.stringify(artifact, null, 2) + '\n');
await writeFile('evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-report-v0.41.5.out.md', artifact.reportMarkdown + '\n');
console.log(JSON.stringify({ status: artifact.receiverPackageStatus, metrics: artifact.metrics, recommendation: artifact.recommendation, policyDecision: artifact.policyDecision }, null, 2));
