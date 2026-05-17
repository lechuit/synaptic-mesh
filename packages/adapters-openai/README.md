# @aletheia/adapters-openai

OpenAI Responses-compatible adapter for Aletheia authority-governed memory.

> **Status**: Phase 1.5. Reference OpenAI integration is live as a narrow library adapter. It does not own OAuth, API keys, terminal UX, tools, publication, or provider account state. Package version is still `0.0.0` until the first release version is chosen.

## Quickstart

```bash
pnpm add @aletheia/core @aletheia/store-sqlite @aletheia/adapters-openai openai
```

```ts
import OpenAI from 'openai';
import { AletheiaAuthority, staticVisibilityPolicy } from '@aletheia/core';
import { AletheiaOpenAIResponsesBridge } from '@aletheia/adapters-openai';
import { openSqliteStores } from '@aletheia/store-sqlite';

const stores = openSqliteStores('./aletheia.sqlite');
const authority = new AletheiaAuthority({
  eventLedger: stores.eventLedger,
  memoryStore: stores.memoryStore,
  conflictRegistry: stores.conflictRegistry,
  visibilityPolicy: staticVisibilityPolicy([{ kind: 'private:user' }]),
});

const bridge = new AletheiaOpenAIResponsesBridge({
  client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  authority,
  eventLedger: stores.eventLedger,
  model: 'gpt-5',
});
```

Hosts own credentials, retries, rate limits, and provider selection. This adapter only receives an already-authenticated client.

## What this package does

- Records conversation turns as append-only Aletheia events.
- Asks an OpenAI Responses-compatible client to draft memory proposals as JSON.
- Sends every draft through `AletheiaAuthority.propose()` before anything becomes a `MemoryAtom`.
- Recalls memory through `AletheiaAuthority.recall()` and re-checks action authority through `tryAct()` before calling the model for an answer.
- Refuses to call the model when recall/action authority fails closed.

## Client contract

The package does not import the OpenAI SDK. It accepts any caller-provided object with `responses.create(input)`:

```ts
const bridge = new AletheiaOpenAIResponsesBridge({
  client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  authority,
  eventLedger: stores.eventLedger,
  model: 'gpt-5',
});
```

## What this package does NOT do

- No OAuth, device login, refresh-token handling, or ChatGPT subscription plumbing.
- No OpenAI SDK dependency.
- No authority upgrade from model output.
- No tool execution.
- No semantic retrieval, embeddings, vector index, or ranking.
- No bypass around `propose`, `recall`, or `tryAct`.

## Fixture Demo

After building the workspace:

```bash
pnpm -r run build
pnpm -F @aletheia/adapters-openai run demo:fixture
```

The fixture uses a fake Responses client and should print `boundaryViolations: []`.

## Stability

Public surface for the initial library cycle:

- `AletheiaOpenAIResponsesBridge`
- `OpenAIResponsesClient`
- `ConversationIngestionInput`
- `AnswerWithRecallInput`
- `ConversationIngestionResult`
- `AnswerWithRecallResult`

Everything else is adapter plumbing and may change before the first `0.1.0` release.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/adapters-openai typecheck
pnpm -F @aletheia/adapters-openai test
pnpm -F @aletheia/adapters-openai build
pnpm -F @aletheia/adapters-openai run demo:fixture
```
