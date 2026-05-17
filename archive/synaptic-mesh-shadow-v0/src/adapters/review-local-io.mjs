import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

export function runNodeCommand(command, { cwd, displayRoot }) {
  const proc = spawnSync(process.execPath, command.args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  return {
    id: command.id,
    command: [
      'node',
      ...command.args.map((arg) => arg.startsWith(displayRoot) ? arg.slice(displayRoot.length + 1) : arg),
    ].join(' '),
    status: proc.status,
    pass: proc.status === 0,
    stderr: proc.stderr.trim(),
  };
}

export function readJsonFile(relativePath, { root }) {
  try {
    return JSON.parse(Buffer.from(spawnSync('cat', [resolve(root, relativePath)], { encoding: 'buffer' }).stdout).toString('utf8'));
  } catch {
    return null;
  }
}

export function writeJsonEvidence(filePath, output) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`);
}
