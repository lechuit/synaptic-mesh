# Release Candidate — Synaptic Mesh v0.37.5

Target: `v0.37.5`

Scope: passive live memory/coherence repeatability scorecard over the completed v0.36.5 observation rehearsal artifact with pinned path/digest. The scorecard measures whether passive observation labels stay stable across repeated receiver passes (baseline replay, paraphrased observation text, reverse-order replay) without turning labels into authority, memory promotion, or runtime behavior.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run test:passive-live-memory-coherence-repeatability-scorecard`
- `npm run release:check -- --target v0.37.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This does not promote or write memory and does not feed runtime. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, daemon/watchers, runtime integration, durable memory promotion, and external effects remain false.
