# Offline real-flow replay

Offline real-flow replay is the first naturalistic test layer after parser normalization evidence.

It uses hand-authored, real-ish handoff examples with gold labels and audit logs:

```text
naturalistic handoff artifact
  -> parserEvidenceRef + parserEvidenceRefHash
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

The replay pack covers:

- planner -> coder local docs handoff -> `shadow_only`;
- coder -> reviewer free-text config/permanent-memory smuggling -> `ask_human`;
- researcher -> planner stale source/policy -> `fetch_source`;
- external doc folded-index hidden runtime/tool authority -> `ask_human`;
- benign folded-index checksum mismatch -> `request_full_receipt`;
- conflicting valid receipts involving config authority -> `ask_human`;
- nested handoff boundary loss -> `request_full_receipt`;
- sender-overclaimed human approval for config/memory/runtime -> `ask_human`;
- stale policy checksum -> `request_policy_refresh`;
- unknown compact grammar digest -> `request_grammar_refresh`;
- explicit destructive delete request -> `block`;
- unparseable authority fragment -> `abstain`;
- reviewer -> coder malformed local receipt -> `request_full_receipt`.

Each replay has:

- a naturalistic raw artifact;
- a `parserEvidenceRef` from the parser normalization fixture set;
- a `parserEvidenceRefHash` over the linked parser fixture's `parserEvidence` plus `routeDecisionInput`, so parser-normalization drift breaks replay validation instead of passing silently;
- a gold-label expected route, compact/human expectations, reason codes, and forbidden effects;
- an observed decision with decisive signals and rejected routes;
- scorecard metrics for false permit, false compact, false human escalation, boundary loss, and wrong route.

## Non-goals

This is not:

- live traffic;
- a live shadow observer;
- an automatic receiver decision;
- a classifier;
- runtime enforcement;
- tool authorization;
- automatic blocking;
- memory write authorization;
- config mutation;
- network access;
- publication readiness;
- production/canary safety evidence.

The goal is to make naturalistic handoff replay measurable before any live observer or runtime work. Passing this gate means each fixture has a hash-bound `goldDecision` and linked parser evidence; it does not mean the receiver can compute the route from raw input by itself. `observedDecision` is deprecated metadata only and new scorecards must not consume it.
