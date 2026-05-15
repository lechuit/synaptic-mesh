# Passive Memory Handoff Candidate Scorecard Protocol v0.29.0-alpha

Defines a disabled-by-default, local/manual/operator-run, read-only/passive scorecard that consumes only the completed v0.28 redacted recall probe artifact and produces human-review handoff candidates.

Boundary: human-readable only, non-authoritative, not runtime input, no memory writes, no tool/network/config/external effects, and `policyDecision: null`.
