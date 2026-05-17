import { validateCompactReceiptForAction } from './receipt-validator.mjs';

const DEFAULT_BOUNDARY = Object.freeze([
  'adapter_contract_only',
  'local_shadow_only',
  'not_framework_integration',
  'not_runtime_enforcement',
  'no_external_effects',
]);

export function createReceiverPolicyAdapter(definition = {}) {
  const adapterId = definition.adapterId ?? 'generic-receiver-policy-adapter-v0';
  const mapPacket = definition.mapPacket ?? defaultMapPacket;
  const boundary = [...(definition.boundary ?? DEFAULT_BOUNDARY)];

  return Object.freeze({
    adapterId,
    boundary,
    evaluate(packet = {}) {
      const mapped = mapPacket(packet);
      const validation = validateAdapterMapping(mapped);
      if (!validation.ok) {
        return finish(adapterId, boundary, mapped, 'fetch_abstain', validation.reasons);
      }

      const result = validateCompactReceiptForAction(mapped.receipt, {
        expectedSource: mapped.expectedSource,
        proposedAction: mapped.proposedAction,
        receiverFreshnessPolicy: mapped.receiverFreshnessPolicy,
        sourceFreshnessPolicy: mapped.sourceFreshnessPolicy,
      });

      return finish(adapterId, boundary, mapped, result.decision, result.reasons, {
        authority: result.authority,
        metadata: result.metadata,
      });
    },
  });
}

export function defaultMapPacket(packet = {}) {
  return {
    receipt: packet.receipt ?? packet.compactReceipt ?? packet.handoff?.receipt,
    expectedSource: packet.expectedSource ?? packet.source ?? {},
    proposedAction: packet.proposedAction ?? packet.action ?? {},
    receiverFreshnessPolicy: packet.receiverFreshnessPolicy,
    sourceFreshnessPolicy: packet.sourceFreshnessPolicy,
    framework: packet.framework ?? 'generic',
    packetId: packet.packetId,
  };
}

export function validateAdapterMapping(mapped = {}) {
  const reasons = [];
  if (typeof mapped.receipt !== 'string' || mapped.receipt.trim() === '') reasons.push('adapter mapping missing compact receipt string');
  if (!mapped.expectedSource || typeof mapped.expectedSource !== 'object') reasons.push('adapter mapping missing expected source object');
  if (!mapped.proposedAction || typeof mapped.proposedAction !== 'object') reasons.push('adapter mapping missing proposed action object');
  if (!mapped.proposedAction?.verb) reasons.push('adapter mapping missing proposed action verb');
  return { ok: reasons.length === 0, reasons };
}

function finish(adapterId, boundary, mapped, decision, reasons, extra = {}) {
  return {
    adapterId,
    framework: mapped?.framework ?? 'generic',
    packetId: mapped?.packetId,
    decision,
    reasons,
    boundary,
    mapped: {
      hasReceipt: typeof mapped?.receipt === 'string' && mapped.receipt.length > 0,
      expectedSource: mapped?.expectedSource ?? {},
      proposedAction: mapped?.proposedAction ?? {},
      hasReceiverFreshnessPolicy: Boolean(mapped?.receiverFreshnessPolicy),
      hasSourceFreshnessPolicy: Boolean(mapped?.sourceFreshnessPolicy),
    },
    ...extra,
  };
}
