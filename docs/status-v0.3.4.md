# Synaptic Mesh v0.3.4 status snapshot

Status: advisory report reviewer runbook public review release. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-advisory-reviewer-runbook`
  - validates `docs/advisory-report-reviewer-runbook.md` exists as human-readable review guidance;
  - requires non-authority language including `ADVISORY ONLY` and `Advisory no es authority`;
  - requires reviewer wording guidance: use “two independent local reviews” when reviews are local/subagent-based;
  - checks required commands for advisory report, Unicode/bidi guard, failure catalog, reproducibility, `review:local`, and release check;
  - checks stop conditions for policy/approval/block/allow/authorization/enforcement/tool/memory/config/publication drift;
  - rejects forbidden authority phrases in the runbook.

## Expected v0.3.4 evidence

```json
{
  "advisoryReviewerRunbook": "pass",
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

## Boundary

The v0.3.4 runbook is human-readable local review guidance only. It does not authorize action and must not be used as runtime or agent-consumed authority.

Not included:

- live traffic/log/session reads;
- raw input persistence;
- runtime, daemon, watcher, adapter, or tool integration;
- memory/config writes;
- external publication or publication automation;
- agent-instruction writes;
- automatic agent consumption;
- machine-readable policy decisions;
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement;
- production, safety-certification, or L2+ operational claims.

## Local validation

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-reviewer-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.4
```

For exact published-release verification after tagging:

```bash
git checkout v0.3.4
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.4
```
