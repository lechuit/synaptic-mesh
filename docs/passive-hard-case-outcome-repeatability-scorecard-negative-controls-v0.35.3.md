# Passive Hard-Case Outcome Repeatability Scorecard — Negative Controls v0.35.3

Negative controls degrade the scorecard for:

- missing/malformed v0.34 outcome value artifact
- fabricated path or sha256 digest
- unknown top-level/protocol/metrics/outcome-item fields in the upstream artifact
- wrong artifact/schema/release/status/metrics/report digest
- semantic spoofing of pinned v0.34 outcome labels and values
- missing, duplicated, unknown, or wrong repeatability runs
- receiver label drift across repeated passes
- source-bound failures
- promotion-to-memory, agent-consumed output, non-null `policyDecision`, or recommendation-as-authority flags
- tool/network/resource fetch, runtime/daemon/watch, memory/config write, raw output/persistence, or external effect attempts
- authority-token payloads that must be detected without being re-emitted
