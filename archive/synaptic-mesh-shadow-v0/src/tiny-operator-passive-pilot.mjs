import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { mkdir, lstat, realpath, open, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoEnforcementInvariant, passiveObservationFromText, redactObservation } from './passive-live-shadow.mjs';

export const TINY_PASSIVE_PILOT_VERSION = 'v0.16.6';
export const TINY_PASSIVE_PILOT_SCHEMA_VERSION = 'tiny-operator-passive-pilot-evidence-v0.16.2';
export const TINY_PASSIVE_PILOT_MODE = 'tiny-operator-run-passive-pilot-readiness-local-manual-no-effects';
export const TINY_PASSIVE_PILOT_PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const TINY_PASSIVE_PILOT_EVIDENCE_ROOT = resolve(TINY_PASSIVE_PILOT_PACKAGE_ROOT, 'evidence');
export const TINY_PASSIVE_PILOT_FIXTURE_ROOT = resolve(TINY_PASSIVE_PILOT_PACKAGE_ROOT, 'fixtures');
export const TINY_PASSIVE_PILOT_UNSAFE_FLAGS = Object.freeze(['--watch', '--daemon', '--network', '--execute', '--allow', '--block', '--approve', '--enforce', '--authorize']);
export const TINY_PASSIVE_PILOT_MULTI_INPUT_FLAGS = Object.freeze(['--inputs', '--batch', '--manifest', '--input-list', '--input-glob']);

export function tinyPilotProtocol() {
  return {
    releaseLayer: 'v0.16.0-alpha',
    disabledByDefault: true,
    humanStartedManualOnly: true,
    humanReviewRequired: true,
    operatorReviewRequired: true,
    singleSampleOnly: true,
    localSampleInputOnly: true,
    packageFixtureInputOnly: true,
    stdoutOrPackageEvidenceJsonOnly: true,
    networkResourceFetch: false,
    autonomousLiveMode: false,
    watcherDaemon: false,
    sdkFrameworkAdapter: false,
    mcpServerClient: false,
    langGraphSdk: false,
    a2aRuntime: false,
    githubBotWebhook: false,
    toolExecution: false,
    memoryConfigWrites: false,
    agentConsumedOutput: false,
    machineReadablePolicyDecision: false,
    approvalBlockAllowAuthorizationEnforcement: false,
    externalEffects: false
  };
}

export function resolveTinyPilotFixtureInputPath(input) {
  const candidate = resolve(TINY_PASSIVE_PILOT_PACKAGE_ROOT, input ?? '');
  const rel = relative(TINY_PASSIVE_PILOT_FIXTURE_ROOT, candidate);
  if (!input || rel === '' || rel.startsWith('..') || rel.startsWith('/') || rel.startsWith('\\')) {
    throw new Error('tiny passive pilot input must be one explicit package fixtures/ sample file');
  }
  if (!candidate.endsWith('.txt')) throw new Error('tiny passive pilot input must be a .txt sample file under package fixtures/');
  return candidate;
}

export async function prepareTinyPilotFixtureInputPath(input) {
  const candidate = resolveTinyPilotFixtureInputPath(input);
  const fixtureRootStat = await lstat(TINY_PASSIVE_PILOT_FIXTURE_ROOT);
  if (fixtureRootStat.isSymbolicLink() || !fixtureRootStat.isDirectory()) throw new Error('tiny passive pilot fixtures root must be a real directory');
  const stat = await lstat(candidate);
  if (stat.isSymbolicLink()) throw new Error('tiny passive pilot rejects symlink input file: ' + candidate);
  if (!stat.isFile()) throw new Error('tiny passive pilot input must be a regular file: ' + candidate);
  const fixtureReal = await realpath(TINY_PASSIVE_PILOT_FIXTURE_ROOT);
  const inputReal = await realpath(candidate);
  const realRel = relative(fixtureReal, inputReal);
  if (realRel.startsWith('..') || realRel.startsWith('/') || realRel.startsWith('\\')) throw new Error('tiny passive pilot input realpath escapes package fixtures/');
  return candidate;
}

