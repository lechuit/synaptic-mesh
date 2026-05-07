#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const releaseGateScripts = [
  'verify:manifest',
  'check',
  'test:receiver-adapters',
  'review:local',
  'test:action-policy',
  'test:authority-routes',
  'test:authority-envelope',
  'test:route-decision-schema',
  'test:threat-model-routes',
  'test:route-decision-wrong-routes',
  'test:receipt-schema',
  'test:authority-benchmark',
  'test:adversarial-generator',
  'test:raw-parser-adversarial',
];

function runGit(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...options }).trim();
}

function runNpmScript(scriptName, cwd) {
  console.log(`\n> release gate: npm run ${scriptName}`);
  execFileSync('npm', ['run', scriptName], { cwd, stdio: 'inherit' });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const parsed = { target: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--target') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--target requires a v-prefixed semver tag value');
      parsed.target = value;
      index += 1;
      continue;
    }
    if (arg.startsWith('--target=')) {
      parsed.target = arg.slice('--target='.length);
      if (!parsed.target) throw new Error('--target requires a v-prefixed semver tag value');
      continue;
    }
    throw new Error(`Unknown release:check argument: ${arg}`);
  }
  return parsed;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, expected, label) {
  assert(text.includes(expected), `${label} must include ${JSON.stringify(expected)}`);
}

function assertNotIncludes(text, forbidden, label) {
  assert(!text.includes(forbidden), `${label} must not include stale ${JSON.stringify(forbidden)}`);
}

function countLabel(passed, total) {
  return `${passed}/${total}`;
}

function assertOptionalCountMatches(text, pattern, expectedCount, label, description) {
  const match = text.match(pattern);
  if (!match) return;

  const actualCount = countLabel(Number(match.groups.passed), Number(match.groups.total));
  assert(
    actualCount === expectedCount,
    `${label} ${description} count ${actualCount} must match current evidence ${expectedCount}; remove the exact count if it is not intended to be release-pinned`,
  );
}

