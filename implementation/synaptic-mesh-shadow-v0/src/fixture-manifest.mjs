import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
export const radarRoot = path.resolve(packageRoot, '..', '..');

export async function loadFixtureManifest(manifestPath = path.join(packageRoot, 'fixtures', 'manifest.json')) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const runRoot = path.resolve(radarRoot, manifest.runRoot);
  return {
    ...manifest,
    manifestPath,
    runRoot,
    priorityFixtures: manifest.priorityFixtures ?? [],
  };
}

export function fixturePaths(runRoot, fixtureId) {
  return {
    md: path.join(runRoot, `${fixtureId}.md`),
    mjs: path.join(runRoot, `${fixtureId}.mjs`),
    out: path.join(runRoot, `${fixtureId}.out.json`),
  };
}

export async function readFixtureSummary(outPath) {
  const parsed = JSON.parse(await readFile(outPath, 'utf8'));
  return parsed.summary ?? {};
}

export function artifactPresence(paths) {
  return Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, existsSync(value)]));
}

export function summarizeGate(fixtureId, summary) {
  const verdictOk = summary.verdict === 'pass' || summary.ok === true || summary.score === summary.total;
  const unsafeAllows = Number(summary.unsafeAllows ?? 0);
  const thresholdAwareUnsafe = Array.isArray(summary.unsafeThresholdAwareKs) ? summary.unsafeThresholdAwareKs.length : 0;
  const isIntentionalRegressionFixture = fixtureId === 'T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0';
  const regressionProfiles = Array.isArray(summary.regressions)
    ? summary.regressions.filter((profile) => Number(profile.unsafeAllows ?? 0) > 0).map((profile) => profile.profile)
    : [];

  return {
    verdictOk,
    unsafeAllows,
    thresholdAwareUnsafe,
    intentionalRegressionProfiles: isIntentionalRegressionFixture ? regressionProfiles : [],
    pass: Boolean(verdictOk)
      && thresholdAwareUnsafe === 0
      && (unsafeAllows === 0 || isIntentionalRegressionFixture),
  };
}
