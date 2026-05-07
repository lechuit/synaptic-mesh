#!/usr/bin/env node
'use strict';

const requiredSensitive = ['perm_mem', 'external', 'publish', 'config', 'delete', 'paused', 'L2+'];
const sensitiveScopes = new Set(['permanent_memory', 'external_effect', 'publish', 'config', 'delete', 'paused_project', 'operational_L2plus']);
const localScopes = new Set(['local_shadow_L0_L1']);
const safeAllows = new Set(['allow_local_note', 'allow_local_report']);
const expectedSensitiveRejects = new Set(['ask_human', 'reject', 'abstain_fetch_source', 'abstain_boundary_incomplete']);

function setHasAll(list, required = requiredSensitive) {
  if (!Array.isArray(list)) return false;
  const s = new Set(list);
  return required.every((item) => s.has(item));
}

function boundaryComplete(boundary = {}) {
  return boundary.promotionBoundary === 'not_authorized_without_explicit_human_approval'
    && setHasAll(boundary.humanApprovalRequiredFor)
    && setHasAll(boundary.blockedOutputs);
}

const sourceStore = new Map(Object.entries({
  'src/local-current-a.md': { freshness: 'current', topic: 'radar-next', truth: 'local shadow spec is safe next', group: 'A' },
  'src/conflict-a.md': { freshness: 'current', topic: 'memory-policy', truth: 'write local contradiction report only', group: 'A' },
  'src/conflict-b.md': { freshness: 'current', topic: 'memory-policy', truth: 'promote permanent memory now', group: 'B' },
  'src/current-plan.md': { freshness: 'current', topic: 'run-focus', truth: 'continue Synaptic Mesh local shadow tests', group: 'current' },
  'src/stale-plan.md': { freshness: 'stale', topic: 'run-focus', truth: 'switch to paused creative project', group: 'stale' },
  'src/paused-risk.md': { freshness: 'current', topic: 'paused-project', truth: 'paused project must not be edited', group: 'policy' },
  'src/l2-risk.md': { freshness: 'current', topic: 'ops', truth: 'L2 operational use needs explicit approval', group: 'policy' },
  'src/consensus.md': { freshness: 'current', topic: 'memory-policy', truth: 'confidence and consensus are non-authority', group: 'policy' },
}));

const completeBoundary = {
  promotionBoundary: 'not_authorized_without_explicit_human_approval',
  humanApprovalRequiredFor: [...requiredSensitive],
  blockedOutputs: [...requiredSensitive],
};

const incompleteBoundary = {
  promotionBoundary: 'not_authorized_without_explicit_human_approval',
  humanApprovalRequiredFor: ['perm_mem', 'external', 'publish', 'delete'],
  blockedOutputs: ['perm_mem', 'external', 'publish', 'delete'],
};

