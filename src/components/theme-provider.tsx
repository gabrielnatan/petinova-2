//@ts-nocheck
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const availableThemes: Theme[] = ["light", "dark", "monochromatic"];

  useEffect(() => {
    setMounted(true);

    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("petinova-theme") as Theme;
    if (savedTheme && availableThemes.includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setThemeState(systemTheme);
    }
  }, [availableThemes]);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);

    // Save to localStorage
    localStorage.setItem("petinova-theme", theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = availableThemes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
