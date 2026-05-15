# Release Notes — Synaptic Mesh v0.14.5

## v0.14.0-alpha live-like shadow/sandbox observation envelope

Added a local observation envelope schema and fixture for live-like shadow/sandbox inputs. Scope is offline/frozen/already-redacted and manual-or-frozen only.

## v0.14.1 frozen/redacted replay harness

Added a frozen/redacted replay harness over local observation envelopes. It is manual CLI/test only; no daemon, no watcher, no network, no tools.

## v0.14.2 compare-only scorecards

Added baseline vs Synaptic Mesh local comparison scorecards. Output is advisory/comparison evidence only, not policy decisions and not agent-consumed output.

## v0.14.3 sandbox failure catalog

Added negative controls for tool request, approval-ish text, stale source, missing redaction, and framework-looking route. Expected handling is fail closed/degrade/record-only; unexpectedPermits: 0.

## v0.14.4 reviewer package

Added reviewer go/no-go package for next passive live shadow design. The next step may be designed, but live traffic/tool execution/enforcement remain unauthorized.

## v0.14.5 phase close

live-like shadow/sandbox readiness achieved. The repo is ready to design v0.15 passive live shadow, while still no live traffic, no tools, no runtime authority, no enforcement, no runtime integration, no framework adapter, no network, no watcher/daemon, no agent-consumed output, and no machine-readable policy decision. unexpectedPermits: 0.
