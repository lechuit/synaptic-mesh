# Deterministic route classifier v0

Deterministic route classifier v0 is a shadow-only classifier over already-normalized parser evidence.

```text
hand-authored parserEvidence + routeDecisionInput
  -> deterministic-route-classifier-v0
  -> shadow RouteDecision
  -> fixture expected-decision comparison
```

Current gate:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run test:route-classifier-shadow
```

## What it does

- consumes `parserEvidence` and `routeDecisionInput` fixture records;
- chooses one canonical route from the RouteDecision vocabulary;
- emits reason codes, decisive signals, rejected routes, and explicit classifier boundary metadata;
- compares classified routes against parser-normalization expected decisions;
- reports false-permit and false-compact rates;
- includes a negative control proving `candidateSummary.sensitiveSignals` cannot be ignored for `shadow_only` permits.

## What it does not do

This is not:

- raw untrusted-input parsing;
- a live shadow observer;
- runtime enforcement;
- automatic blocking;
- tool authorization;
- memory write authorization;
- config mutation;
- network access;
- publication readiness;
- a trained or learned classifier;
- semantic robustness proof.

The classifier is intentionally deterministic and local-shadow only. It is useful for measuring route logic against fixtures before any live observer or runtime work exists.
