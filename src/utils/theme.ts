/**
 * Theme Management Utility
 *
 * Manages light/dark theme preference with localStorage persistence
 * and system preference detection.
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'me-net-theme';

/**
 * Get the system's preferred color scheme.
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the stored theme preference from localStorage.
 * Returns null if no preference is stored.
 */
export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

/**
 * Store the theme preference in localStorage.
 */
export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get the current effective theme.
 * Returns stored preference if available, otherwise system preference.
 */
export function getCurrentTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

/**
 * Apply the theme to the document by setting data-theme attribute.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Toggle between light and dark themes.
 * Returns the new theme.
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme();
  const newTheme: Theme = current === 'light' ? 'dark' : 'light';
  storeTheme(newTheme);
  applyTheme(newTheme);
  return newTheme;
}

/**
 * Initialize the theme system.
 * Applies the current theme and sets up system preference listener.
 * Returns a cleanup function to remove the listener.
 */
export function initializeTheme(): () => void {
  const theme = getCurrentTheme();
  applyTheme(theme);

  // Listen for system preference changes (only applies if no stored preference)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (): void => {
    // Only auto-switch if user hasn't set a preference
    if (getStoredTheme() === null) {
      applyTheme(getSystemTheme());
    }
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
