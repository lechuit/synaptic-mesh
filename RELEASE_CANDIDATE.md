# Release Candidate — Synaptic Mesh v0.31.5

Target: `v0.31.5`

Scope: passive source authority conflict scorecard over the completed v0.30.5 receiver rubric artifact with pinned path/digest. The scorecard measures whether competing memory/source situations can be surfaced safely for human review: source-bound decision versus inference, project rule versus generic prior, explicit contradiction, and stale-memory invalidation.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run test:passive-source-authority-conflict-scorecard`
- `npm run release:check -- --target v0.31.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This does not promote or write memory and does not feed runtime. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, daemon/watchers, runtime integration, durable memory promotion, and external effects remain false.
