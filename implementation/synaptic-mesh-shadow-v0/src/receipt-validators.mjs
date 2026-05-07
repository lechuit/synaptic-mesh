import { DECISIONS, REQUIRED_RECEIPT_FIELDS, missingFields } from './types.mjs';

export function validateReceipt(receipt = {}) {
  const missing = missingFields(receipt, REQUIRED_RECEIPT_FIELDS);
  const reasons = [];

  if (missing.length) reasons.push(`missing authority fields: ${missing.join(', ')}`);
  if (receipt.receiverFreshness && receipt.receiverFreshness !== 'current') reasons.push(`freshness is ${receipt.receiverFreshness}`);
  if (receipt.effectBoundary && !String(receipt.effectBoundary).includes('local') && !String(receipt.effectBoundary).includes('no_runtime')) {
    reasons.push(`effect boundary is not local/no_runtime: ${receipt.effectBoundary}`);
  }
  if (receipt.promotionBoundary && !String(receipt.promotionBoundary).includes('no_') && !String(receipt.promotionBoundary).includes('human')) {
    reasons.push(`promotion boundary is not restrictive: ${receipt.promotionBoundary}`);
  }

  return {
    ok: reasons.length === 0,
    missing,
    reasons,
    decisionIfFailed: DECISIONS.FETCH_ABSTAIN,
  };
}

export function validateCoverage(coverage = {}) {
  if (coverage.complete === true) return { ok: true, reasons: [] };
  return { ok: false, reasons: ['high-boundary coverage incomplete or unknown'], decisionIfFailed: DECISIONS.FETCH_ABSTAIN };
}
