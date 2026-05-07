# Adapter boundary for LangGraph and MCP v0

## Status

Design note only. Not an implementation plan approval.

## Context

Synaptic Mesh is still a local shadow research package. The current safe surface is evidence generation, fixture validation, route-decision shape checks, and reviewable documentation. A real LangGraph or MCP adapter would be easy to overstate: even a small wrapper could be mistaken for runtime integration, tool authorization, or production enforcement.

This note records the smallest future adapter boundary so integration discussion can continue without adding framework dependencies, runtime code, MCP/A2A behavior, config, tool execution, or permission claims in this PR.

## Why no real adapter yet

A real adapter is premature because the project still needs stronger evidence that receiver decisions are semantically correct across adversarial inputs and wrong-route cases. The current system can validate local shadow artifacts, but it must not become a bridge that executes tools, mutates state, or claims permission based on sender-provided labels.

Holding the adapter at a design-note boundary keeps the next work reviewable:

- framework-shaped inputs can be discussed without importing framework SDKs;
- authority and route semantics can harden before they influence runtime graphs or MCP clients;
- reviewers can distinguish local shadow evidence from runtime enforcement;
- publication and manifest gates can stay conservative while schemas stabilize.

## Preconditions before any adapter implementation

A later adapter PR must not start until these gates exist and are green in the target branch:

1. Route semantic correctness tests that verify expected `RouteDecision` outcomes for allowed, denied, degraded, abstained, and wrong-route cases.
2. Raw/parser adversarial coverage showing malformed, lossy, sender-labeled, stale, and authority-laundering inputs cannot be promoted into trusted decisions.
3. Benchmark baseline for local shadow validation overhead, with an explicit comparison point before framework wrapping.
4. Stable schema contracts for `Receipt` and `RouteDecision`, including versioning expectations and failure behavior when unknown fields appear.
5. Clear no-runtime safety claims in docs, release notes, manifest metadata, and PR text so adapter-shaped work is not represented as production integration, tool authorization, or enforcement.

## Minimal future adapter boundary

If the prerequisites are met, the first real adapter should be a shadow-only boundary with this shape:

- consume an `AuthorityEnvelope` and/or `Receipt` as an input fixture or validation object;
- normalize only enough framework metadata to create local shadow evidence;
- emit `RouteDecision` evidence only in shadow mode;
- preserve receiver-side verification: sender labels are not authority;
- fail closed to abstain/escalate when required evidence is missing, stale, malformed, or out of scope.

The adapter must not:

- execute tools;
- mutate memory or promote durable memory;
- change config;
- publish externally;
- call network services as part of decision validation;
- claim user permission, policy authority, production readiness, MCP integration, A2A integration, or runtime enforcement;
- bypass review gates based on framework-provided metadata.

## LangGraph-specific note

A future LangGraph adapter could be a node wrapper that accepts graph state containing a receipt-like object, calls the pure local validator, and returns shadow evidence for downstream inspection. The node must be side-effect-free and should be testable without a LangGraph runtime dependency where possible.

Safe first behavior:

- read fixture/state input;
- validate or abstain;
- return a `RouteDecision` evidence object;
- attach no authority beyond the evidence object itself.

Unsafe behavior for the first adapter:

- controlling graph routing that triggers real tools;
- writing to persistent graph memory;
- treating graph state labels as proof of authorization;
- shipping as a production enforcement node.

## MCP-specific note

A future MCP boundary could describe resources or tool descriptors for local shadow validation artifacts, but descriptor presence must not imply permission to execute actions. MCP tool execution is explicitly out of scope until a separate approval and safety gate exists.

Safe first behavior:

- expose read-only validation examples or schema resources;
- validate static receipts/authority envelopes in a local shadow test harness;
- return evidence records suitable for review.

Unsafe behavior for the first adapter:

- registering executable MCP tools that mutate state or call external services;
- using MCP client approval state as receiver authority;
- bridging MCP output directly into memory, config, publication, or tool execution;
- implying compatibility with production MCP servers.

## Non-goals and blocked actions

This design note does not add and does not authorize:

- runtime integration;
- LangGraph SDK integration;
- MCP server/client/tool implementation;
- A2A integration;
- framework adapter code;
- tool execution;
- memory mutation or memory promotion;
- config changes;
- network calls;
- external publication;
- permission, safety, enforcement, or production-readiness claims.

## Required tests before a real adapter PR

Before implementation, a dedicated PR should add or verify tests for:

- route semantic correctness across positive, degraded, denied, abstain, and wrong-route cases;
- parser/raw-input adversarial fixtures and regression tests;
- authority-envelope validation and sender-label distrust;
- receipt schema validation, including version and unknown-field behavior;
- route-decision schema validation and evidence shape stability;
- no-side-effect adapter contract tests that assert no filesystem writes, network calls, memory mutation, config mutation, or tool execution;
- benchmark regression checks for validation overhead;
- docs/manifest/release checks that preserve the local shadow/no-runtime boundary.

## Review focus

Reviewers should treat any future adapter proposal as unsafe unless it can show: stable input/output schemas, independent receiver verification, explicit abstain behavior, no side effects, and no claims that shadow evidence grants permission.
