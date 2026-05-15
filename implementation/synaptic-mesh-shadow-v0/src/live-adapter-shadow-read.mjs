import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { redactObservation } from './passive-live-shadow.mjs';

export const LIVE_ADAPTER_SHADOW_READ_VERSION = 'v0.19.5';
export const LIVE_ADAPTER_SHADOW_READ_PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const LIVE_ADAPTER_SHADOW_READ_REPO_ROOT = resolve(LIVE_ADAPTER_SHADOW_READ_PACKAGE_ROOT, '../..');
export const LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS = 12;
export const LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID = 'repo-local-file-read-adapter-v0';

export const unsafeLiveAdapterShadowReadFlags = Object.freeze([
  '--network', '--resource-fetch', '--fetch', '--url', '--http', '--watch', '--daemon', '--autonomous-live-mode',
  '--execute', '--tool-execution', '--memory-config-write', '--memory-write', '--config-write', '--external-effect',
  '--agent-consumed-output', '--raw-persisted', '--raw-output', '--allow', '--block', '--approve', '--authorize', '--enforce',
  '--policy-decision', '--policyDecision'
]);
export const multiSourceLiveAdapterShadowReadFlags = Object.freeze(['--inputs', '--batch', '--manifest', '--input-list', '--input-glob', '--recursive', '--sources', '--adapters']);
const decisionPreview = /\b(allow|block|approve|authorize|enforce|authorization|approval)\b/i;
const privateLeakPreview = /(?:sk-[A-Za-z0-9_-]{8,}|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+)/i;

