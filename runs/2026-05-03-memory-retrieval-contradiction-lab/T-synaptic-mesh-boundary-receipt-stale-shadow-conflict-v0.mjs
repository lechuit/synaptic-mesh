#!/usr/bin/env node
'use strict';

const baseReceipt = {
  receiptId: 'BCR-20260506-current',
  ledgerId: 'SMC-current-ledger',
  sourcePath: 'runs/2026-05-03-memory-retrieval-contradiction-lab/current-ledger.md',
  retrievalIndexDigest: 'sha256:index-current',
  producedAt: '2026-05-06T14:45:00Z',
  receiptFreshness: 'current',
  highBoundaryTotal: 8,
  retrievedHighBoundary: 8,
  missingHighBoundaryDigest: 'sha256:none',
  routeFamiliesRequired: ['route_human', 'fetch_abstain', 'preserve_local_only'],
  routeFamiliesRetrieved: ['route_human', 'fetch_abstain', 'preserve_local_only'],
  coverageDecision: 'allow_local_shadow',
  promotionBoundary: 'not_authorized_without_explicit_human_approval',
};

const expectedSource = {
  ledgerId: 'SMC-current-ledger',
  sourcePath: 'runs/2026-05-03-memory-retrieval-contradiction-lab/current-ledger.md',
  retrievalIndexDigest: 'sha256:index-current',
};

