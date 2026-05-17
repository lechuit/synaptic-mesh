#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readPassiveMemoryHandoffInput, scorePassiveMemoryHandoffCandidates } from '../src/passive-memory-handoff-candidate-scorecard.mjs';

function usage() {
  return 'usage: passive-memory-handoff-candidate-scorecard --recall-artifact <repo-local-json> [--out <repo-local-json>] [--report <repo-local-md>]';
}

function parseArgs(argv) {
  const args = { recallArtifact: null, out: null, report: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--recall-artifact') args.recallArtifact = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--report') args.report = argv[++i];
    else throw new Error(`${usage()}\nunknown arg: ${arg}`);
  }
  if (!args.recallArtifact) throw new Error(`${usage()}\n--recall-artifact is required`);
  return args;
}

function assertSafeRepoLocalPath(value, label) {
  if (!value || path.isAbsolute(value) || value.includes('..')) throw new Error(`${label} must be an explicit repo-local path`);
  return value;
}

const args = parseArgs(process.argv);
const recallPath = assertSafeRepoLocalPath(args.recallArtifact, '--recall-artifact');
const input = await readPassiveMemoryHandoffInput(recallPath);
const artifact = scorePassiveMemoryHandoffCandidates(input);
const stdout = `${JSON.stringify(artifact, null, 2)}\n`;
if (args.out) {
  const out = assertSafeRepoLocalPath(args.out, '--out');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, stdout);
}
if (args.report) {
  const report = assertSafeRepoLocalPath(args.report, '--report');
  await mkdir(path.dirname(report), { recursive: true });
  await writeFile(report, artifact.reportMarkdown);
}
process.stdout.write(stdout);
