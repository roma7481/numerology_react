import { useStore } from '../store/useStore';
import { translations, LanguageType } from './translations';

export const useTranslation = () => {
    const { language } = useStore();
    const lang = (language || 'en') as LanguageType;

    const t = (path: string, params?: Record<string, string>) => {
        const keys = path.split('.');
        let result: any = translations[lang] || translations['en'];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                // Fallback to English
                let fallback: any = translations['en'];
                for (const fkey of keys) {
                    if (fallback && fallback[fkey]) {
                        fallback = fallback[fkey];
                    } else {
                        return path; // Key not found
                    }
                }
                result = fallback;
                break;
            }
        }

        if (typeof result === 'string' && params) {
            Object.keys(params).forEach(param => {
                result = result.replace(`{{${param}}}`, params[param]);
            });
        }

        return typeof result === 'string' ? result : path;
    };

    return { t, language: lang };
};
