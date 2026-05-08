# Manual Dry-Run Pilot Runbook

## Status

Manual/local/offline/record-only.

## What this is

A way to run Synaptic Mesh over already-redacted real handoff bundles.

The manual dry-run pilot processes already-redacted artifacts; it does not capture reality.

El piloto manual dry-run procesa artefactos ya redactados; no captura realidad.

## What this is not

- not live observation
- not runtime
- not enforcement
- not approval
- not blocking
- not allowing
- not tool execution
- not memory/config write
- not publication

## Before preparing a bundle

Checklist:

- no raw content persisted
- no secrets
- no private paths
- no tool outputs
- no memory text
- no config text
- no approval text
- no live session capture
- no automatic ingestion

If any item fails, do not run the pilot on that bundle. Redact or discard the bundle and create a fresh `RedactionReviewRecord` before trying again.

## Required artifacts

- `ManualObservationBundle`
- `RedactionReviewRecord`
- expected local evidence output path under `implementation/synaptic-mesh-shadow-v0/evidence/`

The bundle and review record must already exist as local files. The command must not fetch, capture, watch, ingest, or observe any source on its own.

## How to run

From `implementation/synaptic-mesh-shadow-v0/`:

```bash
npm run manual:dry-run -- --input ./fixtures/manual-dry-run-inputs/case-001.json --output ./evidence/manual-dry-run-cli.case-001.out.json
```

Use an explicit local `--input` file and an explicit local `--output` path inside the package evidence directory.

## How to read output

A valid pass must preserve these invariants:

- `recordOnly` must be `true`
- `mayBlock` must be `false`
- `mayAllow` must be `false`
- `forbiddenEffects` must be `0`
- `capabilityTrueCount` must be `0`

Also confirm the output does not claim tool execution, memory/config writes, publication, approval, blocking, allowing, authorization, or enforcement.

## What a pass means

The redacted bundle passed local offline replay.

A pass means the already-redacted input and local output satisfied the current manual dry-run contract and boundary checks.

## What a pass does not mean

- no runtime authorization
- no production safety claim
- no permission to execute tools
- no permission to write memory/config
- no permission to publish
- no permission to approve, block, allow, authorize, or enforce anything

## Failure handling

If the command rejects a case, treat the reject as local evidence only. Rejected cases may write reject evidence, but must not write success evidence, normal `DecisionTrace`, normal `LiveShadowObservationResult`, or scorecard success rows.

Use `docs/manual-dry-run-pilot-failure-catalog.md` to interpret known misuse cases and expected reason codes.

## Review gates

Run these before merging a runbook or pilot-process change:

```bash
npm run verify:manifest
npm run check
npm run review:local
npm run release:check -- --target v0.1.15
```
