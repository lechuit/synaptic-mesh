import { describe, expect, it } from 'vitest';
import { PACKAGE_NAME, PACKAGE_VERSION } from './index.js';

describe('@aletheia/core public surface', () => {
  it('exposes the package name', () => {
    expect(PACKAGE_NAME).toBe('@aletheia/core');
  });

  it('starts at version 0.0.0', () => {
    expect(PACKAGE_VERSION).toBe('0.0.0');
  });
});
