# Live Adapter Shadow-Read Protocol v0.19.0-alpha

Defines the next smallest live barrier after v0.18: local adapter shadow-read. The only positive path is a disabled-by-default, human-started, operator-run, one-shot, local-only, passive/read-only run through a constrained local read adapter.

Required invariants: single explicit repo-local source, bounded window/count, redaction-before-persist, redacted evidence only, human-readable report, `policyDecision: null`, `agentConsumedOutput: false`, `unexpectedPermits: 0`.

Forbidden: enforcement, authorization, approval/block/allow, network/resource fetch, memory/config writes, tool execution beyond explicit local read, daemon/watchers, autonomous live mode, raw persistence/output, external effects, multi-source/batch positive paths, and agent-consumed machine-readable policy decisions.
