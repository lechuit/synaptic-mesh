# Framework Compatibility

Synaptic Mesh is designed as a protocol, not as an OpenClaw-only feature.

## Current status in v0.1.0-rc1

- Current validation context: OpenClaw-origin local shadow workflow.
- Included implementation: standalone local shadow/reference package.
- Not included: OpenClaw runtime integration.
- Not included: adapters for LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or other agent frameworks.
- Not included: production/canary/enforcement/L2+ operational use.

## Intended portability

The core receiver-side question is framework-independent:

> If a memory-derived summary has been compressed, paraphrased, or handed off, what authority survives for the next action?

A portable adapter should preserve at least:

- source identity and digest;
- freshness / produced-at data;
- scope and privacy boundary;
- negative boundaries such as denied, stale, sealed, local-only, do-not-promote, or human-required;
- action class;
- receiver-side validation result.

## Candidate adapter tracks

Future adapters could target:

- OpenClaw runtime hooks;
- LangGraph / LangChain memory or middleware nodes;
- AutoGen / CrewAI handoff messages;
- Semantic Kernel memory/planner flows;
- MCP tool wrappers;
- generic JSON schema + CLI validator for custom stacks.

## Adapter rule

Adapters should not treat sender-local labels as authority. The receiver must independently classify the proposed action, boundary, freshness, and negative constraints before allowing action.

## Boundary

This document is a compatibility roadmap only. It does not authorize runtime/tooling integration or production use.
