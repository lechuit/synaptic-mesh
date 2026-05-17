#!/usr/bin/env node
import { parseLiveReadGateArgs, runLiveReadGate } from '../src/live-read-gate.mjs';

try {
  const parsed = parseLiveReadGateArgs(process.argv.slice(2));
  const json = await runLiveReadGate(parsed);
  process.stdout.write(json);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
