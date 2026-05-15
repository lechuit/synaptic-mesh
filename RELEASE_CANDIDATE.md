# Release Candidate — Synaptic Mesh v0.28.5

Target: `v0.28.5`

Scope: passive memory recall usefulness probe over explicit redacted passive observation artifacts, explicit redacted source anchors, and explicit recall need cards. The probe measures whether passive evidence helps recover decisions, project rules, contradictions, source-bound facts, and stale negative context for AI continuity. Source-bound matches must verify redacted source anchors and digests, not just declared metadata or tags.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run test:passive-memory-recall-usefulness-probe`
- `npm run release:check -- --target v0.28.5`

Boundary: non-authoritative, human-readable-only, redacted-evidence-only, local/manual/passive/read-only/one-shot. This does not write memory and does not feed runtime. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence/output, daemon/watchers, runtime integration, and external effects remain false.
