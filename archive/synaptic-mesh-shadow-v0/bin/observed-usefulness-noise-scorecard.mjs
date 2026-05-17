#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { scoreObservedUsefulnessNoise } from '../src/observed-usefulness-noise-scorecard.mjs';

const file = process.argv[2];
if (!file || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.error('Usage: observed-usefulness-noise-scorecard <cases.json>');
  console.error('Input must be a local JSON array of { id, expectedUsefulness, output } cases. No network, no writes, no authority.');
  process.exit(file ? 0 : 1);
}

const cases = JSON.parse(await readFile(file, 'utf8'));
if (!Array.isArray(cases)) throw new Error('cases.json must contain an array');
process.stdout.write(JSON.stringify(scoreObservedUsefulnessNoise(cases), null, 2) + '\n');
