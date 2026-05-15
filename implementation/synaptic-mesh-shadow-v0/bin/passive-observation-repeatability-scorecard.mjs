#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { scorePassiveObservationRepeatability } from '../src/passive-observation-repeatability-scorecard.mjs';

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
    scorecardStatus: 'DEGRADED_REPEATABILITY_SCORECARD',
    validationIssues: [...new Set(issues)],
    recommendation: 'HOLD_FOR_MORE_EVIDENCE',
    recommendationIsAuthority: false,
    policyDecision: null,
    reportMarkdown: '# Passive Observation Repeatability Scorecard v0.27.5\n\n- Scorecard status: DEGRADED_REPEATABILITY_SCORECARD\n- policyDecision: null\n'
  };
}
function parseArgs(argv) {
  const parsed = { windows: [], outJson: null, outMarkdown: null, stdout: false };
  const rejected = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--window') { parsed.windows.push(argv[++index]); continue; }
    if (arg.startsWith('--window=')) { parsed.windows.push(arg.slice('--window='.length)); continue; }
    if (arg === '--windows') { parsed.windows.push(...String(argv[++index] ?? '').split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg.startsWith('--windows=')) { parsed.windows.push(...arg.slice('--windows='.length).split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg === '--out-json') { parsed.outJson = argv[++index]; continue; }
    if (arg.startsWith('--out-json=')) { parsed.outJson = arg.slice('--out-json='.length); continue; }
    if (arg === '--out-markdown') { parsed.outMarkdown = argv[++index]; continue; }
    if (arg.startsWith('--out-markdown=')) { parsed.outMarkdown = arg.slice('--out-markdown='.length); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    if (['--watch', '--daemon', '--network', '--fetch', '--execute', '--tool', '--glob', '--recursive', '--raw-output', '--raw-persist', '--recommendation-is-authority'].some((flag) => arg === flag || arg.startsWith(flag + '='))) rejected.push(arg);
    else rejected.push(arg);
  }
  return { parsed, rejected };
}

const { parsed, rejected } = parseArgs(process.argv.slice(2));
const cliIssues = rejected.map((flag) => `cli.rejected_flag:${flag}`);
const windowPaths = parsed.windows.map((value, index) => resolveSafePath(value, `cli.windows[${index}]`, { extension: '.json' }));
const outJsonPath = parsed.outJson ? resolveSafePath(parsed.outJson, 'cli.outJson', { evidenceOnly: true, extension: '.json' }) : { issue: null, resolved: null };
const outMarkdownPath = parsed.outMarkdown ? resolveSafePath(parsed.outMarkdown, 'cli.outMarkdown', { evidenceOnly: true, extension: '.md' }) : { issue: null, resolved: null };
for (const issue of [...windowPaths.map((entry) => entry.issue), outJsonPath.issue, outMarkdownPath.issue]) if (issue) cliIssues.push(issue);
let windows = [];
if (!cliIssues.length) windows = await Promise.all(windowPaths.map(async (entry) => JSON.parse(await readFile(entry.resolved, 'utf8'))));
const artifact = cliIssues.length ? degradedCliArtifact(cliIssues) : scorePassiveObservationRepeatability({ windows });
for (const outputPath of [outJsonPath.resolved, outMarkdownPath.resolved].filter(Boolean)) await mkdir(dirname(outputPath), { recursive: true });
if (outJsonPath.resolved) await writeFile(outJsonPath.resolved, JSON.stringify(artifact, null, 2) + '\n');
if (outMarkdownPath.resolved) await writeFile(outMarkdownPath.resolved, artifact.reportMarkdown ?? '');
if (parsed.stdout || (!outJsonPath.resolved && !outMarkdownPath.resolved)) console.log(JSON.stringify(artifact, null, 2));
process.exitCode = artifact.scorecardStatus === 'REPEATABILITY_SCORECARD_COMPLETE' ? 0 : 1;
