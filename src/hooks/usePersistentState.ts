import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * 
 * @param key - localStorage key
 * @param defaultValue - default value if nothing is stored
 * @returns [state, setState] tuple similar to useState
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage or use default
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, state]);

  return [state, setState];
}
