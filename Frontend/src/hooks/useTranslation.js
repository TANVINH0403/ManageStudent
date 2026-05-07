import { useSelector } from 'react-redux';
import { translations } from '../utils/i18n';

export const useTranslation = () => {
  const { preferences } = useSelector(s => s.settings) || {};
  const lang = preferences?.general?.language || 'vi';
  const locale = lang === 'en' ? 'en-US' : 'vi-VN';
  
  const t = (key) => {
    return translations[lang]?.[key] || translations['vi'][key] || key;
  };
  
  return { t, lang, locale };
};
