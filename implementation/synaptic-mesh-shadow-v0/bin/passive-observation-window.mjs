#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { runPassiveObservationWindow } from '../src/passive-observation-window.mjs';

function pathIssue(value, prefix, { evidenceOnly = false, extension = null } = {}) {
  if (typeof value !== 'string' || !value.trim()) return `${prefix}.path_required`;
  if (/^https?:\/\//i.test(value)) return `${prefix}.network_path_rejected`;
  if (isAbsolute(value) || value.includes('..')) return `${prefix}.nonlocal_path_rejected`;
  if (/[*?\[\]{}]/.test(value)) return `${prefix}.glob_or_discovery_rejected`;
  if (extension && !value.endsWith(extension)) return `${prefix}.extension_required:${extension}`;
  if (evidenceOnly && !(value === 'evidence' || value.startsWith('evidence/'))) return `${prefix}.evidence_dir_required`;
  const root = process.cwd();
  const resolved = resolve(root, value);
  const rel = relative(root, resolved);
  if (rel.startsWith('..') || isAbsolute(rel)) return `${prefix}.outside_repo_rejected`;
  return null;
}

function resolveSafePath(value, prefix, options) {
  const issue = pathIssue(value, prefix, options);
  return issue ? { issue, resolved: null } : { issue: null, resolved: resolve(process.cwd(), value) };
}

function degradedCliArtifact(issues) {
  return {
    windowStatus: 'DEGRADED_OBSERVATION_WINDOW',
    validationIssues: [...new Set(issues)],
    policyDecision: null,
    reportMarkdown: '# Passive Observation Window v0.26.5\n\n- Window status: DEGRADED_OBSERVATION_WINDOW\n- policyDecision: null\n'
  };
}

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
const cliIssues = rejected.map((flag) => `cli.rejected_flag:${flag}`);
const outcomesPath = parsed.outcomes ? resolveSafePath(parsed.outcomes, 'cli.outcomes', { extension: '.json' }) : { issue: null, resolved: null };
const outJsonPath = parsed.outJson ? resolveSafePath(parsed.outJson, 'cli.outJson', { evidenceOnly: true, extension: '.json' }) : { issue: null, resolved: null };
const outMarkdownPath = parsed.outMarkdown ? resolveSafePath(parsed.outMarkdown, 'cli.outMarkdown', { evidenceOnly: true, extension: '.md' }) : { issue: null, resolved: null };
for (const issue of [outcomesPath.issue, outJsonPath.issue, outMarkdownPath.issue]) if (issue) cliIssues.push(issue);
let outcomes = null;
if (!cliIssues.length && outcomesPath.resolved) outcomes = JSON.parse(await readFile(outcomesPath.resolved, 'utf8'));
const artifact = cliIssues.length
  ? degradedCliArtifact(cliIssues)
  : await runPassiveObservationWindow({ sources: parsed.sources, recordsPerSource: parsed.recordsPerSource, totalRecords: parsed.totalRecords, outcomes });
for (const outputPath of [outJsonPath.resolved, outMarkdownPath.resolved].filter(Boolean)) await mkdir(dirname(outputPath), { recursive: true });
if (outJsonPath.resolved) await writeFile(outJsonPath.resolved, JSON.stringify(artifact, null, 2) + '\n');
if (outMarkdownPath.resolved) await writeFile(outMarkdownPath.resolved, artifact.reportMarkdown ?? '');
if (parsed.stdout || (!outJsonPath.resolved && !outMarkdownPath.resolved)) console.log(JSON.stringify(artifact, null, 2));
process.exitCode = artifact.windowStatus === 'OBSERVATION_WINDOW_COMPLETE' ? 0 : 1;
