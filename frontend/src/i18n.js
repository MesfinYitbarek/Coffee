// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languagedetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en', // Default language if detected language is not available
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          coffeeCalculatorTitle: 'Coffee Trading Calculator',
          loginSubtitle: 'Login to access your tools',
          registerSubtitle: 'Create your account',
          name: 'Name',
          phoneNumber: 'Phone Number',
          emailAddress: 'Email Address',
          password: 'Password',
          register: 'Register',
          login: 'Login',
          alreadyHaveAccount: 'Already have an account? Login',
          dontHaveAccount: "Don't have an account? Register",
        }
      },
      am: {
        translation: {
          coffeeCalculatorTitle: 'የቡና ንግድ ማስሊያ',
          loginSubtitle: 'መሳሪያዎችዎን ለመጠቀም ይግቡ',
          registerSubtitle: 'መለያዎን ይፍጠሩ',
          name: 'ስም',
          phoneNumber: 'ስልክ ቁጥር',
          emailAddress: 'ኢሜይል አድራሻ',
          password: 'የይለፍ ቃል',
          register: 'ይመዝገቡ',
          login: 'ይግቡ',
          alreadyHaveAccount: 'መለያ አለዎት? ይግቡ',
          dontHaveAccount: 'መለያ የለዎትም? ይመዝገቡ',
        }
      }
    }
  });

export default i18n;