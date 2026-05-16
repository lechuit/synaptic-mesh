# Passive Live Memory/Coherence Stale/Contradiction Invalidation Window — Candidates v0.39.1

The window evaluates five bounded candidate signals:

- three current valid signals carried forward for human handoff
- one stale prior-release anchor invalidated as stale
- one contradictory boundary claim labeled as contradiction caution for human review

The package is human-review-only. It is not a runtime instruction, memory write, durable memory promotion, or agent-consumed decision.
