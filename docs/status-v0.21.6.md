# Synaptic Mesh v0.21.6 status

Deterministic live-read evidence hotfix. Keeps v0.21.5 positive utility pass-to-human-review semantics and normalizes persisted `sourceMtimeMs` to `null` so exact-tag release checks do not drift by checkout filesystem mtimes. No new authority, enforcement, tool execution, external effects, memory/config writes, network fetch, or agent-consumed policy decisions.
