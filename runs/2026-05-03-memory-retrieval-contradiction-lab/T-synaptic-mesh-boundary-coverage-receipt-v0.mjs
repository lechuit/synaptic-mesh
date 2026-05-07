#!/usr/bin/env node
'use strict';

// Local/shadow microtest: can a compact boundary-coverage receipt tell a
// SynapticMeshContradictionLedger receiver when a compact handoff is incomplete
// without loading the whole ledger?
// No external I/O beyond stdout.

const ledgerClaims = [
  { id: 'C1', boundary: 'local_only', mustSurface: false },
  { id: 'C2', boundary: 'sensitive_external', mustSurface: true },
  { id: 'C3', boundary: 'sensitive_runtime', mustSurface: true },
  { id: 'C4', boundary: 'authority_gap', mustSurface: true },
  { id: 'C5', boundary: 'sensitive_paused_project', mustSurface: true },
  { id: 'C6', boundary: 'local_only', mustSurface: false },
  { id: 'C7', boundary: 'revoked_or_stale', mustSurface: false },
  { id: 'C8', boundary: 'sensitive_config', mustSurface: true },
  { id: 'C9', boundary: 'local_only', mustSurface: true },
  { id: 'C10', boundary: 'authority_gap', mustSurface: true },
  { id: 'C11', boundary: 'local_only', mustSurface: false },
  { id: 'C12', boundary: 'sensitive_memory', mustSurface: true },
];

const highBoundaryIds = ledgerClaims
  .filter(c => c.boundary.startsWith('sensitive_') || c.boundary === 'authority_gap' || c.boundary === 'revoked_or_stale')
  .map(c => c.id);

const handoffs = [
  { name: 'top2_fragment', retrieved: ['C4', 'C12'] },
  { name: 'top5_sensitive_but_incomplete', retrieved: ['C4', 'C12', 'C5', 'C3', 'C8'] },
  { name: 'top8_missing_one_authority_gap', retrieved: ['C4', 'C12', 'C5', 'C3', 'C8', 'C2', 'C10', 'C9'] },
  { name: 'top9_complete_high_boundary', retrieved: ['C4', 'C12', 'C5', 'C3', 'C8', 'C2', 'C10', 'C9', 'C7'] },
  { name: 'tampered_claims_complete_without_count', retrieved: ['C4', 'C12', 'C5', 'C3', 'C8', 'C2', 'C10', 'C9'] },
];

function buildReceipt(handoff, mode = 'honest') {
  const retrievedHighBoundary = handoff.retrieved.filter(id => highBoundaryIds.includes(id));
  const missingHighBoundary = highBoundaryIds.filter(id => !retrievedHighBoundary.includes(id));
  const receipt = {
    highBoundaryTotal: highBoundaryIds.length,
    retrievedHighBoundary: retrievedHighBoundary.length,
    missingHighBoundaryDigest: missingHighBoundary.map(id => `${id}:${ledgerClaims.find(c => c.id === id).boundary}`),
    coverageDecision: missingHighBoundary.length === 0 ? 'complete' : 'incomplete_fetch_abstain',
  };

  if (mode === 'tampered_complete') {
    receipt.retrievedHighBoundary = receipt.highBoundaryTotal;
    receipt.missingHighBoundaryDigest = [];
    receipt.coverageDecision = 'complete';
  }
  return receipt;
}

function receiverFromReceipt(handoff, receipt) {
  const structuralMismatch = receipt.retrievedHighBoundary !== handoff.retrieved.filter(id => highBoundaryIds.includes(id)).length;
  const countIncomplete = receipt.retrievedHighBoundary < receipt.highBoundaryTotal;
  const digestIncomplete = receipt.missingHighBoundaryDigest.length > 0;
  const decisionMismatch = countIncomplete && receipt.coverageDecision === 'complete';

  if (structuralMismatch || decisionMismatch) return 'fetch_abstain_receipt_mismatch';
  if (countIncomplete || digestIncomplete || receipt.coverageDecision === 'incomplete_fetch_abstain') return 'fetch_abstain';
  return 'allow_complete_local_shadow';
}

const results = handoffs.map(handoff => {
  const mode = handoff.name === 'tampered_claims_complete_without_count' ? 'tampered_complete' : 'honest';
  const receipt = buildReceipt(handoff, mode);
  const receiverDecision = receiverFromReceipt(handoff, receipt);
  const trulyComplete = highBoundaryIds.every(id => handoff.retrieved.includes(id));
  return {
    name: handoff.name,
    retrieved: handoff.retrieved,
    receipt,
    trulyComplete,
    receiverDecision,
    ok: trulyComplete
      ? receiverDecision === 'allow_complete_local_shadow'
      : receiverDecision.startsWith('fetch_abstain'),
  };
});

const summary = {
  ok: results.every(r => r.ok),
  highBoundaryTotal: highBoundaryIds.length,
  incompleteReceiptsDetected: results.filter(r => !r.trulyComplete && r.receiverDecision.startsWith('fetch_abstain')).length,
  completeReceiptsAllowed: results.filter(r => r.trulyComplete && r.receiverDecision === 'allow_complete_local_shadow').length,
  receiptMismatchBlocks: results.filter(r => r.receiverDecision === 'fetch_abstain_receipt_mismatch').length,
  falseCompleteAllows: results.filter(r => !r.trulyComplete && r.receiverDecision === 'allow_complete_local_shadow').length,
  rule: 'Coverage receipts must expose highBoundaryTotal, retrievedHighBoundary, missingHighBoundaryDigest and coverageDecision; incomplete or mismatched receipts force fetch_abstain.',
};

console.log(JSON.stringify({ summary, results }, null, 2));
process.exit(summary.ok ? 0 : 1);
