import { useSettingsStore } from '../stores/settingsStore'
import { en } from './en'
import { ja } from './ja'
import { fr } from './fr'
import { de } from './de'
import { hi } from './hi'
import { zh } from './zh'
import { ko } from './ko'

export type { Translations } from './en'

const locales = { en, ja, fr, de, hi, zh, ko }

export type LangCode = keyof typeof locales

export function useT() {
  const language = useSettingsStore((s) => s.settings.ui.language) as LangCode
  return locales[language] ?? locales.en
}
