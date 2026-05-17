import { createHash } from 'node:crypto';
import { classifyRoute } from '../route-classifier.mjs';

export const SIMULATED_FRAMEWORK_ADAPTER_INPUT_SCHEMA_VERSION = 'simulated-framework-shaped-adapter-input-v0';
export const SIMULATED_FRAMEWORK_ADAPTER_SHAPE = 'framework_shaped_local_fixture';
export const SIMULATED_FRAMEWORK_ADAPTER_OUTPUT_MODE = 'record_only_evidence';

const ALLOWED_FRAMEWORK_KINDS = Object.freeze(new Set(['mcp_like', 'langgraph_like']));
const ALLOWED_KEYS = Object.freeze(new Set([
  'schemaVersion',
  'adapterShape',
  'frameworkKind',
  'realFrameworkIntegration',
  'sdkImported',
  'sourceAlreadyRedacted',
  'sourceArtifactDigest',
  'redactionReviewRecordId',
  'networkAllowed',
  'liveTrafficAllowed',
  'toolExecutionAllowed',
  'resourceFetchAllowed',
  'memoryWriteAllowed',
  'configWriteAllowed',
  'externalPublicationAllowed',
  'agentConsumedAllowed',
  'machineReadablePolicyAllowed',
  'approvalAllowed',
  'blockingAllowed',
  'allowingAllowed',
  'authorizationAllowed',
  'enforcementAllowed',
  'inputMode',
  'outputMode',
]));
const FALSE_FLAGS = Object.freeze([
  'realFrameworkIntegration',
  'sdkImported',
  'networkAllowed',
  'liveTrafficAllowed',
  'toolExecutionAllowed',
  'resourceFetchAllowed',
  'memoryWriteAllowed',
  'configWriteAllowed',
  'externalPublicationAllowed',
  'agentConsumedAllowed',
  'machineReadablePolicyAllowed',
  'approvalAllowed',
  'blockingAllowed',
  'allowingAllowed',
  'authorizationAllowed',
  'enforcementAllowed',
]);

export function validateSimulatedFrameworkShapedAdapterInput(input = {}) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['input must be object'] };
  for (const key of Object.keys(input)) if (!ALLOWED_KEYS.has(key)) errors.push(`additional property ${key}`);
  if (input.schemaVersion !== SIMULATED_FRAMEWORK_ADAPTER_INPUT_SCHEMA_VERSION) errors.push('schemaVersion mismatch');
  if (input.adapterShape !== SIMULATED_FRAMEWORK_ADAPTER_SHAPE) errors.push('adapterShape mismatch');
  if (!ALLOWED_FRAMEWORK_KINDS.has(input.frameworkKind)) errors.push('frameworkKind must be mcp_like or langgraph_like');
  if (input.sourceAlreadyRedacted !== true) errors.push('sourceAlreadyRedacted must be true');
  if (!/^sha256:[a-f0-9]{64}$/.test(input.sourceArtifactDigest ?? '')) errors.push('sourceArtifactDigest must be sha256 digest');
  if (typeof input.redactionReviewRecordId !== 'string' || input.redactionReviewRecordId.length < 1) errors.push('redactionReviewRecordId must be non-empty string');
  if (input.inputMode !== 'local_redacted_fixture_only') errors.push('inputMode must be local_redacted_fixture_only');
  if (input.outputMode !== SIMULATED_FRAMEWORK_ADAPTER_OUTPUT_MODE) errors.push('outputMode must be record_only_evidence');
  for (const flag of FALSE_FLAGS) if (input[flag] !== false) errors.push(`${flag} must be false`);
  return { ok: errors.length === 0, errors };
}

export function runSimulatedFrameworkShapedAdapter(input = {}, options = {}) {
  const adapterRunId = options.adapterRunId ?? `sim_fw_${input.frameworkKind ?? 'unknown'}_001`;
  const validation = validateSimulatedFrameworkShapedAdapterInput(input);
  if (!validation.ok) return rejected(adapterRunId, input, validation.errors);

  const parserEvidence = produceParserEvidence(input);
  const routeDecisionInput = produceRouteDecisionInput(input, parserEvidence);
  const rawClassifierDecision = classifyRoute({ parserEvidence, routeDecisionInput });
  const classifierDecision = recordOnlyClassifierDecision(rawClassifierDecision);
  const decisionTrace = produceDecisionTrace(input, parserEvidence, classifierDecision);
  const advisoryReport = produceAdvisoryReport(input, classifierDecision, decisionTrace);

  return {
    ok: true,
    adapterRunId,
    inputRef: {
      frameworkKind: input.frameworkKind,
      sourceArtifactDigest: input.sourceArtifactDigest,
      redactionReviewRecordId: input.redactionReviewRecordId,
    },
    parserEvidence,
    classifierDecision,
    decisionTrace,
    advisoryReport,
    result: recordOnlyResult(input),
    boundary: boundary(),
  };
}

function rejected(adapterRunId, input, errors) {
  return {
    ok: false,
    adapterRunId,
    errors,
    parserEvidence: null,
    classifierDecision: null,
    decisionTrace: null,
    advisoryReport: {
      kind: 'human_readable_advisory_report',
      summary: 'Simulated framework-shaped adapter input rejected before pipeline.',
      errors,
      notAuthority: true,
      notAgentInstruction: true,
      machineReadablePolicyDecision: false,
      agentConsumed: false,
    },
    result: {
      recordOnly: true,
      frameworkKind: input?.frameworkKind ?? 'unknown',
      parserEvidenceProduced: false,
      classifierDecisionProduced: false,
      decisionTraceProduced: false,
      advisoryReportProduced: true,
      ...falseCapabilities(),
    },
    boundary: boundary(),
  };
}

