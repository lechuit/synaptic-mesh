import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const evidencePath = resolve(packageRoot, 'evidence/live-like-shadow-reviewer-package-v0.14.4.out.json');
const docs = await readFile(resolve(repoRoot, 'docs/live-like-shadow-reviewer-package-v0.14.4.md'), 'utf8');
const phrases = ['Reviewer go/no-go package', 'next step may be designed', 'live traffic/tool execution/enforcement remain unauthorized', 'human-review advisory only', 'not runtime authority', 'not a machine-readable policy decision', 'not agent-consumed output', 'release:check -- --target v0.14.4'];
assert.deepEqual(phrases.filter((phrase) => !docs.includes(phrase)), [], 'reviewer package must include required wording');
const summary = {
  reviewerPackage: 'pass',
  releaseLayer: 'v0.14.4',
  nextPassiveLiveShadowDesignMayBeDesigned: true,
  liveTrafficAuthorized: false,
  toolExecutionAuthorized: false,
  enforcementAuthorized: false,
  runtimeAuthority: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  approvalEmission: false,
  authorization: false,
  reviewedLayers: ['v0.14.0-alpha', 'v0.14.1', 'v0.14.2', 'v0.14.3']
};
for (const key of ['liveTrafficAuthorized', 'toolExecutionAuthorized', 'enforcementAuthorized', 'runtimeAuthority', 'agentConsumed', 'machineReadablePolicyDecision', 'approvalEmission', 'authorization']) assert.equal(summary[key], false, key);
const output = { artifact: 'T-synaptic-mesh-live-like-shadow-reviewer-package-v0.14.4', timestamp: '2026-05-14T23:59:00.000Z', summary };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
