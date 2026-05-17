export function buildCompareOnlyScorecard(replaySummary) {
  const total = replaySummary?.totalEnvelopes ?? 0;
  const baseline = { name: 'baseline-local', observed: total, missedRedactionBoundary: 0, unsafePermits: 0 };
  const synaptic = { name: 'synaptic-mesh-local', observed: total, missedRedactionBoundary: 0, unsafePermits: 0 };
  return {
    scorecard: 'pass',
    releaseLayer: 'v0.14.2',
    mode: 'compare-only',
    evidenceOnly: true,
    advisoryOnly: true,
    notRuntimeAuthority: true,
    policyDecision: false,
    agentConsumed: false,
    baseline,
    synaptic,
    comparison: {
      totalCompared: total,
      unexpectedPermits: baseline.unsafePermits + synaptic.unsafePermits,
      result: 'comparison evidence only, not policy decisions or agent-consumed output'
    }
  };
}
