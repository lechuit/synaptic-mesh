import { AMBIGUOUS_ACTION_VERBS, DECISIONS, HUMAN_REQUIRED_VERBS, LOCAL_ACTION_VERBS } from './types.mjs';
import { parseCompactReceipt, RECEIPT_FIELD_ALIASES, REQUIRED_COMPACT_RECEIPT_FIELDS } from './receipt-parser.mjs';

const LOCAL_SCOPE_PATTERN = /^(local|local_only|shadow|local_shadow|local_doc|report)(?:[_-].*)?$/i;
const CURRENT_FRESHNESS_PATTERN = /^(current|fresh|same_run)$/i;
const RESTRICTIVE_PROMOTION_PATTERN = /(no_|human|manual|shadow|local)/i;
const SENSITIVE_SCOPE_PATTERN = /(external|runtime|config|delete|publish|production|canary|l2|operational|telegram|email|network)/i;
const RESTRICTIVE_LINEAGE_PATTERN = /(human_required|requires_human|denied|forbid|forbidden|revoked|stale|sealed|private|external|publish|runtime|config|delete|l2|operational|canary|production)/i;

export function validateCompactReceiptForAction(input, options = {}) {
  const parsed = typeof input === 'string' ? parseCompactReceipt(input) : cloneParsed(input);
  const reasons = [...(parsed.errors ?? [])];
  const authority = parsed.authority ?? {};
  const action = options.proposedAction ?? {};

  const missing = REQUIRED_COMPACT_RECEIPT_FIELDS.filter((key) => parsed.fields?.[key] === undefined || parsed.fields?.[key] === '');
  if (missing.length) reasons.push(`missing compact authority fields: ${missing.join(', ')}`);

  const expected = options.expectedSource ?? {};
  if (expected.sourceArtifactId && authority.sourceArtifactId !== expected.sourceArtifactId) reasons.push('source id mismatch');
  if (expected.sourceArtifactPath && authority.sourceArtifactPath !== expected.sourceArtifactPath) reasons.push('source path mismatch');
  if (expected.sourceDigest && authority.sourceDigest !== expected.sourceDigest) reasons.push('source digest mismatch');

  reasons.push(...validateSourceFreshness(authority, options.sourceFreshnessPolicy));

  if (authority.receiverFreshness && !CURRENT_FRESHNESS_PATTERN.test(authority.receiverFreshness)) reasons.push(`freshness is not current: ${authority.receiverFreshness}`);
  reasons.push(...validateProducedAtFreshness(authority.producedAt, options.receiverFreshnessPolicy));
  if (authority.effectScope && !LOCAL_SCOPE_PATTERN.test(authority.effectScope)) reasons.push(`scope is not local shadow: ${authority.effectScope}`);
  if (authority.effectScope && SENSITIVE_SCOPE_PATTERN.test(authority.effectScope)) reasons.push(`scope contains sensitive effect: ${authority.effectScope}`);
  if (authority.promotionBoundary && !RESTRICTIVE_PROMOTION_PATTERN.test(authority.promotionBoundary)) reasons.push(`promotion boundary is not restrictive: ${authority.promotionBoundary}`);
  if (authority.negativeBoundary && SENSITIVE_SCOPE_PATTERN.test(authority.negativeBoundary) === false) reasons.push('negative boundary does not explicitly exclude sensitive effects');
  if (authority.lineageReceipt && authority.lineageReceipt !== 'none' && RESTRICTIVE_LINEAGE_PATTERN.test(authority.lineageReceipt)) reasons.push(`lineage receipt is not clear: ${authority.lineageReceipt}`);
  if (authority.nextAllowedAction && SENSITIVE_SCOPE_PATTERN.test(authority.nextAllowedAction)) reasons.push(`receipt next allowed action contains sensitive effect: ${authority.nextAllowedAction}`);

  if (actionRequiresHuman(action)) {
    return finish(parsed, DECISIONS.ASK_HUMAN, [`action requires human or is unknown/sensitive: ${action.verb ?? 'unknown'}`, ...reasons]);
  }

  if (reasons.length) return finish(parsed, DECISIONS.FETCH_ABSTAIN, reasons);
  return finish(parsed, DECISIONS.ALLOW_LOCAL_SHADOW, ['compact receipt is current, source-matched, local-only, and action is low-risk local']);
}

