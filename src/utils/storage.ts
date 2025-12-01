/**
 * Safe localStorage wrapper that prevents access during build/server-side rendering
 * This fixes the "Cannot initialize local storage without a `--localstorage-file` path" error
 * that occurs when webpack tries to access localStorage in Node.js environment.
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const safeStorage = {
  /**
   * Safely get an item from localStorage
   * Returns null if localStorage is not available (during build)
   */
  getItem: (key: string): string | null => {
    try {
      if (isBrowser && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      // Silently fail during build or if localStorage is not available
      console.warn('localStorage access failed:', error);
    }
    return null;
  },

  /**
   * Safely set an item in localStorage
   * Does nothing if localStorage is not available (during build)
   */
  setItem: (key: string, value: string): void => {
    try {
      if (isBrowser && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      // Silently fail during build or if localStorage is not available
      console.warn('localStorage access failed:', error);
    }
  },

  /**
   * Safely remove an item from localStorage
   * Does nothing if localStorage is not available (during build)
   */
  removeItem: (key: string): void => {
    try {
      if (isBrowser && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      // Silently fail during build or if localStorage is not available
      console.warn('localStorage access failed:', error);
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    return isBrowser && window.localStorage !== null;
  }
};