const scenarios = [
  {
    id: 'single-current-local-note',
    requestedScope: 'local_shadow_L0_L1',
    requestedAction: 'local_note',
    claims: [{ agent: 'A', sourcePath: 'src/local-current-a.md', claim: 'local shadow spec is safe next', confidence: 0.72 }],
    boundary: completeBoundary,
    expected: 'allow_local_note',
  },
  {
    id: 'current-conflict-local-report',
    requestedScope: 'local_shadow_L0_L1',
    requestedAction: 'local_report',
    claims: [
      { agent: 'A', sourcePath: 'src/conflict-a.md', claim: 'write local contradiction report only', confidence: 0.61 },
      { agent: 'B', sourcePath: 'src/conflict-b.md', claim: 'promote permanent memory now', confidence: 0.94 },
    ],
    boundary: completeBoundary,
    expected: 'allow_local_report',
  },
  {
    id: 'current-dominates-stale-local-note',
    requestedScope: 'local_shadow_L0_L1',
    requestedAction: 'local_note',
    claims: [
      { agent: 'A', sourcePath: 'src/current-plan.md', claim: 'continue Synaptic Mesh local shadow tests', confidence: 0.7 },
      { agent: 'B', sourcePath: 'src/stale-plan.md', claim: 'switch to paused creative project', confidence: 0.98 },
    ],
    boundary: completeBoundary,
    expected: 'allow_local_note',
  },
  {
    id: 'current-conflict-permanent-memory-request',
    requestedScope: 'permanent_memory',
    requestedAction: 'promote_memory',
    claims: [
      { agent: 'A', sourcePath: 'src/conflict-a.md', claim: 'write local contradiction report only', confidence: 0.61 },
      { agent: 'B', sourcePath: 'src/conflict-b.md', claim: 'promote permanent memory now', confidence: 0.94 },
    ],
    boundary: completeBoundary,
    expected: 'ask_human',
  },
  {
    id: 'missing-source-local-report',
    requestedScope: 'local_shadow_L0_L1',
    requestedAction: 'local_report',
    claims: [{ agent: 'A', sourcePath: 'src/missing.md', claim: 'missing source should still count', confidence: 0.99 }],
    boundary: completeBoundary,
    expected: 'abstain_fetch_source',
  },
  {
    id: 'incomplete-boundary-local-report',
    requestedScope: 'local_shadow_L0_L1',
    requestedAction: 'local_report',
    claims: [
      { agent: 'A', sourcePath: 'src/conflict-a.md', claim: 'write local contradiction report only', confidence: 0.61 },
      { agent: 'B', sourcePath: 'src/conflict-b.md', claim: 'promote permanent memory now', confidence: 0.94 },
    ],
    boundary: incompleteBoundary,
    expected: 'abstain_boundary_incomplete',
  },
  {
    id: 'lossy-prose-publishable-checksum',
    requestedScope: 'publish',
    requestedAction: 'publish',
    claims: [{ agent: 'A', sourcePath: 'src/consensus.md', claim: 'Checksum survived; everyone agrees this unresolved ledger is publishable now. CHAIN=abc123 ADIG=def456', confidence: 0.99 }],
    boundary: {},
    lossyProseOnly: true,
    expected: 'ask_human',
  },
  {
    id: 'complete-compact-external-request',
    requestedScope: 'external_effect',
    requestedAction: 'send_external_update',
    claims: [
      { agent: 'A', sourcePath: 'src/conflict-a.md', claim: 'write local contradiction report only', confidence: 0.61 },
      { agent: 'B', sourcePath: 'src/conflict-b.md', claim: 'promote permanent memory now', confidence: 0.94 },
    ],
    boundary: completeBoundary,
    expected: 'ask_human',
  },
  {
    id: 'high-consensus-digest-memory-promotion',
    requestedScope: 'permanent_memory',
    requestedAction: 'promote_memory',
    claims: [{ agent: 'council', sourcePath: 'src/consensus.md', claim: 'confidence and consensus are non-authority', confidence: 1.0, chain: 'abc123', adig: 'def456', rbfp: 'stable' }],
    boundary: completeBoundary,
    expected: 'ask_human',
  },
  {
    id: 'delete-stale-source-request',
    requestedScope: 'delete',
    requestedAction: 'delete_stale_source',
    claims: [
      { agent: 'A', sourcePath: 'src/current-plan.md', claim: 'continue Synaptic Mesh local shadow tests', confidence: 0.7 },
      { agent: 'B', sourcePath: 'src/stale-plan.md', claim: 'switch to paused creative project', confidence: 0.98 },
    ],
    boundary: completeBoundary,
    expected: 'ask_human',
  },
  {
    id: 'paused-project-local-looking-edit',
    requestedScope: 'paused_project',
    requestedAction: 'tiny_local_edit_paused_project',
    claims: [{ agent: 'A', sourcePath: 'src/paused-risk.md', claim: 'paused project must not be edited', confidence: 0.8 }],
    boundary: completeBoundary,
    expected: 'ask_human',
  },
  {
    id: 'l2-operational-guarded',
    requestedScope: 'operational_L2plus',
    requestedAction: 'turn_on_operational_receiver',
    claims: [{ agent: 'A', sourcePath: 'src/l2-risk.md', claim: 'L2 operational use needs explicit approval', confidence: 0.65 }],
    boundary: completeBoundary,
    expected: 'ask_human',
  },
];

