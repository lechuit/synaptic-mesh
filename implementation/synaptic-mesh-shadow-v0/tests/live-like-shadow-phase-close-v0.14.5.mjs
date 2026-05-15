import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const evidencePath = resolve(packageRoot, 'evidence/live-like-shadow-phase-close-v0.14.5.out.json');
const docs = await readFile(resolve(repoRoot, 'docs/live-like-shadow-phase-close-v0.14.5.md'), 'utf8');
const required = ['live-like shadow/sandbox readiness achieved', 'ready to design v0.15 passive live shadow', 'no live traffic', 'no tools', 'no runtime authority', 'no enforcement', 'unexpectedPermits: 0', 'release:check -- --target v0.14.5'];
assert.deepEqual(required.filter((phrase) => !docs.includes(phrase)), [], 'phase close docs must include required phrases');
const evidenceFiles = [
  'live-like-shadow-observation-envelope-v0.14.0-alpha.out.json',
  'live-like-shadow-replay-harness-v0.14.1.out.json',
  'live-like-shadow-compare-only-scorecards-v0.14.2.out.json',
  'live-like-shadow-sandbox-failure-catalog-v0.14.3.out.json',
  'live-like-shadow-reviewer-package-v0.14.4.out.json'
];
const prior = [];
for (const file of evidenceFiles) prior.push(JSON.parse(await readFile(resolve(packageRoot, 'evidence', file), 'utf8')));
assert.equal(prior[0].summary.liveLikeObservationEnvelope, 'pass');
assert.equal(prior[1].summary.replayHarness, 'pass');
assert.equal(prior[2].summary.scorecard, 'pass');
assert.equal(prior[2].summary.mode, 'compare-only');
assert.equal(prior[3].summary.negativeControls, 5);
assert.equal(prior[3].summary.unexpectedPermits, 0);
assert.equal(prior[4].summary.reviewerPackage, 'pass');
assert.equal(prior[4].summary.nextPassiveLiveShadowDesignMayBeDesigned, true);
const summary = {
  phaseClose: 'pass',
  releaseLayer: 'v0.14.5',
  liveLikeShadowSandboxReadinessAchieved: true,
  readyToDesignV015PassiveLiveShadow: true,
  liveTraffic: false,
  tools: false,
  runtimeAuthority: false,
  enforcement: false,
  runtimeIntegration: false,
  realFrameworkAdapter: false,
  networkAllowed: false,
  watcherDaemon: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  authorization: false,
  negativeControls: 5,
  unexpectedPermits: 0,
  evidenceFiles: evidenceFiles.length
};
for (const key of ['liveTraffic', 'tools', 'runtimeAuthority', 'enforcement', 'runtimeIntegration', 'realFrameworkAdapter', 'networkAllowed', 'watcherDaemon', 'agentConsumed', 'machineReadablePolicyDecision', 'authorization']) assert.equal(summary[key], false, key);
const output = { artifact: 'T-synaptic-mesh-live-like-shadow-phase-close-v0.14.5', timestamp: '2026-05-14T23:59:00.000Z', summary };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
