import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationMR from './locales/mr.json'; // Marathi translation
import translationEN from './locales/en.json'; // English translation

// Translation resources
const resources = {
  mr: {
    translation: translationMR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // Default language is English
    fallbackLng: 'en', // Fallback language is English
    interpolation: {
      escapeValue: false // React already protects from XSS
    }
  });

export default i18n;
