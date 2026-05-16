# Passive Live Memory/Coherence Invalidation Repeatability Scorecard — Negative Controls v0.40.3

Negative controls reject malformed or spoofed inputs before scoring.

Covered classes include wrong or traversal-shaped artifact paths (`../` and `../../implementation/...`), wrong digests, mutated artifact object digest, wrong upstream artifact identity/schema/status/release, report digest drift, prior validation issues, missing/unknown/extra candidates, candidate source/redaction/boundary drift, stale-not-invalidated, contradiction-not-cautioned, valid carry-forward drift, metric drift, non-null `policyDecision`, unknown-field smuggling, runtime/tool/network/resource requests, memory/config writes, raw output/persistence requests, daemon/watch/autonomous runtime requests, and mutated output boundary flags.

The negative-control suite also verifies that semantic drift in a stale invalidation label yields `HOLD_FOR_MORE_EVIDENCE` rather than advancing.
