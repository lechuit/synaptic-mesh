# Passive Live Memory/Coherence Usefulness Window — Negative Controls v0.38.3

Negative controls degrade the window for:

- missing/malformed v0.37 repeatability artifact
- fabricated path or sha256 digest
- object digest drift from the supplied artifact
- unknown fields in upstream artifact, metrics, or repeatability items
- wrong artifact/schema/release/status/metrics/report digest
- report markdown authority/raw-source poisoning
- missing, relabeled, unstable, non-source-bound, non-redacted, raw-persisted, or memory-promoting repeatability items
- tool/network/resource fetch, runtime/daemon/watch, memory/config write, raw output/persistence, or external effect attempts
- non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token payloads that must be detected without raw re-emission
