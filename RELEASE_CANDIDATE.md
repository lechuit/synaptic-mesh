# Release Candidate — Synaptic Mesh v0.22.5

Target: `v0.22.5`

Scope: observed usefulness/noise scorecard over v0.21 positive utility pass-to-human-review outputs. The scorecard measures mixed valid/noisy/failing cases and reports `trueUsefulPasses`, `falsePasses`, `noiseRejected`, `falseValueWarnings`, `passPrecision`, `reviewBurdenEstimate`, and `recommendation: advance`.

Required local gates:

- `npm run verify:manifest`
- `npm run check`
- `npm run review:local`
- `npm run release:check -- --target v0.22.5`

Boundary: non-authoritative, human-readable-only, scorecard-only, local/manual/passive/read-only/one-shot. `policyDecision: null`; authorization, enforcement, approval/block/allow policy gate behavior, tool execution, agent-consumed output, network/resource fetch, memory/config writes, raw persistence, and external effects remain false.
