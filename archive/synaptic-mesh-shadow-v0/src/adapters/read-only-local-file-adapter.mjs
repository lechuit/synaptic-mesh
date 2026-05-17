import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { classifyRoute } from '../route-classifier.mjs';

const INPUT_SCHEMA_VERSION = 'read-only-local-file-adapter-input-v0';
const RESULT_SCHEMA_VERSION = 'read-only-local-file-adapter-result-v0';
const ADAPTER_MODE = 'manual_local_file_read_only';
const ADAPTER_EVIDENCE_DIRECTORY = 'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter';
const ADAPTER_EVIDENCE_FILENAME = 'read-only-local-file-adapter.out.json';
const APPROVED_SOURCE_FILE_PATH = 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/example.json';
const APPROVED_SOURCE_ARTIFACT_DIGEST = 'sha256:fc594bd17819b1005b813cbb195e9d12195766c4b0b05d020a590180f579cb75';

const ALLOWED_INPUT_KEYS = Object.freeze(new Set([
  'schemaVersion',
  'adapterMode',
  'sourceFilePath',
  'sourceArtifactDigest',
  'sourceAlreadyRedacted',
  'rawInputAllowed',
  'networkAllowed',
  'directoryInputAllowed',
  'globAllowed',
  'watcherAllowed',
  'daemonAllowed',
  'redactionReviewRecord',
  'rawContentPersisted',
]));

const ALLOWED_REDACTION_REVIEW_RECORD_KEYS = Object.freeze(new Set([
  'reviewed',
  'rawContentPersisted',
  'sourceAlreadyRedacted',
]));

const FORBIDDEN_INPUT_TRUE_FLAGS = Object.freeze([
  'rawInputAllowed',
  'networkAllowed',
  'directoryInputAllowed',
  'globAllowed',
  'watcherAllowed',
  'daemonAllowed',
]);

const FORBIDDEN_RESULT_TRUE_FLAGS = Object.freeze([
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]);

export async function runReadOnlyLocalFileAdapter(input = {}, options = {}) {
  const repoRoot = options.repoRoot ? resolve(options.repoRoot) : process.cwd();
  const adapterRunId = options.adapterRunId ?? 'adapter_run_001';
  const inputValidation = validateAdapterInput(input);
  if (!inputValidation.ok) return rejectedResult({ adapterRunId, input, reasons: inputValidation.reasons });
  const sourceBindingValidation = validateApprovedSourceBinding(input);
  if (!sourceBindingValidation.ok) return rejectedResult({ adapterRunId, input, reasons: sourceBindingValidation.reasons });

  const sourcePath = resolve(repoRoot, input.sourceFilePath);
  const containment = await validateSourceContainment(sourcePath, repoRoot);
  if (!containment.ok) return rejectedResult({ adapterRunId, input, reasons: containment.reasons });

  const bytes = await readFile(sourcePath);
  const digest = `sha256:${sha256(bytes)}`;
  if (digest !== input.sourceArtifactDigest) {
    return rejectedResult({ adapterRunId, input, reasons: ['sourceArtifactDigest mismatch'] });
  }

  const sourceText = bytes.toString('utf8');
  const parserEvidence = produceParserEvidence({ input, sourceText, digest });
  const routeDecisionInput = {
    normalizedAuthorityLevel: 'local_shadow',
    normalizedActionEffect: 'text_only',
    candidateSummary: {
      validReceipts: parserEvidence.validReceipts,
      invalidReceipts: parserEvidence.invalidReceipts,
      sensitiveSignals: parserEvidence.sensitiveSignals,
      adapterMode: input.adapterMode,
      alreadyRedacted: input.sourceAlreadyRedacted,
    },
    recommendedRoute: 'shadow_only',
  };
  const classifierDecision = classifyRoute({ parserEvidence, routeDecisionInput });
  const classifierDecisionDigest = sha256Json(classifierDecision);
  const decisionTrace = produceDecisionTrace({ input, parserEvidence, classifierDecisionDigest, digest });
  const advisoryReport = produceAdvisoryReport({ input });

  const result = allowedResult({ adapterRunId, input });

  return {
    ok: true,
    result,
    parserEvidence,
    decisionTrace,
    advisoryReport,
    boundary: boundary(),
  };
}

