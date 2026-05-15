# v0.17.0-alpha limited passive live capture protocol/design

Scope: design/readiness only for a future limited passive live capture step. It is disabled by default, manual/operator-run, local-only, passive, and read-only.

This layer does not start capture, watch files, subscribe to events, connect to services, call tools, make policy decisions, or write memory/config. It only defines the reviewable envelope fields that a human could inspect later.

Required invariants: no enforcement, no authorization, no approval/block/allow output, no autonomous live mode, no network/resource fetch, no SDK/framework adapter, no daemon/watcher, no external effects, no raw private payload persistence, no agent-consumed machine-readable policy decision.
