# Release Candidate — Synaptic Mesh v0.33.5

Target: `v0.33.5`

Scope: passive context assembly hard cases scorecard over the completed v0.32.5 context assembly rehearsal artifact with pinned path/digest. The scorecard measures whether minimal human context assembly survives harder long-continuity cases: active rule versus old context, partial contradiction, source-bound decision carry-forward, stale caution preservation, and tempting noise suppression.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run test:passive-context-assembly-hard-cases`
- `npm run release:check -- --target v0.33.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This does not promote or write memory and does not feed runtime. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, daemon/watchers, runtime integration, durable memory promotion, and external effects remain false.
