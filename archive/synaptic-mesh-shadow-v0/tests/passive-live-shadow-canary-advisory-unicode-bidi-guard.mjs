import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-advisory-unicode-bidi-guard-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-advisory-unicode-bidi-guard.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.3.1');
assert.equal(fixture.dependsOn, 'v0.3.0-alpha-advisory-report');
assert.equal(fixture.mode, 'manual_local_advisory_unicode_bidi_guard_record_only');

const forbiddenControls = new Map([
  [0x202A, 'LEFT-TO-RIGHT EMBEDDING'],
  [0x202B, 'RIGHT-TO-LEFT EMBEDDING'],
  [0x202C, 'POP DIRECTIONAL FORMATTING'],
  [0x202D, 'LEFT-TO-RIGHT OVERRIDE'],
  [0x202E, 'RIGHT-TO-LEFT OVERRIDE'],
  [0x2066, 'LEFT-TO-RIGHT ISOLATE'],
  [0x2067, 'RIGHT-TO-LEFT ISOLATE'],
  [0x2068, 'FIRST STRONG ISOLATE'],
  [0x2069, 'POP DIRECTIONAL ISOLATE'],
  [0x200B, 'ZERO WIDTH SPACE'],
  [0x200C, 'ZERO WIDTH NON-JOINER'],
  [0x200D, 'ZERO WIDTH JOINER'],
  [0x2060, 'WORD JOINER'],
  [0xFEFF, 'ZERO WIDTH NO-BREAK SPACE / BOM'],
]);

const bidiControls = new Set([0x202A, 0x202B, 0x202C, 0x202D, 0x202E, 0x2066, 0x2067, 0x2068, 0x2069]);
const invisibleControls = new Set([0x200B, 0x200C, 0x200D, 0x2060, 0xFEFF]);
const confusablePathRanges = [
  [0x0370, 0x03FF], // Greek and Coptic
  [0x0400, 0x04FF], // Cyrillic
  [0x0500, 0x052F], // Cyrillic supplement
];

const textExtensions = new Set(['.json', '.md', '.mjs', '.js', '.txt', '.yaml', '.yml']);
const scanRoots = [
  'docs',
  'RELEASE_NOTES.md',
  'README.md',
  'implementation/synaptic-mesh-shadow-v0/evidence',
  'implementation/synaptic-mesh-shadow-v0/fixtures',
];
const machineReadableJsonFiles = [
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-expanded-pack.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-expansion.out.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-unicode-bidi-guard.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-expanded-pack.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-source-boundary-expansion.json',
];

function codePoints(value) {
  return [...String(value)].map((char) => char.codePointAt(0));
}

function hasForbiddenControl(value) {
  return codePoints(value).some((codePoint) => forbiddenControls.has(codePoint));
}

function hasBidiControl(value) {
  return codePoints(value).some((codePoint) => bidiControls.has(codePoint));
}

function hasInvisibleControl(value) {
  return codePoints(value).some((codePoint) => invisibleControls.has(codePoint));
}

function hasDangerousPathConfusable(value) {
  return codePoints(value).some((codePoint) => confusablePathRanges.some(([start, end]) => codePoint >= start && codePoint <= end));
}

function isAsciiPrintable(value) {
  return /^[\x20-\x7E]*$/.test(String(value));
}

function evaluateField(field, value) {
  const reasonCodes = [];
  if (hasBidiControl(value)) reasonCodes.push('UNICODE_BIDI_CONTROL_FORBIDDEN');
  if (hasInvisibleControl(value)) reasonCodes.push('UNICODE_INVISIBLE_CONTROL_FORBIDDEN');
  if (field === 'reasonCode' && !/^[A-Z0-9_]+$/.test(value)) reasonCodes.push('REASON_CODE_ASCII_TOKEN_REQUIRED');
  if (field.endsWith('Path') && !isAsciiPrintable(value)) reasonCodes.push('SOURCE_PATH_ASCII_REQUIRED');
  if (field.endsWith('Path') && hasDangerousPathConfusable(value)) reasonCodes.push('UNICODE_CONFUSABLE_PATH_FORBIDDEN');
  if (field === 'machineReadableField' && !isAsciiPrintable(value)) reasonCodes.push('MACHINE_FIELD_ASCII_PRINTABLE_REQUIRED');
  return [...new Set(reasonCodes)].sort();
}

async function listTextFiles(rootPath) {
  const absoluteRoot = resolve(repoRoot, rootPath);
  const entries = [];
  async function walk(current) {
    const stats = await readdir(current, { withFileTypes: true });
    for (const entry of stats) {
      const child = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(child);
      } else if (entry.isFile() && textExtensions.has(extname(child))) {
        entries.push(child);
      }
    }
  }
  try {
    const statEntries = await readdir(absoluteRoot, { withFileTypes: true });
    if (statEntries.length >= 0) await walk(absoluteRoot);
  } catch {
    if (textExtensions.has(extname(absoluteRoot))) entries.push(absoluteRoot);
  }
  return entries;
}

