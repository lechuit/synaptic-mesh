# Passive Live Memory/Coherence Repeatability Scorecard — Negative Controls v0.37.3

Negative controls degrade the scorecard for:

- missing/malformed v0.36 observation artifact
- fabricated path or sha256 digest
- unknown fields in upstream artifact, metrics, or observation items
- wrong artifact/schema/release/status/metrics/report digest
- report markdown authority/raw-source poisoning
- missing, relabeled, semantically drifted, source-path/source-sha/source-signal mutated, non-source-bound, non-redacted, raw-persisted, or memory-promoting observation items
- tool/network/resource fetch, runtime/daemon/watch, memory/config write, raw output/persistence, or external effect attempts
- non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token payloads that must be detected without raw re-emission
