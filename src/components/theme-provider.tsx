//@ts-nocheck
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useThemeStorage } from "@/hooks/use-theme-storage";

export type Theme = "light" | "dark" | "monochromatic";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const { saveTheme, getTheme } = useThemeStorage();
  const availableThemes: Theme[] = ["light", "dark", "monochromatic"];
  
  // Simple theme state - always start with default for SSR
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Single useEffect for initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    setMounted(true);
    
    // Get theme from DOM first (set by inline script), then localStorage, then system
    let initialTheme = defaultTheme;
    
    // 1. Check DOM
    const domTheme = document.documentElement.getAttribute("data-theme") as Theme;
    if (domTheme && availableThemes.includes(domTheme)) {
      initialTheme = domTheme;
    } else {
      // 2. Check localStorage
      const savedTheme = getTheme() as Theme;
      if (savedTheme && availableThemes.includes(savedTheme)) {
        initialTheme = savedTheme;
      } else {
        // 3. Check system preference
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches ? "dark" : "light";
        initialTheme = systemTheme;
      }
      
      // Apply to DOM if not already there
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
    
    // Set state only if different
    setThemeState(initialTheme);
  }, []); // Empty dependency array - run once only

  // Separate effect for theme changes (after mount)
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    // Apply theme to DOM
    document.documentElement.setAttribute("data-theme", theme);
    
    // Save to localStorage
    saveTheme(theme);
  }, [theme, mounted, saveTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = availableThemes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Theme utility functions
export const getThemeColors = (theme: Theme) => {
  const themes = {
    light: {
      name: "Light",
      icon: "☀️",
      description: "Clean and bright interface",
    },
    dark: {
      name: "Dark",
      icon: "🌙",
      description: "Easy on the eyes",
    },
    monochromatic: {
      name: "Monochromatic",
      icon: "⚫",
      description: "Professional grayscale",
    },
  };

  return themes[theme];
};

// Custom hook for theme-aware styling
export const useThemeStyles = () => {
  const { theme } = useTheme();

  return {
    // Card styles
    card: `bg-surface border border-border rounded-lg shadow-md`,
    cardHover: `hover:shadow-lg transition-shadow duration-200`,

    // Button styles
    buttonPrimary: `bg-primary-500 hover:bg-primary-600 text-text-inverse px-4 py-2 rounded-md font-medium transition-colors duration-200`,
    buttonSecondary: `bg-surface border border-border hover:bg-background-secondary text-text-primary px-4 py-2 rounded-md font-medium transition-colors duration-200`,
    buttonGhost: `hover:bg-background-secondary text-text-primary px-4 py-2 rounded-md font-medium transition-colors duration-200`,

    // Input styles
    input: `bg-surface border border-border rounded-md px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none transition-colors duration-200`,

    // Text styles
    textPrimary: `text-text-primary`,
    textSecondary: `text-text-secondary`,
    textTertiary: `text-text-tertiary`,
    textInverse: `text-text-inverse`,

    // Background styles
    background: `bg-background`,
    backgroundSecondary: `bg-background-secondary`,
    backgroundTertiary: `bg-background-tertiary`,
    surface: `bg-surface`,
    surfaceSecondary: `bg-surface-secondary`,

    // Status styles
    success: `text-success`,
    warning: `text-warning`,
    error: `text-error`,
    info: `text-info`,

    // Border styles
    border: `border-border`,
    borderSecondary: `border-border-secondary`,
    borderFocus: `border-border-focus`,

    // Current theme info
    theme,
  };
};
