#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';

const file = process.argv[2];
if (!file || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.error('Usage: controlled-operator-review-queue <v0.22-scorecard.json>');
  console.error('Input must be a local v0.22 scorecard JSON artifact. Output is a local, passive, non-authoritative human-review prioritization artifact only.');
  process.exit(file ? 0 : 1);
}

const scorecard = JSON.parse(await readFile(file, 'utf8'));
process.stdout.write(JSON.stringify(buildControlledOperatorReviewQueue(scorecard), null, 2) + '\n');