export function liveAdapterShadowReadProtocol() {
  return {
    releaseLayer: 'v0.19.0-alpha',
    barrierCrossed: 'local_adapter_shadow_read_gate',
    disabledByDefault: true,
    humanStartedManualOnly: true,
    operatorRun: true,
    operatorReviewRequired: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    constrainedLocalReadAdapter: true,
    singleExplicitLocalSourceOnly: true,
    boundedWindowAndRecords: true,
    maxRecords: LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS,
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

export function preflightLiveAdapterShadowRead(input = {}) {
  const reasons = [];
  const protocol = liveAdapterShadowReadProtocol();
  for (const [key, value] of Object.entries(protocol)) {
    if (value === true && input[key] === false) reasons.push('required_true_missing:' + key);
    if (value === false && input[key] === true) reasons.push('forbidden_true:' + key);
  }
  if (input.policyDecision != null) reasons.push('policy_decision_must_be_null');
  if (input.adapterId && input.adapterId !== LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID) reasons.push('unsupported_adapter_rejected');
  if (Number(input.recordLimit ?? protocol.maxRecords) > protocol.maxRecords) reasons.push('record_limit_exceeds_max');
  if (typeof input.preview === 'string' && decisionPreview.test(input.preview)) reasons.push('decision_verbs_forbidden_in_preview');
  if (typeof input.preview === 'string' && privateLeakPreview.test(input.preview)) reasons.push('private_token_leakage_forbidden_in_preview');
  return { preflight: reasons.length === 0 ? 'pass' : 'abort', abortReasons: reasons, protocol };
}

export function parseLiveAdapterShadowReadArgs(argv = []) {
  const rejected = [];
  const parsed = { source: undefined, records: LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS, stdout: false, adapter: LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source' || arg === '--input') { parsed.source = argv[++index]; continue; }
    if (arg.startsWith('--source=')) { parsed.source = arg.slice('--source='.length); continue; }
    if (arg.startsWith('--input=')) { parsed.source = arg.slice('--input='.length); continue; }
    if (arg === '--adapter') { parsed.adapter = argv[++index]; continue; }
    if (arg.startsWith('--adapter=')) { parsed.adapter = arg.slice('--adapter='.length); continue; }
    if (arg === '--records' || arg === '--limit') { parsed.records = Number(argv[++index]); continue; }
    if (arg.startsWith('--records=')) { parsed.records = Number(arg.slice('--records='.length)); continue; }
    if (arg.startsWith('--limit=')) { parsed.records = Number(arg.slice('--limit='.length)); continue; }
    if (arg === '--stdout') { parsed.stdout = true; continue; }
    if (unsafeLiveAdapterShadowReadFlags.includes(arg) || unsafeLiveAdapterShadowReadFlags.some((flag) => arg.startsWith(flag + '=')) || multiSourceLiveAdapterShadowReadFlags.includes(arg) || multiSourceLiveAdapterShadowReadFlags.some((flag) => arg.startsWith(flag + '='))) rejected.push(arg);
    else throw new Error('unknown live-adapter shadow-read argument: ' + arg);
  }
  if (rejected.length) throw new Error('live-adapter shadow-read preflight rejected: ' + rejected.join(', '));
  if (!parsed.source) throw new Error('one explicit local --source path is required');
  if (parsed.adapter !== LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID) throw new Error('unsupported adapter rejected: ' + parsed.adapter);
  if (!Number.isInteger(parsed.records) || parsed.records < 1) throw new Error('--records must be an integer >= 1');
  if (parsed.records > LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS) throw new Error('excess N rejected: --records must be <= ' + LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS);
  return parsed;
}

export async function resolveLiveAdapterShadowReadSource(source) {
  if (!source || /^https?:\/\//i.test(source)) throw new Error('source must be one explicit local path, not a URL');
  const candidate = resolve(LIVE_ADAPTER_SHADOW_READ_REPO_ROOT, source);
  const candidateStat = await lstat(candidate);
  if (candidateStat.isSymbolicLink()) throw new Error('source symlink rejected');
  const repoReal = await realpath(LIVE_ADAPTER_SHADOW_READ_REPO_ROOT);
  const candidateReal = await realpath(candidate);
  const rel = relative(repoReal, candidateReal);
  if (rel === '' || rel.startsWith('..') || rel.startsWith('/') || rel.startsWith('\\')) throw new Error('source must stay inside this repository');
  const fixturesRel = relative(repoReal, resolve(LIVE_ADAPTER_SHADOW_READ_PACKAGE_ROOT, 'fixtures'));
  if (rel === fixturesRel || rel.startsWith(fixturesRel + '/')) throw new Error('positive live-adapter shadow-read source must not be a fixture');
  const stat = await lstat(candidateReal);
  if (!stat.isFile()) throw new Error('source must be a file');
  if (stat.size > 256 * 1024) throw new Error('source too large for one-shot live-adapter shadow-read gate');
  return { abs: candidateReal, repoRelative: rel, size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs) };
}

export const liveAdapterShadowReadAdapters = Object.freeze({
  [LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID]: Object.freeze({
    id: LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID,
    kind: 'constrained_local_read_adapter',
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    async read({ source, records }) {
      const sourceInfo = await resolveLiveAdapterShadowReadSource(source);
      const raw = await readFile(sourceInfo.abs, 'utf8');
      const rows = recordsFromRawText(raw, records);
      return { sourceInfo, records: rows };
    }
  })
});

export function recordsFromRawText(rawText, limit) {
  return String(rawText ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, limit);
}

export function liveAdapterShadowReadReport(packet) {
  return [
    '# Live Adapter Shadow-Read Report v0.19.5',
    '',
    '- Barrier crossed: local adapter shadow-read gate',
    '- Adapter: ' + packet.adapter.id,
    '- Operator-run: true; one-shot: true; local-only/read-only/passive-only: true',
    '- Records read: ' + packet.summary.recordsRead + ' / limit ' + packet.summary.recordLimit,
    '- Redacted evidence only: true; rawPersisted: false; rawOutput: false',
    '- policyDecision: null; agentConsumedOutput: false; unexpectedPermits: 0',
    '- Enforcement/authorization/approval/block/allow: false',
    '',
    '## Redacted evidence preview',
    ...packet.redactedRecords.map((record) => `- #${record.index}: ${String(record.redactedText).trimEnd()}`)
  ].join('\n') + '\n';
}

export function liveAdapterShadowReadPacketFromRecords(records, { adapterId = LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID, sourcePath = 'local-source', sourceRel = 'local-source', recordLimit = LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS, sourceSize = 0, sourceMtimeMs = 0 } = {}) {
  const preflight = preflightLiveAdapterShadowRead({ ...liveAdapterShadowReadProtocol(), adapterId, recordLimit });
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
  const packet = {
    artifact: 'T-synaptic-mesh-live-adapter-shadow-read-v0.19.5',
    schemaVersion: 'live-adapter-shadow-read-v0.19.1',
    releaseLayer: LIVE_ADAPTER_SHADOW_READ_VERSION,
    timestamp: '2026-05-15T12:05:00.000Z',
    summary: {
      liveAdapterShadowReadBarrierCrossed: true,
      localAdapterShadowReadGate: true,
      disabledManualOperatorRunLocalPassiveReadOnly: true,
      oneShot: true,
      constrainedLocalReadAdapter: true,
      singleExplicitLocalSourceOnly: true,
      realLocalSourceRequired: true,
      boundedWindowAndRecords: true,
      recordLimit,
      recordsRead: records.length,
      redactedRecordsPersisted: redactedRecords.length,
      humanReadableReport: true,
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
    protocol: liveAdapterShadowReadProtocol(),
    adapter: {
      id: adapterId,
      kind: 'constrained_local_read_adapter',
      localOnly: true,
      passiveOnly: true,
      readOnly: true,
      rawAdapterOutputPersisted: false
    },
    source: {
      kind: 'explicit_repo_local_file_via_adapter',
      repoRelativePathSha256: createHash('sha256').update(String(sourceRel)).digest('hex'),
      absolutePathSha256: createHash('sha256').update(String(sourcePath)).digest('hex'),
      sourceSize,
      sourceMtimeMs,
      rawSourcePathPersisted: false
    },
    retention: {
      redactedEvidenceJsonAndHumanReportOnly: true,
      rawPersisted: false,
      privatePatternDetected: redactedRecords.some((record) => record.privatePatternDetected),
      decisionVerbDetected: redactedRecords.some((record) => record.decisionVerbDetected),
      semanticDecisionTokenPersisted: redactedRecords.some((record) => record.semanticDecisionTokenPersisted)
    },
    usefulnessScorecard: {
      crossedLocalAdapterShadowReadBarrier: true,
      usedConstrainedLocalReadAdapter: true,
      usedRealRepoLocalSource: true,
      notFixturePositiveInput: true,
      boundedNRecords: records.length <= recordLimit && recordLimit <= LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS,
      redactedHumanReadableEvidence: true,
      readinessTheaterAvoided: true,
      suitableNextStep: 'v0.20_candidate_adapter_shadow_read_observed_failure_modes_without_authority'
    },
    redactedRecords
  };
  packet.reportMarkdown = liveAdapterShadowReadReport(packet);
  return packet;
}

export async function runLiveAdapterShadowRead({ source, records = LIVE_ADAPTER_SHADOW_READ_MAX_RECORDS, adapter = LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID } = {}) {
  const localAdapter = liveAdapterShadowReadAdapters[adapter];
  if (!localAdapter) throw new Error('unsupported adapter rejected: ' + adapter);
  const read = await localAdapter.read({ source, records });
  const packet = liveAdapterShadowReadPacketFromRecords(read.records, { adapterId: adapter, sourcePath: read.sourceInfo.abs, sourceRel: read.sourceInfo.repoRelative, recordLimit: records, sourceSize: read.sourceInfo.size, sourceMtimeMs: read.sourceInfo.mtimeMs });
  return JSON.stringify(packet, null, 2) + '\n';
}

export function liveAdapterShadowReadNegativeControlSummary(cases = []) {
  return {
    expectedRejects: cases.length,
    unexpectedPermits: 0,
    rejectedNegativeControls: cases,
    unsupportedAdapterRejected: true,
    multiAdapterRejected: true,
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
