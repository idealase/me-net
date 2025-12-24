/**
 * Theme Utility Tests
 */

import {
  applyTheme,
  getCurrentTheme,
  getStoredTheme,
  getSystemTheme,
  initializeTheme,
  storeTheme,
  toggleTheme,
} from './theme';

// Mock matchMedia for tests
const createMatchMediaMock = (matches: boolean): typeof window.matchMedia => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('Theme Utility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
    // Mock matchMedia to return light mode by default
    window.matchMedia = createMatchMediaMock(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStoredTheme', () => {
    it('returns null when no theme is stored', () => {
      expect(getStoredTheme()).toBeNull();
    });

    it('returns "light" when light theme is stored', () => {
      localStorage.setItem('me-net-theme', 'light');
      expect(getStoredTheme()).toBe('light');
    });

    it('returns "dark" when dark theme is stored', () => {
      localStorage.setItem('me-net-theme', 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('returns null for invalid stored values', () => {
      localStorage.setItem('me-net-theme', 'invalid');
      expect(getStoredTheme()).toBeNull();
    });
  });

  describe('storeTheme', () => {
    it('stores light theme', () => {
      storeTheme('light');
      expect(localStorage.getItem('me-net-theme')).toBe('light');
    });

    it('stores dark theme', () => {
      storeTheme('dark');
      expect(localStorage.getItem('me-net-theme')).toBe('dark');
    });
  });

  describe('getSystemTheme', () => {
    it('returns light when prefers-color-scheme is light', () => {
      window.matchMedia = createMatchMediaMock(false);
      expect(getSystemTheme()).toBe('light');
    });

    it('returns dark when prefers-color-scheme is dark', () => {
      window.matchMedia = createMatchMediaMock(true);
      expect(getSystemTheme()).toBe('dark');
    });
  });

  describe('getCurrentTheme', () => {
    it('returns stored theme if available', () => {
      storeTheme('dark');
      expect(getCurrentTheme()).toBe('dark');
    });

    it('returns system theme when no stored preference (light)', () => {
      window.matchMedia = createMatchMediaMock(false);
      expect(getCurrentTheme()).toBe('light');
    });

    it('returns system theme when no stored preference (dark)', () => {
      window.matchMedia = createMatchMediaMock(true);
      expect(getCurrentTheme()).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    it('sets data-theme attribute to light', () => {
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('sets data-theme attribute to dark', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      storeTheme('light');
      applyTheme('light');
      const newTheme = toggleTheme();
      expect(newTheme).toBe('dark');
      expect(getStoredTheme()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggles from dark to light', () => {
      storeTheme('dark');
      applyTheme('dark');
      const newTheme = toggleTheme();
      expect(newTheme).toBe('light');
      expect(getStoredTheme()).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('initializeTheme', () => {
    it('applies stored theme on initialization', () => {
      storeTheme('dark');
      const cleanup = initializeTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      cleanup();
    });

    it('returns a cleanup function', () => {
      const cleanup = initializeTheme();
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('applies light theme by default when no stored preference', () => {
      window.matchMedia = createMatchMediaMock(false);
      const cleanup = initializeTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      cleanup();
    });

    it('applies dark theme when system prefers dark and no stored preference', () => {
      window.matchMedia = createMatchMediaMock(true);
      const cleanup = initializeTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      cleanup();
    });
  });
});
