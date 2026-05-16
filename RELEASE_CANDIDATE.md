# Release Candidate — Synaptic Mesh v0.39.5

Target: `v0.39.5`

Scope: passive live memory/coherence stale/contradiction invalidation window over the completed v0.38.5 usefulness window artifact with pinned path/digest. The window measures whether passive handoff can carry forward current useful signals, invalidate stale claims, and label contradictory boundary claims for human review without turning labels into authority, memory promotion, or runtime behavior.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run test:passive-live-memory-coherence-stale-contradiction-invalidation-window`
- `npm run release:check -- --target v0.39.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This does not promote or write memory and does not feed runtime. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, daemon/watchers, runtime integration, durable memory promotion, and external effects remain false.
