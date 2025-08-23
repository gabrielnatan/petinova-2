import { useCallback, useEffect, useRef } from 'react';

export function useThemeStorage() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveTheme = useCallback((theme: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the localStorage write
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('petinova-theme', theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }, 100); // 100ms debounce
  }, []);

  const getTheme = useCallback((): string | null => {
    try {
      return localStorage.getItem('petinova-theme');
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { saveTheme, getTheme };
}