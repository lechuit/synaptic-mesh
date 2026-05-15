# Operator Review Outcome Capture Protocol v0.24.0-alpha

Defines the next safe barrier after v0.23: a disabled-by-default, manual operator-run, local-only, passive/read-only, one-shot capture of explicit operator value feedback over bounded v0.23 queue items.

The artifact is non-authoritative and human-readable only. It is not a policy artifact, not runtime authority, not tool execution, not a resource fetch, not memory/config writes, not raw persistence/output, and not external effects. It keeps `policyDecision: null` and uses only value-feedback labels: `USEFUL_FOR_REVIEW`, `NOT_USEFUL_NOISE`, `NEEDS_MORE_EVIDENCE`, and `ABSTAIN_OPERATOR_UNCERTAIN`.