export function validateAdapterInput(input = {}) {
  const reasons = [];
  for (const key of Object.keys(input ?? {})) {
    if (!ALLOWED_INPUT_KEYS.has(key)) reasons.push(`additional input property ${key} is forbidden`);
  }
  if (input.schemaVersion !== INPUT_SCHEMA_VERSION) reasons.push('schemaVersion must be read-only-local-file-adapter-input-v0');
  if (input.adapterMode !== ADAPTER_MODE) reasons.push('adapterMode must be manual_local_file_read_only');
  if (typeof input.sourceFilePath !== 'string' || input.sourceFilePath.length === 0) reasons.push('sourceFilePath must be non-empty string');
  if (typeof input.sourceFilePath === 'string') {
    if (looksLikeUrl(input.sourceFilePath)) reasons.push('sourceFilePath must not be URL/network input');
    if (input.sourceFilePath.includes('..')) reasons.push('sourceFilePath must not include parent traversal');
    if (/[*?\[\]{}]/.test(input.sourceFilePath)) reasons.push('sourceFilePath must not include glob characters');
    if (input.sourceFilePath.endsWith('/')) reasons.push('sourceFilePath must name one file, not a directory');
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(input.sourceArtifactDigest ?? '')) reasons.push('sourceArtifactDigest must be sha256 digest');
  if (input.sourceAlreadyRedacted !== true) reasons.push('sourceAlreadyRedacted must be true');
  if (input.rawContentPersisted !== false) reasons.push('rawContentPersisted must be false');
  if (!input.redactionReviewRecord || typeof input.redactionReviewRecord !== 'object') {
    reasons.push('redactionReviewRecord must be present');
  } else {
    for (const key of Object.keys(input.redactionReviewRecord)) {
      if (!ALLOWED_REDACTION_REVIEW_RECORD_KEYS.has(key)) reasons.push(`additional redactionReviewRecord property ${key} is forbidden`);
    }
    if (input.redactionReviewRecord.reviewed !== true) reasons.push('redactionReviewRecord.reviewed must be true');
    if (input.redactionReviewRecord.rawContentPersisted !== false) reasons.push('redactionReviewRecord.rawContentPersisted must be false');
    if (input.redactionReviewRecord.sourceAlreadyRedacted !== true) reasons.push('redactionReviewRecord.sourceAlreadyRedacted must be true');
  }
  for (const flag of FORBIDDEN_INPUT_TRUE_FLAGS) {
    if (input[flag] !== false) reasons.push(`${flag} must be false`);
  }
  return { ok: reasons.length === 0, reasons };
}

function validateApprovedSourceBinding(input = {}) {
  const reasons = [];
  if (input.sourceFilePath !== APPROVED_SOURCE_FILE_PATH) {
    reasons.push('sourceFilePath must match the approved explicit already-redacted local file');
  }
  if (input.sourceArtifactDigest !== APPROVED_SOURCE_ARTIFACT_DIGEST) {
    reasons.push('sourceArtifactDigest must match the approved explicit already-redacted local file digest');
  }
  return { ok: reasons.length === 0, reasons };
}

async function validateSourceContainment(sourcePath, repoRoot) {
  const reasons = [];
  const sourceStat = await lstat(sourcePath).catch(() => null);
  if (!sourceStat) return { ok: false, reasons: ['source file not found'] };
  if (!sourceStat.isFile()) reasons.push('source path must be a regular file');
  if (sourceStat.isSymbolicLink()) reasons.push('source path must not be a symlink');
  const rootReal = await realpath(repoRoot);
  const sourceReal = await realpath(sourcePath);
  const rel = relative(rootReal, sourceReal);
  if (rel.startsWith('..') || rel === '') reasons.push('source file must stay inside repo root and not be repo root');
  return { ok: reasons.length === 0, reasons };
}

function produceParserEvidence({ input, sourceText, digest }) {
  const parsed = parseJsonOrNull(sourceText);
  return {
    kind: 'parserEvidence',
    rawArtifactId: input.sourceFilePath,
    rawInputShape: 'explicit_already_redacted_local_file',
    sourceDigest: digest,
    receiptCandidatesFound: 0,
    validReceipts: 0,
    invalidReceipts: 0,
    freeTextAuthorityAttempts: [],
    sensitiveSignals: [],
    foldedIndex: null,
    normalizationWarnings: ['NO_RECEIPT_CANDIDATE'],
    redactionStatus: parsed?.redactionStatus ?? 'already_redacted',
  };
}

function produceDecisionTrace({ input, parserEvidence, classifierDecisionDigest, digest }) {
  return {
    kind: 'DecisionTrace',
    adapterMode: input.adapterMode,
    sourceFilePath: input.sourceFilePath,
    sourceArtifactDigest: digest,
    steps: [
      'validate_schema_only_input_boundary',
      'read_one_explicit_already_redacted_local_file',
      'produce_parserEvidence',
      'call_existing_route_classifier',
      'produce_human_review_advisory_report',
      'emit_record_only_evidence',
    ],
    parserEvidenceDigest: sha256Json(parserEvidence),
    classifierDecisionDigest,
    rawClassifierDecisionPersisted: false,
    toolExecution: false,
    memoryWrite: false,
    configWrite: false,
    externalPublication: false,
    authorization: false,
    enforcement: false,
  };
}

