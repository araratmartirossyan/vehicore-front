import { useI18n, SUPPORTED_LANGUAGES } from '../../i18n'

export function Header() {
  const { language, setLanguage, t } = useI18n()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">{t('header.dashboard')}</h2>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          className="flex h-8 items-center rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
