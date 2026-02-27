import { NumbersCalculator, NumerologyContext } from '../utils/NumbersCalculator';

export type ColorKey = 'lifePath' | 'soulUrge' | 'expression' | 'destiny' | 'psychomatrix';

export interface CategoryDef {
    id: string;
    table: string;
    iconSet: 'ionicons' | 'material';
    icon: string;
    colorKey: ColorKey;
    /** 'simple' = single number lookup, 'multi' = multiple numbers, 'karmic' = missing numbers, 'psychomatrix' = grid */
    type: 'simple' | 'multi' | 'karmic' | 'psychomatrix';
    /** Whether this category requires partner DOB */
    needsPartner?: boolean;
    /** Whether this category requires personal name */
    needsName?: boolean;
}

export const ALL_CATEGORIES: CategoryDef[] = [
    // ── Life Path group ──
    { id: 'life_path', table: 'life_path_number', iconSet: 'ionicons', icon: 'compass', colorKey: 'lifePath', type: 'simple' },
    { id: 'birthday_number', table: 'birthday_number', iconSet: 'ionicons', icon: 'gift', colorKey: 'lifePath', type: 'simple' },
    { id: 'birthday_code', table: 'birthday_code', iconSet: 'ionicons', icon: 'barcode', colorKey: 'lifePath', type: 'simple' },
    { id: 'maturity_number', table: 'maturity_number', iconSet: 'ionicons', icon: 'leaf', colorKey: 'lifePath', type: 'simple' },
    { id: 'challenge_number', table: 'challenge_number', iconSet: 'ionicons', icon: 'shield', colorKey: 'lifePath', type: 'multi' },
    { id: 'achievement_number', table: 'achievement_number', iconSet: 'ionicons', icon: 'trophy', colorKey: 'lifePath', type: 'multi' },

    // ── Soul Urge group ──
    { id: 'soul_urge', table: 'soul_urge_number', iconSet: 'ionicons', icon: 'flame', colorKey: 'soulUrge', type: 'simple', needsName: true },
    { id: 'desire_number', table: 'desire_number', iconSet: 'ionicons', icon: 'heart', colorKey: 'soulUrge', type: 'simple', needsName: true },
    { id: 'love_number', table: 'love_number', iconSet: 'ionicons', icon: 'heart-circle', colorKey: 'soulUrge', type: 'simple' },
    { id: 'couple_number', table: 'couple_number', iconSet: 'ionicons', icon: 'people', colorKey: 'soulUrge', type: 'simple', needsPartner: true },
    { id: 'marriage_number', table: 'marriage_number', iconSet: 'ionicons', icon: 'ribbon', colorKey: 'soulUrge', type: 'simple', needsName: true },

    // ── Expression group ──
    { id: 'expression', table: 'expression_number', iconSet: 'material', icon: 'diamond-stone', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'personality_number', table: 'personality_number', iconSet: 'ionicons', icon: 'person', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'name_number', table: 'name_number', iconSet: 'ionicons', icon: 'text', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'character_number', table: 'character_number', iconSet: 'ionicons', icon: 'finger-print', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'intelligence_number', table: 'intelligence_number', iconSet: 'ionicons', icon: 'bulb', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'balance_number', table: 'balance_number', iconSet: 'material', icon: 'scale-balance', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'money_number', table: 'money_number', iconSet: 'ionicons', icon: 'cash', colorKey: 'expression', type: 'simple', needsName: true },
    { id: 'lucky_gem', table: 'lucky_gem', iconSet: 'ionicons', icon: 'sparkles', colorKey: 'expression', type: 'simple', needsName: true },

    // ── Destiny group ──
    { id: 'destiny', table: 'destiny_number', iconSet: 'ionicons', icon: 'star', colorKey: 'destiny', type: 'simple', needsName: true },
    { id: 'realization_number', table: 'realization_number', iconSet: 'ionicons', icon: 'sunny', colorKey: 'destiny', type: 'simple', needsName: true },
    { id: 'potential_number', table: 'potential_number', iconSet: 'ionicons', icon: 'rocket', colorKey: 'destiny', type: 'simple', needsName: true },
    { id: 'karmic_lesson', table: 'karmic_lesson', iconSet: 'ionicons', icon: 'infinite', colorKey: 'destiny', type: 'karmic', needsName: true },
    { id: 'planet_number', table: 'planet_number', iconSet: 'ionicons', icon: 'planet', colorKey: 'destiny', type: 'simple' },
    { id: 'personal_year', table: 'personal_year', iconSet: 'ionicons', icon: 'calendar', colorKey: 'soulUrge', type: 'simple' },
    { id: 'personal_month', table: 'personal_month', iconSet: 'ionicons', icon: 'today', colorKey: 'soulUrge', type: 'simple' },
    { id: 'personal_day', table: 'personal_day', iconSet: 'ionicons', icon: 'time', colorKey: 'soulUrge', type: 'simple' },
    { id: 'daily_lucky_number', table: 'daily_lucky_number', iconSet: 'ionicons', icon: 'star', colorKey: 'soulUrge', type: 'simple' },

    // ── Psychomatrix ──
    { id: 'psychomatrix', table: 'psychomatrix', iconSet: 'ionicons', icon: 'apps', colorKey: 'psychomatrix', type: 'psychomatrix' },
];

