import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { observePassiveLocalInput, resolvePassiveEvidenceOutputPath } from '../src/passive-live-shadow.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, '..');
const evidence = resolve(pkg, 'evidence');

const allowed = resolvePassiveEvidenceOutputPath('evidence/passive-live-shadow-observation-cli-v0.15.2.out.json');
assert.ok(allowed.startsWith(evidence + '/'));

const blocked = [
  '../outside.json',
  '../../MEMORY.json',
  'fixtures/should-not-write-v0.15.6.json',
  '/tmp/passive-live-shadow-escape-v0.15.6.json',
  'evidence/not-json.txt'
];
let rejected = 0;
for (const candidate of blocked) {
  assert.throws(() => resolvePassiveEvidenceOutputPath(candidate), /evidence|json/);
  rejected += 1;
}
assert.equal(existsSync(resolve(pkg, 'fixtures/should-not-write-v0.15.6.json')), false);

const sampleInput = resolve(pkg, 'fixtures/passive-live-shadow-sample-input-v0.15.2.txt');
const tmp = await mkdtemp(resolve(tmpdir(), 'sm-v0156-output-boundary-'));
const symlinkParentName = 'passive-live-shadow-v0156-symlink-parent';
const symlinkParent = resolve(evidence, symlinkParentName);
const symlinkOutputName = 'passive-live-shadow-v0156-symlink-output.json';
const symlinkOutput = resolve(evidence, symlinkOutputName);
let symlinkRejected = 0;

async function unlinkIfPresent(pathValue) {
  try { await unlink(pathValue); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
}

try {
  await unlinkIfPresent(symlinkParent);
  await symlink(tmp, symlinkParent, 'dir');
  await assert.rejects(
    () => observePassiveLocalInput({ input: sampleInput, output: `evidence/${symlinkParentName}/escaped.json` }),
    /symlink|realpath|evidence/
  );
  assert.equal(existsSync(resolve(tmp, 'escaped.json')), false);
  symlinkRejected += 1;
  await unlinkIfPresent(symlinkParent);

  const symlinkTarget = resolve(tmp, 'target.json');
  await writeFile(symlinkTarget, 'untouched\n');
  await unlinkIfPresent(symlinkOutput);
  await symlink(symlinkTarget, symlinkOutput, 'file');
  await assert.rejects(
    () => observePassiveLocalInput({ input: sampleInput, output: `evidence/${symlinkOutputName}` }),
    /symlink|ELOOP|evidence/
  );
  assert.equal(readFileSync(symlinkTarget, 'utf8'), 'untouched\n');
  symlinkRejected += 1;
} finally {
  await unlinkIfPresent(symlinkParent);
  await unlinkIfPresent(symlinkOutput);
  await rm(tmp, { recursive: true, force: true });
}

const out = {
  artifact: 'T-synaptic-mesh-passive-live-shadow-output-boundary-v0.15.6',
  timestamp: '2026-05-15T01:52:00.000Z',
  summary: {
    outputBoundaryHardening: 'pass',
    releaseLayer: 'v0.15.6',
    evidenceDirectoryOnly: true,
    stdoutAllowed: true,
    outputPathEscapeRejected: true,
    symlinkParentRejected: true,
    symlinkOutputFileRejected: true,
    rejectedOutputCandidates: rejected + symlinkRejected,
    memoryConfigWrite: false,
    externalEffects: false,
    enforcement: false
  }
};
await mkdir(resolve(pkg, 'evidence'), { recursive: true });
await writeFile(resolve(pkg, 'evidence/passive-live-shadow-output-boundary-v0.15.6.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