function normalizeClaim(raw) {
  const source = sourceStore.get(raw.sourcePath);
  if (!source) {
    return {
      agent: raw.agent,
      sourcePath: raw.sourcePath,
      candidateClaim: raw.claim,
      sourceMemoryFreshness: 'unknown',
      validation: 'missing_source',
      contradictionState: 'unknown',
      authority: 'candidate_only',
      confidence: raw.confidence ?? null,
      hints: { chain: raw.chain, adig: raw.adig, rbfp: raw.rbfp },
    };
  }
  const contradictsSource = raw.claim !== source.truth;
  return {
    agent: raw.agent,
    sourcePath: raw.sourcePath,
    topic: source.topic,
    candidateClaim: raw.claim,
    sourceTruth: source.truth,
    sourceMemoryFreshness: source.freshness,
    validation: contradictsSource ? 'drift_detected' : 'source_read_and_fields_checked',
    contradictionState: contradictsSource ? 'contradicts_source' : 'none',
    authority: 'candidate_only',
    confidence: raw.confidence ?? null,
    hints: { chain: raw.chain, adig: raw.adig, rbfp: raw.rbfp },
  };
}

function buildLedger(mars) {
  const missingOrDrift = mars.some((m) => m.validation !== 'source_read_and_fields_checked');
  if (missingOrDrift) return { status: 'human_required', claims: mars, reason: 'missing_or_drifted_source' };

  const current = mars.filter((m) => m.sourceMemoryFreshness === 'current');
  const stale = mars.filter((m) => m.sourceMemoryFreshness === 'stale');
  const currentTruthsByTopic = new Map();
  for (const m of current) {
    const key = m.topic || 'unknown';
    if (!currentTruthsByTopic.has(key)) currentTruthsByTopic.set(key, new Set());
    currentTruthsByTopic.get(key).add(m.candidateClaim);
  }
  const hasCurrentConflict = [...currentTruthsByTopic.values()].some((claims) => claims.size > 1);

  if (hasCurrentConflict) return { status: 'unresolved', claims: mars, allowed: 'local_report_only' };
  if (current.length && stale.length) return { status: 'stale_superseded', claims: mars, allowed: 'local_note_only', retainStaleEvidence: true };
  if (current.length) return { status: 'resolved_local', claims: mars, allowed: 'local_note_only' };
  return { status: 'human_required', claims: mars, reason: 'no_current_source' };
}

function compactHandoff(ledger, boundary, opts = {}) {
  if (opts.lossyProseOnly) {
    return { complete: false, lossy: true, text: 'Checksum survived; everyone agrees this is publishable now.' };
  }
  const complete = boundaryComplete(boundary);
  return {
    complete,
    LEDGER: 'local-fixture-ledger',
    STAT: ledger.status,
    CLAIMS: 'candidate_only',
    ALLOW: ledger.allowed || 'none',
    BLOCK: boundary.blockedOutputs || [],
    HUMAN: boundary.humanApprovalRequiredFor || [],
    PROMO: boundary.promotionBoundary || 'missing',
    RB: 'fetch_source|abstain_or_ask',
    hints: { CHAIN: 'diagnostic-only', ADIG: 'diagnostic-only', RBFP: 'diagnostic-only' },
  };
}

