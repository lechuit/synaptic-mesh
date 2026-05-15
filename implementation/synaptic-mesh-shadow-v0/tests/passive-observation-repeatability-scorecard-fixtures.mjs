import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPassiveObservationWindow } from '../src/passive-observation-window.mjs';
import { passiveObservationWindowInput, passiveObservationWindowOutcomes } from './passive-observation-window-fixtures.mjs';

export async function passiveObservationRepeatabilityWindows() {
  const completeA = await runPassiveObservationWindow(await passiveObservationWindowInput());
  const completeB = await runPassiveObservationWindow(await passiveObservationWindowInput({ recordsPerSource: 2, totalRecords: 4, outcomes: await passiveObservationWindowOutcomes(['USEFUL_FOR_REVIEW']) }));
  const completeC = await runPassiveObservationWindow(await passiveObservationWindowInput({ recordsPerSource: 1, totalRecords: 2, outcomes: await passiveObservationWindowOutcomes(['USEFUL_FOR_REVIEW']) }));
  const degraded = await runPassiveObservationWindow(await passiveObservationWindowInput({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/missing-repeatability-window.md'] }));
  return [completeA, completeB, completeC, degraded];
}

export async function writePassiveObservationRepeatabilityWindowFixtures() {
  const windows = await passiveObservationRepeatabilityWindows();
  await mkdir(resolve('evidence/passive-observation-repeatability-windows'), { recursive: true });
  await Promise.all(windows.map((window, index) => writeFile(resolve(`evidence/passive-observation-repeatability-windows/window-${index + 1}.json`), JSON.stringify(window, null, 2) + '\n')));
  return windows;
}

export async function passiveObservationRepeatabilityInput(overrides = {}) {
  return { windows: await passiveObservationRepeatabilityWindows(), ...overrides };
}
