# Synaptic Mesh v0.3.5 status snapshot

Status: advisory public review package release. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-advisory-public-review-package`
  - validates `docs/advisory-public-review-package.md` exists as a public human-review evidence index;
  - requires all advisory hardening evidence paths from v0.3.0-alpha through v0.3.4;
  - requires all status/runbook docs from v0.3.0-alpha through v0.3.5;
  - checks required public-review phrases including `ADVISORY ONLY`, `Advisory no es authority`, and “two independent local reviews”;
  - verifies failure catalog, reproducibility, Unicode/bidi, and runbook evidence counts remain pinned;
  - rejects forbidden authority phrases in the public review package.

## Expected v0.3.5 evidence

```json
{
  "advisoryPublicReviewPackage": "pass",
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

## Boundary

The v0.3.5 package is human-readable local/public review evidence only. It does not authorize action and must not be used as runtime or agent-consumed authority.

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
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-public-review-package
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.5
```

For exact published-release verification after tagging:

```bash
git checkout v0.3.5
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.5
```
