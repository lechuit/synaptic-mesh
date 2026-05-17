#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { scoreOperatorOutcomeValue } from '../src/operator-outcome-value-scorecard.mjs';

const [captureFile] = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
if (!captureFile || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.error('Usage: operator-outcome-value-scorecard <v0.24-capture.json>');
  console.error('Input must be an explicit local v0.24 capture artifact. Output is a human-readable, non-authoritative value scorecard only.');
  process.exit(captureFile ? 0 : 1);
}

const capture = JSON.parse(await readFile(captureFile, 'utf8'));
const scorecard = scoreOperatorOutcomeValue(capture);
process.stdout.write(scorecard.reportMarkdown);
