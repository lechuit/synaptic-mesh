#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { readPassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput, scorePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecard, passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardReport } from '../src/passive-live-memory-coherence-invalidation-repeatability-scorecard.mjs';

const inputPath = process.argv[2] ?? 'evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json';
await mkdir('evidence', { recursive: true });
const input = await readPassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput(inputPath);
const artifact = scorePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecard(input);
artifact.reportMarkdown = passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardReport(artifact);
await writeFile('evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json', JSON.stringify(artifact, null, 2) + '\n');
await writeFile('evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-report-v0.40.5.out.md', artifact.reportMarkdown + '\n');
console.log(JSON.stringify({ status: artifact.repeatabilityStatus, metrics: artifact.metrics, recommendation: artifact.recommendation, policyDecision: artifact.policyDecision }, null, 2));
