#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const forbiddenCodePoints = new Map([
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

const criticalRoots = [
  '.github/workflows',
  'README.md',
  'RELEASE_NOTES.md',
  'MANIFEST.json',
  'MANIFEST.files.json',
  'docs',
  'specs',
  'schemas',
  'implementation/synaptic-mesh-shadow-v0/README.md',
  'implementation/synaptic-mesh-shadow-v0/package.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures',
  'implementation/synaptic-mesh-shadow-v0/evidence',
  'implementation/synaptic-mesh-shadow-v0/tests',
  'implementation/synaptic-mesh-shadow-v0/src',
  'implementation/synaptic-mesh-shadow-v0/bin',
  'tools',
];

const textExtensions = new Set([
  '.cjs', '.css', '.csv', '.html', '.js', '.json', '.jsonl', '.md', '.mjs', '.txt', '.yaml', '.yml',
]);

function repoRoot() {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
}

function trackedFiles(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .sort();
}

function isUnder(filePath, rootPath) {
  return filePath === rootPath || filePath.startsWith(`${rootPath}/`);
}

function isCriticalTextFile(filePath) {
  if (!criticalRoots.some((rootPath) => isUnder(filePath, rootPath))) return false;
  return textExtensions.has(path.extname(filePath)) || ['README.md', 'RELEASE_NOTES.md', 'MANIFEST.json', 'MANIFEST.files.json'].includes(filePath);
}

function lineAndColumn(text, index) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

const root = repoRoot();
const findings = [];

for (const filePath of trackedFiles(root)) {
  if (!isCriticalTextFile(filePath)) continue;
  const absolutePath = path.join(root, filePath);
  let text;
  try {
    text = readFileSync(absolutePath, 'utf8');
  } catch {
    continue;
  }

  for (let i = 0; i < text.length; i += 1) {
    const codePoint = text.codePointAt(i);
    if (codePoint > 0xffff) i += 1;
    if (!forbiddenCodePoints.has(codePoint)) continue;
    const { line, column } = lineAndColumn(text, i);
    findings.push({
      file: filePath,
      line,
      column,
      codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      name: forbiddenCodePoints.get(codePoint),
    });
  }
}

if (findings.length > 0) {
  console.error(JSON.stringify({ status: 'fail', findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'pass', checkedRoots: criticalRoots, forbiddenCodePoints: forbiddenCodePoints.size }, null, 2));