function produceAdvisoryReport({ input }) {
  return {
    kind: 'human_readable_advisory_report',
    adapterMode: input.adapterMode,
    summary: 'Read-only local-file adapter skeleton invoked the existing classifier, redacted raw classifier output, and produced human-readable review evidence only.',
    notAuthority: true,
    notAgentInstruction: true,
    machineReadablePolicyDecision: false,
    agentConsumed: false,
  };
}

function allowedResult({ adapterRunId, input }) {
  return {
    schemaVersion: RESULT_SCHEMA_VERSION,
    adapterRunId,
    recordOnly: true,
    sourceFileRead: true,
    sourceFilePath: input.sourceFilePath,
    sourceArtifactDigestVerified: true,
    parserEvidenceProduced: true,
    classifierDecisionProduced: true,
    decisionTraceProduced: true,
    advisoryReportProduced: true,
    toolExecution: false,
    memoryWrite: false,
    configWrite: false,
    externalPublication: false,
    approvalEmission: false,
    machineReadablePolicyDecision: false,
    agentConsumed: false,
    mayBlock: false,
    mayAllow: false,
    authorization: false,
    enforcement: false,
  };
}

function rejectedResult({ adapterRunId, input, reasons }) {
  return {
    ok: false,
    result: {
      schemaVersion: RESULT_SCHEMA_VERSION,
      adapterRunId,
      recordOnly: true,
      sourceFileRead: false,
      sourceFilePath: input?.sourceFilePath ?? '',
      sourceArtifactDigestVerified: false,
      parserEvidenceProduced: false,
      classifierDecisionProduced: false,
      decisionTraceProduced: false,
      advisoryReportProduced: true,
      toolExecution: false,
      memoryWrite: false,
      configWrite: false,
      externalPublication: false,
      approvalEmission: false,
      machineReadablePolicyDecision: false,
      agentConsumed: false,
      mayBlock: false,
      mayAllow: false,
      authorization: false,
      enforcement: false,
    },
    parserEvidence: null,
    decisionTrace: null,
    advisoryReport: {
      kind: 'human_readable_advisory_report',
      summary: 'Read-only local-file adapter input rejected before reading.',
      reasons,
      notAuthority: true,
      notAgentInstruction: true,
    },
    boundary: boundary(),
  };
}

function boundary() {
  return [
    'read_only_local_file_adapter_skeleton',
    'one_explicit_already_redacted_local_file',
    'evidence_record_only',
    'no_policy_logic_in_adapter',
    'calls_existing_route_classifier',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
  ];
}

function parseJsonOrNull(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function looksLikeUrl(value) {
  return /^(?:https?|ssh|git):\/\//i.test(value) || value.startsWith('//') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
}

export async function writeReadOnlyLocalFileAdapterEvidence(output, options = {}) {
  if (options.evidencePath !== undefined || options.outputPath !== undefined) {
    throw new Error('read-only local-file adapter evidence path is fixed');
  }
  const { repoRoot = process.cwd() } = options;
  const root = resolve(repoRoot);
  const evidenceRoot = resolve(root, 'implementation/synaptic-mesh-shadow-v0/evidence');
  const allowedDir = resolve(root, ADAPTER_EVIDENCE_DIRECTORY);
  const target = resolve(allowedDir, ADAPTER_EVIDENCE_FILENAME);
  const targetParent = dirname(target);

  const evidenceRootStat = await lstat(evidenceRoot).catch(() => null);
  if (!evidenceRootStat) throw new Error('evidence root must already exist');
  if (evidenceRootStat.isSymbolicLink()) throw new Error('evidence root must not be symlink');
  if (!evidenceRootStat.isDirectory()) throw new Error('evidence root must already exist');

  const allowedDirStat = await lstat(allowedDir).catch(() => null);
  if (allowedDirStat?.isSymbolicLink()) throw new Error('adapter evidence directory must not be symlink');
  if (!allowedDirStat) await mkdir(allowedDir, { recursive: false });

  const rootReal = await realpath(root);
  const evidenceRootReal = await realpath(evidenceRoot);
  const allowedReal = await realpath(allowedDir);
  const parentReal = await realpath(targetParent);
  const relRoot = relative(rootReal, target);
  const relEvidence = relative(evidenceRootReal, allowedReal);
  if (relRoot.startsWith('..')) throw new Error('evidence output must stay inside repo');
  if (relEvidence !== 'read-only-local-file-adapter') throw new Error('evidence output must stay inside adapter evidence directory');
  if (parentReal !== allowedReal) throw new Error('evidence output parent must be adapter evidence directory');

  const targetStat = await lstat(target).catch(() => null);
  if (targetStat?.isSymbolicLink()) throw new Error('evidence output path must not be symlink');
  await writeFile(target, `${JSON.stringify(output, null, 2)}\n`);
  return target;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function sha256Json(value) {
  return `sha256:${sha256(Buffer.from(canonicalJson(value)))}`;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

export const READ_ONLY_LOCAL_FILE_ADAPTER_BOUNDARY = Object.freeze(boundary());
