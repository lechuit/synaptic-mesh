# Controlled Operator Review Queue Items v0.23.1

Queue generation selects only true useful `PASS_TO_HUMAN_REVIEW` observations from the v0.22 scorecard with no false pass and no authority violations. Items include priority, rationale, source case id, redacted summary, and non-authoritative boundary flags.

Deterministic ordering is by priority, then source case id. The v0.23.5 evidence produces three items: the explicit-threshold source-failure useful pass first, followed by the two clean useful valid passes.
