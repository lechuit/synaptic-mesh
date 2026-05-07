# Local benchmark/overhead harness

Status: **deterministic local fixture benchmark only**. This is not a live LLM benchmark, not an external API benchmark, not a runtime classifier, and not runtime enforcement.

## Authority overhead benchmark

The local shadow package includes a dependency-free harness:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run test:authority-benchmark
```

It reads:

```text
implementation/synaptic-mesh-shadow-v0/fixtures/authority-overhead-benchmark-cases.json
```

and writes:

```text
implementation/synaptic-mesh-shadow-v0/evidence/authority-overhead-benchmark.out.json
```

## Compared representation modes

The fixture benchmark compares four hand-authored representations for the same oracle cases:

- `naive_summary` — short prose with likely boundary loss;
- `full_context` — verbose context preserving all relevant details;
- `simple_receipt` — compact receipt-like text;
- `authority_envelope` — structured AuthorityEnvelope-style record.

The cases cover local shadow allow, external prose authority claims, hidden memory promotion, stale source revalidation, policy-window refresh, and tampered next-allowed-action blocking.

## Metrics

The harness reports deterministic proxy metrics only:

- `tokenCostProxy`: character and byte counts plus `approxTokens = ceil(unicode character count / 4)`. This is a tokenizer-free proxy, not a model-specific token count.
- `wrongRouteRate`: observed route differs from the fixed oracle route.
- `falseCompactRate`: compacted representation had a wrong route.
- `falseHumanEscalationRate`: observed `ask_human` when the oracle did not require a human.
- `falseAllowRate` / `falsePermitRate`: observed `shadow_only` when the oracle expected a non-permit route.
- `boundaryLossRate`: required boundary fields are absent from the representation.
- `receiverDecisionAccuracy`: exact fixed-oracle route match.
- `decisionClassAccuracy`: coarse permit/block/human/defer class match.
- `clarityScore`: mechanical heuristic, `45%` signal retention + `45%` boundary retention + `10%` structured-record bonus. It is not a subjective quality score.

`latencyMs` is intentionally `null` in scored output. Local micro-timing would make committed evidence flaky, so the benchmark does not set latency thresholds or claim latency performance.

## Limitations

The benchmark is useful for repeatable local evidence about representation overhead tradeoffs, but it does not prove runtime safety. In particular:

- fixture strings are hand-authored, not model-generated;
- no external API calls or live LLM calls are made;
- no semantic classifier is implemented;
- no real framework adapter, MCP/A2A adapter, or runtime host integration is measured;
- route results are scored against fixed oracle cases only.
