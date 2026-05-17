#!/usr/bin/env node
import { observePassiveLocalInput, parsePassiveArgs } from '../src/passive-live-shadow.mjs';
try {
  const parsed = parsePassiveArgs(process.argv.slice(2));
  const json = await observePassiveLocalInput(parsed);
  if (parsed.stdout) process.stdout.write(json);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
