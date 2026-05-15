# v0.17.2 redaction and abort criteria

Abort criteria are intentionally conservative: raw secret-like tokens, decision verbs, non-local sources, write/execute requests, network/resource fetch hints, daemon/watch mode, memory/config writes, agent-consumed output, or non-null policyDecision all abort readiness.

Redaction may produce a human-readable preview, but raw input is not persisted and no allow/block/approve/enforce/authorize decision is emitted.
