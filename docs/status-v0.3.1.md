# Synaptic Mesh v0.3.1 status snapshot

Status: advisory report Unicode/bidi guard public review release. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-advisory-unicode-bidi-guard`
  - scans docs, evidence, fixtures, and advisory report artifacts for hidden/bidi Unicode controls;
  - requires reason codes to remain ASCII token strings;
  - requires source/output paths and selected machine-readable fields to stay ASCII-printable;
  - includes escaped negative controls for bidi controls, zero-width characters, source-path confusables, and invisible machine-readable fields;
  - keeps the guard local and advisory-only.

## Expected v0.3.1 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.3.1",
  "dependsOn": "v0.3.0-alpha-advisory-report",
  "mode": "manual_local_advisory_unicode_bidi_guard_record_only",
  "textFindings": 0,
  "machineReadableFindings": 0,
  "reasonCodeAsciiTokenRequired": true,
  "sourcePathAsciiRequired": true,
  "sourcePathConfusableGuard": true,
  "hiddenBidiControlsForbidden": true,
  "advisoryOnly": true,
  "nonAuthoritative": true,
  "automaticAgentConsumptionImplemented": false
}
```

## Boundary

The v0.3.1 guard is local deterministic evidence hygiene only. It does not authorize action and must not be used as runtime or agent-consumed authority.

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
npm --prefix implementation/synaptic-mesh-shadow-v0 run check:unicode
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-unicode-bidi-guard
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.1
```

For exact published-release verification after tagging:

```bash
git checkout v0.3.1
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.1
```
