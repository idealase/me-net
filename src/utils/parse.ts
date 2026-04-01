/**
 * Parsing utilities for user input.
 */

/**
 * Parse comma-separated values from user input.
 * Splits by comma, trims whitespace, and filters out empty values.
 *
 * @param input - Raw input string from user
 * @returns Array of non-empty trimmed values
 *
 * @example
 * parseCommaSeparated('a, b, c') // ['a', 'b', 'c']
 * parseCommaSeparated('a,,b') // ['a', 'b']
 * parseCommaSeparated('  a  ,  b  ') // ['a', 'b']
 * parseCommaSeparated('single') // ['single']
 */
export function parseCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value !== '');
}
