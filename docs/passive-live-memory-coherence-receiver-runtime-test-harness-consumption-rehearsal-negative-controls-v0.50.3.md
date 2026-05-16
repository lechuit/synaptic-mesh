# Passive Live Memory Coherence Receiver Runtime Test Harness Consumption Rehearsal Negative Controls v0.50.3

Negative controls cover absolute and traversal path rejection, source artifact/report digest drift, source status/metric drift, receiver block tampering, unknown fields, nested sentinel smuggling, raw persistence/raw output, forbidden runtime/network/tool/memory/config/external fields, and over-authoritative claims.

Boundary: local, reversible, read-only rehearsal only. The harness parses and consumes pinned v0.49.5 receiver-facing blocks as deterministic local test input only. It does not execute instructions, call tools, fetch network/resources, write memory/config, integrate with a production runtime, authorize/enforce, make allow/block decisions, or create external effects. The compatibility sentinel remains top-level JSON null only.

Pinned source: `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.out.json` (`e0dbbfa1394f614dac521d3df58a6cb9e329e22d0db1b1640131eecbfcd9265e`). Source report: `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-report-v0.49.5.out.md` (`66d017404d1bde5d3a323caea40a2a3c0f168d4ce677815c2df1ea1a71d808c1`). Absolute paths and traversal are rejected before read.
