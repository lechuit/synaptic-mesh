# v0.4.7 — First real adapter design note

Status: design note only
Reviewed base: v0.4.6 human review closeout of v0.4.5
Scope: paper/design only; no adapter implementation

## Decision

Proceed to design the first possible real adapter boundary.

Do **not** implement it in v0.4.7.

The first possible real adapter is intentionally boring:

```text
read-only local-file adapter
input: one explicit already-redacted local file
output: evidence record-only
```

## Why this adapter

The v0.4.6 human review found `openBlockingRisks: 0` for the v0.4.5 boundary package and allowed `goToRealAdapterDesign: true` while keeping `goToRealAdapterImplementation: false`.

This design note converts that permission into a narrow candidate design, not runtime code.

## Non-goals

This design does not include and does not authorize:

- implementation;
- v0.5.0-alpha;
- real adapter execution;
- MCP client/server;
- A2A integration;
- LangGraph integration;
- GitHub bot;
- framework SDK import;
- watcher;
- daemon;
- directory scan;
- glob input;
- directory traversal;
- symlink escape;
- URL input;
- network call;
- live traffic;
- raw unredacted input;
- tool execution;
- memory write;
- config write;
- external publication;
- agent instruction;
- machine-readable policy decision;
- approval;
- block/allow;
- authorization;
- enforcement.

## Adapter candidate shape

### Input contract

The adapter may accept exactly one input reference:

```json
{
  "kind": "explicit_local_file_ref",
  "path": "<single explicit local file path>",
  "redactionStatus": "already_redacted",
  "operatorIntent": "human_review_evidence_only"
}
```

Input constraints:

- exactly one file;
- path must be explicit;
- file must already be redacted;
- no directory input;
- no glob;
- no URL;
- no network location;
- no implicit workspace scan;
- no live/session/log/channel input;
- no automatic discovery.

### Output contract

The adapter may emit only evidence records:

```json
{
  "kind": "read_only_local_file_adapter_evidence",
  "sourceRef": "explicit_local_file_ref",
  "sourceDigest": "sha256:<digest>",
  "parserEvidence": {},
  "decisionTrace": {},
  "advisoryReport": {},
  "recordOnly": true,
  "agentConsumed": false,
  "machineReadablePolicyDecision": false,
  "toolExecution": false,
  "memoryWrite": false,
  "configWrite": false,
  "externalPublication": false,
  "approvalEmission": false,
  "mayBlock": false,
  "mayAllow": false,
  "authorization": false,
  "enforcement": false
}
```

Output constraints:

- evidence record-only;
- human review evidence only;
- no command packet;
- no agent instruction packet;
- no permission token;
- no approval token;
- no executable action plan;
- no machine-readable runtime policy.

## Path and containment rules

A future implementation proposal must reject:

- glob patterns;
- directories;
- parent traversal;
- symlink escape;
- output outside the declared evidence path;
- hidden/bidi path confusion;
- URL-like input;
- environment-variable expansion that changes source scope;
- multiple-file expansion;
- implicit reads of neighboring files.

## Required pre-implementation hazards

Before any implementation, v0.4.8 must catalog expected failures for at least:

- raw input;
- URL input;
- directory input;
- glob input;
- symlink escape;
- output outside evidence;
- agent-consumed output;
- machine-readable policy leak;
- tool execution attempt;
- memory write attempt;
- config write attempt;
- external publication attempt;
- approval attempt;
- block/allow attempt;
- authorization attempt;
- enforcement attempt.

## Go / no-go result

```json
{
  "firstRealAdapterDesignNote": "pass",
  "releaseLayer": "v0.4.7",
  "basedOnHumanReview": "v0.4.6",
  "candidateAdapter": "read_only_local_file_adapter",
  "designOnly": true,
  "implementationAuthorized": false,
  "goToHazardCatalog": true,
  "goToV050AlphaImplementation": false,
  "requiresMaintainerDecisionForImplementation": true,
  "inputLimit": "one_explicit_already_redacted_local_file",
  "outputLimit": "evidence_record_only",
  "globAllowed": false,
  "directoryInputAllowed": false,
  "directoryTraversalAllowed": false,
  "symlinkEscapeAllowed": false,
  "urlInputAllowed": false,
  "networkAllowed": false,
  "watcherAllowed": false,
  "daemonAllowed": false,
  "frameworkSdkAllowed": false,
  "mcpAllowed": false,
  "langGraphAllowed": false,
  "githubBotAllowed": false,
  "toolExecution": false,
  "memoryWrite": false,
  "configWrite": false,
  "externalPublication": false,
  "agentInstruction": false,
  "approvalEmission": false,
  "mayBlock": false,
  "mayAllow": false,
  "authorization": false,
  "enforcement": false
}
```

## Next allowed action

`v0.4.8 — adapter implementation hazard catalog`.

The next step may catalog expected failures. It must not implement the adapter.
