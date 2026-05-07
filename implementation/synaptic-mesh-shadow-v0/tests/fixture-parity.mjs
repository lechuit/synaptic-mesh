import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { loadFixtureManifest, fixturePaths, artifactPresence, readFixtureSummary, summarizeGate, radarRoot } from '../src/fixture-manifest.mjs';

const manifest = await loadFixtureManifest();

const results = [];
for (const fixtureId of manifest.priorityFixtures) {
  const paths = fixturePaths(manifest.runRoot, fixtureId);
  const presence = artifactPresence(paths);
  const missingArtifacts = Object.entries(presence).filter(([, present]) => !present).map(([kind]) => kind);

  let nodeCheck = { status: 'skipped', ok: false, stderr: '' };
  let summary = {};
  let gate = { pass: false, verdictOk: false, unsafeAllows: 0, thresholdAwareUnsafe: 0, intentionalRegressionProfiles: [] };

  if (missingArtifacts.length === 0) {
    const check = spawnSync(process.execPath, ['--check', paths.mjs], { encoding: 'utf8' });
    nodeCheck = {
      status: check.status === 0 ? 'pass' : 'fail',
      ok: check.status === 0,
      stderr: check.stderr.trim(),
    };
    summary = await readFixtureSummary(paths.out);
    gate = summarizeGate(fixtureId, summary);
  }

  results.push({
    fixtureId,
    relativePaths: Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, path.relative(radarRoot, value)])),
    presence,
    missingArtifacts,
    nodeCheck,
    summary,
    gate,
    pass: missingArtifacts.length === 0 && nodeCheck.ok && gate.pass,
  });
}

const summary = {
  artifact: 'T-synaptic-mesh-fixture-parity-harness-v0',
  timestamp: '2026-05-06T17:42:00Z',
  verdict: results.every((r) => r.pass) ? 'pass' : 'fail',
  fixtureCount: results.length,
  passCases: results.filter((r) => r.pass).length,
  missingArtifactCases: results.filter((r) => r.missingArtifacts.length > 0).length,
  nodeCheckFailures: results.filter((r) => !r.nodeCheck.ok).length,
  gateFailures: results.filter((r) => !r.gate.pass).length,
  nonRegressionUnsafeAllowFixtures: results
    .filter((r) => r.fixtureId !== 'T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0')
    .filter((r) => Number(r.gate.unsafeAllows ?? 0) !== 0)
    .map((r) => r.fixtureId),
  intentionalRegressionProfiles: results
    .find((r) => r.fixtureId === 'T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0')
    ?.gate.intentionalRegressionProfiles ?? [],
  mutatedSourceFixtures: false,
};

const output = {
  summary,
  manifest: {
    status: manifest.status,
    sourceManifest: manifest.sourceManifest,
    runRoot: path.relative(radarRoot, manifest.runRoot),
  },
  results,
};

const evidencePath = path.resolve(radarRoot, 'implementation/synaptic-mesh-shadow-v0/evidence/fixture-parity.out.json');
await mkdir(path.dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exitCode = 1;
