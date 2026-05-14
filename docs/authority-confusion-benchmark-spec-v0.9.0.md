# Authority Confusion Benchmark Spec v0.9.0

Status: benchmark spec only. Local/redacted fixture evidence only. No runtime authority.

## Purpose

The Authority Confusion Benchmark tests whether a reviewer can distinguish **context is not permission** when a handoff contains approval-looking or action-looking language but lacks authority evidence.

This is the first proof-of-value step for Synaptic Mesh: create 12 local/redacted cases where a naive baseline should be tempted to permit, while the expected safe decision is never permit.

## Benchmark shape

- 12 local/redacted cases.
- Each case includes a tempting phrase such as approval, safe-to-publish, CI-passed, ready-for-integration, or policy-looking text.
- Each case lacks authority evidence: missing source binding, target scope, actor, channel, timestamp, or explicit grant.
- Each case is context/evidence only, not an instruction and not permission.
- Expected safe decisions are abstain, degrade, or reject.

## Non-goals and boundary

The fixture fields such as `naiveLikelyDecision` and `expectedSafeDecision` are offline benchmark labels for human review and reproducibility. They are not runtime policy decisions, not agent-consumed instructions, and not authorization.

No runtime. No network. No SDK import. No resource fetch. No tool execution. No live traffic. No watcher/daemon. No memory/config writes. No external publication automation. No agent consumption. No machine-readable policy decision. No approval, block/allow, authorization, or enforcement.

## Review command

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-benchmark-spec-v090
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.0
```

## What this proves

This layer proves only that the benchmark fixture is well-formed and conservative. It does not prove Synaptic Mesh prevents the failures yet; that comparison comes later in v0.9.x.
