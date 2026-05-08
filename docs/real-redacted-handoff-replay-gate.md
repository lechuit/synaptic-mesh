# Real-redacted handoff replay gate v0

Status: v0.1.10 offline replay gate for manually reviewed real-redacted handoffs.

This gate consumes the first real-redacted handoff pack and runs it through the offline replay chain:

`ManualObservationBundle` + `RedactionReviewRecord` → `parserEvidence` → classifier decision → `DecisionTrace` → `LiveShadowObservation` → `LiveShadowObservationResult` → replay rows.

It is still offline/local evidence only. It does **not** add a live observer, runtime integration, daemon/watcher, adapter/MCP/A2A integration, tool execution, memory/config writes, external publication, approval paths, blocking, allowing, authorization, or enforcement.

## What this proves

The gate is intended to prove only this:

> The offline pipeline accepts real-redacted handoffs under human review.

It must not be described as proving that an observer works, that live traffic is processed, or that runtime monitoring is safe.

## Input requirements

The source pack must contain exactly three manually reviewed real-redacted cases. Each case must include:

- `ManualObservationBundle`;
- `RedactionReviewRecord`;
- expected `parserEvidence`;
- expected classifier decision;
- expected `DecisionTrace`;
- expected `LiveShadowObservationResult`;
- scorecard row.

The replay gate verifies that raw content, private paths, secret-like values, tool outputs, memory text, config text, approval text, private identifiers, live traffic, and runtime logs are absent from the durable artifacts.

## Expected gate output

The gate must generate and compare the following artifacts against the expected artifacts embedded in the source pack:

- classifier decision;
- `DecisionTrace`;
- `LiveShadowObservationResult`;
- replay scorecard row.

The gate must report:

- real-redacted bundles: 3;
- redaction review records: 3;
- `parserEvidence`: pass;
- classifier decision: pass;
- `DecisionTrace`: pass;
- `LiveShadowObservationResult`: `record_only`;
- traces: 3;
- observations: 3;
- results: 3;
- validation errors: 0;
- mismatch: 0;
- false permits: 0;
- false compacts: 0;
- boundary loss: 0;
- forbidden effects: 0;
- mayBlock: 0;
- mayAllow: 0;
- capability attempts / true capability flags: 0;
- all raw/private/sensitive persistence flags: false.

## Conservative route expectation

The first real-redacted replay gate intentionally expects all cases to remain conservative (`abstain`) because the source is redacted metadata, not raw evidence. This prevents the first real-redacted step from silently becoming a permission/allow path.

## Validation

Run:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:real-redacted-handoff-replay-gate
```

Expected result: `pass`, with 3 traces, 3 observations, 3 `record_only` results, exact generated-vs-expected `LiveShadowObservationResult` and replay scorecard row matches, and all operational counters at zero.
