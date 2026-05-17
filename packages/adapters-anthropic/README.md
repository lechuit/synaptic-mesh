# @aletheia-labs/adapters-anthropic

Anthropic-compatible adapter for Aletheia authority-governed memory.

> **Status**: `0.1.0` public baseline. Reference Anthropic integration is live as a narrow library adapter. It does not own OAuth, API keys, terminal UX, tools, publication, or provider account state.

## Quickstart

```bash
pnpm add @aletheia-labs/core @aletheia-labs/store-sqlite @aletheia-labs/adapters-anthropic @anthropic-ai/sdk
```

```ts
import Anthropic from '@anthropic-ai/sdk';
import { AletheiaAuthority, staticVisibilityPolicy } from '@aletheia-labs/core';
import { AletheiaAnthropicBridge } from '@aletheia-labs/adapters-anthropic';
import { openSqliteStores } from '@aletheia-labs/store-sqlite';

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

`@anthropic-ai/sdk` is an optional peer dependency. `@aletheia-labs/core` stays SDK-free.

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

Everything else is adapter plumbing and may change during the `0.x` line.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia-labs/adapters-anthropic typecheck
pnpm -F @aletheia-labs/adapters-anthropic test
pnpm -F @aletheia-labs/adapters-anthropic build
```

## Boundary

The model may suggest memory. It never grants authority. Receipts, scope, visibility, status, conflicts, freshness, and action classification remain receiver-side checks.
