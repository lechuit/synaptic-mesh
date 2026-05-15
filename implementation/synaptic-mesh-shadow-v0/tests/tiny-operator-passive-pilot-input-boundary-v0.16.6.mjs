import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { prepareTinyPilotFixtureInputPath, runTinyPilotLocalInput } from '../src/tiny-operator-passive-pilot.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, '..');
const sample = resolve(pkg, 'fixtures/tiny-operator-passive-pilot-sample-v0.16.1.txt');
const prepared = await prepareTinyPilotFixtureInputPath(sample);
assert.equal(prepared, sample);
const packet = JSON.parse(await runTinyPilotLocalInput({ input: sample, stdout: true }));
assert.equal(packet.summary.packageFixtureInputOnly, true);
assert.equal(packet.abortCriteria.inputEscapeOrSymlink, false);

const blocked = [
  '../README.md',
  '../../MANIFEST.json',
  '/tmp/tiny-passive-pilot-v0166-input.txt',
  'evidence/tiny-operator-passive-pilot-v0.16.5.out.json',
  'fixtures',
  'fixtures/tiny-operator-passive-pilot-negative-controls-v0.16.3.json'
];
let rejected = 0;
for (const candidate of blocked) {
  await assert.rejects(() => prepareTinyPilotFixtureInputPath(candidate), /fixtures|sample|txt|regular|realpath/);
  rejected += 1;
}

const tmp = await mkdtemp(resolve(tmpdir(), 'sm-v0166-input-boundary-'));
const symlinkFile = resolve(pkg, 'fixtures/tiny-v0166-symlink-input.txt');
const symlinkParent = resolve(pkg, 'fixtures/tiny-v0166-symlink-parent');
async function clean(pathValue) { try { await unlink(pathValue); } catch (error) { if (error?.code !== 'ENOENT') throw error; } }
try {
  const outside = resolve(tmp, 'outside.txt');
  await writeFile(outside, 'outside sample should never be read\n');
  await clean(symlinkFile);
  await symlink(outside, symlinkFile, 'file');
  await assert.rejects(() => prepareTinyPilotFixtureInputPath(symlinkFile), /symlink|fixtures/);
  rejected += 1;
  await clean(symlinkFile);

  await clean(symlinkParent);
  await symlink(tmp, symlinkParent, 'dir');
  await assert.rejects(() => prepareTinyPilotFixtureInputPath(resolve(symlinkParent, 'outside.txt')), /realpath|fixtures/);
  rejected += 1;
} finally {
  await clean(symlinkFile);
  await clean(symlinkParent);
  await rm(tmp, { recursive: true, force: true });
}
assert.equal(existsSync(resolve(pkg, 'fixtures/tiny-v0166-symlink-input.txt')), false);

const out = {
  artifact: 'T-synaptic-mesh-tiny-operator-passive-pilot-input-boundary-v0.16.6',
  timestamp: '2026-05-15T02:28:00.000Z',
  summary: {
    inputBoundaryHardening: 'pass',
    releaseLayer: 'v0.16.6',
    packageFixtureInputOnly: true,
    singleSampleOnly: true,
    inputPathEscapeRejected: true,
    inputSymlinkFileRejected: true,
    inputSymlinkParentRejected: true,
    rejectedInputCandidates: rejected,
    rawPersisted: false,
    memoryConfigWrite: false,
    externalEffects: false,
    enforcement: false
  }
};
await mkdir(resolve(pkg, 'evidence'), { recursive: true });
await writeFile(resolve(pkg, 'evidence/tiny-operator-passive-pilot-input-boundary-v0.16.6.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
