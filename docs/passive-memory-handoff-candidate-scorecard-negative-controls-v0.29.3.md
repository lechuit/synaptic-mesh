# Passive Memory Handoff Candidate Scorecard Negative Controls v0.29.3

Negative controls degrade malformed/missing recall artifacts, incomplete v0.28 status, non-null `policyDecision`, source-bound ratio failures, contradiction/stale failures, noise leakage, missing card coverage, unsourced matches, missing source anchors, raw output requests, tool/network/memory/config/runtime flags, daemon/watch flags, and nested authority-token text.

Authority-token text is detected without re-emitting the injected token in degraded output.
