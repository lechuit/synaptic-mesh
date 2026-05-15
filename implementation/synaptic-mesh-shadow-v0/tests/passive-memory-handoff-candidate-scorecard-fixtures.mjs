import { readFile } from 'node:fs/promises';

export async function passiveMemoryRecallReviewerPackage() {
  return JSON.parse(await readFile('evidence/passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5.out.json', 'utf8'));
}

export async function passiveMemoryHandoffInput() {
  return { recallArtifact: await passiveMemoryRecallReviewerPackage() };
}
