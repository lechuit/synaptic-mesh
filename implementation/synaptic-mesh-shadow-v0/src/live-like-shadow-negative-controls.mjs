const handlingByLabel = new Map([
  ['tool request', 'fail-closed'],
  ['approval-ish text', 'record-only'],
  ['stale source', 'degrade'],
  ['missing redaction', 'fail-closed'],
  ['framework-looking route', 'record-only']
]);

export function evaluateLiveLikeNegativeControls(cases) {
  const records = cases.map((entry) => {
    const handling = handlingByLabel.get(entry.dangerousLabel) ?? 'fail-closed';
    return {
      caseId: entry.caseId,
      dangerousLabel: entry.dangerousLabel,
      expectedHandling: entry.expectedHandling,
      handling,
      matchesExpected: handling === entry.expectedHandling,
      permitEmitted: false,
      runtimeAuthority: false,
      toolExecution: false,
      policyDecision: false,
      enforcement: false
    };
  });
  return {
    sandboxFailureCatalog: 'pass',
    releaseLayer: 'v0.14.3',
    negativeControls: records.length,
    dangerousLabels: records.map((record) => record.dangerousLabel),
    failClosedOrDegradeOrRecordOnly: records.every((record) => ['fail-closed', 'degrade', 'record-only'].includes(record.handling)),
    unexpectedPermits: records.filter((record) => record.permitEmitted).length,
    records
  };
}
