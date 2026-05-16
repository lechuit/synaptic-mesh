#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  readPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput,
  scorePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRun,
} from '../src/passive-live-memory-coherence-runtime-context-injection-dry-run.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json';
const input = await readPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRun(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ dryRunStatus: artifact.dryRunStatus, harnessConsumableCandidateCount: artifact.metrics.harnessConsumableCandidateCount, nextBarrier: artifact.nextBarrier }, null, 2));
