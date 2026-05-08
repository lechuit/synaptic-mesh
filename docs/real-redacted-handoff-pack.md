# Real-redacted handoff pack v0

Status: v0.1.10 fixture-pack gate for the first manually curated real-redacted handoffs.

This pack is the first controlled step after the manual capture protocol and `RedactionReviewRecord` schema. It adds low-risk real-redacted handoff fixtures and expected offline replay artifacts, but it still does **not** add live observation, an observer, runtime integration, daemon/watcher, adapter/MCP/A2A integration, tool execution, memory/config writes, external publication, approval paths, blocking, allowing, authorization, or enforcement.

## What enters the repo

Only redacted metadata and summary-safe labels enter the repo:

- `ManualObservationBundle` records;
- matching `RedactionReviewRecord` records;
- redacted summary labels;
- expected `parserEvidence` shape;
- expected classifier decision;
- expected `DecisionTrace` shape;
- expected `LiveShadowObservationResult` shape;
- scorecard rows.

Raw handoff content does not enter the repo.

## Current cases

The first pack contains three low-risk real-redacted cases:

1. release/boundary review handoff;
2. Planner → Reviewer non-runtime boundary handoff;
3. mild ambiguity case that must degrade conservatively.

All three are expected to remain conservative: selected route `abstain`, result `record_only`, no effects.

## Required counters

The gate expects:

- real-redacted bundles: 3;
- redaction review records: 3;
- parser evidence valid: 3;
- classifier decision pass: 3;
- expected DecisionTrace records: 3;
- expected LiveShadowObservationResult records: 3;
- scorecard rows: 3;
- validation errors: 0;
- raw content persisted: false;
- private paths persisted: false;
- secret-like values persisted: false;
- tool outputs persisted: false;
- memory text persisted: false;
- config text persisted: false;
- approval text persisted: false;
- forbidden effects: 0;
- mayBlock: 0;
- mayAllow: 0;
- capability attempts: 0;
- mismatch: 0.

## Validation

Run:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:real-redacted-handoff-pack
```

Expected result: `pass`, with 3 real-redacted bundles and all operational counters at zero.

## Boundary

This is still fixture-pack evidence only. The next block should connect these records into a real-redacted replay gate. It should not claim that an observer works or that real traffic is being processed.
