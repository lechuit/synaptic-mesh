export const LOCAL_ACTION_VERBS = new Set([
  'write_doc',
  'run_local_test',
  'prepare_draft',
  'create_local_fixture',
]);

export const AMBIGUOUS_ACTION_VERBS = new Set([
  'tool_call',
  'invoke',
  'execute',
  'dispatch',
  'function_call',
  'handoff',
  'delegate',
  'agent_action',
]);

export const HUMAN_REQUIRED_VERBS = new Set([
  'send_external',
  'http_request',
  'network_call',
  'email_send',
  'message_send',
  'change_config',
  'update_settings',
  'modify_runtime_config',
  'promote_memory',
  'write_memory',
  'delete',
  'remove_file',
  'rm',
  'publish',
  'post_public',
  'release_publish',
  'runtime_integrate',
  'install_runtime_hook',
  'canary_enable',
  'production_use',
  'l2_operational_use',
]);

const sensitiveActionStrategy = Object.freeze({
  id: 'sensitive-verb',
  matches(action) {
    return HUMAN_REQUIRED_VERBS.has(action.verb);
  },
  classify() {
    return { riskTier: 'sensitive', requiresHuman: true };
  },
  humanReason(action) {
    return `action requires human or is unknown/sensitive: ${action.verb ?? 'unknown'}`;
  },
});

const ambiguousActionStrategy = Object.freeze({
  id: 'ambiguous-framework-verb',
  matches(action) {
    return AMBIGUOUS_ACTION_VERBS.has(action.verb);
  },
  classify() {
    return { riskTier: 'ambiguous', requiresHuman: true };
  },
  humanReason(action) {
    return `action requires human because verb is ambiguous: ${action.verb ?? 'unknown'}`;
  },
});

const localActionStrategy = Object.freeze({
  id: 'local-low-risk-verb',
  matches(action) {
    return LOCAL_ACTION_VERBS.has(action.verb) && action.riskTier !== 'sensitive';
  },
  classify(action) {
    return { riskTier: action.riskTier ?? 'low_local', requiresHuman: false };
  },
});

const unknownActionStrategy = Object.freeze({
  id: 'unknown-or-sensitive-fallback',
  matches() {
    return true;
  },
  classify() {
    return { riskTier: 'unknown', requiresHuman: true };
  },
  humanReason(action) {
    return `action requires human or is unknown/sensitive: ${action.verb ?? 'unknown'}`;
  },
});

export const ACTION_POLICY_STRATEGIES = Object.freeze([
  sensitiveActionStrategy,
  ambiguousActionStrategy,
  localActionStrategy,
  unknownActionStrategy,
]);

export function classifyAction(action = {}) {
  return classifyReceiverAction(action).classification;
}

export function classifyReceiverAction(action = {}) {
  const normalized = { ...action, verb: action.verb ?? 'unknown' };
  const strategy = ACTION_POLICY_STRATEGIES.find((candidate) => candidate.matches(normalized));
  return {
    strategyId: strategy.id,
    classification: strategy.classify(normalized),
    humanReason: strategy.humanReason?.(normalized),
  };
}

export function actionRequiresHuman(action = {}) {
  return classifyReceiverAction(action).classification.requiresHuman;
}

export function humanRequiredReason(action = {}) {
  return classifyReceiverAction(action).humanReason ?? `action requires human or is unknown/sensitive: ${action.verb ?? 'unknown'}`;
}
