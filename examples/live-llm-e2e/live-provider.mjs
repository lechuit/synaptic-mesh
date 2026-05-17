import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { AletheiaAnthropicBridge } from '../../packages/adapters-anthropic/dist/index.js';
import { AletheiaOpenAIResponsesBridge } from '../../packages/adapters-openai/dist/index.js';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';

export function selectLiveProvider() {
  const requested = (process.env.ALETHEIA_LIVE_PROVIDER ?? '').trim().toLowerCase();
  const openaiKey = envValue('OPENAI_API_KEY');
  const anthropicKey = envValue('ANTHROPIC_API_KEY');
  if (requested !== '' && requested !== 'openai' && requested !== 'anthropic') {
    throw new Error('ALETHEIA_LIVE_PROVIDER must be "openai" or "anthropic".');
  }

  if ((requested === 'openai' || requested === '') && openaiKey !== undefined) {
    const client = new OpenAIResponsesHttpClient({
      apiKey: openaiKey,
      baseUrl: envValue('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1',
    });
    const model = envValue('OPENAI_MODEL') ?? DEFAULT_OPENAI_MODEL;
    return {
      name: 'openai',
      model,
      callCount: () => client.callCount,
      bridge: ({ authority, eventLedger }) =>
        new AletheiaOpenAIResponsesBridge({
          client,
          authority,
          eventLedger,
          model,
        }),
    };
  }

  if ((requested === 'anthropic' || requested === '') && anthropicKey !== undefined) {
    const client = new AnthropicMessagesHttpClient({
      apiKey: anthropicKey,
      baseUrl: envValue('ANTHROPIC_BASE_URL') ?? 'https://api.anthropic.com/v1',
    });
    const model = envValue('ANTHROPIC_MODEL') ?? DEFAULT_ANTHROPIC_MODEL;
    return {
      name: 'anthropic',
      model,
      callCount: () => client.callCount,
      bridge: ({ authority, eventLedger }) =>
        new AletheiaAnthropicBridge({
          client,
          authority,
          eventLedger,
          model,
        }),
    };
  }

  throw new Error(
    [
      'No live provider key found. This demo does not use mocks.',
      'Set OPENAI_API_KEY for OpenAI Responses, or ANTHROPIC_API_KEY with ALETHEIA_LIVE_PROVIDER=anthropic.',
      'You can place those values in .env.local; this script loads it automatically.',
      'Build first with: pnpm -r run build',
    ].join('\n'),
  );
}

export function envValue(name) {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return undefined;
  return value;
}

export async function maybeWriteJsonReport(reportPath, report) {
  if (reportPath === undefined || reportPath.trim() === '') return;
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

export async function loadLocalEnv() {
  const envPath = process.env.ALETHEIA_ENV_FILE ?? '.env.local';
  let text;
  try {
    text = await readFile(envPath, 'utf8');
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') return;
    throw err;
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const equalsAt = line.indexOf('=');
    if (equalsAt <= 0) continue;
    const key = line.slice(0, equalsAt).trim();
    const value = unquoteEnvValue(line.slice(equalsAt + 1).trim());
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

class OpenAIResponsesHttpClient {
  callCount = 0;

  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  responses = {
    create: async (input) => {
      this.callCount += 1;
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`OpenAI Responses API ${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  };
}

class AnthropicMessagesHttpClient {
  callCount = 0;

  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  messages = {
    create: async (input) => {
      this.callCount += 1;
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Anthropic Messages API ${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  };
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
