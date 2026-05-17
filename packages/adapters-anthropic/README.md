# @aletheia/adapters-anthropic

Anthropic-compatible adapter for Aletheia authority-governed memory.

> **Status**: Phase 1.4. Reference LLM integration is live as a narrow adapter. It does not add authority, execute tools, publish externally, or bypass `propose`, `recall`, or `tryAct`.

## What this package does

- Records conversation turns as append-only Aletheia events.
- Asks an Anthropic-compatible client to draft memory proposals as JSON.
- Sends every draft through `AletheiaAuthority.propose()` before anything becomes a MemoryAtom.
- Recalls memory through `AletheiaAuthority.recall()` and re-checks action authority through `tryAct()` before calling the model for an answer.
- Refuses to call the model when recall/action authority fails closed.

## Client contract

The adapter accepts the shape exposed by `@anthropic-ai/sdk`:

```ts
const bridge = new AletheiaAnthropicBridge({
  client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  authority,
  eventLedger,
  model: 'claude-3-5-sonnet-latest',
});
```

`@anthropic-ai/sdk` is an optional peer dependency so `@aletheia/core` and local fixture tests remain SDK-free.

## Boundary

The model may suggest memory. It never grants authority. Receipts, scope, visibility, status, conflicts, freshness, and action classification remain receiver-side checks.
