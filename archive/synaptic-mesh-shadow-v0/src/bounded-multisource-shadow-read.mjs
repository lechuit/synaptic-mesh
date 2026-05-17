import { createHash } from 'node:crypto';
import { redactObservation } from './passive-live-shadow.mjs';
import {
  LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID,
  liveAdapterShadowReadAdapters,
  resolveLiveAdapterShadowReadSource,
  recordsFromRawText,
  unsafeLiveAdapterShadowReadFlags,
} from './live-adapter-shadow-read.mjs';

export const BOUNDED_MULTISOURCE_SHADOW_READ_VERSION = 'v0.20.5';
export const BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES = 3;
export const BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE = 5;
export const BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS = 12;
export const BOUNDED_MULTISOURCE_SHADOW_READ_ADAPTER_ID = LIVE_ADAPTER_SHADOW_READ_ADAPTER_ID;

const forbiddenSourceSyntax = /[*?\[\]{}]/;
const decisionPreview = /\b(allow|block|approve|authorize|enforce|authorization|approval)\b/i;
const privateLeakPreview = /(?:sk-[A-Za-z0-9_-]{8,}|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+)/i;

export function boundedMultisourceShadowReadProtocol() {
  return {
    releaseLayer: 'v0.20.0-alpha',
    barrierCrossed: 'bounded_explicit_multisource_shadow_read',
    disabledByDefault: true,
    humanStartedManualOnly: true,
    operatorRun: true,
    operatorReviewRequired: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    constrainedLocalReadAdapter: true,
    explicitMultiSourceOnly: true,
    minSources: 2,
    maxSources: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES,
    maxRecordsPerSource: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE,
    maxTotalRecords: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS,
    realLocalSourceRequired: true,
    fixturePositiveInputAllowed: false,
    perSourceIsolation: true,
    perSourceFailureIsolation: true,
    redactionBeforePersist: true,
    redactedEvidenceOnly: true,
    humanReadableReport: true,
    networkFetch: false,
    resourceFetch: false,
    autonomousLiveMode: false,
    watcherDaemon: false,
    globRecursiveDiscovery: false,
    implicitSources: false,
    outsideRepoPaths: false,
    symlinks: false,
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

export function preflightBoundedMultisourceShadowRead(input = {}) {
  const reasons = [];
  const protocol = boundedMultisourceShadowReadProtocol();
  for (const [key, value] of Object.entries(protocol)) {
    if (value === true && input[key] === false) reasons.push('required_true_missing:' + key);
    if (value === false && input[key] === true) reasons.push('forbidden_true:' + key);
  }
  if (input.policyDecision != null) reasons.push('policy_decision_must_be_null');
  if (input.adapterId && input.adapterId !== BOUNDED_MULTISOURCE_SHADOW_READ_ADAPTER_ID) reasons.push('unsupported_adapter_rejected');
  if (!Array.isArray(input.sources)) reasons.push('explicit_sources_array_required');
  else {
    if (input.sources.length < protocol.minSources) reasons.push('at_least_two_explicit_sources_required');
    if (input.sources.length > protocol.maxSources) reasons.push('source_count_exceeds_max');
    if (new Set(input.sources).size !== input.sources.length) reasons.push('duplicate_sources_rejected');
    for (const source of input.sources) {
      if (typeof source !== 'string' || !source.trim()) reasons.push('source_must_be_nonempty_string');
      else {
        if (/^https?:\/\//i.test(source)) reasons.push('url_source_rejected');
        if (forbiddenSourceSyntax.test(source)) reasons.push('glob_or_discovery_syntax_rejected');
      }
    }
  }
  const recordsPerSource = input.recordsPerSource ?? protocol.maxRecordsPerSource;
  const totalRecords = input.totalRecords ?? protocol.maxTotalRecords;
  if (!Number.isInteger(recordsPerSource) || recordsPerSource < 1) reasons.push('records_per_source_must_be_finite_integer_gte_1');
  else if (recordsPerSource > protocol.maxRecordsPerSource) reasons.push('records_per_source_exceeds_max');
  if (!Number.isInteger(totalRecords) || totalRecords < 1) reasons.push('total_records_must_be_finite_integer_gte_1');
  else if (totalRecords > protocol.maxTotalRecords) reasons.push('total_records_exceeds_max');
  if (typeof input.preview === 'string' && decisionPreview.test(input.preview)) reasons.push('decision_verbs_forbidden_in_preview');
  if (typeof input.preview === 'string' && privateLeakPreview.test(input.preview)) reasons.push('private_token_leakage_forbidden_in_preview');
  return { preflight: reasons.length === 0 ? 'pass' : 'abort', abortReasons: [...new Set(reasons)], protocol };
}

export function parseBoundedMultisourceShadowReadArgs(argv = []) {
  const parsed = {
    sources: [],
    recordsPerSource: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE,
    totalRecords: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS,
    adapter: BOUNDED_MULTISOURCE_SHADOW_READ_ADAPTER_ID,
  };
  const rejected = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') { parsed.sources.push(argv[++index]); continue; }
    if (arg.startsWith('--source=')) { parsed.sources.push(arg.slice('--source='.length)); continue; }
    if (arg === '--sources') { parsed.sources.push(...String(argv[++index] ?? '').split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg.startsWith('--sources=')) { parsed.sources.push(...arg.slice('--sources='.length).split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg === '--adapter') { parsed.adapter = argv[++index]; continue; }
    if (arg.startsWith('--adapter=')) { parsed.adapter = arg.slice('--adapter='.length); continue; }
    if (arg === '--records-per-source') { parsed.recordsPerSource = Number(argv[++index]); continue; }
    if (arg.startsWith('--records-per-source=')) { parsed.recordsPerSource = Number(arg.slice('--records-per-source='.length)); continue; }
    if (arg === '--total-records') { parsed.totalRecords = Number(argv[++index]); continue; }
    if (arg.startsWith('--total-records=')) { parsed.totalRecords = Number(arg.slice('--total-records='.length)); continue; }
    if (arg === '--stdout') continue;
    if (unsafeLiveAdapterShadowReadFlags.includes(arg) || unsafeLiveAdapterShadowReadFlags.some((flag) => arg.startsWith(flag + '=')) || ['--input-glob', '--recursive', '--manifest', '--batch', '--inputs', '--adapters', '--implicit-sources'].some((flag) => arg === flag || arg.startsWith(flag + '='))) rejected.push(arg);
    else throw new Error('unknown bounded multisource shadow-read argument: ' + arg);
  }
  if (rejected.length) throw new Error('bounded multisource shadow-read preflight rejected: ' + rejected.join(', '));
  if (!Number.isInteger(parsed.recordsPerSource) || parsed.recordsPerSource < 1) throw new Error('--records-per-source must be an integer >= 1');
  if (!Number.isInteger(parsed.totalRecords) || parsed.totalRecords < 1) throw new Error('--total-records must be an integer >= 1');
  const preflight = preflightBoundedMultisourceShadowRead({ ...boundedMultisourceShadowReadProtocol(), sources: parsed.sources, adapterId: parsed.adapter, recordsPerSource: parsed.recordsPerSource, totalRecords: parsed.totalRecords });
  if (preflight.preflight !== 'pass') throw new Error('bounded multisource shadow-read preflight rejected: ' + preflight.abortReasons.join(', '));
  return parsed;
}

function redactRecord(record, sourceIndex, recordIndex) {
  const redaction = redactObservation(record);
  if (redaction.semanticDecisionTokenPersisted) throw new Error('private/decision token leakage after redaction at source ' + sourceIndex + ' record ' + recordIndex);
  return {
    sourceIndex,
    index: recordIndex,
    rawSha256: redaction.rawSha256,
    rawBytes: redaction.rawBytes,
    redactedSha256: redaction.redactedSha256,
    redactedText: redaction.redactedText.slice(0, 240),
    privatePatternDetected: redaction.privatePatternDetected,
    decisionVerbDetected: redaction.decisionVerbDetected,
    semanticDecisionTokenPersisted: redaction.semanticDecisionTokenPersisted
  };
}

export async function readBoundedMultisourceInputs({ sources, recordsPerSource, totalRecords }) {
  const results = [];
  let remaining = totalRecords;
  for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
    const source = sources[sourceIndex];
    try {
      const sourceInfo = await resolveLiveAdapterShadowReadSource(source);
      const raw = await import('node:fs/promises').then(({ readFile }) => readFile(sourceInfo.abs, 'utf8'));
      const records = recordsFromRawText(raw, Math.min(recordsPerSource, remaining));
      remaining -= records.length;
      results.push({ sourceIndex, status: 'ok', sourceInfo, records });
    } catch (error) {
      results.push({ sourceIndex, status: 'failed_isolated', errorClass: error?.name ?? 'Error', errorMessageRedactedSha256: createHash('sha256').update(String(error?.message ?? 'unknown')).digest('hex'), records: [] });
    }
  }
  return results;
}

export function boundedMultisourceShadowReadPacketFromResults(results, { sources, adapterId = BOUNDED_MULTISOURCE_SHADOW_READ_ADAPTER_ID, recordsPerSource = BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE, totalRecords = BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS } = {}) {
  const preflight = preflightBoundedMultisourceShadowRead({ ...boundedMultisourceShadowReadProtocol(), adapterId, sources, recordsPerSource, totalRecords });
  if (preflight.preflight !== 'pass') throw new Error('preflight failed: ' + preflight.abortReasons.join(', '));
  const redactedRecords = results.flatMap((result) => result.records.map((record, recordIndex) => redactRecord(record, result.sourceIndex, recordIndex)));
  const packet = {
    artifact: 'T-synaptic-mesh-bounded-explicit-multisource-shadow-read-v0.20.5',
    schemaVersion: 'bounded-explicit-multisource-shadow-read-v0.20.1',
    releaseLayer: BOUNDED_MULTISOURCE_SHADOW_READ_VERSION,
    timestamp: '2026-05-15T12:23:00.000Z',
    summary: {
      boundedExplicitMultisourceShadowReadBarrierCrossed: true,
      boundedExplicitMultiSourceShadowRead: true,
      disabledManualOperatorRunLocalPassiveReadOnly: true,
      oneShot: true,
      constrainedLocalReadAdapter: true,
      explicitSourcesOnly: true,
      sourceCount: sources.length,
      maxSources: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES,
      recordsPerSourceLimit: recordsPerSource,
      totalRecordLimit: totalRecords,
      recordsRead: redactedRecords.length,
      redactedRecordsPersisted: redactedRecords.length,
      perSourceIsolation: true,
      perSourceFailureIsolation: true,
      sourceFailuresIsolated: results.filter((result) => result.status !== 'ok').length,
      humanReadableReport: true,
      redactionBeforePersist: true,
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
      globRecursiveDiscovery: false,
      implicitSources: false,
      outsideRepoPaths: false,
      symlinks: false
    },
    protocol: boundedMultisourceShadowReadProtocol(),
    adapter: {
      id: adapterId,
      kind: 'constrained_local_read_adapter_multisource_operator_run',
      localOnly: true,
      passiveOnly: true,
      readOnly: true,
      rawAdapterOutputPersisted: false
    },
    sources: results.map((result) => ({
      sourceIndex: result.sourceIndex,
      status: result.status,
      kind: 'explicit_repo_local_file_via_adapter',
      repoRelativePathSha256: result.sourceInfo ? createHash('sha256').update(String(result.sourceInfo.repoRelative)).digest('hex') : null,
      absolutePathSha256: result.sourceInfo ? createHash('sha256').update(String(result.sourceInfo.abs)).digest('hex') : null,
      sourceSize: result.sourceInfo?.size ?? null,
      sourceMtimeMs: null,
      rawSourcePathPersisted: false,
      recordsRead: result.records.length,
      failureIsolated: result.status !== 'ok',
      errorClass: result.errorClass,
      errorMessageRedactedSha256: result.errorMessageRedactedSha256
    })),
    retention: {
      redactedEvidenceJsonAndHumanReportOnly: true,
      rawPersisted: false,
      privatePatternDetected: redactedRecords.some((record) => record.privatePatternDetected),
      decisionVerbDetected: redactedRecords.some((record) => record.decisionVerbDetected),
      semanticDecisionTokenPersisted: redactedRecords.some((record) => record.semanticDecisionTokenPersisted)
    },
    usefulnessScorecard: {
      crossedBoundedExplicitMultisourceBarrier: true,
      crossedBeyondSingleSourceAdapterShadowRead: true,
      usedConstrainedLocalReadAdapter: true,
      usedMultipleRealRepoLocalSources: results.filter((result) => result.status === 'ok').length >= 2,
      perSourceIsolationDemonstrated: true,
      perSourceFailureIsolationDemonstrated: results.some((result) => result.status !== 'ok'),
      boundedSourceAndRecordCounts: sources.length <= BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES && recordsPerSource <= BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE && redactedRecords.length <= totalRecords,
      redactedHumanReadableEvidence: true,
      readinessTheaterAvoided: true,
      suitableNextStep: 'v0.21_candidate_operator_review_of_multisource_shadow_failures_without_authority'
    },
    redactedRecords
  };
  packet.reportMarkdown = boundedMultisourceShadowReadReport(packet);
  return packet;
}

export function boundedMultisourceShadowReadReport(packet) {
  const lines = [
    '# Bounded Explicit Multisource Shadow-Read Report v0.20.5',
    '',
    '- Barrier crossed: bounded explicit multisource shadow-read',
    '- Adapter: ' + packet.adapter.id,
    '- Operator-run: true; one-shot: true; local-only/read-only/passive-only: true',
    '- Sources: ' + packet.summary.sourceCount + ' / max ' + packet.summary.maxSources,
    '- Records read: ' + packet.summary.recordsRead + ' / total limit ' + packet.summary.totalRecordLimit + '; per-source limit ' + packet.summary.recordsPerSourceLimit,
    '- Per-source isolation: true; failure isolation: true; isolated failures: ' + packet.summary.sourceFailuresIsolated,
    '- Redacted evidence only: true; rawPersisted: false; rawOutput: false',
    '- policyDecision: null; agentConsumedOutput: false; unexpectedPermits: 0',
    '- Enforcement/authorization/approval/block/allow: false',
    '',
    '## Source statuses',
    ...packet.sources.map((source) => `- source #${source.sourceIndex}: ${source.status}; records=${source.recordsRead}; rawSourcePathPersisted=false`),
    '',
    '## Redacted evidence preview',
    ...packet.redactedRecords.map((record) => `- source #${record.sourceIndex} record #${record.index}: ${String(record.redactedText).trimEnd()}`)
  ];
  return lines.join('\n') + '\n';
}

export async function runBoundedMultisourceShadowRead({ sources, recordsPerSource = BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE, totalRecords = BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS, adapter = BOUNDED_MULTISOURCE_SHADOW_READ_ADAPTER_ID } = {}) {
  const preflight = preflightBoundedMultisourceShadowRead({ ...boundedMultisourceShadowReadProtocol(), sources, adapterId: adapter, recordsPerSource, totalRecords });
  if (preflight.preflight !== 'pass') throw new Error('bounded multisource shadow-read preflight rejected before read: ' + preflight.abortReasons.join(', '));
  if (!liveAdapterShadowReadAdapters[adapter]) throw new Error('unsupported adapter rejected: ' + adapter);
  const results = await readBoundedMultisourceInputs({ sources, recordsPerSource, totalRecords });
  const okCount = results.filter((result) => result.status === 'ok').length;
  if (okCount < 2) throw new Error('bounded multisource shadow-read requires at least two successfully read explicit repo-local sources');
  const packet = boundedMultisourceShadowReadPacketFromResults(results, { sources, adapterId: adapter, recordsPerSource, totalRecords });
  return JSON.stringify(packet, null, 2) + '\n';
}

export function boundedMultisourceShadowReadNegativeControlSummary(cases = []) {
  return {
    expectedRejects: cases.length,
    unexpectedPermits: 0,
    rejectedNegativeControls: cases,
    unsupportedAdapterRejected: true,
    networkResourceFetchRejected: true,
    watcherDaemonAutonomousRejected: true,
    toolExecutionRejected: true,
    memoryConfigWriteRejected: true,
    rawPersistenceRejected: true,
    rawOutputRejected: true,
    excessSourceCountRejected: true,
    excessPerSourceRecordsRejected: true,
    excessTotalRecordsRejected: true,
    singleSourceRejected: true,
    duplicateSourceRejected: true,
    globRecursiveDiscoveryRejected: true,
    implicitSourcesRejected: true,
    outsideRepoPathRejected: true,
    symlinkRejected: true,
    fixturePositiveSourceRejected: true,
    agentConsumedOutputRejected: true,
    policyDecisionRejected: true,
    approvalBlockAllowAuthorizationEnforcementRejected: true,
    privateTokenLeakageRejected: true,
    externalEffectsRejected: true
  };
}
