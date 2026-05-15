# Passive Observation Repeatability Scorecard — v0.27.3 negative controls

Rejects malformed window artifacts, non-null policyDecision, authority tokens in nested/report fields, raw persistence/output requests, unsafe CLI paths, invalid counts/NaN, missing degradation cause, and attempts to treat a recommendation as authority.

## Boundary

- policyDecision: null
- recommendationIsAuthority: false
- Human-readable signal only
- Non-authoritative; no runtime authority
- Redacted artifacts only; raw persistence: false
