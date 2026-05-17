# Live LLM E2E Demo

This demo runs Aletheia against a real provider API, not a fixture client.

It uses the published library shape:

- `@aletheia/core` for `AletheiaAuthority`
- `@aletheia/store-sqlite` for storage
- `@aletheia/adapters-openai` or `@aletheia/adapters-anthropic` for the provider bridge
- caller-provided API key and HTTP client

No OAuth, no CLI auth flow, no SDK dependency, and no mock fallback.

## Run

Build first, then provide one provider key:

```bash
pnpm -r run build

OPENAI_API_KEY=... pnpm run demo:live-llm
# or
ANTHROPIC_API_KEY=... ALETHEIA_LIVE_PROVIDER=anthropic pnpm run demo:live-llm
```

Or copy `.env.example` to `.env.local` at the repo root:

```bash
cp .env.example .env.local
```

Then fill in:

```bash
ALETHEIA_LIVE_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
ALETHEIA_LIVE_E2E_REPORT=evidence/live-llm-e2e/anthropic.json
```

`.env.local` is ignored by git. Do not paste real keys into tracked files.
The JSON report can include an `answerPreview` generated from your test prompt, so do not use sensitive real-world content in `ALETHEIA_LIVE_USER_PROMPT`.

Optional environment:

- `ALETHEIA_LIVE_PROVIDER`: `openai` or `anthropic`. If omitted, OpenAI is used when `OPENAI_API_KEY` exists, otherwise Anthropic is used when `ANTHROPIC_API_KEY` exists.
- `OPENAI_MODEL`: default `gpt-4.1-mini`.
- `ANTHROPIC_MODEL`: default `claude-3-5-sonnet-latest`.
- `OPENAI_BASE_URL`: default `https://api.openai.com/v1`.
- `ANTHROPIC_BASE_URL`: default `https://api.anthropic.com/v1`.
- `ALETHEIA_LIVE_DB`: SQLite path. Default `:memory:`.
- `ALETHEIA_LIVE_E2E_REPORT`: optional path to write the sanitized JSON report.
- `ALETHEIA_LIVE_USER_PROMPT`: optional user prompt for the ingestion turn.

## What It Verifies

The script performs one full governed-memory loop:

1. Record a source conversation event.
2. Ask the real LLM to draft memory proposals.
3. Route each draft through `AletheiaAuthority.propose()`.
4. Confirm the first proposed atom through an explicit harness transition that simulates demo-operator verification.
5. Recall verified memory and answer a safe local action.
6. Attempt a sensitive action and verify the model is not called.

The report must end with `boundaryViolations: []`.

If no key is present, the script exits nonzero with setup instructions. It never falls back to a mock.
