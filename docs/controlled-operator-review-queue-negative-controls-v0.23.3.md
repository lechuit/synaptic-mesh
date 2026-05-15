# Controlled Operator Review Queue Negative Controls v0.23.3

Negative controls degrade queue generation for malformed scorecards, non-null `policyDecision`, false passes, authority violations, recommendation-as-authority, forbidden capability flags, raw persisted/output flags, and external effects.

Degraded status is `DEGRADED_NO_QUEUE_GENERATED`; no item is emitted from unsafe or malformed evidence.
