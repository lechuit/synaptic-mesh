const sensitiveClassByFlag = {
  rawPersisted: 'raw_content',
  secretLikePersisted: 'secret_like_value',
  privatePathPersisted: 'private_path',
  toolOutputPersisted: 'tool_output',
  memoryTextPersisted: 'memory_text',
  configTextPersisted: 'config_text',
  approvalTextPersisted: 'approval_text',
  longRawPromptPersisted: 'long_raw_prompt',
  unknownSensitiveFieldPersisted: 'unknown_sensitive_field',
};

const publicFlags = [
  'rawPersisted',
  'secretLikePersisted',
  'privatePathPersisted',
  'toolOutputPersisted',
  'memoryTextPersisted',
  'configTextPersisted',
  'approvalTextPersisted',
];

const internalFlags = [
  ...publicFlags,
  'longRawPromptPersisted',
  'unknownSensitiveFieldPersisted',
];

function labelFor(path) {
  return path.map((part) => String(part)).join('.');
}

function entries(value, path = []) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((item, index) => entries(item, [...path, index]));
  return Object.entries(value).flatMap(([key, child]) => {
    const current = [...path, key];
    const self = [{ path: current, key, value: child }];
    return child && typeof child === 'object' ? [...self, ...entries(child, current)] : self;
  });
}

function persistedFieldSet(candidate) {
  return new Set((candidate?.persistedFields ?? []).map((field) => String(field)));
}

function hasPersistedField(candidate, names) {
  const fields = persistedFieldSet(candidate);
  return names.some((name) => fields.has(name));
}

function keyMatches(key, pattern) {
  return pattern.test(String(key));
}

function stringValueMatches(value, pattern) {
  return typeof value === 'string' && pattern.test(value);
}

function detectRawPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['rawContent', 'rawPrompt', 'rawText', 'rawPayload'])
    || flat.some(({ key }) => keyMatches(key, /^(rawContent|rawText|rawPayload)$/i));
}

function detectSecretLikePersisted(candidate, flat) {
  return hasPersistedField(candidate, ['secretValue', 'apiKey', 'accessToken', 'password'])
    || flat.some(({ key, value }) => keyMatches(key, /(secret|apiKey|accessToken|password|token)$/i)
      || stringValueMatches(value, /(sk-[a-zA-Z0-9]{16,}|ghp_[a-zA-Z0-9]{16,}|AKIA[0-9A-Z]{12,}|Bearer\s+[a-zA-Z0-9._-]{16,})/));
}

function detectPrivatePathPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['privatePath'])
    || flat.some(({ key, value }) => (keyMatches(key, /(privatePath|absolutePath|localPath)$/i) || typeof value === 'string')
      && stringValueMatches(value, /(\/Users\/[^\s/]+|\/home\/[^\s/]+|C:\\Users\\[^\\\s]+)/));
}

function detectToolOutputPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['toolOutput', 'stdout', 'stderr', 'terminalOutput'])
    || flat.some(({ key }) => keyMatches(key, /^(toolOutput|stdout|stderr|terminalOutput|commandOutput)$/i));
}

function detectMemoryTextPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['memoryText', 'memoryMd', 'memoryExcerpt'])
    || flat.some(({ key }) => keyMatches(key, /^(memoryText|memoryMd|memoryExcerpt)$/i));
}

function detectConfigTextPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['configText', 'configYaml', 'envFile'])
    || flat.some(({ key }) => keyMatches(key, /^(configText|configYaml|configJson|envFile)$/i));
}

function detectApprovalTextPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['approvalText', 'approvalCommand', 'approvalPrompt'])
    || flat.some(({ key }) => keyMatches(key, /^(approvalText|approvalCommand|approvalPrompt)$/i));
}

function detectLongRawPromptPersisted(candidate, flat, threshold) {
  return hasPersistedField(candidate, ['longRawPrompt'])
    || flat.some(({ key, value }) => keyMatches(key, /^(rawPrompt|promptText|longRawPrompt)$/i)
      && typeof value === 'string'
      && value.length > threshold);
}

function detectUnknownSensitiveFieldPersisted(candidate, flat) {
  return hasPersistedField(candidate, ['unknownSensitiveField', 'unknownSensitivePayload'])
    || flat.some(({ key }) => keyMatches(key, /(unknownSensitive|sensitivePayload|sensitiveField)$/i));
}

function flagDetections(candidate, options = {}) {
  const flat = entries(candidate);
  const longPromptThreshold = options.longPromptThreshold ?? 240;
  return {
    rawPersisted: detectRawPersisted(candidate, flat),
    secretLikePersisted: detectSecretLikePersisted(candidate, flat),
    privatePathPersisted: detectPrivatePathPersisted(candidate, flat),
    toolOutputPersisted: detectToolOutputPersisted(candidate, flat),
    memoryTextPersisted: detectMemoryTextPersisted(candidate, flat),
    configTextPersisted: detectConfigTextPersisted(candidate, flat),
    approvalTextPersisted: detectApprovalTextPersisted(candidate, flat),
    longRawPromptPersisted: detectLongRawPromptPersisted(candidate, flat, longPromptThreshold),
    unknownSensitiveFieldPersisted: detectUnknownSensitiveFieldPersisted(candidate, flat),
  };
}

export function scanRedactionCandidate(candidate, options = {}) {
  const detections = flagDetections(candidate, options);
  const detectedFlags = internalFlags.filter((flag) => detections[flag]);
  const reasonCodes = detectedFlags.map((flag) => `REDACTION_${sensitiveClassByFlag[flag].toUpperCase()}_PERSISTED`);
  return {
    caseId: candidate?.caseId ?? 'unknown_case',
    redactionGate: detectedFlags.length === 0 ? 'pass' : 'reject',
    ...Object.fromEntries(publicFlags.map((flag) => [flag, detections[flag]])),
    longRawPromptPersisted: detections.longRawPromptPersisted,
    unknownSensitiveFieldPersisted: detections.unknownSensitiveFieldPersisted,
    reasonCodes,
    evidencePointers: detectedFlags.map((flag) => sensitiveClassByFlag[flag]),
    boundary: 'manual_offline_redaction_scan_only',
  };
}

export function summarizeRedactionGate(results) {
  const rejected = results.filter((result) => result.redactionGate === 'reject');
  const publicPersisted = Object.fromEntries(publicFlags.map((flag) => [flag, results.some((result) => result[flag])]));
  return {
    redactionGate: rejected.length === 0 ? 'pass' : 'reject',
    ...publicPersisted,
  };
}

export function expectedPassingRedactionGateOutput() {
  return {
    redactionGate: 'pass',
    rawPersisted: false,
    secretLikePersisted: false,
    privatePathPersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
  };
}