/**
 * Calculate the number(s) for a given category.
 * Returns a single number for 'simple', an array for 'multi'/'karmic'.
 */
export function calculateForCategory(
    categoryId: string,
    context: NumerologyContext,
): number | number[] {
    const parts = context.dateOfBirth.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    switch (categoryId) {
        case 'life_path':
            return NumbersCalculator.calcLifeNumberMethod1(context);
        case 'birthday_number':
            return NumbersCalculator.calcBirthdayNumber(context);
        case 'birthday_code':
            return NumbersCalculator.calcBirthdayCode(context);
        case 'maturity_number':
            return NumbersCalculator.calcMaturityNumber(context);
        case 'challenge_number':
            return [
                NumbersCalculator.calcChallengeNumber1(context),
                NumbersCalculator.calcChallengeNumber2(context),
                NumbersCalculator.calcChallengeNumber3(context),
                NumbersCalculator.calcChallengeNumber4(context),
            ];
        case 'achievement_number':
            return [
                NumbersCalculator.calcAchievmentNumber1(context),
                NumbersCalculator.calcAchievmentNumber2(context),
                NumbersCalculator.calcAchievmentNumber3(context),
                NumbersCalculator.calcAchievmentNumber4(context),
            ];
        case 'soul_urge':
            return NumbersCalculator.calcSoulNumberLetters(context);
        case 'desire_number':
            return NumbersCalculator.calcDesireNumber(context);
        case 'love_number': {
            if (!context.partnerDateOfBirth) return 0;
            const pParts = context.partnerDateOfBirth.split('/');
            const pDay = parseInt(pParts[0], 10);
            const pMonth = parseInt(pParts[1], 10);
            return NumbersCalculator.calcPartnerLoveNumber(pDay, pMonth);
        }
        case 'couple_number':
            return NumbersCalculator.calcCoupleNumber(context);
        case 'marriage_number':
            return NumbersCalculator.calcMarriageNumber(context);
        case 'expression':
            return NumbersCalculator.calcExpressionNumber(context);
        case 'personality_number':
            return NumbersCalculator.calcPersonalityNumber(context);
        case 'name_number':
            return NumbersCalculator.calcNameNumber(context);
        case 'character_number':
            return NumbersCalculator.calcCharacterNumber(context);
        case 'intelligence_number':
            return NumbersCalculator.calcIntelligenceNumber(context);
        case 'balance_number':
            return NumbersCalculator.calcBalanceNumber(context);
        case 'money_number':
            return NumbersCalculator.calcMoneyNumber(context);
        case 'lucky_gem':
            return NumbersCalculator.calcLuckyGem(context);
        case 'destiny':
            return NumbersCalculator.calcDestinyNumber(context);
        case 'realization_number':
            return NumbersCalculator.calcRealizationNumber(context);
        case 'potential_number':
            return NumbersCalculator.calcPotencialNumber(context);
        case 'karmic_lesson':
            return NumbersCalculator.calcKarmaNumber(context);
        case 'planet_number':
            return NumbersCalculator.calcToSingleDigit(day);
        case 'personal_year':
            return NumbersCalculator.calcPersonalYear(context);
        case 'personal_month':
            return NumbersCalculator.calcPersonalMonth(context);
        case 'personal_day':
            return NumbersCalculator.calcPersonalDay(context);
        case 'daily_lucky_number':
            return NumbersCalculator.calcLuckyDailyNumber(context, 0);
        default:
            return 0;
    }
}
