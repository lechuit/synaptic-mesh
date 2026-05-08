# Manual Dry-Run Pilot Checklist

Use this checklist before running the manual dry-run pilot on any real-redacted handoff bundle.

## Boundary statement

The manual dry-run pilot processes already-redacted artifacts; it does not capture reality.

El piloto manual dry-run procesa artefactos ya redactados; no captura realidad.

## Redaction checklist

Do not run the pilot unless all items are true:

- [ ] no raw content persisted
- [ ] no secrets
- [ ] no private paths
- [ ] no tool outputs
- [ ] no memory text
- [ ] no config text
- [ ] no approval text
- [ ] no live session capture
- [ ] no automatic ingestion
- [ ] `ManualObservationBundle` exists as a local already-redacted artifact
- [ ] `RedactionReviewRecord` exists and matches the bundle
- [ ] expected output path is local and under `implementation/synaptic-mesh-shadow-v0/evidence/`

## Run checklist

- [ ] command uses explicit local `--input`
- [ ] command uses explicit local `--output`
- [ ] command is manual/offline/record-only
- [ ] command is not described as an observer, watcher, daemon, runtime, approval path, authorization path, or enforcement path

## Pass interpretation checklist

A pass is only valid if:

- [ ] `recordOnly` is `true`
- [ ] `mayBlock` is `false`
- [ ] `mayAllow` is `false`
- [ ] `forbiddenEffects` is `0`
- [ ] `capabilityTrueCount` is `0`
- [ ] no tool execution is claimed
- [ ] no memory/config write is claimed
- [ ] no publication is claimed
- [ ] no approval/block/allow/authorization/enforcement is claimed

A pass means the redacted bundle passed local offline replay. It does not grant runtime authorization, production safety status, tool permission, memory/config permission, publication permission, or approval/block/allow/enforcement permission.
