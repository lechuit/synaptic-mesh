export function validateLiveLikeEnvelope(envelope) {
  const failures = [];
  if (envelope?.schemaVersion !== 'live-like-shadow-observation-envelope-v0.14.0-alpha') failures.push('schemaVersion');
  if (envelope?.mode !== 'live-like shadow/sandbox') failures.push('mode');
  const source = envelope?.sourceBoundary ?? {};
  const redaction = envelope?.redaction ?? {};
  const forbidden = envelope?.forbiddenEffects ?? {};
  if (source.offlineFrozenAlreadyRedacted !== true) failures.push('offlineFrozenAlreadyRedacted');
  if (source.manualOrFrozenOnly !== true) failures.push('manualOrFrozenOnly');
  for (const key of ['liveTraffic', 'network', 'watcherDaemon', 'frameworkAdapter', 'sdkImport']) if (source[key] !== false) failures.push(key);
  if (redaction.status !== 'already-redacted') failures.push('redaction.status');
  if (redaction.rawPrivateContent !== false) failures.push('rawPrivateContent');
  if (redaction.placeholdersOnly !== true) failures.push('placeholdersOnly');
  for (const key of ['toolExecution', 'agentConsumed', 'machineReadablePolicyDecision', 'approvalBlockAllowAuthorizationEnforcement']) if (forbidden[key] !== false) failures.push(key);
  return { valid: failures.length === 0, failures };
}

export function replayFrozenLiveLikeEnvelopes(envelopes) {
  const records = envelopes.map((envelope) => {
    const validation = validateLiveLikeEnvelope(envelope);
    return {
      envelopeId: envelope?.envelopeId ?? 'unknown',
      replayMode: 'frozen/redacted manual replay only',
      validation,
      advisoryOnly: true,
      runtimeAuthority: false,
      liveTraffic: false,
      networkAllowed: false,
      toolExecution: false,
      watcherDaemon: false,
      agentConsumed: false,
      machineReadablePolicyDecision: false,
      authorization: false,
      enforcement: false
    };
  });
  return {
    replayHarness: 'pass',
    releaseLayer: 'v0.14.1',
    replayMode: 'frozen/redacted manual CLI/test only',
    totalEnvelopes: records.length,
    validEnvelopes: records.filter((record) => record.validation.valid).length,
    invalidEnvelopes: records.filter((record) => !record.validation.valid).length,
    advisoryOnly: true,
    runtimeAuthority: false,
    liveTraffic: false,
    networkAllowed: false,
    toolExecution: false,
    watcherDaemon: false,
    records
  };
}
