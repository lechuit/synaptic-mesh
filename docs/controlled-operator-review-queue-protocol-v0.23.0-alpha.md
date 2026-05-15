# Controlled Operator Review Queue Protocol v0.23.0-alpha

Defines the next safe barrier after v0.22: a disabled-by-default, manual operator-run, local-only, passive/read-only, one-shot controlled operator review queue over v0.22 scorecard cases.

The queue is a human-review prioritization artifact only. It is not a decision queue, not an approval queue, not authorization, not enforcement, not tool execution, not a resource fetch, not raw persistence/output, and not runtime authority. Output uses redacted summaries only and keeps `policyDecision: null`.