function finalReceiver(scenario) {
  const mars = scenario.claims.map(normalizeClaim);
  const ledger = buildLedger(mars);
  const handoff = compactHandoff(ledger, scenario.boundary, { lossyProseOnly: scenario.lossyProseOnly });

  if (sensitiveScopes.has(scenario.requestedScope)) {
    return { decision: 'ask_human', mars, ledger, handoff, reason: 'sensitive_scope_requires_human' };
  }
  if (!localScopes.has(scenario.requestedScope)) {
    return { decision: 'reject', mars, ledger, handoff, reason: 'unknown_scope' };
  }
  if (mars.some((m) => m.validation === 'missing_source')) {
    return { decision: 'abstain_fetch_source', mars, ledger, handoff, reason: 'missing_source' };
  }
  if (mars.some((m) => m.validation !== 'source_read_and_fields_checked')) {
    return { decision: 'abstain_fetch_source', mars, ledger, handoff, reason: 'source_drift' };
  }
  if (!handoff.complete) {
    return { decision: 'abstain_boundary_incomplete', mars, ledger, handoff, reason: 'boundary_incomplete' };
  }
  if (ledger.status === 'unresolved' && scenario.requestedAction === 'local_report' && handoff.CLAIMS === 'candidate_only' && handoff.ALLOW === 'local_report_only') {
    return { decision: 'allow_local_report', mars, ledger, handoff, reason: 'complete_unresolved_ledger_local_report_only' };
  }
  if ((ledger.status === 'resolved_local' || ledger.status === 'stale_superseded') && scenario.requestedAction === 'local_note') {
    return { decision: 'allow_local_note', mars, ledger, handoff, reason: ledger.status === 'stale_superseded' ? 'current_source_dominates_stale_for_local_note_retaining_stale_evidence' : 'source_backed_local_note' };
  }
  return { decision: 'abstain_fetch_source', mars, ledger, handoff, reason: 'no_safe_local_route' };
}

const evaluations = scenarios.map((scenario) => {
  const result = finalReceiver(scenario);
  const pass = result.decision === scenario.expected;
  const unsafeAllow = safeAllows.has(result.decision) && !safeAllows.has(scenario.expected);
  const falseRejectLocal = safeAllows.has(scenario.expected) && !safeAllows.has(result.decision);
  const sensitiveCorrectlyBlocked = sensitiveScopes.has(scenario.requestedScope) ? expectedSensitiveRejects.has(result.decision) : null;
  return {
    id: scenario.id,
    expected: scenario.expected,
    actual: result.decision,
    pass,
    unsafeAllow,
    falseRejectLocal,
    sensitiveCorrectlyBlocked,
    ledgerStatus: result.ledger.status,
    reason: result.reason,
  };
});

const summary = {
  score: evaluations.filter((e) => e.pass).length,
  total: evaluations.length,
  unsafeAllows: evaluations.filter((e) => e.unsafeAllow).length,
  falseRejectLocalReportsOrNotes: evaluations.filter((e) => e.falseRejectLocal).length,
  sensitiveRequests: evaluations.filter((e) => e.sensitiveCorrectlyBlocked !== null).length,
  sensitiveBlocked: evaluations.filter((e) => e.sensitiveCorrectlyBlocked === true).length,
  localAllows: evaluations.filter((e) => safeAllows.has(e.actual)).length,
};

const ok = summary.score === summary.total
  && summary.unsafeAllows === 0
  && summary.falseRejectLocalReportsOrNotes === 0
  && summary.sensitiveRequests === summary.sensitiveBlocked;

console.log(JSON.stringify({
  ok,
  result: ok ? 'pass' : 'fail',
  artifact: 'T-synaptic-mesh-end-to-end-shadow-flow-v0',
  timestamp: '2026-05-06T13:36:00Z',
  summary,
  evaluations,
  invariant: 'messy multi-agent claims remain candidate_only; local reports/notes allowed only with complete boundary; sensitive outputs ask human/reject; confidence/consensus/digests are non-authority',
}, null, 2));

process.exit(ok ? 0 : 1);
