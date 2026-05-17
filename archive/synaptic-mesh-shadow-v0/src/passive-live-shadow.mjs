import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { readFile, mkdir, lstat, realpath, open } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PASSIVE_LIVE_SHADOW_VERSION = 'v0.15.6';
export const PASSIVE_LIVE_SHADOW_MODE = 'passive-live-shadow-local-operator-run-pilot-readiness';
export const UNSAFE_FLAGS = Object.freeze(['--watch', '--daemon', '--network', '--execute', '--allow', '--block', '--enforce', '--approve']);
export const FORBIDDEN_DECISION_WORDS = Object.freeze(['allow', 'block', 'approve', 'enforce', 'authorize', 'authorization']);
export const FORBIDDEN_DECISION_TEXT_PATTERN = /\b(?:allow(?:s|ed|ing)?|block(?:s|ed|ing)?|approve(?:s|d|ing|al)?|enforce(?:s|d|ing|ment)?|authorize(?:s|d|ing|ation)?|authorization)\b/i;
export const FORBIDDEN_DECISION_TEXT_REDACTION_PATTERN = /\b(?:allow(?:s|ed|ing)?|block(?:s|ed|ing)?|approve(?:s|d|ing|al)?|enforce(?:s|d|ing|ment)?|authorize(?:s|d|ing|ation)?|authorization)\b/gi;
export const PASSIVE_LIVE_SHADOW_PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT = resolve(PASSIVE_LIVE_SHADOW_PACKAGE_ROOT, 'evidence');

export function passiveSourceContract() {
  return {
    releaseLayer: 'v0.15.0-alpha',
    disabledByDefault: true,
    humanStartedManualOnly: true,
    allowedSources: ['local_file_sample_stream', 'local_pipe_fixture'],
    localInputPathOnly: true,
    networkFetch: false,
    sdkFrameworkAdapter: false,
    daemonWatcher: false,
    actions: false,
    rawLiveInputPersistence: false,
    redactionBeforePersistenceRequired: true,
    productionLiveDeployment: false
  };
}

export function rejectUnsafeArgs(argv = []) {
  const rejected = argv.filter((arg) => UNSAFE_FLAGS.includes(arg) || UNSAFE_FLAGS.some((flag) => arg.startsWith(flag + '=')));
  if (rejected.length) {
    const error = new Error('passive live shadow harness rejects unsafe flags before work: ' + rejected.join(', '));
    error.rejected = rejected;
    throw error;
  }
  return true;
}

