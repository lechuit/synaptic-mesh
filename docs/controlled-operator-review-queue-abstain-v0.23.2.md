# Controlled Operator Review Queue Abstain Behavior v0.23.2

If the source scorecard recommendation is `hold` or `degrade`, v0.23 abstains and generates no queue items. This prevents a recommendation value from becoming authority and forces operator review of the source scorecard instead.

Abstain status is `ABSTAIN_REQUIRES_OPERATOR_SOURCE_REVIEW`; it still has `policyDecision: null` and all capability/effect flags false.
