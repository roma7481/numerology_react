export type ZodiacSign = {
    name: string;
    icon: string;
};

export const getZodiacSign = (dateStr: string): ZodiacSign => {
    // Expected format DD/MM/YYYY
    const [day, month] = dateStr.split('/').map(Number);

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Aquarius', icon: 'water' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'Pisces', icon: 'waves' };
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', icon: 'ceylon-barney' }; // Using MaterialCommunityIcons
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Taurus', icon: 'horn' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Gemini', icon: 'human-male-female' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cancer', icon: 'clover' }; // No crab in MaterialCommunityIcons? Use clover or something similar if needed, actually 'cancer' exists in some libs.
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', icon: 'cat' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', icon: 'human-female' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', icon: 'scale-balance' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Scorpio', icon: 'water' }; // Scorpio usually use water or leaf?
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagittarius', icon: 'arrow-top-right' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'Capricorn', icon: 'bone' };

    // Standard fallback mapping to MaterialCommunityIcons zodiac names if available
    const zodiacs: Record<string, string> = {
        'Aries': 'zodiac-aries',
        'Taurus': 'zodiac-taurus',
        'Gemini': 'zodiac-gemini',
        'Cancer': 'zodiac-cancer',
        'Leo': 'zodiac-leo',
        'Virgo': 'zodiac-virgo',
        'Libra': 'zodiac-libra',
        'Scorpio': 'zodiac-scorpio',
        'Sagittarius': 'zodiac-sagittarius',
        'Capricorn': 'zodiac-capricorn',
        'Aquarius': 'zodiac-aquarius',
        'Pisces': 'zodiac-pisces'
    };

    const getName = (): string => {
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
        return 'Pisces';
    };

    const name = getName();
    return { name, icon: zodiacs[name] };
};

export const formatProfileDate = (dateStr: string, language: string = 'en'): string => {
    // DD/MM/YYYY to "Month DD, YYYY"
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    const langMap: Record<string, string> = {
        en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
    };

    return date.toLocaleDateString(langMap[language] || 'en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
};
