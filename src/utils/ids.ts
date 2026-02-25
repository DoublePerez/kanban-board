/**
 * @module utils/ids
 * Cryptographically secure unique ID generation.
 * Uses the Web Crypto API (available in all modern browsers)
 * instead of Math.random() for collision-resistant identifiers.
 */

/** Generate a unique ID using crypto.randomUUID() (v4 UUID). */
export function generateId(): string {
  return crypto.randomUUID();
}
