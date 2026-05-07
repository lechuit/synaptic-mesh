export {
  ACTION_POLICY_STRATEGIES,
  AMBIGUOUS_ACTION_VERBS,
  HUMAN_REQUIRED_VERBS,
  LOCAL_ACTION_VERBS,
  actionRequiresHuman,
  classifyAction,
  classifyReceiverAction,
  humanRequiredReason,
} from './action-policy.mjs';

export const DECISIONS = Object.freeze({
  ALLOW_LOCAL_SHADOW: 'allow_local_shadow',
  FETCH_ABSTAIN: 'fetch_abstain',
  ASK_HUMAN: 'ask_human',
  BLOCK_LOCAL: 'block_local',
});


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

