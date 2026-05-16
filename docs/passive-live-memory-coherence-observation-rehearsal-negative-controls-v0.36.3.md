# Passive Live Memory/Coherence Observation Rehearsal — Negative Controls v0.36.3

Negative controls degrade the rehearsal for:

- missing/malformed v0.35 repeatability artifact
- fabricated path or sha256 digest
- unknown fields in upstream artifact or metrics
- wrong artifact/schema/release/status/metrics/report digest
- unstable or boundary-invalid repeatability items
- missing, unexpected, duplicated, or digest-drifted source packs
- source packs that are not redacted, not local, not read-only, or raw-persisted
- missing anchors or authority-token anchors
- tool/network/resource fetch, runtime/daemon/watch, memory/config write, raw output/persistence, or external effect attempts
- non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token payloads that must be detected without raw re-emission