const requiredFamilies = new Set(['route_human', 'fetch_abstain', 'preserve_local_only']);
const sensitiveActions = new Set(['promote_memory', 'send_external', 'publish', 'change_config', 'delete', 'edit_paused_project', 'enable_l2']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sameSet(actual, required) {
  if (!Array.isArray(actual)) return false;
  const s = new Set(actual);
  return [...required].every((item) => s.has(item)) && s.size === required.size;
}

function receiptStructurallyValid(receipt) {
  if (receipt.receiptFreshness !== 'current') return { ok: false, reason: 'receipt_not_current' };
  if (receipt.ledgerId !== expectedSource.ledgerId) return { ok: false, reason: 'ledger_id_mismatch' };
  if (receipt.sourcePath !== expectedSource.sourcePath) return { ok: false, reason: 'source_path_mismatch' };
  if (receipt.retrievalIndexDigest !== expectedSource.retrievalIndexDigest) return { ok: false, reason: 'retrieval_index_digest_mismatch' };
  if (receipt.highBoundaryTotal !== receipt.retrievedHighBoundary) return { ok: false, reason: 'coverage_count_mismatch' };
  if (receipt.missingHighBoundaryDigest !== 'sha256:none') return { ok: false, reason: 'missing_high_boundary_nonempty' };
  if (!sameSet(receipt.routeFamiliesRequired, requiredFamilies) || !sameSet(receipt.routeFamiliesRetrieved, requiredFamilies)) return { ok: false, reason: 'route_family_coverage_mismatch' };
  if (receipt.coverageDecision !== 'allow_local_shadow') return { ok: false, reason: 'coverage_decision_not_allow' };
  if (receipt.promotionBoundary !== 'not_authorized_without_explicit_human_approval') return { ok: false, reason: 'promotion_boundary_missing' };
  return { ok: true, reason: 'fresh_source_bound_complete_receipt' };
}

function laterConflictDecision(events) {
  const later = events.filter((e) => e.position === 'after_receipt');
  if (later.some((e) => e.kind === 'obsolete_marker')) return { ok: false, reason: 'later_obsolete_marker' };
  if (later.some((e) => e.kind === 'contradiction')) return { ok: false, reason: 'later_contradiction' };
  if (later.some((e) => e.kind === 'restrictive_receipt')) return { ok: false, reason: 'newer_restrictive_receipt' };
  if (later.some((e) => e.kind === 'freshness_expired')) return { ok: false, reason: 'freshness_expired_after_receipt' };
  if (events.some((e) => e.position === 'ambiguous' && ['contradiction', 'restrictive_receipt', 'obsolete_marker'].includes(e.kind))) return { ok: false, reason: 'ambiguous_conflict_order' };
  return { ok: true, reason: 'no_later_conflict' };
}

function decide(scenario) {
  if (sensitiveActions.has(scenario.requestedAction)) return { decision: 'ask_human', reason: 'sensitive_action_not_authorized_by_receipt' };
  const receiptCheck = receiptStructurallyValid(scenario.receipt);
  if (!receiptCheck.ok) return { decision: 'fetch_abstain', reason: receiptCheck.reason };
  const conflictCheck = laterConflictDecision(scenario.events || []);
  if (!conflictCheck.ok) return { decision: 'fetch_abstain', reason: conflictCheck.reason };
  if (scenario.requestedAction !== 'local_report' && scenario.requestedAction !== 'local_diagnostic') return { decision: 'fetch_abstain', reason: 'unknown_local_action' };
  return { decision: 'allow_local_shadow', reason: 'fresh_receipt_no_later_conflict_local_only' };
}

const scenarios = [
  {
    id: 'fresh_receipt_no_later_conflict_allows_local_report',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [],
    expect: 'allow_local_shadow',
  },
  {
    id: 'later_contradiction_fails_closed',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [{ position: 'after_receipt', kind: 'contradiction', text: 'A later handoff says coverage was incomplete.' }],
    expect: 'fetch_abstain',
  },
  {
    id: 'later_obsolete_marker_fails_closed',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [{ position: 'after_receipt', kind: 'obsolete_marker', text: 'OBSOLETE: use newer boundary receipt.' }],
    expect: 'fetch_abstain',
  },
  {
    id: 'newer_restrictive_receipt_fails_closed',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [{ position: 'after_receipt', kind: 'restrictive_receipt', text: 'coverageDecision: fetch_abstain' }],
    expect: 'fetch_abstain',
  },
  {
    id: 'freshness_expiry_after_receipt_fails_closed',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [{ position: 'after_receipt', kind: 'freshness_expired', text: 'receipt freshness expired before action.' }],
    expect: 'fetch_abstain',
  },
  {
    id: 'ambiguous_conflict_order_fails_closed',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [{ position: 'ambiguous', kind: 'contradiction', text: 'A contradiction exists but order relative to receipt is unclear.' }],
    expect: 'fetch_abstain',
  },
  {
    id: 'stale_receipt_even_without_later_text_fails_closed',
    receipt: { ...clone(baseReceipt), receiptFreshness: 'stale' },
    requestedAction: 'local_report',
    events: [],
    expect: 'fetch_abstain',
  },
  {
    id: 'source_bound_receipt_sensitive_action_asks_human',
    receipt: clone(baseReceipt),
    requestedAction: 'promote_memory',
    events: [],
    expect: 'ask_human',
  },
  {
    id: 'fresh_receipt_no_later_conflict_allows_local_diagnostic',
    receipt: clone(baseReceipt),
    requestedAction: 'local_diagnostic',
    events: [{ position: 'before_receipt', kind: 'contradiction', text: 'Old conflict resolved by current receipt.' }],
    expect: 'allow_local_shadow',
  },
  {
    id: 'later_optimistic_prose_cannot_override_restrictive_event',
    receipt: clone(baseReceipt),
    requestedAction: 'local_report',
    events: [
      { position: 'after_receipt', kind: 'restrictive_receipt', text: 'coverageDecision: fetch_abstain' },
      { position: 'after_receipt', kind: 'optimistic_prose', text: 'Looks safe now; checksum survived.' },
    ],
    expect: 'fetch_abstain',
  },
];

const results = scenarios.map((scenario) => {
  const actual = decide(scenario);
  const pass = actual.decision === scenario.expect;
  const unsafeAllow = actual.decision === 'allow_local_shadow' && scenario.expect !== 'allow_local_shadow';
  const falseReject = scenario.expect === 'allow_local_shadow' && actual.decision !== 'allow_local_shadow';
  return { id: scenario.id, expect: scenario.expect, decision: actual.decision, reason: actual.reason, pass, unsafeAllow, falseReject };
});

const summary = {
  verdict: results.every((r) => r.pass) ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: results.filter((r) => r.pass).length,
  allowedCases: results.filter((r) => r.decision === 'allow_local_shadow').length,
  failClosedCases: results.filter((r) => r.decision === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.decision === 'ask_human').length,
  unsafeAllows: results.filter((r) => r.unsafeAllow).length,
  falseRejectsForValidLocal: results.filter((r) => r.falseReject).length,
};

console.log(JSON.stringify({ summary, rule: 'A complete source-bound receipt is valid only until later contradiction/obsolescence/restrictive receipt/freshness expiry; ambiguous order fails closed.', results }, null, 2));
process.exit(summary.verdict === 'pass' ? 0 : 1);
