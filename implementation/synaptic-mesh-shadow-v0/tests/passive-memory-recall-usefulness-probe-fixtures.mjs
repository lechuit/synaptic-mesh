import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function passiveMemoryRecallCards() {
  return JSON.parse(await readFile(resolve('fixtures/passive-memory-recall-need-cards-v0.28.1.json'), 'utf8'));
}

export async function passiveMemoryRecallEvidence() {
  return JSON.parse(await readFile(resolve('fixtures/passive-memory-recall-evidence-v0.28.1.json'), 'utf8'));
}

export async function passiveMemoryRecallSourceArtifacts() {
  return JSON.parse(await readFile(resolve('evidence/passive-memory-recall-source-anchors-v0.28.1.json'), 'utf8'));
}

export async function passiveMemoryRecallInput() {
  const cards = await passiveMemoryRecallCards();
  const evidence = await passiveMemoryRecallEvidence();
  const sourceArtifacts = await passiveMemoryRecallSourceArtifacts();
  return { cards: cards.cards, evidence: evidence.evidence, sourceArtifacts: sourceArtifacts.sourceArtifacts };
}