function validateSourceFreshness(authority, policy) {
  if (!policy) return [];

  const reasons = [];
  const profile = policy.profile ?? policy.mode ?? 'strict';
  const diagnosticOptional = profile === 'diagnostic_optional';
  if (profile !== 'strict' && !diagnosticOptional) return [`source freshness policy has unsupported profile: ${profile}`];

  const hasSourceMtime = policy.sourceMtime !== undefined && policy.sourceMtime !== '';
  const hasRunPair = Boolean(policy.sourceRunId && policy.currentRunId);
  const hasObservedDigest = Boolean(policy.observedSourceDigest);
  if (diagnosticOptional && !hasSourceMtime && !hasRunPair && !hasObservedDigest) {
    reasons.push('diagnostic optional source freshness policy has no observed source evidence');
  }

  if (!diagnosticOptional || hasSourceMtime) {
    const receiverNowMs = Date.parse(policy.receiverNow ?? '');
    if (!Number.isFinite(receiverNowMs)) return ['source freshness policy has invalid receiverNow timestamp'];

    const maxSourceAgeMs = Number(policy.maxSourceAgeMs);
    if (!Number.isFinite(maxSourceAgeMs) || maxSourceAgeMs < 0) return ['source freshness policy has invalid maxSourceAgeMs'];

    const sourceMtimeMs = Date.parse(policy.sourceMtime ?? '');
    if (!Number.isFinite(sourceMtimeMs)) reasons.push('missing or invalid source artifact mtime under source freshness policy');
    else if (receiverNowMs - sourceMtimeMs > maxSourceAgeMs) reasons.push(`source artifact mtime exceeds receiver max source age: ${policy.sourceMtime}`);
    else if (sourceMtimeMs - receiverNowMs > Number(policy.allowedFutureSkewMs ?? 0)) reasons.push(`source artifact mtime is in the future beyond receiver skew: ${policy.sourceMtime}`);
  }

  if (diagnosticOptional) {
    if (hasRunPair && policy.sourceRunId !== policy.currentRunId) reasons.push('source artifact run id is not current');
  } else if (policy.currentRunId && policy.sourceRunId !== policy.currentRunId) {
    reasons.push('source artifact run id is not current');
  }

  if (policy.observedSourceDigest && authority.sourceDigest !== policy.observedSourceDigest) reasons.push('receipt digest does not match observed source digest');

  return reasons;
}

function validateProducedAtFreshness(producedAt, policy) {
  if (!policy) return [];

  const reasons = [];
  if (!producedAt) return ['missing produced-at timestamp under receiver freshness policy'];

  const producedMs = Date.parse(producedAt);
  if (!Number.isFinite(producedMs)) return [`produced-at timestamp is invalid: ${producedAt}`];

  const receiverNowMs = Date.parse(policy.receiverNow ?? '');
  if (!Number.isFinite(receiverNowMs)) return ['receiver freshness policy has invalid receiverNow timestamp'];

  const maxAgeMs = Number(policy.maxAgeMs);
  if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) return ['receiver freshness policy has invalid maxAgeMs'];

  const futureSkewMs = Number(policy.allowedFutureSkewMs ?? 0);
  if (!Number.isFinite(futureSkewMs) || futureSkewMs < 0) return ['receiver freshness policy has invalid future skew'];
  if (futureSkewMs > maxAgeMs) return ['receiver freshness policy has excessive future skew'];

  const ageMs = receiverNowMs - producedMs;
  if (ageMs < -futureSkewMs) reasons.push(`produced-at timestamp is in the future beyond receiver skew: ${producedAt}`);
  if (ageMs > maxAgeMs) reasons.push(`produced-at timestamp exceeds receiver max age: ${producedAt}`);

  return reasons;
}

function actionRequiresHuman(action = {}) {
  if (HUMAN_REQUIRED_VERBS.has(action.verb)) return true;
  if (AMBIGUOUS_ACTION_VERBS.has(action.verb)) return true;
  if (!LOCAL_ACTION_VERBS.has(action.verb)) return true;
  if (action.riskTier === 'sensitive') return true;
  return false;
}

function finish(parsed, decision, reasons) {
  return {
    decision,
    reasons,
    authority: { ...(parsed.authority ?? {}) },
    metadata: { ...(parsed.metadata ?? {}) },
    fieldAliases: RECEIPT_FIELD_ALIASES,
  };
}

function cloneParsed(parsed = {}) {
  return {
    ok: parsed.ok !== false,
    fields: { ...(parsed.fields ?? {}) },
    authority: { ...(parsed.authority ?? {}) },
    metadata: { ...(parsed.metadata ?? {}) },
    errors: [...(parsed.errors ?? [])],
  };
}
