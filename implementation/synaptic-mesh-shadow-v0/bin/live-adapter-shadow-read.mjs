#!/usr/bin/env node
import { parseLiveAdapterShadowReadArgs, runLiveAdapterShadowRead } from '../src/live-adapter-shadow-read.mjs';

try {
  const parsed = parseLiveAdapterShadowReadArgs(process.argv.slice(2));
  const json = await runLiveAdapterShadowRead(parsed);
  process.stdout.write(json);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
