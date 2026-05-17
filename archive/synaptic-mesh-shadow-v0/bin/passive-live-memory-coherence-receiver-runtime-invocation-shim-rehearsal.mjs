#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { readPassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput, scorePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsal } from '../src/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-reviewer-package-v0.50.5.out.json';
const reportPath = process.argv[3] ?? 'evidence/passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-report-v0.50.5.out.md';
const input = await readPassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput(inputPath, reportPath);
const artifact = scorePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsal(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-reviewer-package-v0.51.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-report-v0.51.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ rehearsalStatus: artifact.rehearsalStatus, localShimInvocationCount: artifact.metrics.localShimInvocationCount, shimOutputCount: artifact.metrics.shimOutputCount, contextHandoffResultCount: artifact.metrics.contextHandoffResultCount, nextBarrier: artifact.nextBarrier }, null, 2));
