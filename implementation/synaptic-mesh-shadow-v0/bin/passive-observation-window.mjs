#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPassiveObservationWindow } from '../src/passive-observation-window.mjs';

function parseArgs(argv) {
  const parsed = { sources: [], recordsPerSource: 2, totalRecords: 6, outJson: null, outMarkdown: null, outcomes: null, stdout: false };
  const rejected = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') { parsed.sources.push(argv[++index]); continue; }
    if (arg.startsWith('--source=')) { parsed.sources.push(arg.slice('--source='.length)); continue; }
    if (arg === '--sources') { parsed.sources.push(...String(argv[++index] ?? '').split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg.startsWith('--sources=')) { parsed.sources.push(...arg.slice('--sources='.length).split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg === '--outcomes') { parsed.outcomes = argv[++index]; continue; }
    if (arg.startsWith('--outcomes=')) { parsed.outcomes = arg.slice('--outcomes='.length); continue; }
    if (arg === '--records-per-source') { parsed.recordsPerSource = Number(argv[++index]); continue; }
    if (arg.startsWith('--records-per-source=')) { parsed.recordsPerSource = Number(arg.slice('--records-per-source='.length)); continue; }
    if (arg === '--total-records') { parsed.totalRecords = Number(argv[++index]); continue; }
    if (arg.startsWith('--total-records=')) { parsed.totalRecords = Number(arg.slice('--total-records='.length)); continue; }
    if (arg === '--out-json') { parsed.outJson = argv[++index]; continue; }
    if (arg.startsWith('--out-json=')) { parsed.outJson = arg.slice('--out-json='.length); continue; }
    if (arg === '--out-markdown') { parsed.outMarkdown = argv[++index]; continue; }
    if (arg.startsWith('--out-markdown=')) { parsed.outMarkdown = arg.slice('--out-markdown='.length); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    if (['--watch', '--daemon', '--network', '--fetch', '--execute', '--tool', '--glob', '--recursive', '--raw-output', '--raw-persist'].some((flag) => arg === flag || arg.startsWith(flag + '='))) rejected.push(arg);
    else rejected.push(arg);
  }
  return { parsed, rejected };
}

const { parsed, rejected } = parseArgs(process.argv.slice(2));
let outcomes = null;
if (parsed.outcomes) outcomes = JSON.parse(await readFile(resolve(parsed.outcomes), 'utf8'));
const artifact = rejected.length
  ? { windowStatus: 'DEGRADED_OBSERVATION_WINDOW', validationIssues: rejected.map((flag) => `cli.rejected_flag:${flag}`), policyDecision: null, reportMarkdown: '# Passive Observation Window v0.26.5\n\n- Window status: DEGRADED_OBSERVATION_WINDOW\n- policyDecision: null\n' }
  : await runPassiveObservationWindow({ sources: parsed.sources, recordsPerSource: parsed.recordsPerSource, totalRecords: parsed.totalRecords, outcomes });
if (parsed.outJson || parsed.outMarkdown) await mkdir(resolve('evidence'), { recursive: true });
if (parsed.outJson) await writeFile(resolve(parsed.outJson), JSON.stringify(artifact, null, 2) + '\n');
if (parsed.outMarkdown) await writeFile(resolve(parsed.outMarkdown), artifact.reportMarkdown ?? '');
if (parsed.stdout || (!parsed.outJson && !parsed.outMarkdown)) console.log(JSON.stringify(artifact, null, 2));
process.exitCode = artifact.windowStatus === 'OBSERVATION_WINDOW_COMPLETE' ? 0 : 1;
