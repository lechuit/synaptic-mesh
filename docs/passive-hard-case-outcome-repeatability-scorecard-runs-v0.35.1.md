# Passive Hard-Case Outcome Repeatability Scorecard — Runs v0.35.1

Adds three bounded repeatability runs over the same five v0.34.5 receiver outcome hard cases:

1. `repeat-baseline-v034-labels` — baseline replay of v0.34 labels.
2. `repeat-paraphrased-rationales` — same labels with changed rationales.
3. `repeat-order-invariant-human-context` — same labels under shuffled order.

Each run remains source-bound, human-review-only, minimal-context-only, no promotion to memory, not agent-consumed, recommendation-not-authority, and `policyDecision: null`.
