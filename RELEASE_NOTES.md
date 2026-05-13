# Release Notes — Synaptic Mesh v0.3.5

Status: advisory public review package. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.3.4 added the reviewer runbook, v0.3.5 adds a compact public review package that indexes advisory report hardening evidence from v0.3.0-alpha through v0.3.5 without turning the package into policy, approval, authorization, enforcement, or automatic agent-consumed instruction.

## Highlights since v0.3.4

- Added `docs/advisory-public-review-package.md`.
- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-public-review-package.mjs`.
- Added public-review package fixture/evidence:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-public-review-package.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-public-review-package.out.json`
- Wired the new gate into local `check`, `review:local`, and `release:check` validation.
- Pinned evidence/docs coverage for v0.3.0-alpha through v0.3.4 advisory hardening artifacts.

## Expected v0.3.5 evidence

```json
{
  "advisoryPublicReviewPackage": "pass",
  "releaseLayer": "v0.3.5",
  "requiredEvidence": 6,
  "missingEvidence": 0,
  "requiredDocs": 7,
  "missingDocs": 0,
  "requiredPhrases": 10,
  "missingRequiredPhrases": 0,
  "forbiddenPhraseFindings": 0,
  "machineReadablePolicyDecision": false,
  "consumedByAgent": false,
  "mayBlock": false,
  "mayAllow": false
}
```

## Conservative release statement

`v0.3.5` proves only that local human-readable public review package checks pass against committed docs/evidence. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.5
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- The advisory report, runbook, and public review package remain review evidence, not action sources. Advisory no es authority.
