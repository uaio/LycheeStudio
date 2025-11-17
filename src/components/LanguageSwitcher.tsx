import React from 'react';
import { Globe } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const LanguageSwitcher: React.FC = () => {
  const { state, setLanguage, t } = useAppContext();

  const languages = [
    { value: 'zh' as const, label: '中文', flag: '🇨🇳' },
    { value: 'en' as const, label: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className="language-switcher">
      <div className="language-header">
        <Globe size={16} />
        <span>{t.settings.general.language}</span>
      </div>
      <div className="language-options">
        {languages.map(({ value, label, flag }) => (
          <button
            key={value}
            className={`language-option ${state.language === value ? 'active' : ''}`}
            onClick={() => setLanguage(value)}
          >
            <span className="language-flag">{flag}</span>
            <span className="language-label">{label}</span>
            {state.language === value && (
              <div className="language-indicator">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};