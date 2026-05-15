# Release Candidate — Synaptic Mesh v0.21.6

Target: `v0.21.6`

Scope: deterministic live-read evidence replay hotfix for v0.21 positive utility pass-to-human-review. The positive utility semantics remain the same as v0.21.5: bounded explicit multisource shadow-read evidence may pass only as `PASS_TO_HUMAN_REVIEW` with `observationAccepted`, `includedInReport`, and `readyForHumanReview` true.

Hotfix: persisted live-read/live-adapter/bounded-multisource source metadata normalizes `sourceMtimeMs` to `null` so exact-tag release checks do not drift by checkout filesystem mtimes.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run release:check -- --target v0.21.6`

Boundary: non-authoritative, classification-only, local/manual/passive/read-only/one-shot. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, raw persistence, and external effects remain false.
