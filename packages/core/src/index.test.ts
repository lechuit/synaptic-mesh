import { describe, expect, it } from 'vitest';
import { PACKAGE_NAME, PACKAGE_VERSION } from './index.js';

describe('@aletheia-labs/core public surface', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@aletheia-labs/core');
  });

  it('exports the package version', () => {
    expect(PACKAGE_VERSION).toBe('0.1.1');
  });
});
