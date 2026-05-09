# Redaction policy schema v0

`schemas/redaction-policy.schema.json` defines the offline executable-gate policy contract used by the v0.1.17 redaction work.

Scope:

- manual/offline/local-shadow evidence only;
- reject-only gate policy for persisted sensitive fields;
- already-redacted or placeholder fixtures only;
- no live observation, runtime integration, daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, approval path, authorization, or enforcement.

The policy requires coverage for these sensitive classes:

- raw content persisted;
- secret-like value persisted;
- private path persisted;
- tool output persisted;
- memory text persisted;
- config text persisted;
- approval text persisted;
- long raw prompt persisted;
- unknown sensitive field persisted.

The schema is intentionally narrow: it validates the policy/fixture shape and hard no-persistence invariants, but it does not itself scan live data or authorize runtime decisions.
