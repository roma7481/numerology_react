import { useStore } from '../store/useStore';

export const LanguageController = {
    getLanguage: (): string => {
        // Ported from LanguageController.java -> AppPreferences.getValue()
        return useStore.getState().language || 'en';
    },

    setLanguage: (language: string) => {
        // Ported from LanguageController.java -> AppPreferences.saveValue()
        useStore.getState().setLanguage(language);
    },

    getToolbarComp: (language: string): string => {
        // Partial port from LanguageController.java
        switch (language) {
            case 'ru': return 'Совместимость';
            case 'es': return 'Compatibilidad';
            case 'pt': return 'Compatibilidade';
            case 'fr': return 'Compatibilité';
            case 'de': return 'Kompatibilität';
            case 'it': return 'Compatibilità';
            default: return 'Compatibility';
        }
    }
};