async function scanTextRoots() {
  const findings = [];
  for (const rootPath of scanRoots) {
    const files = await listTextFiles(rootPath);
    for (const absolutePath of files) {
      const text = await readFile(absolutePath, 'utf8');
      let line = 1;
      let column = 1;
      for (const char of text) {
        const codePoint = char.codePointAt(0);
        if (forbiddenControls.has(codePoint)) {
          findings.push({
            file: relative(repoRoot, absolutePath),
            line,
            column,
            codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
            name: forbiddenControls.get(codePoint),
          });
        }
        if (char === '\n') {
          line += 1;
          column = 1;
        } else {
          column += 1;
        }
      }
    }
  }
  return findings;
}

function fieldTypeForKey(key) {
  if (key === 'reasonCode' || key === 'reasonCodes' || key === 'expectedReasonCodes') return 'reasonCode';
  if (key.endsWith('Path') || key.endsWith('Ref') || key === 'machineReadableJsonFiles') return 'sourceArtifactPath';
  if (['caseId', 'coverageLabel', 'releaseLayer', 'dependsOn', 'mode', 'verdict', 'safetyClaimScope', 'boundary', 'scanRoots'].includes(key)) return 'machineReadableField';
  return null;
}

function collectMachineReadableFindings(value, pathParts = [], inheritedFieldType = null) {
  const findings = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const pathString = [...pathParts, index].join('.');
      if (typeof item === 'string' && inheritedFieldType) {
        const reasonCodes = evaluateField(inheritedFieldType, item);
        if (reasonCodes.length > 0) findings.push({ path: pathString, value: item, reasonCodes });
      } else {
        findings.push(...collectMachineReadableFindings(item, [...pathParts, index], inheritedFieldType));
      }
    });
    return findings;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const fieldType = fieldTypeForKey(key);
      if (typeof child === 'string') {
        const pathString = [...pathParts, key].join('.');
        if (fieldType) {
          const reasonCodes = evaluateField(fieldType, child);
          if (reasonCodes.length > 0) findings.push({ path: pathString, value: child, reasonCodes });
        }
      } else {
        findings.push(...collectMachineReadableFindings(child, [...pathParts, key], fieldType));
      }
    }
  }
  return findings;
}

const positiveResults = fixture.positiveControls.map((control) => ({
  caseId: control.caseId,
  reasonCodes: [
    ...control.reasonCodes.flatMap((reasonCode) => evaluateField('reasonCode', reasonCode)),
    ...evaluateField('sourceArtifactPath', control.sourceArtifactPath),
    ...evaluateField('outputArtifactPath', control.outputArtifactPath),
    ...evaluateField('machineReadableField', control.machineReadableField),
  ],
}));

const negativeResults = fixture.negativeControls.map((control) => {
  const reasonCodes = evaluateField(control.field === 'reasonCode' ? 'reasonCode' : control.field, control.value);
  return { caseId: control.caseId, field: control.field, reasonCodes };
});

for (const result of positiveResults) {
  assert.deepEqual(result.reasonCodes, [], `${result.caseId} should have no unicode guard findings`);
}
for (const [index, result] of negativeResults.entries()) {
  const expected = fixture.negativeControls[index].expectedReasonCodes;
  for (const code of expected) assert.ok(result.reasonCodes.includes(code), `${result.caseId} should include ${code}; got ${result.reasonCodes.join(', ')}`);
}

const textFindings = await scanTextRoots();
assert.deepEqual(textFindings, [], 'docs/evidence/report text must not contain hidden/bidi unicode controls');

const machineReadableFindings = [];
for (const relativePath of machineReadableJsonFiles) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(resolve(repoRoot, relativePath), 'utf8'));
  } catch {
    continue;
  }
  for (const finding of collectMachineReadableFindings(parsed)) machineReadableFindings.push({ file: relativePath, ...finding });
}
assert.deepEqual(machineReadableFindings, [], 'machine-readable fields must not contain invisible/bidi/confusable unsafe unicode');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-13T03:20:00.000Z',
    verdict: 'pass',
    releaseLayer: fixture.releaseLayer,
    dependsOn: fixture.dependsOn,
    mode: fixture.mode,
    scanRoots,
    machineReadableJsonFiles,
    positiveControls: positiveResults.length,
    negativeControls: negativeResults.length,
    textFindings: textFindings.length,
    machineReadableFindings: machineReadableFindings.length,
    reasonCodeAsciiTokenRequired: true,
    sourcePathAsciiRequired: true,
    sourcePathConfusableGuard: true,
    hiddenBidiControlsForbidden: true,
    advisoryReportGuardDocumented: true,
    advisoryOnly: true,
    nonAuthoritative: true,
    runtimeIntegrated: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    automaticAgentConsumptionImplemented: false,
    safetyClaimScope: 'advisory_report_unicode_bidi_hygiene_only_not_authority_not_runtime_not_enforcement',
  },
  positiveResults,
  negativeResults,
  textFindings,
  machineReadableFindings,
  boundary: [
    'local_text_hygiene_only',
    'not_runtime',
    'not_authority',
    'not_agent_consumed',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (output.summary.verdict !== 'pass') process.exit(1);
