# Passive Observation Repeatability Scorecard — v0.27.0-alpha protocol

Defines an operator-run, one-shot, local-only repeatability scorecard over explicit redacted v0.26 passive observation window artifacts. It does not execute tools, fetch resources, write memory/config, persist raw content, or emit machine-readable policy decisions. Outputs remain human-readable and non-authoritative with policyDecision: null.

## Boundary

- policyDecision: null
- recommendationIsAuthority: false
- Human-readable signal only
- Non-authoritative; no runtime authority
- Redacted artifacts only; raw persistence: false