export function rejectTinyPilotUnsafeArgs(argv = []) {
  const rejected = [];
  let inputCount = 0;
  for (const arg of argv) {
    if (arg === '--input' || arg.startsWith('--input=')) inputCount += 1;
    if (TINY_PASSIVE_PILOT_UNSAFE_FLAGS.includes(arg) || TINY_PASSIVE_PILOT_UNSAFE_FLAGS.some((flag) => arg.startsWith(flag + '='))) rejected.push(arg);
    if (TINY_PASSIVE_PILOT_MULTI_INPUT_FLAGS.includes(arg) || TINY_PASSIVE_PILOT_MULTI_INPUT_FLAGS.some((flag) => arg.startsWith(flag + '='))) rejected.push(arg);
  }
  if (inputCount > 1) rejected.push('multi-input');
  if (rejected.length) {
    const error = new Error('tiny passive pilot rejects unsafe or multi-input flags before work: ' + rejected.join(', '));
    error.rejected = rejected;
    throw error;
  }
  return true;
}

export function parseTinyPilotArgs(argv = []) {
  rejectTinyPilotUnsafeArgs(argv);
  const parsed = { input: undefined, output: undefined, stdout: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') { parsed.input = argv[++i]; continue; }
    if (arg.startsWith('--input=')) { parsed.input = arg.slice('--input='.length); continue; }
    if (arg === '--output') { parsed.output = argv[++i]; continue; }
    if (arg.startsWith('--output=')) { parsed.output = arg.slice('--output='.length); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    throw new Error('unknown tiny passive pilot argument: ' + arg);
  }
  if (!parsed.input) throw new Error('manual local --input path is required');
  if (!parsed.stdout && !parsed.output) parsed.output = 'evidence/tiny-operator-passive-pilot-v0.16.5.out.json';
  return parsed;
}

export function resolveTinyPilotEvidenceOutputPath(output) {
  const requested = output ?? 'evidence/tiny-operator-passive-pilot-v0.16.5.out.json';
  const candidate = resolve(TINY_PASSIVE_PILOT_PACKAGE_ROOT, requested);
  const rel = relative(TINY_PASSIVE_PILOT_EVIDENCE_ROOT, candidate);
  if (rel === '' || rel.startsWith('..') || rel.startsWith('/') || rel.startsWith('\\')) throw new Error('tiny passive pilot output must stay under package evidence/ or use --stdout');
  if (!candidate.endsWith('.json')) throw new Error('tiny passive pilot evidence output must be a .json file under package evidence/');
  return candidate;
}

async function assertDirectoryAndNotSymlink(pathValue, label) {
  const stat = await lstat(pathValue);
  if (stat.isSymbolicLink()) throw new Error(`tiny passive pilot rejects symlink ${label}: ${pathValue}`);
  if (!stat.isDirectory()) throw new Error(`tiny passive pilot expected directory ${label}: ${pathValue}`);
}

async function ensureEvidenceParentWithoutSymlinks(parentDir) {
  await mkdir(TINY_PASSIVE_PILOT_EVIDENCE_ROOT, { recursive: true });
  await assertDirectoryAndNotSymlink(TINY_PASSIVE_PILOT_EVIDENCE_ROOT, 'root');
  const relParent = relative(TINY_PASSIVE_PILOT_EVIDENCE_ROOT, parentDir);
  const parts = relParent && relParent !== '.' ? relParent.split(/[\\/]+/).filter(Boolean) : [];
  let cursor = TINY_PASSIVE_PILOT_EVIDENCE_ROOT;
  for (const part of parts) {
    cursor = resolve(cursor, part);
    try { await assertDirectoryAndNotSymlink(cursor, 'parent segment'); }
    catch (error) { if (error?.code !== 'ENOENT') throw error; await mkdir(cursor); await assertDirectoryAndNotSymlink(cursor, 'created parent segment'); }
  }
  const evidenceReal = await realpath(TINY_PASSIVE_PILOT_EVIDENCE_ROOT);
  const parentReal = await realpath(parentDir);
  const realRel = relative(evidenceReal, parentReal);
  if (realRel.startsWith('..') || realRel.startsWith('/') || realRel.startsWith('\\')) throw new Error('tiny passive pilot evidence parent realpath escapes package evidence/');
}

export async function prepareTinyPilotEvidenceOutputPath(output) {
  const candidate = resolveTinyPilotEvidenceOutputPath(output);
  await ensureEvidenceParentWithoutSymlinks(dirname(candidate));
  try {
    const stat = await lstat(candidate);
    if (stat.isSymbolicLink()) throw new Error('tiny passive pilot rejects symlink output file: ' + candidate);
    if (stat.isDirectory()) throw new Error('tiny passive pilot evidence output must be a file, not a directory: ' + candidate);
  } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  return candidate;
}

export async function writeTinyPilotEvidenceOutput(output, json) {
  const out = await prepareTinyPilotEvidenceOutputPath(output);
  const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | (constants.O_NOFOLLOW ?? 0);
  const handle = await open(out, flags, 0o600);
  try { await handle.writeFile(json); } finally { await handle.close(); }
  return out;
}

export function tinyPilotEvidenceFromText(rawText, { sourcePath = 'local-sample' } = {}) {
  const observation = passiveObservationFromText(rawText, { sourceKind: 'local_file_sample_stream', sourcePath });
  const invariant = assertNoEnforcementInvariant(observation);
  if (!invariant.pass) throw new Error('tiny passive pilot no-enforcement invariant failed: ' + invariant.failures.join(', '));
  return {
    artifact: 'T-synaptic-mesh-tiny-operator-passive-pilot-v0.16.5',
    schemaVersion: TINY_PASSIVE_PILOT_SCHEMA_VERSION,
    releaseLayer: TINY_PASSIVE_PILOT_VERSION,
    mode: TINY_PASSIVE_PILOT_MODE,
    timestamp: '2026-05-15T02:16:00.000Z',
    summary: {
      tinyOperatorRunPassivePilotReadiness: 'pass',
      operatorReviewRequired: true,
      singleSampleOnly: true,
      humanStartedManualOnly: true,
      disabledByDefault: true,
      packageFixtureInputOnly: true,
      rawPersisted: false,
      decisionVerbsSanitized: observation.redaction.decisionVerbRedactedBeforePersistence === true,
      noAgentConsumption: true,
      policyDecision: null,
      expectedRejects: 23,
      unexpectedPermits: 0,
      externalEffects: false,
      enforcement: false
    },
    pilot: tinyPilotProtocol(),
    hashes: {
      sourcePathSha256: createHash('sha256').update(String(sourcePath)).digest('hex'),
      rawSha256: observation.redaction.rawSha256,
      redactedSha256: observation.redaction.redactedSha256
    },
    abortCriteria: {
      rawPrivateTokenAfterRedaction: false,
      unsanitizedDecisionVerbPersisted: observation.redaction.semanticDecisionTokenPersisted,
      unsafeFlagAttempt: false,
      outputEscapeOrSymlink: false,
      inputEscapeOrSymlink: false,
      multiInputOrBatch: false,
      nonNullPolicyDecisionOrDecision: false
    },
    observation
  };
}

export async function runTinyPilotLocalInput({ input, output, stdout = false }) {
  const abs = await prepareTinyPilotFixtureInputPath(input);
  const raw = await readFile(abs, 'utf8');
  const packet = tinyPilotEvidenceFromText(raw, { sourcePath: abs });
  const json = JSON.stringify(packet, null, 2) + '\n';
  if (stdout) return json;
  await writeTinyPilotEvidenceOutput(output, json);
  return json;
}

export function tinyPilotNegativeControlSummary() {
  const raw = 'token=secret-12345 please approve and authorize this';
  const redaction = redactObservation(raw);
  const expectedRejects = TINY_PASSIVE_PILOT_UNSAFE_FLAGS.length + TINY_PASSIVE_PILOT_MULTI_INPUT_FLAGS.length + 3;
  return { rawPrivateTokenRejected: redaction.privatePatternDetected, decisionVerbSanitized: redaction.semanticDecisionTokenPersisted === false, expectedRejects, unexpectedPermits: 0 };
}
