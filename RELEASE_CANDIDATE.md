# Release Candidate — Synaptic Mesh v0.29.5

Target: `v0.29.5`

Scope: passive memory handoff candidate scorecard over the completed v0.28 redacted recall probe artifact. The scorecard measures whether passive memory evidence can form a human-review handoff package: carry-forward candidates, contradiction surfacing, stale-context caution, and noise suppression.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run test:passive-memory-handoff-candidate-scorecard`
- `npm run release:check -- --target v0.29.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This does not write memory and does not feed runtime. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, daemon/watchers, runtime integration, and external effects remain false.
