# @aletheia/core

The core authority engine of Aletheia: memory as governance for LLM agents.

> **Status**: Phase 1.5. The public consumer facade (`AletheiaAuthority`) and strict TypeScript domain/storage/runtime contracts are live. Package version is still `0.0.0` until the first release version is chosen.

## Quickstart

```bash
pnpm add @aletheia/core @aletheia/store-sqlite
```

```ts
import { AletheiaAuthority, staticVisibilityPolicy } from '@aletheia/core';
import { openSqliteStores } from '@aletheia/store-sqlite';

const stores = openSqliteStores('./aletheia.sqlite');
const authority = new AletheiaAuthority({
  eventLedger: stores.eventLedger,
  memoryStore: stores.memoryStore,
  conflictRegistry: stores.conflictRegistry,
  visibilityPolicy: staticVisibilityPolicy([{ kind: 'private:user' }]),
});
```

Hosts provide storage and visibility policy. LLM adapters are optional and live outside core.

## Consumer API

Parse raw literals through the exported zod schemas when constructing values
by hand; they preserve the branded ID types used by the runtime contracts.
This assumes the source event already exists in the ledger and recalled atoms
have reached an actionable status (`verified` or `trusted`).

```ts
import {
  ActionContextSchema,
  MemoryProposalSchema,
  ProposedActionSchema,
  RecallQuerySchema,
} from '@aletheia/core';

const proposalResult = await authority.propose(
  MemoryProposalSchema.parse({
    proposalId: 'prop-1',
    proposedBy: 'agent-1',
    proposedAt: '2026-05-17T12:00:00Z',
    candidateType: 'preference',
    claim: 'The user prefers concise Spanish progress updates.',
    sourceEventIds: ['evt-1'],
    intendedScope: { kind: 'project', projectId: 'demo' },
    intendedVisibility: { kind: 'private:user' },
    riskLevel: 'low_local',
    knownConflicts: [],
  }),
);

const recall = await authority.recall(
  RecallQuerySchema.parse({
    agentId: 'agent-1',
    scope: { kind: 'project', projectId: 'demo' },
    limit: 5,
  }),
);

const action = await authority.tryAct(
  ProposedActionSchema.parse({ classifiedAction: 'local_report', target: 'local summary' }),
  ActionContextSchema.parse({
    agentId: 'agent-1',
    scope: { kind: 'project', projectId: 'demo' },
    citedMemoryIds: recall.atoms.map((atom) => atom.memoryId),
  }),
);

console.log(proposalResult.decision.outcome, recall.decision.outcome, action.decision.outcome);
```

Every call returns a structured decision. Memory text, receipts, model prose, confidence, and consensus never grant permission by themselves.

## What this package does

- **Domain schemas and types**: `Receipt`, `CompressedReceipt`, `MemoryAtom`, `MemoryProposal`, `ActionContextPacket`, `Coverage`, `ConflictRecord`, `Decision`, and discriminated unions for status/scope/visibility.
- **Storage interfaces**: `EventLedger`, `MemoryStore`, and `ConflictRegistry`. Implementations live in other packages.
- **WriteGate**: validates source events, scope, visibility, risk, and conflict boundaries before memory insertion.
- **RetrievalRouter**: non-semantic recall by visibility, scope, status, type, freshness, and conflict state.
- **ActionAuthorizer**: receiver-side `tryAct()` guard. Sensitive actions always ask human.
- **AletheiaAuthority**: small facade exposing `propose()`, `recall()`, and `tryAct()`.

## Fail-closed examples

- No permitted visibility -> `deny` or `fetch_abstain`.
- Missing source event -> `deny`.
- Candidate memory cited for action -> `fetch_abstain`.
- Sealed or human-required memory -> `ask_human`.
- Sensitive action (`external_send`, `delete`, `publication`, etc.) -> `ask_human`.
- Unresolved conflict touching cited memory -> `conflict_boundary_packet`.

## What this package does NOT do

- No embeddings, vector store, semantic retrieval, or ranking.
- No LLM SDK dependency. Use `@aletheia/adapters-anthropic`, `@aletheia/adapters-openai`, or your own adapter.
- No OAuth, CLI, MCP server, daemon, watcher, or terminal UX.
- No authorization service. Aletheia classifies memory authority; your host still owns real-world permissions.
- No automatic promotion to `trusted`.

## Stability

Public surface for the initial library cycle:

- `AletheiaAuthority`
- `WriteGate`, `RetrievalRouter`, `ActionAuthorizer` from `@aletheia/core/runtime`
- storage interfaces exported from `@aletheia/core`
- zod schemas and inferred types from `@aletheia/core` or `@aletheia/core/types`
- decision outcomes and reason shapes

Still pre-`0.1.0`: breaking changes are possible while the release shape is pinned. After `0.1.0`, changes to `propose()`, `recall()`, `tryAct()`, exported schemas, storage interfaces, or decision unions should be treated as semver-relevant.

Schema changes matter operationally: changing `MemoryAtomSchema` or receipt schemas can affect persisted stores and should be paired with migration/replay guidance.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/core typecheck
pnpm -F @aletheia/core test
pnpm -F @aletheia/core build
pnpm -F @aletheia/core smoke:e2e
```

Publish dry-run:

```bash
pnpm -F @aletheia/core publish --dry-run --no-git-checks
```

## Specs

This package implements:

- `specs/aletheia-memory-authority-v0.md` — system architecture.
- `specs/memory-authority-receipt-v0.md` — receipt contract.
- `specs/compressed-temporal-receipt-v0.md` — compressed-temporal-receipt format.

Where the spec is ambiguous, fix the spec first.
