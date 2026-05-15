# Positive Utility Pass Gate Protocol v0.21.0-alpha

Defines a non-authoritative positive utility gate over bounded explicit multisource shadow-read evidence. The gate is classification-only and may produce `PASS_TO_HUMAN_REVIEW` when evidence is useful for humans.

Hard boundary: not authorization, not enforcement, not a policy allow/block/approve gate, no tool execution, no external effects, no raw persistence, and `policyDecision: null`.
