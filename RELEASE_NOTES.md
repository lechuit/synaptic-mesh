# Release Notes — Synaptic Mesh v0.17.5

## v0.17.0-alpha protocol/design

Defined limited passive live capture readiness as design/readiness only. Scope remains gated, disabled/manual/operator-run/local/passive/read-only with no enforcement, no authorization, no approval/block/allow, no autonomous live mode, no tool execution, no memory/config writes, no agent-consumed machine-readable policy decisions, and no external effects.

## v0.17.1 capture envelope/schema/readiness fixture

Added a synthetic local envelope fixture for shape-only review. It records disabledByDefault, operatorRun, localOnly, passiveOnly, readOnly, rawPersisted: false, agentConsumedOutput: false, and policyDecision: null.

## v0.17.2 redaction and abort criteria

Added conservative abort criteria for raw persistence, decision verbs, non-local or write-like modes, network/resource fetch hints, daemon/watch/autonomous mode, tool execution, memory/config writes, agent-consumed output, and non-null policyDecision.

## v0.17.3 negative controls and boundary hazards

Added negative controls for boundary hazards. Expected rejects cover unsafe flags and decision laundering; unexpectedPermits: 0.

## v0.17.4 reviewer runbook/public review package

Added reviewer runbook and public review package notes. The branch includes two independent local review notes; they are not GitHub reviews and not deployment approvals.

## v0.17.5 phase close

Closed limited passive live capture readiness as design/readiness only. policyDecision: null; agentConsumedOutput: false; rawPersisted: false; unexpectedPermits: 0; no enforcement; no authorization; no approval/block/allow; no autonomous live mode; no tool execution; no memory/config writes; no external effects.

## Carry-forward prior release boundaries

passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

tiny operator-run passive pilot readiness remains one explicit local sample input at a time with operatorReviewRequired: true; singleSampleOnly: true; packageFixtureInputOnly: true; rawPersisted: false; packageFixtureInputOnly: true; inputPathEscapeRejected: true; unexpectedPermits: 0; no agent-consumed output; no machine-readable policy decision; no enforcement; no authorization; no tool execution; no external effects.
