import { scoreObservedUsefulnessNoise } from '../src/observed-usefulness-noise-scorecard.mjs';
import { observedUsefulnessNoiseCases } from './observed-usefulness-noise-scorecard-fixtures.mjs';

export async function controlledOperatorReviewQueueScorecard(overrides = {}) {
  const scorecard = scoreObservedUsefulnessNoise(await observedUsefulnessNoiseCases());
  return { ...scorecard, ...overrides };
}
