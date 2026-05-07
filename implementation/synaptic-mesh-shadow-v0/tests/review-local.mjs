import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const radarRoot = resolve(packageRoot, '..', '..');
const evidencePath = resolve(packageRoot, 'evidence/review-local.out.json');

const commands = [
  {
    id: 'syntax-core-reference',
    args: ['--check', resolve(packageRoot, 'src/types.mjs')],
  },
  {
    id: 'syntax-receipt-parser',
    args: ['--check', resolve(packageRoot, 'src/receipt-parser.mjs')],
  },
  {
    id: 'syntax-receipt-validator',
    args: ['--check', resolve(packageRoot, 'src/receipt-validator.mjs')],
  },
  {
    id: 'syntax-cli',
    args: ['--check', resolve(packageRoot, 'bin/validate-receipt.mjs')],
  },
  {
    id: 'receipt-parser-validator-tests',
    args: [resolve(packageRoot, 'tests/receipt-parser-validator.mjs')],
  },
  {
    id: 'receipt-transform-regression-tests',
    args: [resolve(packageRoot, 'tests/receipt-transform-regression.mjs')],
  },
  {
    id: 'cli-validator-tests',
    args: [resolve(packageRoot, 'tests/cli-validator.mjs')],
  },
  {
    id: 'synthetic-handoff-examples-tests',
    args: [resolve(packageRoot, 'tests/synthetic-handoff-examples.mjs')],
  },
  {
    id: 'partial-receipt-degrade-tests',
    args: [resolve(packageRoot, 'tests/partial-receipt-degrade.mjs')],
  },
  {
    id: 'fixture-parity-harness',
    args: [resolve(packageRoot, 'tests/fixture-parity.mjs')],
  },
  {
    id: 'normalized-summary-adapter',
    args: [resolve(packageRoot, 'tests/summary-normalizer.mjs')],
  },
];

const rows = commands.map((command) => {
  const proc = spawnSync(process.execPath, command.args, {
    cwd: radarRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  return {
    id: command.id,
    command: [process.execPath, ...command.args.map((arg) => arg.startsWith(radarRoot) ? arg.slice(radarRoot.length + 1) : arg)].join(' '),
    status: proc.status,
    pass: proc.status === 0,
    stderr: proc.stderr.trim(),
  };
});

function readJson(relativePath) {
  try {
    return JSON.parse(Buffer.from(spawnSync('cat', [resolve(radarRoot, relativePath)], { encoding: 'buffer' }).stdout).toString('utf8'));
  } catch {
    return null;
  }
}

const fixtureParity = readJson('implementation/synaptic-mesh-shadow-v0/evidence/fixture-parity.out.json');
const normalizedSummary = readJson('implementation/synaptic-mesh-shadow-v0/evidence/normalized-fixture-summary.out.json');
const transformRegression = readJson('implementation/synaptic-mesh-shadow-v0/evidence/receipt-transform-regression.out.json');
const cliValidator = readJson('implementation/synaptic-mesh-shadow-v0/evidence/cli-validator.out.json');
const syntheticHandoff = readJson('implementation/synaptic-mesh-shadow-v0/evidence/synthetic-handoff-examples.out.json');
const partialDegrade = readJson('implementation/synaptic-mesh-shadow-v0/evidence/partial-receipt-degrade.out.json');

const unsafeAllowSignals = [
  ...(fixtureParity?.summary?.nonRegressionUnsafeAllowFixtures ?? []),
  ...((normalizedSummary?.summary?.nonRegressionUnsafeAllowFixtures ?? [])),
];
if (Number(transformRegression?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('receipt-transform-regression');
if (Number(cliValidator?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('cli-validator');
if (Number(syntheticHandoff?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('synthetic-handoff-examples');
if (Number(partialDegrade?.summary?.unsafeAllows ?? 0) !== 0) unsafeAllowSignals.push('partial-receipt-degrade');

const summary = {
  artifact: 'T-synaptic-mesh-review-local-runner-v0',
  timestamp: '2026-05-06T19:33:00Z',
  verdict: rows.every((row) => row.pass) && unsafeAllowSignals.length === 0 ? 'pass' : 'fail',
  commands: rows.length,
  passCommands: rows.filter((row) => row.pass).length,
  failedCommands: rows.filter((row) => !row.pass).map((row) => row.id),
  fixtureCount: fixtureParity?.summary?.fixtureCount ?? null,
  fixtureParityVerdict: fixtureParity?.summary?.verdict ?? null,
  normalizedFixtureCount: normalizedSummary?.summary?.normalizedFixtureCount ?? null,
  transformRegressionVerdict: transformRegression?.summary?.verdict ?? null,
  cliValidatorVerdict: cliValidator?.summary?.verdict ?? null,
  syntheticHandoffVerdict: syntheticHandoff?.summary?.verdict ?? null,
  partialReceiptDegradeVerdict: partialDegrade?.summary?.verdict ?? null,
  unsafeAllowSignals,
  sourceFixtureMutation: false,
};

const output = {
  summary,
  rows,
  boundary: [
    'local_review_only',
    'not_runtime_integration',
    'not_config',
    'not_publication',
    'not_enforcement',
    'no_external_effects',
  ],
};

mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
