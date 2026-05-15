# Bounded Explicit Multisource Shadow-Read Report v0.20.5

- Barrier crossed: bounded explicit multisource shadow-read
- Adapter: repo-local-file-read-adapter-v0
- Operator-run: true; one-shot: true; local-only/read-only/passive-only: true
- Sources: 3 / max 3
- Records read: 10 / total limit 10; per-source limit 4
- Per-source isolation: true; failure isolation: true; isolated failures: 0
- Redacted evidence only: true; rawPersisted: false; rawOutput: false
- policyDecision: null; agentConsumedOutput: false; unexpectedPermits: 0
- Enforcement/authorization/approval/block/allow: false

## Source statuses
- source #0: ok; records=4; rawSourcePathPersisted=false
- source #1: ok; records=4; rawSourcePathPersisted=false
- source #2: ok; records=2; rawSourcePathPersisted=false

## Redacted evidence preview
- source #0 record #0: # Synaptic Mesh v0.21.6
- source #0 record #1: This is the public review release `v0.21.6`. Current v0.21.6 status is narrower than live runtime but crosses the next smallest safe barrier after bounded explicit multisource shadow-read: a **positive utility pass-to-human-review** gate.
- source #0 record #2: The v0.21.x ladder is still disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, and non-authoritative. It consumes valid v0.20-style bounded explicit multisource shadow-read evidence and may classify clean, us
- source #0 record #3: This is not a policy [NON_AUTHORITATIVE_INPUT_VERB_REDACTED]/[NON_AUTHORITATIVE_INPUT_VERB_REDACTED]/[NON_AUTHORITATIVE_INPUT_VERB_REDACTED] gate and not runtime authority. Boundaries: `policyDecision: null`, `[NON_AUTHORITATIVE_INPUT_VERB_
- source #1 record #0: # Release Notes — Synaptic Mesh v0.21.6
- source #1 record #1: ## Summary
- source #1 record #2: `v0.21.6` preserves the v0.21.5 positive gate and hotfixes deterministic evidence replay. `v0.21.5` introduced the **positive utility pass-to-human-review** gate. It demonstrates what happens when bounded explicit multisource shadow-read ev
- source #1 record #3: ## Evidence
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.21.6
- source #2 record #1: Target: `v0.21.6`
