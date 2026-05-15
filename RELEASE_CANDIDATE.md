# Release Candidate — Synaptic Mesh v0.23.5

Target: `v0.23.5`

Scope: controlled operator review queue over the v0.22 observed usefulness/noise scorecard. The queue emits local human-review prioritization items for true useful passes only, with priority, rationale, source case id, and redacted summary.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run release:check -- --target v0.23.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This is not a decision queue and not an approval queue. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, and external effects remain false.