function produceParserEvidence(input) {
  return {
    kind: 'parserEvidence',
    rawArtifactId: `simulated-framework-shaped/${input.frameworkKind}/${input.redactionReviewRecordId}`,
    rawInputShape: 'framework_shaped_local_fixture',
    frameworkKind: input.frameworkKind,
    sourceArtifactDigest: input.sourceArtifactDigest,
    redactionReviewRecordId: input.redactionReviewRecordId,
    receiptCandidatesFound: 1,
    validReceipts: 1,
    invalidReceipts: 0,
    freeTextAuthorityAttempts: [],
    sensitiveSignals: [],
    foldedIndex: null,
    normalizationWarnings: [],
    sourceAlreadyRedacted: true,
    localFixtureOnly: true,
    networkUsed: false,
    resourceFetch: false,
  };
}

function produceRouteDecisionInput(input, parserEvidence) {
  return {
    normalizedAuthorityLevel: 'local_shadow',
    normalizedActionEffect: 'text_only',
    candidateSummary: {
      validReceipts: parserEvidence.validReceipts,
      invalidReceipts: parserEvidence.invalidReceipts,
      sensitiveSignals: parserEvidence.sensitiveSignals,
      frameworkKind: input.frameworkKind,
      alreadyRedacted: true,
      localFixtureOnly: true,
    },
    recommendedRoute: 'shadow_only',
  };
}

function recordOnlyClassifierDecision(rawClassifierDecision) {
  return {
    selectedRoute: rawClassifierDecision.selectedRoute,
    humanRequired: false,
    compactAllowed: false,
    reasonCodes: rawClassifierDecision.reasonCodes ?? [],
    decisiveSignals: rawClassifierDecision.decisiveSignals ?? [],
    rejectedRoutesPersisted: false,
    rawClassifierDecisionPersisted: false,
    classifier: {
      id: rawClassifierDecision.classifier?.id ?? 'deterministic-route-classifier-v0',
      mode: 'record_only_simulated_framework_shape_review',
      runtimeEnforcement: false,
      toolAuthorization: false,
    },
    recordOnly: true,
    machineReadablePolicyDecision: false,
    agentConsumed: false,
    notAuthority: true,
    mayBlock: false,
    mayAllow: false,
    authorization: false,
    enforcement: false,
  };
}

function produceDecisionTrace(input, parserEvidence, classifierDecision) {
  const parserEvidenceHash = sha256Json(parserEvidence);
  const classifierDecisionHash = sha256Json(classifierDecision);
  return {
    kind: 'DecisionTrace',
    traceMode: 'simulated_framework_shaped_local_fixture_only',
    frameworkKind: input.frameworkKind,
    sourceArtifactDigest: input.sourceArtifactDigest,
    parserEvidenceHash,
    classifierDecisionHash,
    selectedRoute: classifierDecision.selectedRoute,
    reasonCodes: classifierDecision.reasonCodes,
    boundaryVerdict: {
      recordOnly: true,
      falsePermit: false,
      falseCompact: false,
      boundaryLoss: false,
    },
    steps: [
      'validate_framework_shaped_local_fixture',
      'produce_parserEvidence',
      'produce_classifierDecision_record_only',
      'produce_DecisionTrace',
      'produce_human_readable_advisory_report',
      'emit_record_only_evidence',
    ],
    ...falseCapabilities(),
  };
}

function produceAdvisoryReport(input, classifierDecision, decisionTrace) {
  return {
    kind: 'human_readable_advisory_report',
    mode: 'record_only_human_review_advisory',
    frameworkKind: input.frameworkKind,
    title: `Framework-shaped ${input.frameworkKind} local fixture advisory`,
    normalizedContent: [
      `Framework-shaped ${input.frameworkKind} fixture was processed locally as already-redacted record-only evidence.`,
      'This is not real framework integration and not runtime authorization.',
      `Selected route for review evidence: ${classifierDecision.selectedRoute}.`,
      `Reason codes: ${classifierDecision.reasonCodes.join(', ')}.`,
    ].join('\n'),
    decisionTraceHash: sha256Json(decisionTrace),
    notAuthority: true,
    notAgentInstruction: true,
    machineReadablePolicyDecision: false,
    agentConsumed: false,
  };
}

function recordOnlyResult(input) {
  return {
    recordOnly: true,
    frameworkKind: input.frameworkKind,
    sourceArtifactDigest: input.sourceArtifactDigest,
    parserEvidenceProduced: true,
    classifierDecisionProduced: true,
    decisionTraceProduced: true,
    advisoryReportProduced: true,
    ...falseCapabilities(),
  };
}

function falseCapabilities() {
  return {
    realFrameworkIntegration: false,
    sdkImported: false,
    networkUsed: false,
    liveTrafficAllowed: false,
    toolExecution: false,
    resourceFetch: false,
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

function boundary() {
  return [
    'simulated_framework_shaped_adapter_only',
    'fake_local_redacted_fixture_only',
    'no_real_framework_integration',
    'no_framework_sdk',
    'no_network',
    'no_live_traffic',
    'no_resource_fetch',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_agent_consumption',
    'no_machine_policy',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
    'record_only_evidence',
  ];
}

function sha256Json(value) {
  return createHash('sha256').update(JSON.stringify(sortKeys(value))).digest('hex');
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortKeys(item)]));
}
