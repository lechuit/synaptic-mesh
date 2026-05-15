# Release Notes — Synaptic Mesh v0.15.5

## v0.15.0-alpha passive live shadow source contract

Defined allowed passive sources as explicit local file/sample streams and local pipe fixtures only. Disabled by default, human-started/manual, no network fetch, no SDK/framework adapter, no daemon/watcher, no actions, and redaction-gated before persistence.

## v0.15.1 redaction-before-persistence gate

Added negative controls for raw/private/tool/memory/config/approval text. Raw input is not committed; persisted evidence is redacted/metadata/hashed where appropriate.

## v0.15.2 passive observation CLI/harness

Added manual local-input harness. It writes local evidence or stdout, never watches, never daemonizes, never uses network, never executes tools, and rejects unsafe flags. unsafeFlagsRejected: 8.

## v0.15.3 no-enforcement invariant suite

Asserted passive shadow cannot emit allow/block/approve/enforce/authorize decisions. Output remains record/advisory evidence only, including dangerous cases.

## v0.15.4 reviewer package

Added Human review package for deciding whether a tiny local operator-run pilot may be attempted next. It explicitly says no autonomous live mode, no enforcement, no tool execution, no authorization, and no daemon/watcher.

## v0.15.5 phase close

passive live shadow readiness achieved for local operator-run pilot only. Next step may be v0.16 tiny operator-run pilot, still no enforcement, no tool execution, no authorization, no daemon/watcher by default, no external effects, no production/live deployment, and no autonomous live mode.
