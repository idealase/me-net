/**
 * Tests for parsing utilities.
 */

import { parseCommaSeparated } from './parse';

describe('parseCommaSeparated', () => {
  it('splits comma-separated values', () => {
    const result = parseCommaSeparated('a, b, c');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('trims whitespace from each value', () => {
    const result = parseCommaSeparated('  a  ,  b  ,  c  ');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('filters out empty values', () => {
    const result = parseCommaSeparated('a,,b');
    expect(result).toEqual(['a', 'b']);
  });

  it('handles single value without commas', () => {
    const result = parseCommaSeparated('single value');
    expect(result).toEqual(['single value']);
  });

  it('handles empty string', () => {
    const result = parseCommaSeparated('');
    expect(result).toEqual([]);
  });

  it('handles only whitespace', () => {
    const result = parseCommaSeparated('   ');
    expect(result).toEqual([]);
  });

  it('handles only commas', () => {
    const result = parseCommaSeparated(',,,');
    expect(result).toEqual([]);
  });

  it('handles values with internal whitespace', () => {
    const result = parseCommaSeparated('Morning walk, Evening meditation');
    expect(result).toEqual(['Morning walk', 'Evening meditation']);
  });

  it('handles mixed empty and non-empty values', () => {
    const result = parseCommaSeparated('a, , b, , c');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('preserves commas within trimmed values', () => {
    const result = parseCommaSeparated('Exercise, Meditation, Healthy eating');
    expect(result).toEqual(['Exercise', 'Meditation', 'Healthy eating']);
  });
});
