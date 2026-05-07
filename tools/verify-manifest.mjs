#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const manifestFileName = 'MANIFEST.json';

function repoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error(`Unable to locate git repository root: ${error.message}`);
  }
}

function trackedFiles(root) {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd: root });
  return output
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((filePath) => filePath !== manifestFileName)
    .sort();
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function duplicatePaths(entries) {
  const seen = new Set();
  const duplicates = new Set();
  for (const entry of entries) {
    if (seen.has(entry.path)) duplicates.add(entry.path);
    seen.add(entry.path);
  }
  return [...duplicates].sort();
}

function diffSorted(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

const root = repoRoot();
const manifestPath = path.join(root, manifestFileName);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

if (!Array.isArray(manifest.files)) {
  throw new Error('MANIFEST.json must contain a files array.');
}

const entries = manifest.files;
const manifestPaths = entries.map((entry) => entry.path);
const trackedPaths = trackedFiles(root);
const errors = [];

for (const entry of entries) {
  if (!entry || typeof entry.path !== 'string' || typeof entry.bytes !== 'number' || typeof entry.sha256 !== 'string') {
    errors.push(`Invalid manifest entry shape: ${JSON.stringify(entry)}`);
  }
}

const duplicates = duplicatePaths(entries);
if (duplicates.length > 0) {
  errors.push(`Duplicate manifest paths: ${duplicates.join(', ')}`);
}

const missingFromManifest = diffSorted(trackedPaths, manifestPaths);
const extraInManifest = diffSorted(manifestPaths, trackedPaths);
if (missingFromManifest.length > 0) {
  errors.push(`Tracked files missing from MANIFEST.json: ${missingFromManifest.join(', ')}`);
}
if (extraInManifest.length > 0) {
  errors.push(`Manifest entries not tracked by git: ${extraInManifest.join(', ')}`);
}

for (const entry of entries) {
  if (typeof entry.path !== 'string') continue;
  const filePath = path.join(root, entry.path);
  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (error) {
    errors.push(`${entry.path}: cannot read file (${error.message})`);
    continue;
  }

  const actualBytes = buffer.byteLength;
  const actualSha256 = sha256(buffer);
  if (entry.bytes !== actualBytes) {
    errors.push(`${entry.path}: bytes ${entry.bytes} != ${actualBytes}`);
  }
  if (entry.sha256 !== actualSha256) {
    errors.push(`${entry.path}: sha256 ${entry.sha256} != ${actualSha256}`);
  }
}

if (errors.length > 0) {
  console.error(JSON.stringify({ status: 'fail', manifest: manifestFileName, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'pass', manifest: manifestFileName, files: entries.length }, null, 2));
