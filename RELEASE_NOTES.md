# Release Notes — Synaptic Mesh v0.16.5

## v0.16.0-alpha pilot protocol and scope

Defined a disabled-by-default, human-started/manual, local-only tiny operator-run passive pilot protocol. Scope is one explicit local sample input at a time, with human review required before any source expansion.

## v0.16.1 tiny pilot runner/harness

Added a tiny runner wrapping passive live shadow redaction/no-enforcement checks. It writes stdout or package evidence JSON only and rejects --watch, --daemon, --network, --execute, --allow, --block, --approve, --enforce, --authorize, and batch/multi-input modes before work.

## v0.16.2 evidence packet metadata

Added an evidence packet shape with operatorReviewRequired: true; singleSampleOnly: true; rawPersisted: false; hashes present; decision verbs sanitized; no agent-consumed output; no machine-readable policy decision.

## v0.16.3 abort criteria and negative controls

Added negative controls for raw private token handling, unsanitized decision verbs, unsafe flags, output escape/symlink attempts, multi-input/batch attempts, and non-null policyDecision/decision. expectedRejects are counted and unexpectedPermits: 0.

## v0.16.4 reviewer runbook

Added the reviewer runbook/audit packet requiring human review before source expansion and reaffirming disabled/manual/local/no-effects only.

## v0.16.5 phase close

tiny operator-run passive pilot readiness only. Next step may be v0.17 limited passive live capture design only if gates and human reviews pass. no agent-consumed output; no machine-readable policy decision; no enforcement; no authorization; no tool execution; no network; no daemon/watcher by default; no watcher/daemon; no framework/SDK adapter; no external effects.

Carry-forward from v0.15: passive live shadow readiness achieved for local operator-run pilot only; v0.16 keeps that readiness disabled/manual/local/no-effects only.
