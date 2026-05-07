#!/usr/bin/env node
import { createHash } from 'node:crypto';

const current = {
  ledgerId: 'SynapticMeshContradictionLedger:2026-05-03-memory-retrieval-contradiction-lab',
  sourcePath: 'runs/2026-05-03-memory-retrieval-contradiction-lab/memory-retrieval-contradiction-lab.agentflow.md',
  retrievalIndexDigest: 'sha256:idx-4e7c9f2a-local-shadow',
  routeFamilies: ['boundary', 'missing', 'decision', 'source', 'staleness'],
  issuedAt: '2026-05-06T14:50:00Z',
  maxAgeMinutes: 20,
};

const now = Date.parse('2026-05-06T15:00:00Z');

function receipt(overrides = {}) {
  return {
    type: 'synaptic-mesh-boundary-coverage-receipt-v0',
    ledgerId: current.ledgerId,
    sourcePath: current.sourcePath,
    retrievalIndexDigest: current.retrievalIndexDigest,
    routeFamilies: [...current.routeFamilies],
    highBoundaryTotal: 8,
    retrievedHighBoundary: 8,
    missingHighBoundaryDigest: 'sha256:none',
    coverageDecision: 'allow_local_shadow',
    requestedAction: 'local_shadow_report',
    issuedAt: current.issuedAt,
    maxAgeMinutes: current.maxAgeMinutes,
    ...overrides,
  };
}

const cases = [
  { id: 'exact_current_source_bound_receipt', expect: 'allow_local_shadow', input: receipt() },
  { id: 'stale_receipt_fails_closed', expect: 'fetch_abstain', input: receipt({ issuedAt: '2026-05-06T13:55:00Z' }) },
  { id: 'ledger_id_mismatch_fails_closed', expect: 'fetch_abstain', input: receipt({ ledgerId: 'SynapticMeshContradictionLedger:other-run' }) },
  { id: 'source_path_swap_fails_closed', expect: 'fetch_abstain', input: receipt({ sourcePath: 'runs/2026-05-03-memory-retrieval-contradiction-lab/other.agentflow.md' }) },
  { id: 'retrieval_index_digest_mismatch_fails_closed', expect: 'fetch_abstain', input: receipt({ retrievalIndexDigest: 'sha256:idx-stale-or-swapped' }) },
  { id: 'route_family_coverage_mismatch_fails_closed', expect: 'fetch_abstain', input: receipt({ routeFamilies: ['boundary', 'missing', 'decision', 'source'] }) },
  { id: 'complete_counts_wrong_source_cannot_allow', expect: 'fetch_abstain', input: receipt({ sourcePath: 'handoff.md', highBoundaryTotal: 8, retrievedHighBoundary: 8 }) },
  { id: 'sensitive_requested_action_asks_human', expect: 'ask_human', input: receipt({ requestedAction: 'promote_to_runtime_enforcement' }) },
  { id: 'local_diagnostic_report_allowed', expect: 'allow_local_shadow', input: receipt({ requestedAction: 'local_diagnostic_report' }) },
];

const sensitiveActions = new Set([
  'promote_to_runtime_enforcement',
  'write_permanent_memory',
  'change_config',
  'publish_external',
  'delete_files',
  'run_canary',
]);

function sameSet(a = [], b = []) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x) => b.includes(x));
}

function ageMinutes(issuedAt) {
  const t = Date.parse(issuedAt);
  if (!Number.isFinite(t)) return Infinity;
  return (now - t) / 60000;
}

function decide(r) {
  if (r?.type !== 'synaptic-mesh-boundary-coverage-receipt-v0') return { decision: 'fetch_abstain', reason: 'wrong_receipt_type' };
  if (sensitiveActions.has(r.requestedAction)) return { decision: 'ask_human', reason: 'sensitive_action_not_authorized_by_receipt' };
  if (r.ledgerId !== current.ledgerId) return { decision: 'fetch_abstain', reason: 'ledger_id_mismatch' };
  if (r.sourcePath !== current.sourcePath) return { decision: 'fetch_abstain', reason: 'source_path_mismatch' };
  if (r.retrievalIndexDigest !== current.retrievalIndexDigest) return { decision: 'fetch_abstain', reason: 'retrieval_index_digest_mismatch' };
  if (!sameSet(r.routeFamilies, current.routeFamilies)) return { decision: 'fetch_abstain', reason: 'route_family_coverage_mismatch' };
  if (ageMinutes(r.issuedAt) < 0 || ageMinutes(r.issuedAt) > r.maxAgeMinutes) return { decision: 'fetch_abstain', reason: 'receipt_stale_or_future' };
  if (r.retrievedHighBoundary !== r.highBoundaryTotal) return { decision: 'fetch_abstain', reason: 'boundary_count_mismatch' };
  if (r.missingHighBoundaryDigest !== 'sha256:none') return { decision: 'fetch_abstain', reason: 'missing_boundary_digest_nonempty' };
  if (r.coverageDecision !== 'allow_local_shadow') return { decision: 'fetch_abstain', reason: 'receipt_decision_not_allow' };
  if (!['local_shadow_report', 'local_diagnostic_report'].includes(r.requestedAction)) return { decision: 'ask_human', reason: 'unknown_action_requires_human' };
  return { decision: 'allow_local_shadow', reason: 'fresh_exact_source_bound_receipt' };
}

const results = cases.map((c) => {
  const actual = decide(c.input);
  return { id: c.id, expect: c.expect, ...actual, pass: actual.decision === c.expect };
});

const summary = {
  verdict: results.every((r) => r.pass) ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: results.filter((r) => r.pass).length,
  allowedCases: results.filter((r) => r.decision === 'allow_local_shadow').length,
  failClosedCases: results.filter((r) => r.decision === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.decision === 'ask_human').length,
  unsafeAllows: results.filter((r) => r.id !== 'exact_current_source_bound_receipt' && r.id !== 'local_diagnostic_report_allowed' && r.decision === 'allow_local_shadow').length,
  falseRejectsForValidLocal: results.filter((r) => ['exact_current_source_bound_receipt', 'local_diagnostic_report_allowed'].includes(r.id) && r.decision !== 'allow_local_shadow').length,
  blockedReasons: results
    .filter((r) => r.decision !== 'allow_local_shadow')
    .reduce((acc, r) => ({ ...acc, [r.reason]: (acc[r.reason] || 0) + 1 }), {}),
};

const conclusion = summary.verdict === 'pass' && summary.unsafeAllows === 0 && summary.falseRejectsForValidLocal === 0
  ? 'Coverage receipts can stay compact only if source-bound: ledger id, source path, retrieval index digest, route-family coverage, and freshness must all match the current run; sensitive actions still require a human.'
  : 'Source binding is insufficient; keep coverage receipts advisory and fetch/ask instead of allowing.';

const receiptDigest = createHash('sha256').update(JSON.stringify({ current, summary, conclusion })).digest('hex').slice(0, 16);
console.log(JSON.stringify({ summary, conclusion, receiptDigest, results }, null, 2));
if (summary.verdict !== 'pass' || summary.unsafeAllows || summary.falseRejectsForValidLocal) process.exitCode = 1;
