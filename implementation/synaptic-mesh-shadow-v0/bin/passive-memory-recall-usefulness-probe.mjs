#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { scorePassiveMemoryRecallUsefulness } from '../src/passive-memory-recall-usefulness-probe.mjs';

function pathIssue(value, prefix, { evidenceOnly = false, extension = null, input = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) return `${prefix}.path_required`;
  if (/^https?:\/\//i.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value)) return `${prefix}.network_path_rejected`;
  if (isAbsolute(value) || value.includes('..')) return `${prefix}.nonlocal_path_rejected`;
  if (/[*?\[\]{}]/.test(value)) return `${prefix}.glob_or_discovery_rejected`;
  if (extension && !value.endsWith(extension)) return `${prefix}.extension_required:${extension}`;
  if (evidenceOnly && !(value === 'evidence' || value.startsWith('evidence/'))) return `${prefix}.evidence_dir_required`;
  if (input && !(value.startsWith('fixtures/') || value.startsWith('evidence/') || value.startsWith('examples/'))) return `${prefix}.explicit_repo_local_fixture_required`;
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
    probeStatus: 'DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE',
    validationIssues: [...new Set(issues)],
    recommendation: 'HOLD_FOR_MORE_EVIDENCE',
    recommendationIsAuthority: false,
    policyDecision: null,
    metrics: {
      cardCount: 0,
      evidenceCount: 0,
      usefulRecallRatio: 0,
      contradictionSurfacingRatio: 0,
      staleNegativeMarkedRatio: 0,
      sourceBoundMatchRatio: 0,
      irrelevantMatchRatio: 0,
      boundaryViolationCount: issues.length,
      policyDecision: null
    },
    reportMarkdown: '# Passive Memory Recall Usefulness Probe v0.28.5\n\n- probeStatus: DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE\n- policyDecision: null\n'
  };
}
function parseArgs(argv) {
  const parsed = { cards: null, evidence: null, outJson: null, outMarkdown: null, stdout: false };
  const rejected = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--cards') { parsed.cards = argv[++index]; continue; }
    if (arg.startsWith('--cards=')) { parsed.cards = arg.slice('--cards='.length); continue; }
    if (arg === '--evidence') { parsed.evidence = argv[++index]; continue; }
    if (arg.startsWith('--evidence=')) { parsed.evidence = arg.slice('--evidence='.length); continue; }
    if (arg === '--out-json') { parsed.outJson = argv[++index]; continue; }
    if (arg.startsWith('--out-json=')) { parsed.outJson = arg.slice('--out-json='.length); continue; }
    if (arg === '--out-markdown') { parsed.outMarkdown = argv[++index]; continue; }
    if (arg.startsWith('--out-markdown=')) { parsed.outMarkdown = arg.slice('--out-markdown='.length); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    if (['--watch', '--daemon', '--network', '--fetch', '--execute', '--tool', '--glob', '--recursive', '--raw-output', '--raw-persist', '--memory-write', '--config-write', '--runtime-integration', '--recommendation-is-authority'].some((flag) => arg === flag || arg.startsWith(flag + '='))) rejected.push(arg);
    else rejected.push(arg);
  }
  return { parsed, rejected };
}

const { parsed, rejected } = parseArgs(process.argv.slice(2));
const cliIssues = rejected.map((flag) => `cli.rejected_flag:${flag}`);
const cardsPath = parsed.cards ? resolveSafePath(parsed.cards, 'cli.cards', { input: true, extension: '.json' }) : { issue: 'cli.cards.path_required', resolved: null };
const evidencePath = parsed.evidence ? resolveSafePath(parsed.evidence, 'cli.evidence', { input: true, extension: '.json' }) : { issue: 'cli.evidence.path_required', resolved: null };
const outJsonPath = parsed.outJson ? resolveSafePath(parsed.outJson, 'cli.outJson', { evidenceOnly: true, extension: '.json' }) : { issue: null, resolved: null };
const outMarkdownPath = parsed.outMarkdown ? resolveSafePath(parsed.outMarkdown, 'cli.outMarkdown', { evidenceOnly: true, extension: '.md' }) : { issue: null, resolved: null };
for (const issue of [cardsPath.issue, evidencePath.issue, outJsonPath.issue, outMarkdownPath.issue]) if (issue) cliIssues.push(issue);
let input = {};
if (!cliIssues.length) {
  const cards = JSON.parse(await readFile(cardsPath.resolved, 'utf8'));
  const evidence = JSON.parse(await readFile(evidencePath.resolved, 'utf8'));
  input = { cards: cards.cards ?? cards, evidence: evidence.evidence ?? evidence };
}
const artifact = cliIssues.length ? degradedCliArtifact(cliIssues) : scorePassiveMemoryRecallUsefulness(input);
for (const outputPath of [outJsonPath.resolved, outMarkdownPath.resolved].filter(Boolean)) await mkdir(dirname(outputPath), { recursive: true });
if (outJsonPath.resolved) await writeFile(outJsonPath.resolved, JSON.stringify(artifact, null, 2) + '\n');
if (outMarkdownPath.resolved) await writeFile(outMarkdownPath.resolved, artifact.reportMarkdown ?? '');
if (parsed.stdout || (!outJsonPath.resolved && !outMarkdownPath.resolved)) console.log(JSON.stringify(artifact, null, 2));
process.exitCode = artifact.probeStatus === 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE' ? 0 : 1;
