# T-synaptic-mesh-retrieval-threshold-cliff-v0

## Purpose

Local/shadow microtest for the Synaptic Mesh contradiction-ledger line: find the retrieval-budget cliff where a compact handoff can no longer safely route from the visible subset of claims.

This extends `T-synaptic-mesh-contradiction-ledger-retrieval-ranking-v0`: the previous test showed decision/boundary-first ranking beats similarity/confidence-first. This test asks a harder question: **what should the receiver do when even the better ranking cannot fit every high-boundary claim inside the current top-k/budget?**

## Setup

- Corpus: 12 synthetic contradiction-ledger claims.
- High-boundary claims: 8 (`sensitive_*`, `authority_gap`, or `revoked_or_stale`).
- Must-surface claims: 8 decision-changing claims.
- Sweep: `top-k = 2..10` using the decision+contradiction+boundary score from the prior ranking test.
- Strategies compared:
  - `naive`: decides from retrieved claims only.
  - `threshold_aware`: treats missing high-boundary indexed claims as insufficient evidence and returns `fetch_abstain`.

## Validation

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-retrieval-threshold-cliff-v0.mjs
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-retrieval-threshold-cliff-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-retrieval-threshold-cliff-v0.out.json
cat runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-retrieval-threshold-cliff-v0.out.json | jq '.summary'
```

Observed summary:

```json
{
  "ok": true,
  "totalClaims": 12,
  "highBoundaryClaims": 8,
  "mustSurfaceClaims": 8,
  "firstFullHighBoundaryK": 9,
  "unsafeNaiveKs": [],
  "unsafeThresholdAwareKs": [],
  "abstainBeforeCliffKs": [2, 3, 4, 5, 6, 7, 8],
  "rule": "If compact retrieval budget omits any indexed high-boundary claim, receiver must fetch/abstain instead of treating the visible subset as safe."
}
```

## Result

Verdict: `pass`.

The retrieval cliff appears at `top-k=9`: that is the first budget that covers all indexed high-boundary claims. For `top-k < 9`, the threshold-aware receiver correctly returns `fetch_abstain` instead of route decisions based on an incomplete boundary set.

The naive receiver did not produce a false safe allow in this fixture because at least one sensitive claim remained visible at each tested budget, but that is not enough: it still cannot prove that no omitted high-boundary claim would change the route. The useful result is the receiver-side rule, not a claim that this specific fixture is adversarial enough to break naive routing.

## Consolidated rule

> A compact contradiction-ledger handoff needs a boundary coverage signal. If the receiver knows there are omitted high-boundary claims, it must `fetch_abstain` / expand retrieval rather than treating the top-k subset as route-complete.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime enforcement, config changes, persistent memory writes, external notifications, publication, deletion, paused-project work, canary promotion, or L2+ operation.

## Next safe experiment

`T-synaptic-mesh-boundary-coverage-receipt-v0`: add a compact receipt field such as `highBoundaryTotal`, `retrievedHighBoundary`, and `missingHighBoundaryDigest`, then test whether the receiver can detect insufficient coverage without reading the full ledger.
