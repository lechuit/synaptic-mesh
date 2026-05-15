#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { replayFrozenLiveLikeEnvelopes } from '../src/live-like-shadow-replay.mjs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('usage: live-like-shadow-replay <already-redacted-envelope.json>');
  process.exit(2);
}
const envelope = JSON.parse(readFileSync(inputPath, 'utf8'));
const output = replayFrozenLiveLikeEnvelopes([envelope]);
console.log(JSON.stringify(output, null, 2));
process.exit(output.invalidEnvelopes === 0 ? 0 : 1);
