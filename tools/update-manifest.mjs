#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const metadataFileName = 'MANIFEST.json';
const filesFileName = 'MANIFEST.files.json';
const manifestFileNames = new Set([metadataFileName, filesFileName]);

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
    .filter((filePath) => !manifestFileNames.has(filePath))
    .sort();
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const root = repoRoot();
const metadataPath = path.join(root, metadataFileName);
const filesPath = path.join(root, filesFileName);
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));

if (Array.isArray(metadata.files)) {
  delete metadata.files;
}

const files = trackedFiles(root).map((filePath) => {
  const buffer = readFileSync(path.join(root, filePath));
  return {
    path: filePath,
    bytes: buffer.byteLength,
    sha256: sha256(buffer),
  };
});

const filesManifest = {
  manifest: filesFileName,
  generatedFrom: 'git ls-files excluding MANIFEST.json and MANIFEST.files.json',
  files,
};

writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
writeFileSync(filesPath, `${JSON.stringify(filesManifest, null, 2)}\n`);

console.log(JSON.stringify({ status: 'updated', metadata: metadataFileName, filesManifest: filesFileName, files: files.length }, null, 2));
