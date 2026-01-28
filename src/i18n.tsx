import React, { createContext, useContext, useMemo, useState } from 'react'
import en from './locales/en.json'
import fr from './locales/fr.json'
import de from './locales/de.json'

export type Language = 'en' | 'fr' | 'de'

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

// We use string keys for flexibility; keep them consistent across languages.
type TranslationKey = string

const translations: Record<Language, Record<string, string>> = {
  en,
  fr,
  de,
}

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'vehicore_language'

function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
  if (stored && ['en', 'fr', 'de'].includes(stored)) return stored

  const browser = window.navigator.language.toLowerCase().slice(0, 2)
  if (browser === 'fr') return 'fr'
  if (browser === 'de') return 'de'
  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    }
  }

  const value: I18nContextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => {
        const table = translations[language] || translations.en
        return table[key] || translations.en[key] || key
      },
    }),
    [language]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

