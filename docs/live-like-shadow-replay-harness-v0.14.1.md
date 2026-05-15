# Live-like Shadow/Sandbox Replay Harness v0.14.1

Frozen/redacted replay harness over local observation envelopes; frozen/redacted is the required input boundary.

Scope:

- manual CLI/test only
- offline/frozen/already-redacted envelopes only
- compare/replay record only; not runtime authority
- no daemon
- no file watcher
- no network
- no resource fetch
- no tools
- no live traffic
- no SDK import
- no framework adapter
- no agent-consumed output
- no machine-readable policy decision
- no approval/block/allow/authorization/enforcement

The CLI reads a user-provided local JSON fixture path and writes JSON to stdout. It does not fetch resources, monitor files, call tools, or connect to any framework.

Evidence target: `release:check -- --target v0.14.1`.
