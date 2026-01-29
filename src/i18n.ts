import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import en from './locales/en.json'
import nl from './locales/nl.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import ru from './locales/ru.json'

const resources = {
    en: { translation: en },
    nl: { translation: nl },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    ru: { translation: ru },
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
        },
    })

export default i18n
