import { DECISIONS, classifyAction } from './types.mjs';
import { validateCoverage, validateReceipt } from './receipt-validators.mjs';

export function decideAction(packet = {}) {
  const reasons = [];
  const actionClass = classifyAction(packet.proposedAction ?? {});

  if (actionClass.requiresHuman) {
    return finish(packet, DECISIONS.ASK_HUMAN, [`action requires human or is unknown: ${packet.proposedAction?.verb ?? 'unknown'}`]);
  }

  for (const conflict of packet.conflicts ?? []) {
    if (conflict.status === 'unresolved' || conflict.status === 'requires_human') {
      return finish(packet, DECISIONS.FETCH_ABSTAIN, [`unresolved conflict: ${conflict.conflictId ?? 'unknown'}`]);
    }
  }

  const coverage = validateCoverage(packet.coverage ?? {});
  if (!coverage.ok) return finish(packet, coverage.decisionIfFailed, coverage.reasons);

  if (!Array.isArray(packet.receipts) || packet.receipts.length === 0) {
    return finish(packet, DECISIONS.FETCH_ABSTAIN, ['no receipt supplied']);
  }

  for (const receipt of packet.receipts) {
    const validation = validateReceipt(receipt);
    if (!validation.ok) reasons.push(...validation.reasons);
  }

  if (reasons.length) return finish(packet, DECISIONS.FETCH_ABSTAIN, reasons);
  return finish(packet, DECISIONS.ALLOW_LOCAL_SHADOW, ['complete current local receipt and coverage for low-risk local action']);
}

function finish(packet, decision, reasons) {
  return { ...packet, decision, reasons };
}
