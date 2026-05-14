
# Framework Adapter Reviewer Runbook v0.8.4

Status: human reviewer runbook only. No real framework adapter and no framework authorization.

Framework dry-run evidence is not framework authorization.

## 1. Purpose

Use this runbook to review the v0.8.0 through v0.8.3 evidence before any future discussion about framework integration.

## 2. Quick boundary

- No real framework adapter.
- No SDK imports.
- No MCP server/client.
- No network.
- No resource fetch.
- No tool execution.
- No live traffic.
- No watcher/daemon.
- No runtime.
- No memory/config writes.
- No external publication.
- No agent consumption.
- No machine-readable policy.
- No approval, block/allow, authorization, or enforcement.

## 3. Preflight

Start from a clean working tree. Confirm the release target is `v0.8.4`. Confirm previous v0.8 evidence exists locally before reviewing this runbook.

## 4. Run local validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-adapter-reviewer-runbook-v084
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.4
```

## 5. Read the evidence

Check that go/no-go remains design-only, adapter design remains implementation-blocked, hazard cases wrote no success evidence, and the dry-run contract remains record-only.

## 6. NO-GO triggers

Stop if any evidence or prose implies SDK import, MCP server/client, framework runtime, network, resource fetch, tool execution, live traffic, watcher/daemon, memory/config write, external publication, agent consumption, machine-readable policy, approval, block/allow, authorization, or enforcement.

## 7. Human decision checkpoint

A human may decide whether to continue design review. A human must not treat this runbook as permission to implement. The result is review readiness only.

## 8. What this does not authorize

This runbook does not authorize real framework integration, adapter implementation, SDK import, runtime execution, network access, resource fetch, tool execution, agent-consumed output, machine-readable policy, approval, blocking, allowing, authorization, or enforcement.
