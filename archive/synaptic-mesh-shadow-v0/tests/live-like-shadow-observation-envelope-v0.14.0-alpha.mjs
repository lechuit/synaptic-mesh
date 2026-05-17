import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const evidencePath = resolve(packageRoot, 'evidence/live-like-shadow-observation-envelope-v0.14.0-alpha.out.json');
const schema = JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-like-shadow-observation-envelope-v0.14.0.schema.json'), 'utf8'));
const fixture = JSON.parse(await readFile(resolve(packageRoot, 'fixtures/live-like-shadow-observation-v0.14.0-alpha.json'), 'utf8'));
const docs = await readFile(resolve(repoRoot, 'docs/live-like-shadow-observation-envelope-v0.14.0-alpha.md'), 'utf8');

const requiredDocPhrases = ['live-like shadow/sandbox', 'offline/frozen/already-redacted', 'no raw private content', 'no live traffic', 'no network', 'no watcher/daemon', 'no SDK import', 'no framework adapter', 'not runtime authority', 'release:check -- --target v0.14.0-alpha'];
assert.deepEqual(requiredDocPhrases.filter((phrase) => !docs.includes(phrase)), [], 'docs must include boundary phrases');

assert.equal(schema.properties.schemaVersion.const, 'live-like-shadow-observation-envelope-v0.14.0-alpha');
assert.equal(fixture.schemaVersion, 'live-like-shadow-observation-envelope-v0.14.0-alpha');
assert.equal(fixture.mode, 'live-like shadow/sandbox');
assert.equal(fixture.sourceBoundary.offlineFrozenAlreadyRedacted, true);
assert.equal(fixture.sourceBoundary.manualOrFrozenOnly, true);
for (const key of ['liveTraffic', 'network', 'watcherDaemon', 'frameworkAdapter', 'sdkImport']) assert.equal(fixture.sourceBoundary[key], false, key);
assert.equal(fixture.redaction.status, 'already-redacted');
assert.equal(fixture.redaction.rawPrivateContent, false);
assert.equal(fixture.redaction.placeholdersOnly, true);
for (const key of ['toolExecution', 'agentConsumed', 'machineReadablePolicyDecision', 'approvalBlockAllowAuthorizationEnforcement']) assert.equal(fixture.forbiddenEffects[key], false, key);

const summary = {
  liveLikeObservationEnvelope: 'pass',
  releaseLayer: 'v0.14.0-alpha',
  liveLikeShadowSandbox: true,
  offlineFrozenAlreadyRedacted: true,
  manualOrFrozenOnly: true,
  rawPrivateContent: false,
  liveTraffic: false,
  networkAllowed: false,
  watcherDaemon: false,
  sdkImport: false,
  frameworkAdapter: false,
  toolExecution: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  authorization: false,
  enforcement: false
};
const output = { artifact: 'T-synaptic-mesh-live-like-shadow-observation-envelope-v0.14.0-alpha', timestamp: '2026-05-14T23:59:00.000Z', summary };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
