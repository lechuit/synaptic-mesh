# Anthropic E2E Demo

This example documents the Phase 1.4/1.5 path from a Claude-compatible model to governed memory.

The executable fixture demo runs without an API key:

```bash
pnpm -r run build
node examples/anthropic-e2e/fixture-demo.mjs
```

It prints a report with `boundaryViolations: []`.

The adapter contract checks live in `packages/adapters-anthropic/src/anthropic-bridge.test.ts`:

```bash
pnpm -F @aletheia/adapters-anthropic test
```

They verify:

- Session A records a conversation event and sends model-drafted memory through `AletheiaAuthority.propose()`.
- Malformed model JSON writes no memory.
- Recall failure does not call the model.
- Sensitive action classification asks human and does not call the model.
- Local/shadow action calls the model only after `recall()` and `tryAct()` both allow it.

## Live Claude Wiring

Application code can swap the fixture client for the Anthropic SDK:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { AletheiaAuthority, staticVisibilityPolicy } from '@aletheia/core';
import { AletheiaAnthropicBridge } from '@aletheia/adapters-anthropic';
import { openSqliteStores } from '@aletheia/store-sqlite';

const stores = openSqliteStores('./aletheia-demo.sqlite');
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

The bridge still does not treat model output as authority: every proposal goes through the WriteGate, and every answer path re-runs receiver-side action authorization.
