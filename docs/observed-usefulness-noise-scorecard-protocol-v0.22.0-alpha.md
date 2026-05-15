# Observed Usefulness/Noise Scorecard Protocol v0.22.0-alpha

v0.22 adds a passive, local, one-shot scorecard over v0.21 positive utility pass gate outputs. It measures whether `PASS_TO_HUMAN_REVIEW` is useful under mixed valid/noisy/failing fixtures.

Boundary: human-readable only, scorecard only, non-authoritative, no `policyDecision`, no authorization, no enforcement, no allow/block/approve gate, no tool execution, no network/resource fetch, no memory/config writes, no external effects, no watcher/daemon, and no agent-consumed machine-readable policy decision.
