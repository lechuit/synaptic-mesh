# Manual observation redaction fixture pack v0

Status: unreleased v0.1.9-track offline fixture gate. Not redaction implementation, not live observation, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

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

This is unreleased `v0.1.9-track` work. Repository release metadata remains at the latest published release until a dedicated v0.1.9 release PR is cut. During this track, `release:check -- --target v0.1.8` is a latest-published-release baseline/compatibility gate, not a claim that this work was released under v0.1.8.
