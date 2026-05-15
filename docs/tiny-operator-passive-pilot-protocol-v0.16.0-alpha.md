# Tiny operator-run passive pilot protocol v0.16.0-alpha

Scope is intentionally tiny: one explicit local sample input, started by a human operator, reviewed by a human before any source expansion. The pilot is disabled by default and is not a live autonomous mode.

Allowed: local file sample input, redaction before persistence, stdout or package evidence JSON only.

Forbidden: autonomous live mode, watcher/daemon, network/resource fetch, SDK/framework adapter, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot/webhook, tool execution, memory/config writes, agent-consumed output, machine-readable policy decision, approval/block/allow/authorization/enforcement, and external effects.

Abort criteria: raw private token observed after redaction, unsanitized decision verb in persisted text, unsafe flag attempt, output escape or symlink escape, multi-input/batch attempt, or any non-null policyDecision/decision field.
