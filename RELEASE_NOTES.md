# Release Notes — Synaptic Mesh v0.3.4

Status: advisory report reviewer runbook. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.3.3 added reproducibility/drift checks, v0.3.4 adds a concise reviewer runbook so humans can review advisory evidence without turning it into policy, approval, authorization, enforcement, or automatic agent-consumed instruction.

## Highlights since v0.3.3

- Added `docs/advisory-report-reviewer-runbook.md`.
- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-reviewer-runbook.mjs`.
- Added runbook fixture/evidence:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-reviewer-runbook.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-reviewer-runbook.out.json`
- Wired the new gate into local `check`, `review:local`, and `release:check` validation.
- Added public wording guidance: when reviews are local/subagent-based, describe them as “two independent local reviews,” not GitHub reviews.

## Expected v0.3.4 evidence

```json
{
  "advisoryReviewerRunbook": "pass",
  "releaseLayer": "v0.3.4",
  "requiredPhrases": 10,
  "missingRequiredPhrases": 0,
  "requiredSections": 6,
  "missingRequiredSections": 0,
  "forbiddenPhraseFindings": 0,
  "requiredCommands": 6,
  "missingCommands": 0,
  "machineReadablePolicyDecision": false,
  "consumedByAgent": false,
  "mayBlock": false,
  "mayAllow": false
}
```

## Conservative release statement

`v0.3.4` proves only that local human-readable reviewer runbook checks pass against committed docs/evidence. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.4
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- The advisory report and runbook remain review evidence, not action sources. Advisory no es authority.
