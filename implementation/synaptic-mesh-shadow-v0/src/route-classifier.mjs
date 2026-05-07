const sensitiveSignals = new Set([
  'CONFIG_CHANGE_PROMOTION',
  'RUNTIME_OR_PERMANENT_MEMORY_BOUNDARY',
  'RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW',
  'HIDDEN_SENSITIVE_PROMOTION',
  'CONFLICTING_VALID_RECEIPTS',
  'DESTRUCTIVE_DELETE_REQUEST',
  'EXTERNAL_PUBLICATION_PROMOTION',
]);

const sensitiveWarnings = new Set([
  'CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT',
  'CONFIG_CHANGE_PROMOTION_IN_RECEIPT',
  'FOLDED_INDEX_HIDES_SENSITIVE_PROMOTION',
  'SENSITIVE_BOUNDARY_PROMOTION_IN_FREE_TEXT',
  'SENDER_OVERCLAIMS_HUMAN_APPROVAL',
  'MULTIPLE_VALID_RECEIPTS_CONFLICT',
]);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasAny(values = [], candidates) {
  return values.some((value) => candidates.has(value));
}

function rejectedRoutes(selectedRoute, reasons = []) {
  const primary = reasons[0] ?? 'ROUTE_SELECTED_BY_SHADOW_CLASSIFIER';
  const noSensitive = reasons.includes('NO_SENSITIVE_PROMOTION') || reasons.includes('NO_RECEIPT_CANDIDATE') ? 'NO_SENSITIVE_PROMOTION' : primary;
  const map = {
    block: { shadow_only: reasons, ask_human: ['EXPLICITLY_FORBIDDEN_EFFECT_REQUESTED'], request_full_receipt: ['EXPLICITLY_FORBIDDEN_EFFECT_REQUESTED'] },
    ask_human: { shadow_only: reasons, fetch_source: ['HUMAN_AUTHORITY_REQUIRED_FOR_SENSITIVE_BOUNDARY'], request_full_receipt: ['HUMAN_AUTHORITY_REQUIRED_FOR_SENSITIVE_BOUNDARY'] },
    fetch_source: { shadow_only: reasons, ask_human: [noSensitive], request_full_receipt: ['SOURCE_REFRESH_PREFERRED'] },
    request_full_receipt: { shadow_only: reasons, ask_human: [noSensitive], fetch_source: ['FULL_RECEIPT_PREFERRED'] },
    request_policy_refresh: { shadow_only: reasons, ask_human: [noSensitive], fetch_source: ['POLICY_REFRESH_PREFERRED'] },
    request_grammar_refresh: { shadow_only: reasons, ask_human: [noSensitive], request_full_receipt: ['GRAMMAR_REFRESH_PREFERRED'] },
    shadow_only: { ask_human: ['NO_SENSITIVE_SIGNAL'], fetch_source: ['SOURCE_CURRENT'], request_full_receipt: ['RECEIPT_VALID'] },
    abstain: { shadow_only: reasons, ask_human: [noSensitive], request_full_receipt: ['AUTHORITY_AMBIGUOUS'] },
  };
  return map[selectedRoute] ?? { abstain: ['UNKNOWN_ROUTE'] };
}

function decision(route, { reasons, decisiveSignals, compactAllowed = false, humanRequired = false, rejected } = {}) {
  const cleanReasons = unique(reasons);
  return {
    selectedRoute: route,
    humanRequired: route === 'ask_human' ? true : humanRequired,
    compactAllowed: route === 'shadow_only' ? compactAllowed : false,
    reasonCodes: cleanReasons,
    decisiveSignals: unique(decisiveSignals ?? cleanReasons),
    rejectedRoutes: rejected ?? rejectedRoutes(route, cleanReasons),
    classifier: {
      id: 'deterministic-route-classifier-v0',
      mode: 'shadow_only_fixture_evaluation',
      runtimeEnforcement: false,
      toolAuthorization: false,
    },
  };
}

