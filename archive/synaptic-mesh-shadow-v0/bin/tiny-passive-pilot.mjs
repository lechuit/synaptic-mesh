#!/usr/bin/env node
import { parseTinyPilotArgs, runTinyPilotLocalInput } from '../src/tiny-operator-passive-pilot.mjs';
try {
  const parsed = parseTinyPilotArgs(process.argv.slice(2));
  const json = await runTinyPilotLocalInput(parsed);
  if (parsed.stdout) process.stdout.write(json);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
