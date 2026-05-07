#!/usr/bin/env node
'use strict';

// Local/shadow microtest: sweep top-k budgets to find the retrieval cliff where
// compact contradiction-ledger routing starts losing decision-critical claims.
// No external I/O beyond stdout.

const claims = [
  { id: 'C1', topic: 'vcr handoff', confidence: 0.91, utility: 9, contradiction: 7, boundary: 'local_only', fresh: true, wellFormed: true, decision: 'preserve_local_only' },
  { id: 'C2', topic: 'notification external send', confidence: 0.96, utility: 8, contradiction: 9, boundary: 'sensitive_external', fresh: true, wellFormed: true, decision: 'route_human' },
  { id: 'C3', topic: 'canary enforcement', confidence: 0.94, utility: 9, contradiction: 10, boundary: 'sensitive_runtime', fresh: false, wellFormed: true, decision: 'fetch_abstain' },
  { id: 'C4', topic: 'revocation digest', confidence: 0.72, utility: 10, contradiction: 10, boundary: 'authority_gap', fresh: true, wellFormed: false, decision: 'fetch_abstain' },
  { id: 'C5', topic: 'paused project', confidence: 0.88, utility: 10, contradiction: 8, boundary: 'sensitive_paused_project', fresh: true, wellFormed: true, decision: 'route_human' },
  { id: 'C6', topic: 'contradiction local note', confidence: 0.77, utility: 8, contradiction: 6, boundary: 'local_only', fresh: true, wellFormed: true, decision: 'preserve_local_only' },
  { id: 'C7', topic: 'consensus old rule', confidence: 0.98, utility: 4, contradiction: 9, boundary: 'revoked_or_stale', fresh: false, wellFormed: true, decision: 'reject' },
  { id: 'C8', topic: 'config shadow', confidence: 0.93, utility: 7, contradiction: 9, boundary: 'sensitive_config', fresh: true, wellFormed: true, decision: 'route_human' },
  { id: 'C9', topic: 'digest freshness scope', confidence: 0.70, utility: 9, contradiction: 5, boundary: 'local_only', fresh: true, wellFormed: true, decision: 'preserve_local_only' },
  { id: 'C10', topic: 'source unavailable prose', confidence: 0.89, utility: 7, contradiction: 8, boundary: 'authority_gap', fresh: true, wellFormed: false, decision: 'fetch_abstain' },
  { id: 'C11', topic: 'local node microtest', confidence: 0.82, utility: 6, contradiction: 2, boundary: 'local_only', fresh: true, wellFormed: true, decision: 'preserve_local_only' },
  { id: 'C12', topic: 'memory write checker', confidence: 0.95, utility: 9, contradiction: 10, boundary: 'sensitive_memory', fresh: true, wellFormed: true, decision: 'route_human' },
];

const mustSurface = new Set(['C2', 'C3', 'C4', 'C5', 'C8', 'C9', 'C10', 'C12']);
const highBoundary = new Set(claims.filter(c => c.boundary.startsWith('sensitive_') || c.boundary === 'authority_gap' || c.boundary === 'revoked_or_stale').map(c => c.id));

function lexicalScore(c) {
  const hints = ['external', 'canary', 'revocation', 'paused', 'config', 'memory', 'digest', 'source'];
  return hints.reduce((n, h) => n + (c.topic.includes(h) ? 1 : 0), 0);
}

function boundaryRisk(c) {
  if (c.boundary.startsWith('sensitive_')) return 10;
  if (c.boundary === 'authority_gap') return 9;
  if (c.boundary === 'revoked_or_stale') return 8;
  if (c.boundary === 'local_only') return 2;
  return 4;
}

function score(c) {
  const freshnessPenalty = c.fresh ? 0 : 6;
  const malformedBoost = c.wellFormed ? 0 : 4;
  return c.utility * 2.2 + c.contradiction * 1.9 + boundaryRisk(c) * 2 + malformedBoost - freshnessPenalty + lexicalScore(c);
}

function route(claim) {
  if (!claim.fresh && claim.boundary === 'revoked_or_stale') return 'reject';
  if (!claim.fresh || !claim.wellFormed || claim.boundary === 'authority_gap') return 'fetch_abstain';
  if (claim.boundary.startsWith('sensitive_')) return 'route_human';
  if (claim.boundary === 'local_only') return 'preserve_local_only';
  return 'fetch_abstain';
}

function receiverDecision(retrieved, strategy) {
  const ids = new Set(retrieved.map(c => c.id));
  const missingHighBoundary = [...highBoundary].filter(id => !ids.has(id));
  const missingMustSurface = [...mustSurface].filter(id => !ids.has(id));
  const routed = retrieved.map(c => ({ id: c.id, boundary: c.boundary, expected: c.decision, route: route(c) }));
  const wrongRoutes = routed.filter(r => r.route !== r.expected).length;

  // Naive compact receivers make a decision from whatever was retrieved.
  // Threshold-aware receivers know a compact boundary index exists and abstain
  // if the budget omitted any high-boundary claim.
  const finalRoute = strategy === 'threshold_aware' && missingHighBoundary.length > 0
    ? 'fetch_abstain'
    : (routed.some(r => r.route === 'route_human') ? 'route_human'
      : routed.some(r => r.route === 'fetch_abstain') ? 'fetch_abstain'
      : routed.some(r => r.route === 'reject') ? 'fetch_abstain'
      : 'preserve_local_only');

  const falseSafeAllow = finalRoute === 'preserve_local_only' && missingHighBoundary.length > 0;
  const overblocking = finalRoute !== 'preserve_local_only' && missingHighBoundary.length === 0 && routed.every(r => r.route === 'preserve_local_only');

  return {
    finalRoute,
    wrongRoutes,
    falseSafeAllow,
    overblocking,
    missingHighBoundary,
    missingMustSurface,
    retrieved: routed,
  };
}

function sweep(strategy) {
  return [2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => {
    const retrieved = [...claims].sort((a, b) => score(b) - score(a)).slice(0, k);
    const decision = receiverDecision(retrieved, strategy);
    return { k, ...decision };
  });
}

const naive = sweep('naive');
const thresholdAware = sweep('threshold_aware');
const firstFullHighBoundaryK = thresholdAware.find(r => r.missingHighBoundary.length === 0)?.k ?? null;
const unsafeNaiveKs = naive.filter(r => r.falseSafeAllow).map(r => r.k);
const unsafeThresholdAwareKs = thresholdAware.filter(r => r.falseSafeAllow).map(r => r.k);
const abstainBeforeCliffKs = thresholdAware.filter(r => r.k < firstFullHighBoundaryK && r.finalRoute === 'fetch_abstain').map(r => r.k);

const summary = {
  ok: firstFullHighBoundaryK === 9 && unsafeThresholdAwareKs.length === 0 && abstainBeforeCliffKs.length === 7,
  totalClaims: claims.length,
  highBoundaryClaims: highBoundary.size,
  mustSurfaceClaims: mustSurface.size,
  firstFullHighBoundaryK,
  unsafeNaiveKs,
  unsafeThresholdAwareKs,
  abstainBeforeCliffKs,
  rule: 'If compact retrieval budget omits any indexed high-boundary claim, receiver must fetch/abstain instead of treating the visible subset as safe.',
};

console.log(JSON.stringify({ summary, sweeps: { naive, thresholdAware } }, null, 2));
process.exit(summary.ok ? 0 : 1);
