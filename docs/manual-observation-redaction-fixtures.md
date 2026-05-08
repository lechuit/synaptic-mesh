# Manual observation redaction fixture pack v0

Status: v0.1.9 offline fixture gate. Not redaction implementation, not live observation, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

This fixture pack defines positive redacted manual observation cases and negative synthetic leakage labels for the manual-offline ingestion track.

## Boundary

This pack does **not**:

- persist real raw prompts, transcripts, secrets, tool outputs, memory/config text, approval text, or private paths
- implement redaction code
- capture live traffic
- read live logs or sessions
- implement a live observer, watcher, daemon, CLI, MCP endpoint, GitHub hook, or adapter
- execute tools, write memory/config, publish externally, approve, block, allow, authorize, or enforce

Negative cases use synthetic labels such as `SECRET_LIKE_VALUE_PLACEHOLDER`; they are not real secrets or captured raw content.

## Coverage

The fixture pack covers rejection labels for:

- raw prompt persistence
- secret-like value persistence
- tool output persistence
- memory text persistence
- config text persistence
- approval text persistence
- private path persistence
- capability attempts

The expected counters remain strict:

- `redactionFailures: 0`
- `rawContentPersisted: false`
- `privatePathPersisted: false`
- `secretLikeValuePersisted: false`
- `toolOutputPersisted: false`
- `memoryTextPersisted: false`
- `configTextPersisted: false`
- `approvalTextPersisted: false`
- `capabilityAttempts: 0`
- `forbiddenEffects: 0`
- `humanReviewRequiredForCapture: true`

## Release boundary

This is included in the `v0.1.9` public review package. `release:check -- --target v0.1.9` verifies this gate as local/offline evidence only, not runtime readiness.

## Parser evidence replay follow-up

The next v0.1.9 offline gate is [Manual bundle parserEvidence replay v0](manual-bundle-parser-evidence-replay.md). It maps accepted redacted manual bundles into parserEvidence shape only; it does not compute classifier decisions, generate DecisionTrace records, observe live traffic, execute tools, write memory/config, publish, approve, block, allow, or enforce.
