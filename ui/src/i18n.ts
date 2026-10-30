import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(HttpBackend) // loads translations from /public/locales
  .use(LanguageDetector) // detects and remembers the user's language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: 'en',
    load: 'languageOnly', // "es-ES" / "en-US" -> "es" / "en"
    defaultNS: 'translation',
    ns: ['translation'],

    backend: {
      // BASE_URL keeps this working if you ever set `base` in vite.config
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values (XSS-safe)
    },

    react: {
      useSuspense: true, // your <Suspense> in index.tsx handles the loading state
    },
  });

// keep <html lang="..."> in sync (accessibility / SEO)
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
