export const DECISIONS = Object.freeze({
  ALLOW_LOCAL_SHADOW: 'allow_local_shadow',
  FETCH_ABSTAIN: 'fetch_abstain',
  ASK_HUMAN: 'ask_human',
  BLOCK_LOCAL: 'block_local',
});

export const LOCAL_ACTION_VERBS = new Set([
  'write_doc',
  'run_local_test',
  'prepare_draft',
  'create_local_fixture',
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

export const REQUIRED_RECEIPT_FIELDS = Object.freeze([
  'sourceArtifactId',
  'sourceArtifactPath',
  'producedAt',
  'receiverFreshness',
  'effectBoundary',
  'promotionBoundary',
  'lineage',
  'nextAllowedAction',
]);

export function missingFields(object, fields = REQUIRED_RECEIPT_FIELDS) {
  return fields.filter((field) => object?.[field] === undefined || object?.[field] === null || object?.[field] === '');
}

export function classifyAction(action = {}) {
  const verb = action.verb ?? 'unknown';
  if (HUMAN_REQUIRED_VERBS.has(verb)) return { riskTier: 'sensitive', requiresHuman: true };
  if (LOCAL_ACTION_VERBS.has(verb) && action.riskTier !== 'sensitive') return { riskTier: action.riskTier ?? 'low_local', requiresHuman: false };
  return { riskTier: 'unknown', requiresHuman: true };
}
