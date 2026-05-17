import assert from 'node:assert/strict';
import { decideAction } from '../src/decision-engine.mjs';
import { createActionContextPacket } from '../src/action-context-packet.mjs';

const goodReceipt = {
  sourceArtifactId: 'T-synaptic-mesh-reference-implementation-plan-v0',
  sourceArtifactPath: 'research-package/T-synaptic-mesh-reference-implementation-plan-v0.md',
  producedAt: '2026-05-06T17:22:00Z',
  receiverFreshness: 'current',
  effectBoundary: 'local_only_no_runtime_effect',
  promotionBoundary: 'no_memory_write_human_confirmation_required',
  lineage: 'successor_of_T-synaptic-mesh-threat-model-v0',
  nextAllowedAction: 'T-synaptic-mesh-shadow-schema-skeleton-v0_local_files_syntax_tests_only',
};

const allow = decideAction(createActionContextPacket({
  proposedAction: { verb: 'run_local_test', target: 'implementation/synaptic-mesh-shadow-v0/tests/smoke.mjs', riskTier: 'low_local' },
  receipts: [goodReceipt],
  coverage: { complete: true },
}));
assert.equal(allow.decision, 'allow_local_shadow');

const missing = decideAction(createActionContextPacket({
  proposedAction: { verb: 'run_local_test', target: 'local', riskTier: 'low_local' },
  receipts: [{ ...goodReceipt, sourceArtifactPath: '' }],
  coverage: { complete: true },
}));
assert.equal(missing.decision, 'fetch_abstain');
assert.match(missing.reasons.join('\n'), /sourceArtifactPath/);

const external = decideAction(createActionContextPacket({
  proposedAction: { verb: 'send_external', target: 'telegram', riskTier: 'sensitive' },
  receipts: [goodReceipt],
  coverage: { complete: true },
}));
assert.equal(external.decision, 'ask_human');

const incompleteCoverage = decideAction(createActionContextPacket({
  proposedAction: { verb: 'write_doc', target: 'local-doc', riskTier: 'low_local' },
  receipts: [goodReceipt],
  coverage: { complete: false },
}));
assert.equal(incompleteCoverage.decision, 'fetch_abstain');

console.log(JSON.stringify({
  verdict: 'pass',
  cases: 4,
  unsafeAllows: 0,
  decisions: {
    allowLocalShadow: allow.decision,
    missingField: missing.decision,
    externalEffect: external.decision,
    incompleteCoverage: incompleteCoverage.decision
  }
}, null, 2));
