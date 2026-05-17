const retentionCeilings = {
  raw_live_input: 0,
  redacted_observation_record: 7,
  redacted_result_record: 7,
  aggregate_scorecard: 90,
};

const knownArtifactClasses = new Set([
  ...Object.keys(retentionCeilings),
  'public_release_evidence',
]);

function reject(caseId, reasonCodes) {
  return {
    caseId,
    retentionGate: 'reject',
    reasonCodes,
    boundary: 'manual_offline_retention_gate_only',
  };
}

export function evaluateRetentionCandidate(candidate) {
  const caseId = candidate?.caseId ?? 'unknown_case';
  const reasonCodes = [];
  const artifactClass = candidate?.artifactClass;

  if (!knownArtifactClasses.has(artifactClass)) reasonCodes.push('RETENTION_UNKNOWN_CLASS_REJECTED');
  if (candidate?.rawContentPersisted === true) reasonCodes.push('RETENTION_RAW_CONTENT_PERSISTED');
  if (candidate?.retentionSchedulerImplemented === true) reasonCodes.push('RETENTION_SCHEDULER_FORBIDDEN');
  if (candidate?.deletionImplemented === true) reasonCodes.push('RETENTION_DELETION_IMPLEMENTATION_FORBIDDEN');
  if (candidate?.liveObserverImplemented === true) reasonCodes.push('RETENTION_LIVE_OBSERVER_FORBIDDEN');
  if (candidate?.runtimeIntegrationImplemented === true) reasonCodes.push('RETENTION_RUNTIME_INTEGRATION_FORBIDDEN');

  if (artifactClass === 'raw_live_input' && candidate?.retentionDays !== 0) {
    reasonCodes.push('RETENTION_RAW_LIVE_INPUT_MUST_BE_ZERO_DAY');
  }
  if (Object.hasOwn(retentionCeilings, artifactClass) && candidate?.retentionDays > retentionCeilings[artifactClass]) {
    reasonCodes.push('RETENTION_CEILING_EXCEEDED');
  }
  if ((artifactClass === 'redacted_observation_record' || artifactClass === 'redacted_result_record')
    && candidate?.redactionStatus !== 'redacted') {
    reasonCodes.push('RETENTION_REDACTION_STATUS_REQUIRED');
  }
  if (artifactClass === 'aggregate_scorecard' && candidate?.aggregateOnly !== true) {
    reasonCodes.push('RETENTION_AGGREGATE_ONLY_REQUIRED');
  }
  if (artifactClass === 'public_release_evidence' && candidate?.syntheticOrNonSensitive !== true) {
    reasonCodes.push('RETENTION_PUBLIC_EVIDENCE_MUST_BE_SYNTHETIC_OR_NON_SENSITIVE');
  }

  if (reasonCodes.length > 0) return reject(caseId, [...new Set(reasonCodes)].sort());
  return {
    caseId,
    retentionGate: 'pass',
    artifactClass,
    retentionDays: candidate.retentionDays ?? null,
    reasonCodes: [],
    boundary: 'manual_offline_retention_gate_only',
  };
}

export function summarizeRetentionGate(results) {
  const rejected = results.filter((result) => result.retentionGate === 'reject');
  return {
    retentionGate: rejected.length === 0 ? 'pass' : 'reject',
    rejected: rejected.length,
    total: results.length,
  };
}
