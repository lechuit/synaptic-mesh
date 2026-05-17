#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { readPassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteInput, scorePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuite } from '../src/passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-reviewer-package-v0.51.5.out.json';
const reportPath = process.argv[3] ?? 'evidence/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-report-v0.51.5.out.md';
const input = await readPassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteInput(inputPath, reportPath);
const artifact = scorePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuite(input);
const evidenceDir = resolve(packageRoot, 'evidence');
await mkdir(evidenceDir, { recursive: true });
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite-reviewer-package-v0.52.5.out.json'), `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile(resolve(evidenceDir, 'passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite-report-v0.52.5.out.md'), `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ suiteStatus: artifact.suiteStatus, fixtureScenarioCount: artifact.metrics.fixtureScenarioCount, adapterInvocationCount: artifact.metrics.adapterInvocationCount, fixtureFailClosedCount: artifact.metrics.fixtureFailClosedCount, effectsBlockedCount: artifact.metrics.effectsBlockedCount, nextBarrier: artifact.nextBarrier }, null, 2));
