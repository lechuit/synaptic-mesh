# Contributing

Thanks for looking at Aletheia.

The most useful contributions right now are:

- failing tests for authority laundering, stale memory, conflict handling, or
  scope/visibility mistakes;
- small API ergonomics improvements that preserve fail-closed behavior;
- package README improvements and copyable examples;
- provider adapter fixtures that do not pull SDKs into `@aletheia/core`;
- spec clarifications when code and protocol wording diverge.

Please keep these boundaries intact:

- no semantic retrieval, embeddings, or vector stores;
- no automatic promotion to `trusted`;
- no CLI, daemon, watcher, MCP server, or OAuth flow in the initial library
  cycle;
- no weakening TypeScript strictness or zod schema validation;
- no treating confidence, consensus, chain labels, or prose as authority.

Run the normal gates before opening a PR:

```sh
pnpm -r run typecheck
pnpm -r run test
pnpm -r run build
pnpm run smoke:core-e2e
```
