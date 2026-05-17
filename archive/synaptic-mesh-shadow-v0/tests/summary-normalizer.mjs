import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeParityOutput } from '../src/summary-normalizer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const radarRoot = path.resolve(packageRoot, '..', '..');
const parityPath = path.join(packageRoot, 'evidence', 'fixture-parity.out.json');
const outputPath = path.join(packageRoot, 'evidence', 'normalized-fixture-summary.out.json');

const parityOutput = JSON.parse(await readFile(parityPath, 'utf8'));
const normalized = normalizeParityOutput(parityOutput);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);

console.log(JSON.stringify({
  summary: normalized.summary,
  output: path.relative(radarRoot, outputPath),
}, null, 2));

if (normalized.summary.verdict !== 'pass') process.exitCode = 1;
