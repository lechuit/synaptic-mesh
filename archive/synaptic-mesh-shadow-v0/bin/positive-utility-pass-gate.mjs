#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { runPositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';

function parseArgs(argv = []) {
  const parsed = { sources: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') { parsed.sources.push(argv[++index]); continue; }
    if (arg.startsWith('--source=')) { parsed.sources.push(arg.slice('--source='.length)); continue; }
    if (arg === '--sources') { parsed.sources.push(...String(argv[++index] ?? '').split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg.startsWith('--sources=')) { parsed.sources.push(...arg.slice('--sources='.length).split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg === '--records-per-source') { parsed.recordsPerSource = Number(argv[++index]); continue; }
    if (arg.startsWith('--records-per-source=')) { parsed.recordsPerSource = Number(arg.slice('--records-per-source='.length)); continue; }
    if (arg === '--total-records') { parsed.totalRecords = Number(argv[++index]); continue; }
    if (arg.startsWith('--total-records=')) { parsed.totalRecords = Number(arg.slice('--total-records='.length)); continue; }
    if (arg === '--max-isolated-source-failures') { parsed.maxIsolatedSourceFailures = Number(argv[++index]); continue; }
    if (arg.startsWith('--max-isolated-source-failures=')) { parsed.maxIsolatedSourceFailures = Number(arg.slice('--max-isolated-source-failures='.length)); continue; }
    if (arg === '--packet') { parsed.packetPath = argv[++index]; continue; }
    if (arg.startsWith('--packet=')) { parsed.packetPath = arg.slice('--packet='.length); continue; }
    if (arg === '--stdout') continue;
    throw new Error('unknown positive utility pass-gate argument: ' + arg);
  }
  return parsed;
}

try {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.packetPath) parsed.packet = JSON.parse(await readFile(parsed.packetPath, 'utf8'));
  const json = await runPositiveUtilityPassGate(parsed);
  process.stdout.write(json);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
