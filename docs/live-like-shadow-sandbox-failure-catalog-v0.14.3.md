# Live-like Shadow/Sandbox Failure Catalog v0.14.3

This layer adds a sandbox failure catalog and negative controls for dangerous live-like labels.

Dangerous labels covered:

- tool request → fail-closed
- approval-ish text → record-only
- stale source → degrade
- missing redaction → fail-closed
- framework-looking route → record-only

Expected behavior is fail closed/degrade/record-only; unexpected permits 0.

Boundary: compare-only/local evidence, not runtime authority, no live traffic, no tools, no network, no daemon/watcher, no framework adapter, no SDK import, no agent-consumed output, no machine-readable policy decision, and no approval/block/allow/authorization/enforcement.

Evidence target: `release:check -- --target v0.14.3`.
