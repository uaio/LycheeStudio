import React from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const ThemeSwitcher: React.FC = () => {
  const { state, setTheme, effectiveTheme } = useAppContext();

  const themes = [
    { value: 'light' as const, icon: Sun, label: '浅色', key: 'settings.appearance.theme.light' },
    { value: 'dark' as const, icon: Moon, label: '深色', key: 'settings.appearance.theme.dark' },
    { value: 'system' as const, icon: Monitor, label: '跟随系统', key: 'settings.appearance.theme.system' }
  ];

  return (
    <div className="theme-switcher">
      <div className="theme-options">
        {themes.map(({ value, icon: Icon, label, key }) => (
          <button
            key={value}
            className={`theme-option ${state.theme === value ? 'active' : ''}`}
            onClick={() => setTheme(value)}
            title={label}
          >
            <Icon size={16} />
            <span>{label}</span>
            {state.theme === value && (
              <div className="theme-indicator" />
            )}
          </button>
        ))}
      </div>
      {state.theme === 'system' && (
        <div className="system-theme-info">
          <span className="system-theme-text">
            当前: {effectiveTheme === 'dark' ? '深色' : '浅色'}
          </span>
        </div>
      )}
    </div>
  );
};