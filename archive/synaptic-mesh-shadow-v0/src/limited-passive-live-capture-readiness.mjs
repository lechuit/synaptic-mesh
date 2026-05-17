const forbiddenPreview = /\b(allow|block|approve|enforce|authorize)\b/i;

export function evaluateLimitedPassiveLiveCaptureEnvelope(envelope) {
  const abortReasons = [];
  const requireTrue = ['disabledByDefault','operatorRun','localOnly','passiveOnly','readOnly'];
  for (const key of requireTrue) if (envelope?.[key] !== true) abortReasons.push(`required_true_missing:${key}`);
  const requireFalse = ['rawPersisted','agentConsumedOutput'];
  for (const key of requireFalse) if (envelope?.[key] !== false) abortReasons.push(`required_false_missing:${key}`);
  if (envelope?.policyDecision !== null) abortReasons.push('policy_decision_must_be_null');
  if (envelope?.networkFetch || envelope?.resourceFetch) abortReasons.push('network_or_resource_fetch_forbidden');
  if (envelope?.daemon || envelope?.watch || envelope?.autonomousLiveMode) abortReasons.push('daemon_watch_autonomous_forbidden');
  if (envelope?.toolExecution) abortReasons.push('tool_execution_forbidden');
  if (envelope?.memoryConfigWrite) abortReasons.push('memory_config_write_forbidden');
  if (envelope?.externalEffects) abortReasons.push('external_effects_forbidden');
  if (typeof envelope?.preview === 'string' && forbiddenPreview.test(envelope.preview)) abortReasons.push('decision_verbs_forbidden_in_preview');
  return {
    readiness: abortReasons.length === 0 ? 'pass' : 'abort',
    abortReasons,
    summary: {
      disabledByDefault: envelope?.disabledByDefault === true,
      operatorRun: envelope?.operatorRun === true,
      localOnly: envelope?.localOnly === true,
      passiveOnly: envelope?.passiveOnly === true,
      readOnly: envelope?.readOnly === true,
      rawPersisted: envelope?.rawPersisted === true,
      agentConsumedOutput: envelope?.agentConsumedOutput === true,
      policyDecision: envelope?.policyDecision ?? null,
      externalEffects: envelope?.externalEffects === true,
      enforcement: false, authorization: false, approvalBlockAllow: false, toolExecution: envelope?.toolExecution === true, memoryConfigWrite: envelope?.memoryConfigWrite === true
    }
  };
}

export function summarizeLimitedPassiveLiveCaptureReadiness(envelope) {
  const evaluation = evaluateLimitedPassiveLiveCaptureEnvelope(envelope);
  return {
    artifact: 'T-synaptic-mesh-limited-passive-live-capture-readiness-v0.17',
    timestamp: '2026-05-15T10:00:00.000Z',
    summary: {
      limitedPassiveLiveCaptureReadiness: evaluation.readiness === 'pass',
      releaseLayer: 'v0.17.5',
      designReadinessOnly: true,
      disabledManualOperatorRunLocalPassiveReadOnly: evaluation.summary.disabledByDefault && evaluation.summary.operatorRun && evaluation.summary.localOnly && evaluation.summary.passiveOnly && evaluation.summary.readOnly,
      rawPersisted: evaluation.summary.rawPersisted,
      agentConsumedOutput: evaluation.summary.agentConsumedOutput,
      policyDecision: evaluation.summary.policyDecision,
      externalEffects: evaluation.summary.externalEffects,
      enforcement: evaluation.summary.enforcement,
      authorization: evaluation.summary.authorization,
      approvalBlockAllow: evaluation.summary.approvalBlockAllow,
      toolExecution: evaluation.summary.toolExecution,
      memoryConfigWrite: evaluation.summary.memoryConfigWrite,
      abortReasons: evaluation.abortReasons
    },
    envelope: { sourceLabel: envelope.sourceLabel, observedAt: envelope.observedAt }
  };
}
