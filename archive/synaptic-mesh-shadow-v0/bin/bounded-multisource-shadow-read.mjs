#!/usr/bin/env node
import { parseBoundedMultisourceShadowReadArgs, runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';

try {
  const parsed = parseBoundedMultisourceShadowReadArgs(process.argv.slice(2));
  const json = await runBoundedMultisourceShadowRead(parsed);
  process.stdout.write(json);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
