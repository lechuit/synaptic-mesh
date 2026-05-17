import { type Scope, type Visibility, scopeKey, visibilityKey } from '../types/index.js';

export function sameScope(a: Scope, b: Scope): boolean {
  return scopeKey(a) === scopeKey(b);
}

export function sameVisibility(a: Visibility, b: Visibility): boolean {
  return visibilityKey(a) === visibilityKey(b);
}

export function includesVisibility(
  permitted: readonly Visibility[],
  requested: Visibility,
): boolean {
  const requestedKey = visibilityKey(requested);
  return permitted.some((v) => visibilityKey(v) === requestedKey);
}
