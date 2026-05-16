# Passive Live Memory/Coherence Stale/Contradiction Invalidation Window — Protocol v0.39.0-alpha

Defines a local, disabled-by-default, operator-run one-shot invalidation window over the pinned completed v0.38.5 passive live memory/coherence usefulness window.

Boundary: passive/read-only, explicit pinned artifact only, bounded stale/contradiction invalidation window only, redacted before persist, raw source cache excluded, human-readable report only, human-review-only, non-authoritative, no memory writes, no runtime integration, no enforcement, no tool/network/resource fetch, no approval/block/allow decision, and `policyDecision: null`.

This crosses the next safe barrier after v0.38: a passive handoff must not merely carry forward useful signals; it must also invalidate stale signals and label contradictory claims for human review before anything approaches live memory.