function currentPublishedRelease() {
  try {
    const tag = runGit(['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*']);
    return tag || null;
  } catch {
    return null;
  }
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = runGit(['rev-parse', '--show-toplevel']);
const expectedPackageRoot = path.join(repoRoot, 'implementation/synaptic-mesh-shadow-v0');
const packageRoot = process.cwd();

assert(
  path.resolve(packageRoot) === path.resolve(expectedPackageRoot),
  `release:check must be run from implementation/synaptic-mesh-shadow-v0; got ${packageRoot}`,
);

const manifest = readJson(path.join(repoRoot, 'MANIFEST.json'));
const packageJson = readJson(path.join(packageRoot, 'package.json'));
const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
const releaseNotes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
const releaseChecklist = readFileSync(path.join(repoRoot, 'docs/release-checklist.md'), 'utf8');
const shadowReadme = readFileSync(path.join(packageRoot, 'README.md'), 'utf8');

const manifestVersion = manifest.version;
const manifestReleaseTag = `v${manifestVersion}`;
const releaseTarget = args.target ?? manifestReleaseTag;
const publishedRelease = currentPublishedRelease();
const staleVersions = ['v0.1.2', '0.1.2'].filter((version) => version !== manifestReleaseTag && version !== manifestVersion);

assert(/^\d+\.\d+\.\d+$/.test(manifestVersion), `MANIFEST.json version must be semver-like; got ${manifestVersion}`);
assert(/^v\d+\.\d+\.\d+$/.test(releaseTarget), `release target must be a v-prefixed semver tag such as v0.1.4; got ${releaseTarget}`);
if (!args.target) {
  console.warn(`release:check defaulting --target to MANIFEST.json version ${manifestReleaseTag}; pass -- --target vX.Y.Z for release/tag verification.`);
}
assert(packageJson.private === true, 'shadow package must remain private for release checks');
assert(packageJson.version === '0.0.0-local', 'shadow package version must remain 0.0.0-local unless publication scope changes');
assert(packageJson.scripts?.['release:check'] === 'node ../../tools/release-check.mjs', 'package.json must wire npm run release:check to ../../tools/release-check.mjs');

assertIncludes(readme, `# Synaptic Mesh ${manifestReleaseTag}`, 'README.md');
assertIncludes(readme, `release candidate \`${manifestReleaseTag}\``, 'README.md');
assertIncludes(readme, `Current ${manifestReleaseTag} status is narrower`, 'README.md');
assertIncludes(releaseNotes, `# Release Notes — Synaptic Mesh ${manifestReleaseTag}`, 'RELEASE_NOTES.md');
assertIncludes(releaseChecklist, 'npm run release:check', 'docs/release-checklist.md');
assertIncludes(releaseChecklist, 'no runtime integration', 'docs/release-checklist.md');
assertIncludes(releaseChecklist, 'no production, canary, enforcement, or safety-certification claims', 'docs/release-checklist.md');

for (const staleVersion of staleVersions) {
  assertNotIncludes(readme, staleVersion, 'README.md');
}

for (const scriptName of releaseGateScripts) {
  runNpmScript(scriptName, packageRoot);
}

const reviewEvidence = readJson(path.join(packageRoot, 'evidence/review-local.out.json'));
assert(reviewEvidence?.summary?.verdict === 'pass', 'review-local evidence verdict must be pass');
assert(reviewEvidence?.summary?.sourceFixtureMutation === false, 'review-local evidence must report sourceFixtureMutation: false');
assert((reviewEvidence?.summary?.unsafeAllowSignals ?? []).length === 0, 'review-local evidence must report zero unsafe allow signals');

const receiverAdapterEvidence = readJson(path.join(packageRoot, 'evidence/receiver-policy-adapter-contracts.out.json'));
assert(receiverAdapterEvidence?.summary?.verdict === 'pass', 'receiver adapter evidence verdict must be pass');
assert(receiverAdapterEvidence?.summary?.unsafeAllows === 0, 'receiver adapter evidence must report unsafeAllows: 0');

const reviewLocalCount = countLabel(reviewEvidence.summary.passCommands, reviewEvidence.summary.commands);
const receiverAdapterCount = countLabel(receiverAdapterEvidence.summary.passCases, receiverAdapterEvidence.summary.totalCases);

assertOptionalCountMatches(
  readme,
  /Expected current result:\s*(?<passed>\d+)\/(?<total>\d+) commands pass/,
  reviewLocalCount,
  'README.md',
  'review-local',
);
assertOptionalCountMatches(
  releaseNotes,
  /review-local:\s*pass\s+(?<passed>\d+)\/(?<total>\d+)/,
  reviewLocalCount,
  'RELEASE_NOTES.md',
  'review-local',
);
assertOptionalCountMatches(
  shadowReadme,
  /commands:\s*`(?<passed>\d+)\/(?<total>\d+)` passing/,
  reviewLocalCount,
  'implementation/synaptic-mesh-shadow-v0/README.md',
  'review-local',
);
assertOptionalCountMatches(
  readme,
  /Expected current result:\s*(?<passed>\d+)\/(?<total>\d+) cases pass/,
  receiverAdapterCount,
  'README.md',
  'receiver adapter contracts',
);
assertOptionalCountMatches(
  releaseNotes,
  /receiver adapter contracts:\s*pass\s+(?<passed>\d+)\/(?<total>\d+)/,
  receiverAdapterCount,
  'RELEASE_NOTES.md',
  'receiver adapter contracts',
);

console.log(JSON.stringify({
  status: 'pass',
  currentPublishedRelease: publishedRelease,
  releaseTarget,
  manifestReleaseTarget: manifestReleaseTag,
  packageRoot: path.relative(repoRoot, packageRoot),
  gates: releaseGateScripts,
  boundary: [
    'local_shadow_only',
    'no_runtime_integration',
    'no_tool_execution',
    'no_external_publication',
    'no_production_safety_claim',
  ],
}, null, 2));
