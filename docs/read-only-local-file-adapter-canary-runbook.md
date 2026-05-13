# Read-only local-file adapter canary runbook

## Status

Manual/local/read-only/record-only adapter canary guidance for `v0.5.0-alpha`.

This runbook is for a human reviewer running or reviewing the first real read-only local-file adapter canary. It documents the narrow allowed path and the stop conditions around it.

It depends on both prior adapter gates:

- PR #3 negative controls: `v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls`
- PR #4 positive canary: `v0.5.0-alpha-pr4-read-only-local-file-adapter-canary`

Explicit dependency labels: PR #3 negative controls; PR #4 positive canary.
Explicit dependency slugs: `v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls`; `v0.5.0-alpha-pr4-read-only-local-file-adapter-canary`.

A passing adapter canary is evidence of local read-only boundary preservation, not runtime authorization.

Un canary pass del adapter prueba preservación local de frontera read-only; no autoriza runtime.

## What this is

The adapter canary is a one-case local proof that the minimal adapter skeleton can process one explicit already-redacted local file through the existing evidence pipeline:

`explicit redacted local file → parserEvidence → existing classifier → DecisionTrace → advisory report → evidence output`

It is evidence for reviewers. It is not a runtime decision point.

## What this is not

- not MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob, or recursive traversal
- not URL input, network input, live traffic, live observer, or session capture
- not raw input persistence
- not tool execution
- not memory/config writes
- not external publication
- not approval, block/allow, authorization, or enforcement
- not a mini receiver
- not agent-consumed policy
- not production readiness or safety certification

## Allowed input

The canary may use exactly one explicit already-redacted local file.

The input must satisfy all of these conditions before the file is read:

1. `schemaVersion` is `read-only-local-file-adapter-input-v0`.
2. `adapterMode` is `manual_local_file_read_only`.
3. `sourceFilePath` names one file inside the repository.
4. `sourceArtifactDigest` is a `sha256:` digest for that file.
5. `sourceAlreadyRedacted` is `true`.
6. `redactionReviewRecord.reviewed` is `true`.
7. `redactionReviewRecord.rawContentPersisted` is `false`.
8. `redactionReviewRecord.sourceAlreadyRedacted` is `true`.
9. `rawContentPersisted` is `false`.
10. `rawInputAllowed`, `networkAllowed`, `directoryInputAllowed`, `globAllowed`, `watcherAllowed`, and `daemonAllowed` are all `false`.

The canary must reject URLs, directory inputs, glob inputs, parent traversal, symlink input, and unknown capability/authority fields before reading a source file.

## Allowed output

The canary may write only local evidence under:

`implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/`

The evidence is an audit record only. It may include parser evidence, DecisionTrace digests, a human-readable advisory report, and summary counters. It must not include raw private input, secrets, raw classifier decisions, agent instructions, or machine-readable policy decisions.

The canary output must keep these fields false everywhere they appear: `toolExecution`, `memoryWrite`, `configWrite`, `externalPublication`, `approvalEmission`, `machineReadablePolicyDecision`, `agentConsumed`, `mayBlock`, `mayAllow`, `authorization`, and `enforcement`.

## How to run the local gates

From `implementation/synaptic-mesh-shadow-v0/`:

```bash
npm run verify:manifest
npm run check
npm run review:local
npm run test:adapter-implementation-hazard-catalog
npm run test:read-only-local-file-adapter-schema
npm run test:read-only-local-file-adapter
npm run test:read-only-local-file-adapter-negative-controls
npm run test:read-only-local-file-adapter-canary
npm run test:read-only-local-file-adapter-canary-runbook
```

For the final `v0.5.0-alpha` release branch after PR #6 release metadata updates `MANIFEST.json` to `0.5.0-alpha`, run:

```bash
npm run release:check -- --target v0.5.0-alpha
```

This final release command is intentionally not an applicable PR #5 gate while `MANIFEST.json` still targets `v0.4.8`; it becomes mandatory in PR #6 and the final release check.

Do not reinterpret a passing local canary as permission to enable a runtime adapter, watcher, daemon, network path, approval path, block/allow path, authorization path, or enforcement path.

## What pass means

A passing canary means:

- exactly one explicit already-redacted local file was read
- the source digest was verified
- parser evidence was produced
- the existing classifier stage was called
- a DecisionTrace was produced
- a human-readable advisory report was produced
- output remained record-only local evidence
- forbidden effect count stayed zero
- capability true count stayed zero
- raw classifier decision fields were not persisted

A pass is useful evidence that the local read-only boundary held for this one canary case.

## What pass does not mean

A pass does not mean:

- runtime authorization exists
- enforcement exists
- an agent may consume the evidence as a policy decision
- a receiver has been replaced or bypassed
- raw input can be processed
- network, URL, directory, glob, watcher, daemon, MCP, A2A, LangGraph, or GitHub-bot integrations are allowed
- tools, memory writes, config writes, external publication, approvals, blocking, allowing, authorization, or enforcement are allowed
- production readiness or safety certification has been established

## When to abort

Abort before running or accepting the canary if any of these are true:

- the source file is not explicitly named
- the source file is not already redacted
- the redaction review record is missing or not reviewed
- raw content was persisted
- the input path is a URL, directory, glob, traversal, symlink, or outside-repository path
- output would be written outside the fixed adapter evidence directory
- unknown capability or authority fields appear in the input
- raw classifier decisions or route/tool authorization fields would be returned or persisted
- any tool/memory/config/publication/approval/block/allow/authorization/enforcement field becomes true
- a reviewer wants to use the canary as operational permission

A failed canary is still evidence. Record the failure, keep it local, and fix the boundary or test in a later review step. Do not bypass the boundary to make the canary pass.
