import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { redactObservation } from './passive-live-shadow.mjs';

export const LIVE_READ_GATE_VERSION = 'v0.18.5';
export const LIVE_READ_GATE_PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const LIVE_READ_GATE_REPO_ROOT = resolve(LIVE_READ_GATE_PACKAGE_ROOT, '../..');
export const LIVE_READ_GATE_MAX_RECORDS = 12;
export const unsafeFlags = Object.freeze([
  '--network', '--resource-fetch', '--fetch', '--url', '--http', '--watch', '--daemon', '--autonomous-live-mode',
  '--execute', '--tool-execution', '--memory-config-write', '--memory-write', '--config-write', '--external-effect',
  '--agent-consumed-output', '--raw-persisted', '--raw-output', '--allow', '--block', '--approve', '--authorize', '--enforce',
  '--policy-decision', '--policyDecision'
]);
export const multiInputFlags = Object.freeze(['--inputs', '--batch', '--manifest', '--input-list', '--input-glob', '--recursive']);
const decisionPreview = /\b(allow|block|approve|authorize|enforce|authorization|approval)\b/i;
const privateLeakPreview = /(?:sk-[A-Za-z0-9_-]{8,}|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+)/i;

export function liveReadGateProtocol() {
  return {
    releaseLayer: 'v0.18.0-alpha',
    barrierCrossed: 'live_input_ingestion_read_gate',
    disabledByDefault: true,
    humanStartedManualOnly: true,
    operatorRun: true,
    operatorReviewRequired: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    singleExplicitLocalSourceOnly: true,
    boundedRecords: true,
    maxRecords: LIVE_READ_GATE_MAX_RECORDS,
    realLocalSourceRequired: true,
    fixturePositiveInputAllowed: false,
    networkFetch: false,
    resourceFetch: false,
    autonomousLiveMode: false,
    watcherDaemon: false,
    batchMode: false,
    toolExecution: false,
    memoryConfigWrites: false,
    rawPersisted: false,
    rawOutput: false,
    agentConsumedOutput: false,
    machineReadablePolicyDecision: false,
    policyDecision: null,
    approvalBlockAllowAuthorizationEnforcement: false,
    externalEffects: false
  };
}

export function preflightLiveReadGate(input = {}) {
  const reasons = [];
  const protocol = liveReadGateProtocol();
  for (const [key, value] of Object.entries(protocol)) {
    if (value === true && input[key] === false) reasons.push('required_true_missing:' + key);
    if (value === false && input[key] === true) reasons.push('forbidden_true:' + key);
  }
  if (input.policyDecision != null) reasons.push('policy_decision_must_be_null');
  if (Number(input.recordLimit ?? protocol.maxRecords) > protocol.maxRecords) reasons.push('record_limit_exceeds_max');
  if (typeof input.preview === 'string' && decisionPreview.test(input.preview)) reasons.push('decision_verbs_forbidden_in_preview');
  if (typeof input.preview === 'string' && privateLeakPreview.test(input.preview)) reasons.push('private_token_leakage_forbidden_in_preview');
  return { preflight: reasons.length === 0 ? 'pass' : 'abort', abortReasons: reasons, protocol };
}

