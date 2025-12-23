import { describe, it, expect, beforeEach, vi } from 'vitest';

import { generateId, now, isValidISODate } from './id';

describe('id utilities', () => {
  describe('generateId', () => {
    it('generates id with behaviour prefix', () => {
      const id = generateId('b');
      expect(id).toMatch(/^b-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('generates id with outcome prefix', () => {
      const id = generateId('o');
      expect(id).toMatch(/^o-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('generates id with value prefix', () => {
      const id = generateId('v');
      expect(id).toMatch(/^v-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('generates id with link prefix', () => {
      const id = generateId('l');
      expect(id).toMatch(/^l-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('generates id with warning prefix', () => {
      const id = generateId('w');
      expect(id).toMatch(/^w-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('generates unique ids', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId('b'));
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('now', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns ISO 8601 formatted timestamp', () => {
      const fixedDate = new Date('2025-12-23T10:30:00.000Z');
      vi.setSystemTime(fixedDate);

      const timestamp = now();
      expect(timestamp).toBe('2025-12-23T10:30:00.000Z');
    });
  });

  describe('isValidISODate', () => {
    it('returns true for valid ISO 8601 dates', () => {
      expect(isValidISODate('2025-12-23T10:30:00.000Z')).toBe(true);
    });

    it('returns false for invalid date strings', () => {
      expect(isValidISODate('not-a-date')).toBe(false);
      expect(isValidISODate('')).toBe(false);
      expect(isValidISODate('2025-13-45')).toBe(false);
    });

    it('returns false for non-ISO formatted dates', () => {
      // This is a valid date but not in exact ISO format
      expect(isValidISODate('2025-12-23')).toBe(false);
      expect(isValidISODate('Dec 23, 2025')).toBe(false);
    });
  });
});
