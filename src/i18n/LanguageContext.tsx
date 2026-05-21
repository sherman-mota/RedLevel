import React, { createContext, useContext } from 'react';
import { Language, Translations, translations } from './translations';

interface LanguageContextValue {
  language: Language;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'pt-BR',
  t: translations['pt-BR'],
});

export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  const t = translations[language] ?? translations['pt-BR'];
  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