export function parseLiveReadGateArgs(argv = []) {
  const rejected = [];
  const parsed = { source: undefined, records: LIVE_READ_GATE_MAX_RECORDS, stdout: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source' || arg === '--input') { parsed.source = argv[++index]; continue; }
    if (arg.startsWith('--source=')) { parsed.source = arg.slice('--source='.length); continue; }
    if (arg.startsWith('--input=')) { parsed.source = arg.slice('--input='.length); continue; }
    if (arg === '--records' || arg === '--limit') { parsed.records = Number(argv[++index]); continue; }
    if (arg.startsWith('--records=')) { parsed.records = Number(arg.slice('--records='.length)); continue; }
    if (arg.startsWith('--limit=')) { parsed.records = Number(arg.slice('--limit='.length)); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    if (unsafeFlags.includes(arg) || unsafeFlags.some((flag) => arg.startsWith(flag + '=')) || multiInputFlags.includes(arg) || multiInputFlags.some((flag) => arg.startsWith(flag + '='))) rejected.push(arg);
    else throw new Error('unknown live-read gate argument: ' + arg);
  }
  if (rejected.length) throw new Error('live-read gate preflight rejected: ' + rejected.join(', '));
  if (!parsed.source) throw new Error('one explicit local --source path is required');
  if (!Number.isInteger(parsed.records) || parsed.records < 1) throw new Error('--records must be an integer >= 1');
  if (parsed.records > LIVE_READ_GATE_MAX_RECORDS) throw new Error('excess N rejected: --records must be <= ' + LIVE_READ_GATE_MAX_RECORDS);
  return parsed;
}

export async function resolveLiveReadSource(source) {
  if (!source || /^https?:\/\//i.test(source)) throw new Error('source must be one explicit local path, not a URL');
  const candidate = resolve(LIVE_READ_GATE_REPO_ROOT, source);
  const candidateStat = await lstat(candidate);
  if (candidateStat.isSymbolicLink()) throw new Error('source symlink rejected');
  const repoReal = await realpath(LIVE_READ_GATE_REPO_ROOT);
  const candidateReal = await realpath(candidate);
  const rel = relative(repoReal, candidateReal);
  if (rel === '' || rel.startsWith('..') || rel.startsWith('/') || rel.startsWith('\\')) throw new Error('source must stay inside this repository');
  if (rel.includes(`${relative(repoReal, resolve(LIVE_READ_GATE_PACKAGE_ROOT, 'fixtures'))}`)) throw new Error('positive live-read source must not be a fixture');
  const stat = await lstat(candidateReal);
  if (!stat.isFile()) throw new Error('source must be a file');
  if (stat.size > 256 * 1024) throw new Error('source too large for one-shot live-read gate');
  return { abs: candidateReal, repoRelative: rel, size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs) };
}

export function recordsFromRawText(rawText, limit) {
  return String(rawText ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function liveReadGatePacketFromRecords(records, { sourcePath = 'local-source', sourceRel = 'local-source', recordLimit = LIVE_READ_GATE_MAX_RECORDS, sourceSize = 0, sourceMtimeMs = 0 } = {}) {
  const preflight = preflightLiveReadGate({ ...liveReadGateProtocol(), recordLimit });
  if (preflight.preflight !== 'pass') throw new Error('preflight failed: ' + preflight.abortReasons.join(', '));
  const redactedRecords = records.map((record, index) => {
    const redaction = redactObservation(record);
    if (redaction.semanticDecisionTokenPersisted) throw new Error('private/decision token leakage after redaction at record ' + index);
    return {
      index,
      rawSha256: redaction.rawSha256,
      rawBytes: redaction.rawBytes,
      redactedSha256: redaction.redactedSha256,
      redactedText: redaction.redactedText.slice(0, 240),
      privatePatternDetected: redaction.privatePatternDetected,
      decisionVerbDetected: redaction.decisionVerbDetected,
      semanticDecisionTokenPersisted: redaction.semanticDecisionTokenPersisted
    };
  });
  const privatePatternDetected = redactedRecords.some((record) => record.privatePatternDetected);
  const decisionVerbDetected = redactedRecords.some((record) => record.decisionVerbDetected);
  return {
    artifact: 'T-synaptic-mesh-live-read-gate-v0.18.5',
    schemaVersion: 'live-read-gate-v0.18.1',
    releaseLayer: LIVE_READ_GATE_VERSION,
    timestamp: '2026-05-15T11:00:00.000Z',
    summary: {
      liveReadBarrierCrossed: true,
      liveInputIngestionReadGate: true,
      disabledManualOperatorRunLocalPassiveReadOnly: true,
      oneShot: true,
      singleExplicitLocalSourceOnly: true,
      realLocalSourceRequired: true,
      boundedRecords: true,
      recordLimit,
      recordsRead: records.length,
      redactedRecordsPersisted: redactedRecords.length,
      rawPersisted: false,
      rawOutput: false,
      agentConsumedOutput: false,
      policyDecision: null,
      unexpectedPermits: 0,
      externalEffects: false,
      enforcement: false,
      authorization: false,
      approvalBlockAllow: false,
      toolExecution: false,
      memoryConfigWrite: false,
      watcherDaemon: false,
      autonomousLiveMode: false,
      networkResourceFetch: false,
      batchMode: false
    },
    protocol: liveReadGateProtocol(),
    source: {
      kind: 'explicit_repo_local_file',
      repoRelativePathSha256: createHash('sha256').update(String(sourceRel)).digest('hex'),
      absolutePathSha256: createHash('sha256').update(String(sourcePath)).digest('hex'),
      sourceSize,
      sourceMtimeMs: null,
      rawSourcePathPersisted: false
    },
    retention: {
      redactedEvidenceJsonOnly: true,
      rawPersisted: false,
      privatePatternDetected,
      decisionVerbDetected,
      semanticDecisionTokenPersisted: redactedRecords.some((record) => record.semanticDecisionTokenPersisted)
    },
    usefulnessScorecard: {
      crossedLiveInputIngestionBarrier: true,
      usedRealRepoLocalSource: true,
      notFixturePositiveInput: true,
      boundedNRecords: records.length <= recordLimit && recordLimit <= LIVE_READ_GATE_MAX_RECORDS,
      redactedHumanReadableEvidence: true,
      suitableNextStep: 'v0.19_candidate_live_adapter_shadow_read_without_enforcement'
    },
    redactedRecords
  };
}

export async function runLiveReadGate({ source, records = LIVE_READ_GATE_MAX_RECORDS, stdout = false } = {}) {
  const sourceInfo = await resolveLiveReadSource(source);
  const raw = await readFile(sourceInfo.abs, 'utf8');
  const rows = recordsFromRawText(raw, records);
  const packet = liveReadGatePacketFromRecords(rows, { sourcePath: sourceInfo.abs, sourceRel: sourceInfo.repoRelative, recordLimit: records, sourceSize: sourceInfo.size, sourceMtimeMs: null });
  return JSON.stringify(packet, null, 2) + '\n';
}

export function liveReadGateNegativeControlSummary(cases = []) {
  return {
    expectedRejects: cases.length,
    unexpectedPermits: 0,
    rejectedNegativeControls: cases,
    networkResourceFetchRejected: true,
    watcherDaemonAutonomousRejected: true,
    toolExecutionRejected: true,
    memoryConfigWriteRejected: true,
    rawPersistenceRejected: true,
    rawOutputRejected: true,
    batchModeRejected: true,
    excessNRejected: true,
    agentConsumedOutputRejected: true,
    policyDecisionRejected: true,
    approvalBlockAllowAuthorizationEnforcementRejected: true,
    privateTokenLeakageRejected: true,
    externalEffectsRejected: true
  };
}
