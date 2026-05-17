import { type Scope, type Visibility, scopeKey, visibilityKey } from '../types/index.js';

/**
 * Compare two scope discriminated unions by their canonical index key.
 *
 * @remarks
 * Use this anywhere runtime logic needs exact scope equality. It intentionally
 * does not implement hierarchy or inheritance between scopes.
 */
export function sameScope(a: Scope, b: Scope): boolean {
  return scopeKey(a) === scopeKey(b);
}

/**
 * Compare two visibility discriminated unions by their canonical index key.
 */
export function sameVisibility(a: Visibility, b: Visibility): boolean {
  return visibilityKey(a) === visibilityKey(b);
}

/**
 * Return true when a requested visibility plane is explicitly permitted.
 *
 * @remarks
 * This is exact matching only; hosts that want broader visibility inheritance
 * must encode it in their `VisibilityPolicy` by returning all permitted planes.
 */
export function includesVisibility(
  permitted: readonly Visibility[],
  requested: Visibility,
): boolean {
  const requestedKey = visibilityKey(requested);
  return permitted.some((v) => visibilityKey(v) === requestedKey);
}
