# @aletheia/adapters-anthropic

Anthropic-compatible adapter for Aletheia authority-governed memory.

> **Status**: Phase 1.5. Reference Anthropic integration is live as a narrow library adapter. It does not own OAuth, API keys, terminal UX, tools, publication, or provider account state. Package version is still `0.0.0` until the first release version is chosen.

## Quickstart

```bash
pnpm add @aletheia/core @aletheia/store-sqlite @aletheia/adapters-anthropic @anthropic-ai/sdk
```

```ts
import Anthropic from '@anthropic-ai/sdk';
import { AletheiaAuthority, staticVisibilityPolicy } from '@aletheia/core';
import { AletheiaAnthropicBridge } from '@aletheia/adapters-anthropic';
import { openSqliteStores } from '@aletheia/store-sqlite';

const stores = openSqliteStores('./aletheia.sqlite');
const authority = new AletheiaAuthority({
  eventLedger: stores.eventLedger,
  memoryStore: stores.memoryStore,
  conflictRegistry: stores.conflictRegistry,
  visibilityPolicy: staticVisibilityPolicy([{ kind: 'private:user' }]),
});

const bridge = new AletheiaAnthropicBridge({
  client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  authority,
  eventLedger: stores.eventLedger,
  model: 'claude-3-5-sonnet-latest',
});
```

Hosts own credentials, retries, rate limits, and provider selection. This adapter only receives an already-authenticated client.

## What this package does

- Records conversation turns as append-only Aletheia events.
- Asks an Anthropic-compatible client to draft memory proposals as JSON.
- Sends every draft through `AletheiaAuthority.propose()` before anything becomes a MemoryAtom.
- Recalls memory through `AletheiaAuthority.recall()` and re-checks action authority through `tryAct()` before calling the model for an answer.
- Refuses to call the model when recall/action authority fails closed.

## Client contract

The adapter accepts any object with the `messages.create(input)` shape exposed by `@anthropic-ai/sdk`:

```ts
const bridge = new AletheiaAnthropicBridge({
  client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  authority,
  eventLedger,
  model: 'claude-3-5-sonnet-latest',
});
```

`@anthropic-ai/sdk` is an optional peer dependency. `@aletheia/core` stays SDK-free.

## What this package does NOT do

- No OAuth, device login, refresh-token handling, or subscription plumbing.
- No authority upgrade from model output.
- No tool execution.
- No semantic retrieval, embeddings, vector index, or ranking.
- No bypass around `propose`, `recall`, or `tryAct`.

## Stability

Public surface for the initial library cycle:

- `AletheiaAnthropicBridge`
- `AnthropicMessagesClient`
- `ConversationIngestionInput`
- `AnswerWithRecallInput`
- `ConversationIngestionResult`
- `AnswerWithRecallResult`

Everything else is adapter plumbing and may change before the first `0.1.0` release.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/adapters-anthropic typecheck
pnpm -F @aletheia/adapters-anthropic test
pnpm -F @aletheia/adapters-anthropic build
```

## Boundary

The model may suggest memory. It never grants authority. Receipts, scope, visibility, status, conflicts, freshness, and action classification remain receiver-side checks.
