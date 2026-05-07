# Offline real-flow replay

Offline real-flow replay is the first naturalistic test layer after parser normalization evidence.

It uses hand-authored, real-ish handoff examples with gold labels and audit logs:

```text
naturalistic handoff artifact
  -> parserEvidenceRef
  -> observed RouteDecision fixture
  -> gold label comparison
  -> scorecard / audit log
```

Current gate:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run test:real-flow-replay
```

## What is covered

The initial replay pack covers:

- planner -> coder local docs handoff -> `shadow_only`;
- coder -> reviewer free-text config/permanent-memory smuggling -> `ask_human`;
- researcher -> planner stale source/policy -> `fetch_source`;
- external doc folded-index hidden runtime/tool authority -> `ask_human`;
- reviewer -> coder malformed local receipt -> `request_full_receipt`.

Each replay has:

- a naturalistic raw artifact;
- a `parserEvidenceRef` from the parser normalization fixture set;
- a gold-label expected route, compact/human expectations, reason codes, and forbidden effects;
- an observed decision with decisive signals and rejected routes;
- scorecard metrics for false permit, false compact, false human escalation, boundary loss, and wrong route.

## Non-goals

This is not:

- live traffic;
- a live shadow observer;
- a classifier;
- runtime enforcement;
- tool authorization;
- automatic blocking;
- memory write authorization;
- config mutation;
- network access;
- publication readiness;
- production/canary safety evidence.

The goal is to make naturalistic handoff replay measurable before any live observer or classifier work.
