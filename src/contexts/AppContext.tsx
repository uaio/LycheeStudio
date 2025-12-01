import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, Theme, AppState, Translations } from '../types/i18n';
import { zh } from '../locales/zh';
import { en } from '../locales/en';
import { safeStorage } from '../utils/storage';

interface AppContextType {
  state: AppState;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  t: Translations;
  effectiveTheme: 'light' | 'dark';
}

const defaultState: AppState = {
  language: 'zh',
  theme: 'dark',
  systemTheme: 'dark',
  translations: zh
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedLanguage = safeStorage.getItem('language') as Language;
    const savedTheme = safeStorage.getItem('theme') as Theme;

    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      setTheme(savedTheme);
    }
  }, []);

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({
        ...prev,
        systemTheme: e.matches ? 'dark' : 'light'
      }));
    };

    // Set initial system theme
    setState(prev => ({
      ...prev,
      systemTheme: mediaQuery.matches ? 'dark' : 'light'
    }));

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = state.theme === 'system' ? state.systemTheme : state.theme;
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [state.theme, state.systemTheme]);

  const setLanguage = (language: Language) => {
    const translations = language === 'zh' ? zh : en;
    setState(prev => ({
      ...prev,
      language,
      translations
    }));
    safeStorage.setItem('language', language);
  };

  const setTheme = (theme: Theme) => {
    setState(prev => ({
      ...prev,
      theme
    }));
    safeStorage.setItem('theme', theme);
  };

  const effectiveTheme = state.theme === 'system' ? state.systemTheme : state.theme;

  const value: AppContextType = {
    state,
    setLanguage,
    setTheme,
    t: state.translations,
    effectiveTheme
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};