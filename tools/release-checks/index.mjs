import { passiveLiveShadowCanarySuite } from './passive-live-shadow-canary.mjs';
import { readOnlyLocalFileAdapterSuite } from './read-only-local-file-adapter.mjs';
import { manualDryRunSuite } from './manual-dry-run.mjs';
import { frameworkShapedAdapterSuite } from './framework-shaped-adapter.mjs';

export const releaseCheckSuites = Object.freeze([
  passiveLiveShadowCanarySuite,
  readOnlyLocalFileAdapterSuite,
  manualDryRunSuite,
  frameworkShapedAdapterSuite,
]);
