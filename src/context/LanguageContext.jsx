import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en';
import ar from '../locales/ar';

const LanguageContext = createContext();

const translationsMap = { en, ar };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_lang');
    return saved && (saved === 'ar' || saved === 'en') ? saved : 'ar'; // Default language is Arabic
  });

  useEffect(() => {
    const currentLang = language === 'ar' || language === 'en' ? language : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    if (currentLang === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }

    localStorage.setItem('app_lang', currentLang);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguage(lang);
    }
  };

  const t = (key, fallbackOrParams = '', paramsObj = null) => {
    if (!key) return '';

    let fallback = '';
    let params = null;

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      params = fallbackOrParams;
    } else {
      fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : '';
      if (typeof paramsObj === 'object' && paramsObj !== null) {
        params = paramsObj;
      }
    }

    const keys = key.split('.');
    
    // Try current selected language first
    let result = translationsMap[language];
    let found = true;

    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        found = false;
        break;
      }
    }

    let template = '';
    if (found && typeof result === 'string') {
      template = result;
    } else {
      // Fallback to English if translation is missing in Arabic
      let fallbackResult = translationsMap['en'];
      let fallbackFound = true;

      for (const fk of keys) {
        if (fallbackResult && fallbackResult[fk] !== undefined) {
          fallbackResult = fallbackResult[fk];
        } else {
          fallbackFound = false;
          break;
        }
      }

      if (fallbackFound && typeof fallbackResult === 'string') {
        template = fallbackResult;
      } else {
        template = fallback || key;
      }
    }

    if (params && typeof template === 'string') {
      Object.keys(params).forEach((paramKey) => {
        const val = params[paramKey] !== undefined && params[paramKey] !== null ? params[paramKey] : '';
        const regex = new RegExp(`\\{\\{\\s*${paramKey}\\s*\\}\\}`, 'gi');
        template = template.replace(regex, val);
      });
    }

    return template;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      changeLanguage,
      t,
      isRTL: language === 'ar',
      dir: language === 'ar' ? 'rtl' : 'ltr',
      translations: translationsMap[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
