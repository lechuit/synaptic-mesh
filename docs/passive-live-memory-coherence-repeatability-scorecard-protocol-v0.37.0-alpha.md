# Passive Live Memory/Coherence Repeatability Scorecard — Protocol v0.37.0-alpha

Defines a local, disabled-by-default, operator-run one-shot repeatability scorecard over the pinned completed v0.36.5 passive live memory/coherence observation rehearsal artifact.

Boundary: passive/read-only, explicit pinned artifact only, redacted before persist, raw source cache excluded, human-readable report only, human-review-only, non-authoritative, no memory writes, no runtime integration, no enforcement, no tool/network/resource fetch, no approval/block/allow decision, and `policyDecision: null`.

This crosses the next safe barrier after v0.36: it measures whether the passive memory/coherence observations remain stable under repeated receiver passes/variations without writing memory or feeding agents.
