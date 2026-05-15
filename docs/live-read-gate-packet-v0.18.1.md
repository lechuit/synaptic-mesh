# v0.18.x live-read gate

This v0.18.x layer is a live-read gate: first controlled crossing of the live input ingestion barrier. It is disabled by default, manually started by an operator, local only, passive only, read-only, one-shot only, and limited to one explicit repo-local source with bounded records.

Raw source text may enter process memory for redaction, but raw input is not persisted. Evidence is redacted JSON only plus human-readable release notes. `policyDecision: null`; `agentConsumedOutput: false`; `rawPersisted: false`; `unexpectedPermits: 0`.

Forbidden: network/resource fetch, external effects, tool execution, memory/config writes, daemon/watcher/autonomous mode, batch/multi-input, excess N, raw persistence/output, private token leakage, approval/block/allow/authorization/enforcement, and agent-consumed machine-readable decisions.
