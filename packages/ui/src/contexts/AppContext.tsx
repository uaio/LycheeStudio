/**
 * App Context
 */

import { createContext, useContext, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'zh' | 'en';

export interface AppContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export interface AppProviderProps {
  children: ReactNode;
  theme?: ThemeMode;
  language?: Language;
  onThemeChange?: (theme: ThemeMode) => void;
  onLanguageChange?: (language: Language) => void;
}

export function AppProvider({
  children,
  theme = 'system',
  language = 'zh',
  onThemeChange,
  onLanguageChange,
}: AppProviderProps) {
  const setTheme = (newTheme: ThemeMode) => {
    onThemeChange?.(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    onLanguageChange?.(newLanguage);
  };

  const value: AppContextType = {
    theme,
    setTheme,
    language,
    setLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