export function classifyRoute({ parserEvidence = {}, routeDecisionInput = {} } = {}) {
  const warnings = parserEvidence.normalizationWarnings ?? [];
  const signals = parserEvidence.sensitiveSignals ?? [];
  const attempts = parserEvidence.freeTextAuthorityAttempts ?? [];
  const summary = routeDecisionInput.candidateSummary ?? {};
  const summarySignals = summary.sensitiveSignals ?? [];
  const combinedSignals = unique([...signals, ...summarySignals]);

  if (warnings.includes('EXPLICITLY_FORBIDDEN_EFFECT_REQUESTED') || signals.includes('DESTRUCTIVE_DELETE_REQUEST')) {
    return decision('block', { reasons: ['EXPLICITLY_FORBIDDEN_EFFECT_REQUESTED', 'DESTRUCTIVE_DELETE_REQUEST'], decisiveSignals: ['EXPLICITLY_FORBIDDEN_EFFECT_REQUESTED', 'DESTRUCTIVE_DELETE_REQUEST'] });
  }

  if (warnings.includes('POLICY_CHECKSUM_STALE') || warnings.includes('POLICY_CLOCK_MISSING') || warnings.includes('POLICY_REFRESH_REQUIRED')) {
    const reason = warnings.includes('POLICY_CLOCK_MISSING') ? 'POLICY_CLOCK_MISSING' : 'POLICY_CHECKSUM_STALE';
    return decision('request_policy_refresh', { reasons: [reason, 'POLICY_REFRESH_REQUIRED'], decisiveSignals: [reason, 'NO_SENSITIVE_PROMOTION'] });
  }

  if (warnings.includes('GRAMMAR_DIGEST_UNKNOWN') || warnings.includes('GRAMMAR_VERSION_ROLLBACK') || warnings.includes('GRAMMAR_REFRESH_REQUIRED')) {
    const reason = warnings.includes('GRAMMAR_VERSION_ROLLBACK') ? 'GRAMMAR_VERSION_ROLLBACK' : 'GRAMMAR_DIGEST_UNKNOWN';
    return decision('request_grammar_refresh', { reasons: [reason, 'GRAMMAR_REFRESH_REQUIRED'], decisiveSignals: [reason, 'NO_SENSITIVE_PROMOTION'] });
  }

  if (warnings.includes('MULTIPLE_VALID_RECEIPTS_CONFLICT') && !hasAny(combinedSignals, sensitiveSignals)) {
    return decision('request_full_receipt', { reasons: ['MULTIPLE_VALID_RECEIPTS_CONFLICT', 'FULL_RECEIPT_REQUIRED_FOR_LOCAL_CONFLICT'], decisiveSignals: ['MULTIPLE_VALID_RECEIPTS_CONFLICT', 'NO_SENSITIVE_PROMOTION'] });
  }

  if (hasAny(combinedSignals, sensitiveSignals) || hasAny(warnings, sensitiveWarnings) || attempts.includes('SENDER_LABEL_APPROVAL')) {
    if (warnings.includes('MULTIPLE_VALID_RECEIPTS_CONFLICT') || signals.includes('CONFLICTING_VALID_RECEIPTS')) {
      return decision('ask_human', { reasons: ['MULTIPLE_VALID_RECEIPTS_CONFLICT', 'CONFIG_CHANGE_PROMOTION_IN_RECEIPT', 'CONFLICTING_VALID_RECEIPTS'], decisiveSignals: ['MULTIPLE_VALID_RECEIPTS_CONFLICT', 'CONFIG_CHANGE_PROMOTION'] });
    }
    if (warnings.includes('SENDER_OVERCLAIMS_HUMAN_APPROVAL')) {
      return decision('ask_human', { reasons: ['FREE_TEXT_NOT_AUTHORITY', 'SENDER_OVERCLAIMS_HUMAN_APPROVAL', 'RUNTIME_OR_PERMANENT_MEMORY_BOUNDARY'], decisiveSignals: ['SENDER_OVERCLAIMS_HUMAN_APPROVAL', 'CONFIG_CHANGE_PROMOTION', 'PERMANENT_MEMORY_BOUNDARY'] });
    }
    if (warnings.includes('FOLDED_INDEX_HIDES_SENSITIVE_PROMOTION') || signals.includes('RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW')) {
      return decision('ask_human', { reasons: ['FOLDED_INDEX_MISMATCH', 'HIDDEN_SENSITIVE_PROMOTION', 'RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW'], decisiveSignals: ['FOLDED_INDEX_MISMATCH', 'RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW'] });
    }
    if (warnings.includes('EXTERNAL_PUBLICATION_PROMOTION_IN_FREE_TEXT') || combinedSignals.includes('EXTERNAL_PUBLICATION_PROMOTION')) {
      return decision('ask_human', { reasons: ['FREE_TEXT_NOT_AUTHORITY', 'EXTERNAL_PUBLICATION_PROMOTION_IN_FREE_TEXT', 'EXTERNAL_PUBLICATION_PROMOTION'], decisiveSignals: ['EXTERNAL_PUBLICATION_PROMOTION', 'FREE_TEXT_AUTHORITY_ATTEMPT'] });
    }
    if (warnings.includes('PERMANENT_MEMORY_WRITE_REQUESTED')) {
      return decision('ask_human', { reasons: ['PERMANENT_MEMORY_WRITE_REQUESTED', 'RUNTIME_OR_PERMANENT_MEMORY_BOUNDARY'], decisiveSignals: ['PERMANENT_MEMORY_WRITE_REQUESTED', 'PERMANENT_MEMORY_BOUNDARY'] });
    }
    if (combinedSignals.includes('RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW')) {
      return decision('ask_human', { reasons: ['RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW'], decisiveSignals: ['RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW'] });
    }
    if (warnings.includes('CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT') && !combinedSignals.includes('RUNTIME_OR_PERMANENT_MEMORY_BOUNDARY')) {
      return decision('ask_human', { reasons: ['FREE_TEXT_NOT_AUTHORITY', 'CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT', 'CONFIG_CHANGE_PROMOTION'], decisiveSignals: ['CONFIG_CHANGE_PROMOTION', ...(warnings.includes('STALE_POLICY_WINDOW') ? ['STALE_POLICY_WINDOW'] : [])] });
    }
    return decision('ask_human', { reasons: ['FREE_TEXT_NOT_AUTHORITY', 'CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT', 'RUNTIME_OR_PERMANENT_MEMORY_BOUNDARY'], decisiveSignals: ['FREE_TEXT_AUTHORITY_ATTEMPT', 'CONFIG_CHANGE_PROMOTION', 'PERMANENT_MEMORY_BOUNDARY'] });
  }

  if (warnings.includes('STALE_POLICY_WINDOW') || warnings.includes('SOURCE_DIGEST_MISMATCH') || warnings.includes('SOURCE_REFRESH_REQUIRED') || summary.freshness === 'stale') {
    const reason = warnings.includes('SOURCE_DIGEST_MISMATCH') ? 'SOURCE_DIGEST_MISMATCH' : 'STALE_POLICY_WINDOW';
    return decision('fetch_source', { reasons: [reason, 'SOURCE_REFRESH_REQUIRED'], decisiveSignals: [reason, ...(reason === 'STALE_POLICY_WINDOW' ? ['SOURCE_DIGEST_REVALIDATION_REQUIRED'] : ['NO_SENSITIVE_PROMOTION'])] });
  }

  if (warnings.includes('NO_RECEIPT_CANDIDATE') || warnings.includes('AUTHORITY_AMBIGUOUS')) {
    const reasons = ['NO_RECEIPT_CANDIDATE', 'AUTHORITY_AMBIGUOUS', ...(warnings.includes('EMPTY_HANDOFF') ? ['EMPTY_HANDOFF'] : [])];
    return decision('abstain', { reasons, decisiveSignals: reasons });
  }

  if (warnings.includes('FOLDED_INDEX_MISMATCH')) {
    const reason = warnings.includes('BOUNDARY_COVERAGE_MISSING') ? 'BOUNDARY_COVERAGE_MISSING' : 'FULL_RECEIPT_REQUIRED_FOR_COMPACT_MISMATCH';
    return decision('request_full_receipt', { reasons: ['FOLDED_INDEX_MISMATCH', reason], decisiveSignals: ['FOLDED_INDEX_MISMATCH', 'NO_SENSITIVE_PROMOTION'] });
  }

  if (warnings.includes('NESTED_HANDOFF_BOUNDARY_LOSS')) {
    return decision('request_full_receipt', { reasons: ['NESTED_HANDOFF_BOUNDARY_LOSS', 'BOUNDARY_COVERAGE_MISSING'], decisiveSignals: ['NESTED_HANDOFF_BOUNDARY_LOSS', 'NO_SENSITIVE_PROMOTION'] });
  }

  if (warnings.includes('INVALID_RECEIPT_SCHEMA') || warnings.includes('BOUNDARY_COVERAGE_MISSING') || warnings.includes('MISSING_POLICY_CHECKSUM') || Number(parserEvidence.invalidReceipts ?? 0) > 0) {
    return decision('request_full_receipt', { reasons: unique(warnings.filter((code) => ['INVALID_RECEIPT_SCHEMA', 'MISSING_POLICY_CHECKSUM', 'BOUNDARY_COVERAGE_MISSING'].includes(code))).length ? unique(warnings.filter((code) => ['INVALID_RECEIPT_SCHEMA', 'MISSING_POLICY_CHECKSUM', 'BOUNDARY_COVERAGE_MISSING'].includes(code))) : ['INVALID_RECEIPT_SCHEMA'], decisiveSignals: ['INVALID_RECEIPT_SCHEMA', 'BOUNDARY_COVERAGE_MISSING', 'NO_SENSITIVE_PROMOTION'] });
  }

  if (routeDecisionInput.normalizedAuthorityLevel === 'local_shadow' && routeDecisionInput.normalizedActionEffect === 'text_only' && Number(parserEvidence.validReceipts ?? 0) > 0 && warnings.length === 0 && combinedSignals.length === 0) {
    return decision('shadow_only', { reasons: ['LOCAL_SHADOW_RECEIPT_CURRENT', 'LOCAL_SHADOW_BOUNDARY_COMPLETE'], decisiveSignals: ['VALID_LOCAL_SHADOW_RECEIPT', 'BOUNDARY_COMPLETE', 'NO_SENSITIVE_SIGNAL'], compactAllowed: true });
  }

  return decision('abstain', { reasons: ['AUTHORITY_AMBIGUOUS'], decisiveSignals: ['AUTHORITY_AMBIGUOUS'] });
}
