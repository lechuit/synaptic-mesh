#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { buildOperatorReviewOutcomeCapture } from '../src/operator-review-outcome-capture.mjs';

const [queueFile, outcomesFile] = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
if (!queueFile || !outcomesFile || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.error('Usage: operator-review-outcome-capture <v0.23-queue.json> <operator-outcomes.json>');
  console.error('Inputs must be local files. Output is a human-readable, non-authoritative value-feedback report only.');
  process.exit(queueFile && outcomesFile ? 0 : 1);
}

const queue = JSON.parse(await readFile(queueFile, 'utf8'));
const outcomes = JSON.parse(await readFile(outcomesFile, 'utf8'));
const capture = buildOperatorReviewOutcomeCapture(queue, outcomes);
process.stdout.write(capture.reportMarkdown);
