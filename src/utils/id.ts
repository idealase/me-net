/**
 * Utility functions for ID generation and timestamps
 */

/**
 * Generate a unique identifier with a prefix
 */
export function generateId(prefix: 'b' | 'o' | 'v' | 'l' | 'w'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get current ISO 8601 timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Check if a string is a valid ISO 8601 date
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}