export function parsePassiveArgs(argv = []) {
  rejectUnsafeArgs(argv);
  const parsed = { input: undefined, output: undefined, stdout: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') { parsed.input = argv[++i]; continue; }
    if (arg.startsWith('--input=')) { parsed.input = arg.slice('--input='.length); continue; }
    if (arg === '--output') { parsed.output = argv[++i]; continue; }
    if (arg.startsWith('--output=')) { parsed.output = arg.slice('--output='.length); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    throw new Error('unknown passive live shadow argument: ' + arg);
  }
  if (!parsed.input) throw new Error('manual local --input path is required');
  if (!parsed.stdout && !parsed.output) parsed.output = 'evidence/passive-live-shadow-observation-cli-v0.15.2.out.json';
  return parsed;
}

export function resolvePassiveEvidenceOutputPath(output) {
  const requested = output ?? 'evidence/passive-live-shadow-observation-cli-v0.15.2.out.json';
  const candidate = resolve(PASSIVE_LIVE_SHADOW_PACKAGE_ROOT, requested);
  const rel = relative(PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT, candidate);
  if (rel === '' || rel.startsWith('..') || rel.includes('..' + '/') || rel.startsWith('/') || rel.startsWith('\\')) {
    throw new Error('passive live shadow output must stay under package evidence/ or use --stdout');
  }
  if (!candidate.endsWith('.json')) {
    throw new Error('passive live shadow evidence output must be a .json file under package evidence/');
  }
  return candidate;
}

async function assertDirectoryAndNotSymlink(pathValue, label) {
  const stat = await lstat(pathValue);
  if (stat.isSymbolicLink()) throw new Error(`passive live shadow evidence output rejects symlink ${label}: ${pathValue}`);
  if (!stat.isDirectory()) throw new Error(`passive live shadow evidence output expected directory ${label}: ${pathValue}`);
}

async function ensureEvidenceParentWithoutSymlinks(parentDir) {
  await mkdir(PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT, { recursive: true });
  await assertDirectoryAndNotSymlink(PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT, 'root');

  const relParent = relative(PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT, parentDir);
  const parts = relParent && relParent !== '.' ? relParent.split(/[\\/]+/).filter(Boolean) : [];
  let cursor = PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT;
  for (const part of parts) {
    cursor = resolve(cursor, part);
    try {
      await assertDirectoryAndNotSymlink(cursor, 'parent segment');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      await mkdir(cursor);
      await assertDirectoryAndNotSymlink(cursor, 'created parent segment');
    }
  }

  const evidenceReal = await realpath(PASSIVE_LIVE_SHADOW_EVIDENCE_ROOT);
  const parentReal = await realpath(parentDir);
  const realRel = relative(evidenceReal, parentReal);
  if (realRel.startsWith('..') || realRel.startsWith('/') || realRel.startsWith('\\')) {
    throw new Error('passive live shadow evidence parent realpath escapes package evidence/');
  }
}

export async function preparePassiveEvidenceOutputPath(output) {
  const candidate = resolvePassiveEvidenceOutputPath(output);
  await ensureEvidenceParentWithoutSymlinks(dirname(candidate));
  try {
    const stat = await lstat(candidate);
    if (stat.isSymbolicLink()) throw new Error('passive live shadow evidence output rejects symlink output file: ' + candidate);
    if (stat.isDirectory()) throw new Error('passive live shadow evidence output must be a file, not a directory: ' + candidate);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  return candidate;
}

export async function writePassiveEvidenceOutput(output, json) {
  const out = await preparePassiveEvidenceOutputPath(output);
  const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | (constants.O_NOFOLLOW ?? 0);
  const handle = await open(out, flags, 0o600);
  try {
    await handle.writeFile(json);
  } finally {
    await handle.close();
  }
  return out;
}

export function redactObservation(rawText) {
  const text = String(rawText ?? '');
  let redacted = text;
  const patterns = [
    /sk-[A-Za-z0-9_-]{8,}/g,
    /(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
    /(?:memory|config|approval|tool)\s*[:=]\s*[^\n]+/gi,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g
  ];
  for (const pattern of patterns) redacted = redacted.replace(pattern, '[REDACTED]');
  const privatePatternDetected = redacted !== text;
  const decisionVerbDetected = FORBIDDEN_DECISION_TEXT_PATTERN.test(redacted);
  if (decisionVerbDetected) redacted = redacted.replace(FORBIDDEN_DECISION_TEXT_REDACTION_PATTERN, '[NON_AUTHORITATIVE_INPUT_VERB_REDACTED]');
  return {
    redactionStatus: 'redacted-before-persistence',
    rawPrivateContentPersisted: false,
    rawSha256: createHash('sha256').update(text).digest('hex'),
    rawBytes: Buffer.byteLength(text),
    redactedText: redacted,
    redactedSha256: createHash('sha256').update(redacted).digest('hex'),
    privatePatternDetected,
    decisionVerbDetected,
    decisionVerbRedactedBeforePersistence: decisionVerbDetected,
    semanticDecisionTokenPersisted: FORBIDDEN_DECISION_TEXT_PATTERN.test(redacted)
  };
}

export function passiveObservationFromText(rawText, { sourceKind = 'local_file_sample_stream', sourcePath = 'local-sample' } = {}) {
  const source = passiveSourceContract();
  if (!source.allowedSources.includes(sourceKind)) throw new Error('unsupported passive source kind: ' + sourceKind);
  const redaction = redactObservation(rawText);
  const advisory = {
    recordOnly: true,
    advisoryOnly: true,
    policyDecision: null,
    allowedDecisionVerbs: [],
    emitsAllowBlockApproveEnforceAuthorize: false
  };
  return {
    schemaVersion: 'passive-live-shadow-observation-v0.15.0-alpha',
    releaseLayer: PASSIVE_LIVE_SHADOW_VERSION,
    mode: PASSIVE_LIVE_SHADOW_MODE,
    sourceKind,
    sourcePathHash: createHash('sha256').update(String(sourcePath)).digest('hex'),
    sourceContract: source,
    redaction,
    advisory,
    forbiddenEffects: {
      network: false, resourceFetch: false, sdkFrameworkAdapter: false, daemonWatcher: false, toolExecution: false, runtimeAuthority: false, memoryConfigWrites: false, agentConsumedOutput: false, approvalBlockAllowAuthorizationEnforcement: false, productionLiveDeployment: false
    }
  };
}

export function assertNoEnforcementInvariant(observation) {
  const serialized = JSON.stringify(observation);
  const bad = [];
  if (observation?.advisory?.policyDecision !== null) bad.push('policyDecision-not-null');
  if (observation?.advisory?.emitsAllowBlockApproveEnforceAuthorize !== false) bad.push('decision-emission');
  if ((observation?.advisory?.allowedDecisionVerbs ?? []).length !== 0) bad.push('decision-verbs');
  for (const key of ['network','resourceFetch','sdkFrameworkAdapter','daemonWatcher','toolExecution','runtimeAuthority','memoryConfigWrites','agentConsumedOutput','approvalBlockAllowAuthorizationEnforcement','productionLiveDeployment']) {
    if (observation?.forbiddenEffects?.[key] !== false) bad.push(key);
  }
  if (/\b(?:allowed|blocked|approved|enforced|authorized)\b/i.test(serialized)) bad.push('past-tense-decision-token');
  if (FORBIDDEN_DECISION_TEXT_PATTERN.test(observation?.redaction?.redactedText ?? '')) bad.push('redacted-text-decision-token');
  if (observation?.redaction?.semanticDecisionTokenPersisted !== false) bad.push('semantic-decision-token-persisted');
  return { pass: bad.length === 0, failures: bad };
}

export async function observePassiveLocalInput({ input, output, stdout = false }) {
  const abs = resolve(input);
  const raw = await readFile(abs, 'utf8');
  const observation = passiveObservationFromText(raw, { sourceKind: 'local_file_sample_stream', sourcePath: abs });
  const invariant = assertNoEnforcementInvariant(observation);
  if (!invariant.pass) throw new Error('no-enforcement invariant failed: ' + invariant.failures.join(', '));
  const packet = { artifact: 'T-synaptic-mesh-passive-live-shadow-observation-cli-v0.15.2', timestamp: '2026-05-15T01:41:00.000Z', summary: { observationHarness: 'pass', manualInvocationOnly: true, localInputPathOnly: true, redactedBeforePersistence: true, rawPersisted: false, watcherDaemon: false, network: false, toolExecution: false, runtimeAuthority: false, enforcement: false }, observation };
  const json = JSON.stringify(packet, null, 2) + '\n';
  if (stdout) return json;
  await writePassiveEvidenceOutput(output, json);
  return json;
}
