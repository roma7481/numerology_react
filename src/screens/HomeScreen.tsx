import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { NumbersCalculator } from '../utils/NumbersCalculator';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Shadow, circle } from '../theme/SharedStyles';
import HeroDailyNumber from '../components/HeroDailyNumber';
import BiorhythmChart from '../components/BiorhythmChart';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';
import { useNavigation } from '@react-navigation/native';
import { ALL_CATEGORIES, CategoryDef, calculateForCategory } from '../config/CategoryConfig';
import { dbService } from '../services/DatabaseService';
import { adService } from '../services/AdService';
import RateUsDialog, { useRateDialog } from '../components/RateUsDialog';
import NativeAdCard from '../components/ads/NativeAdCard';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 60) / 2;

// ─── Greeting Header ───────────────────────────────────────────
function GreetingHeader({ formattedDate }: { formattedDate: string }) {
    const { theme, profileName, firstName } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const displayName = profileName || firstName || t('settings.profile_card_new_user');

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greeting_morning');
        if (hour < 18) return t('home.greeting_afternoon');
        return t('home.greeting_evening');
    }, [t]);

    return (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.greetingRow}>
            <View style={styles.greetingLeft}>
                <View style={[styles.avatarSmall, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#e9d5ff' }]}>
                    <MaterialCommunityIcons name="meditation" size={22} color={isDark ? '#7dd3fc' : '#9d4edd'} />
                </View>
                <View style={styles.greetingText}>
                    <Text style={[styles.greetingLabel, { color: colors.textSecondary }]}>
                        {greeting.toUpperCase()}
                    </Text>
                    <Text style={[styles.greetingName, { color: colors.textTitle }]} numberOfLines={1}>
                        {displayName}
                    </Text>
                </View>
            </View>
            <View style={[styles.dateBadge, { backgroundColor: isDark ? colors.cardBackground : '#fff', borderColor: isDark ? colors.cardBorder : colors.cardBorder }]}>
                <Ionicons name="calendar" size={14} color={colors.primary} />
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formattedDate}</Text>
            </View>
        </Animated.View>
    );
}

// ─── Top Insights (Life Path + Destiny) ────────────────────────
function TopInsights() {
    const { theme, dateOfBirth, language, firstName, lastName, middleName } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const navigation = useNavigation<any>();

    const context = useMemo(() => ({
        dateOfBirth: dateOfBirth || '01/01/1990',
        language,
        firstName: firstName || '',
        lastName: lastName || '',
        fatherName: middleName || '',
    }), [dateOfBirth, language, firstName, lastName, middleName]);

    const hasName = !!(firstName || lastName);
    const lifePathNum = useMemo(() => calculateForCategory('life_path', context), [context]);
    const destinyNum = useMemo(() => hasName ? calculateForCategory('destiny', context) : null, [context, hasName]);

    const insights = [
        {
            id: 'life_path',
            label: t('category_titles.life_path'),
            number: lifePathNum,
            icon: 'footsteps' as const,
            color: isDark ? '#7dd3fc' : '#9d4edd',
            bg: isDark ? 'rgba(255,255,255,0.1)' : '#f3f0ff',
            needsName: false,
        },
        {
            id: 'destiny',
            label: t('category_titles.destiny'),
            number: destinyNum,
            icon: 'sparkles' as const,
            color: isDark ? '#bae6fd' : '#e0aa3e',
            bg: isDark ? 'rgba(255,255,255,0.1)' : '#fffbf0',
            needsName: !hasName,
        },
    ];

    return (
        <View style={styles.sectionWrapper}>
            <Animated.Text entering={FadeInDown.duration(400).delay(300)} style={[styles.sectionTitle, { color: colors.textTitle }]}>
                {t('home.top_insights')}
            </Animated.Text>
            <View style={styles.insightsRow}>
                {insights.map((item, idx) => (
                    <Animated.View key={item.id} entering={FadeInDown.duration(400).delay(350 + idx * 80)} style={styles.insightCardWrapper}>
                        <TouchableOpacity
                            style={[styles.insightCard, { backgroundColor: item.bg, borderColor: colors.cardBorder }, isDark ? {} : Shadow.light]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (item.id === 'life_path') {
                                    adService.checkInterstitial(() => navigation.navigate('LifePath'));
                                } else {
                                    adService.checkInterstitial(() => navigation.navigate('CategoryDetail', { categoryId: item.id }));
                                }
                            }}
                        >
                            <View style={[styles.insightIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' }]}>
                                <Ionicons name={item.icon} size={20} color={item.color} />
                            </View>
                            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>{item.label.toUpperCase()}</Text>
                            <Text style={[styles.insightNumber, { color: colors.textTitle }]}>{item.needsName ? '—' : String(item.number)}</Text>
                            {item.needsName && (
                                <Text style={[styles.insightNote, { color: colors.textSecondary }]}>{t('home.name_required')}</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}

// ─── Compatibility CTA Card ────────────────────────────────────
function CompatibilityCard() {
    const { theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const navigation = useNavigation<any>();

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.sectionWrapper}>
            <TouchableOpacity
                style={[
                    styles.compatCard,
                    {
                        backgroundColor: isDark ? 'rgba(255,200,100,0.08)' : '#fdf8ef',
                        borderColor: isDark ? 'rgba(224,170,62,0.3)' : '#f5e6c8',
                    },
                ]}
                activeOpacity={0.7}
                onPress={() => adService.checkInterstitial(() => navigation.navigate('Compatibility'))}
            >
                <View style={styles.compatLeft}>
                    <View style={styles.compatTitleRow}>
                        <Text style={[styles.compatTitle, { color: colors.textTitle }]}>{t('home.compatibility_title')}</Text>
                        <View style={[styles.premiumBadge, { backgroundColor: isDark ? '#e0aa3e' : '#d4a017' }]}>
                            <Ionicons name="diamond" size={10} color="#fff" />
                            <Text style={styles.premiumText}>PREMIUM</Text>
                        </View>
                    </View>
                    <Text style={[styles.compatSub, { color: colors.textSecondary }]}>{t('home.compatibility_subtitle')}</Text>
                    <View style={[styles.compatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
                    <View style={styles.compatCta}>
                        <Text style={[styles.compatCtaText, { color: isDark ? '#e0aa3e' : '#c4900a' }]}>{t('home.compatibility_cta')}</Text>
                        <Ionicons name="arrow-forward" size={16} color={isDark ? '#e0aa3e' : '#c4900a'} />
                    </View>
                </View>
                <View style={[styles.compatIcon, { backgroundColor: isDark ? 'rgba(224,170,62,0.15)' : '#f5e6c8' }]}>
                    <Ionicons name="heart" size={26} color="#e05555" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Accordion Section ─────────────────────────────────────────
function AccordionSection({
    title, icon, categories, defaultOpen, useGrid, iconColor
}: {
    title: string; icon: string; categories: CategoryDef[]; defaultOpen?: boolean; useGrid?: boolean; iconColor?: string;
}) {
    const [isOpen, setIsOpen] = useState(!!defaultOpen);
    const { theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const navigation = useNavigation<any>();
    const accentColor = iconColor || (isDark ? '#7dd3fc' : '#9d4edd');

    return (
        <View style={[styles.accordionWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#fff', borderColor: colors.cardBorder }]}>
            <TouchableOpacity style={styles.accordionHeader} activeOpacity={0.7} onPress={() => setIsOpen(!isOpen)}>
                <View style={styles.accordionLeft}>
                    <View style={[styles.accordionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f8f5ff' }]}>
                        <Ionicons name={icon as any} size={18} color={accentColor} />
                    </View>
                    <Text style={[styles.accordionTitle, { color: colors.textTitle }]}>{title}</Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.accordionContent}>
                    <Text style={[styles.tapHint, { color: colors.textSecondary }]}>{t('home.tap_to_view')}</Text>
                    <View style={useGrid ? styles.accordionGrid2x2 : styles.accordionGrid}>
                        {categories.map((item, idx) => {
                            const catColor = colors.categoryColors[item.colorKey];
                            const catTitle = t(`category_titles.${item.id}` as any) || item.id;
                            return (
                                <Animated.View key={item.id} entering={FadeInDown.duration(300).delay(idx * 40)} style={useGrid ? styles.gridCell : undefined}>
                                    <TouchableOpacity
                                        style={[styles.miniCard, { backgroundColor: catColor.bgFill, borderColor: colors.cardBorder }]}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            if (item.type === 'psychomatrix') {
                                                adService.checkInterstitial(() => navigation.navigate('Psychomatrix'));
                                            } else if (item.id === 'life_path') {
                                                adService.checkInterstitial(() => navigation.navigate('LifePath'));
                                            } else {
                                                adService.checkInterstitial(() => navigation.navigate('CategoryDetail', { categoryId: item.id }));
                                            }
                                        }}
                                    >
                                        <View style={[styles.miniCardIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' }]}>
                                            {item.iconSet === 'ionicons' ? (
                                                <Ionicons name={item.icon as any} size={16} color={catColor.color} />
                                            ) : (
                                                <MaterialCommunityIcons name={item.icon as any} size={16} color={catColor.color} />
                                            )}
                                        </View>
                                        <Text style={[styles.miniCardTitle, { color: colors.textSecondary }]} numberOfLines={2}>{catTitle}</Text>
                                        <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Detailed Readings (Accordions) ────────────────────────────
function DetailedReadings() {
    const { theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const coreCategories = ALL_CATEGORIES.filter(c =>
        ['birthday_number', 'expression', 'soul_urge', 'personality_number'].includes(c.id)
    );

    const loveCategories = ALL_CATEGORIES.filter(c =>
        ['desire_number', 'love_number', 'couple_number', 'marriage_number'].includes(c.id)
    );

    const nameCategories = ALL_CATEGORIES.filter(c =>
        ['name_number', 'character_number', 'intelligence_number', 'balance_number', 'money_number', 'lucky_gem'].includes(c.id)
    );

    const lifeCycleCategories = ALL_CATEGORIES.filter(c =>
        ['birthday_code', 'maturity_number', 'challenge_number', 'achievement_number'].includes(c.id)
    );

    const destinyCategories = ALL_CATEGORIES.filter(c =>
        ['realization_number', 'potential_number', 'karmic_lesson', 'planet_number'].includes(c.id)
    );

    const dailyCategories = ALL_CATEGORIES.filter(c =>
        ['personal_year', 'personal_month', 'personal_day', 'daily_lucky_number'].includes(c.id)
    );

    const psychomatrixCategories = ALL_CATEGORIES.filter(c =>
        c.id === 'psychomatrix'
    );

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(600)} style={styles.sectionWrapper}>
            <Text style={[styles.sectionTitle, { color: colors.textTitle }]}>{t('home.detailed_readings')}</Text>
            <View style={{ gap: Spacing.m }}>
                <AccordionSection
                    title={t('home.core_numbers')}
                    icon="diamond"
                    categories={coreCategories}
                    defaultOpen={true}
                    useGrid={true}
                    iconColor={colors.categoryColors.destiny.color}
                />
                <AccordionSection
                    title={t('home.love_relationships')}
                    icon="heart"
                    categories={loveCategories}
                    useGrid={true}
                    iconColor={colors.categoryColors.soulUrge.color}
                />
                <AccordionSection
                    title={t('home.name_character')}
                    icon="person"
                    categories={nameCategories}
                    useGrid={true}
                    iconColor={colors.categoryColors.expression.color}
                />
                <NativeAdCard variant="compact" />
                <AccordionSection
                    title={t('home.life_cycles')}
                    icon="sync"
                    categories={lifeCycleCategories}
                    useGrid={true}
                    iconColor={colors.categoryColors.lifePath.color}
                />
                <AccordionSection
                    title={t('home.destiny_karma')}
                    icon="star"
                    categories={destinyCategories}
                    useGrid={true}
                    iconColor={colors.categoryColors.destiny.color}
                />
                <AccordionSection
                    title={t('home.daily_forecasts')}
                    icon="calendar"
                    categories={dailyCategories}
                    useGrid={true}
                    iconColor={colors.categoryColors.soulUrge.color}
                />
                <NativeAdCard variant="compact" />
                <AccordionSection
                    title={t('home.psychomatrix_title')}
                    icon="grid"
                    categories={psychomatrixCategories}
                    useGrid={true}
                    iconColor={colors.categoryColors.psychomatrix.color}
                />
            </View>
        </Animated.View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function HomeScreen() {
    const { dateOfBirth, language, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { visible: rateVisible, triggerRateCheck, dismiss: dismissRate } = useRateDialog();
    const hasTriggeredRate = useRef(false);

    const { day, month, year, dailyNumber } = useMemo(() => {
        const parts = (dateOfBirth || "01/01/1990").split('/');
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);

        const dn = NumbersCalculator.calcPersonalDay({ dateOfBirth: dateOfBirth || '01/01/1990', language, firstName: '', lastName: '' });

        return { day: d || 1, month: m || 1, year: y || 1990, dailyNumber: dn || 1 };
    }, [dateOfBirth, language]);

    const [guidanceText, setGuidanceText] = useState(t('home.guidance_default'));

    useEffect(() => {
        (async () => {
            try {
                const desc = await dbService.getPersonalDayInterpretation(language, dailyNumber);
                if (desc) {
                    // Get first sentence
                    const firstSentence = desc.split(/[.!?]/)[0]?.trim();
                    if (firstSentence) {
                        setGuidanceText(firstSentence + '.');
                    }
                }
            } catch (e) {
                // Keep default text
            }
        })();
    }, [dailyNumber, language]);

    // Trigger rate dialog once per app open
    useEffect(() => {
        if (!hasTriggeredRate.current) {
            hasTriggeredRate.current = true;
            triggerRateCheck();
        }
    }, []);

    const formattedDate = useMemo(() => {
        const now = new Date();
        const langMap: Record<string, string> = {
            en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
        };
        return now.toLocaleDateString(langMap[language] || 'en-US', {
            month: 'short',
            day: 'numeric',
        });
    }, [language]);

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} bounces={false}>
            <LinearGradient
                colors={colors.backgroundGradient}
                style={styles.fullBackground}
            >
                <View style={[styles.content, { paddingTop: insets.top + Spacing.m }]}>
                    <GreetingHeader formattedDate={formattedDate} />

                    <HeroDailyNumber
                        dailyNumber={dailyNumber}
                        guidanceText={guidanceText}
                        onPress={() => navigation.navigate('CategoryDetail', { categoryId: 'personal_day' })}
                    />

                    <View style={styles.chartWrapper}>
                        <BiorhythmChart day={day} month={month} year={year} />
                    </View>

                    <TopInsights />

                    <CompatibilityCard />

                    <DetailedReadings />
                </View>
            </LinearGradient>

            <RateUsDialog visible={rateVisible} onDismiss={dismissRate} />
        </ScrollView>
    );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    fullBackground: { flex: 1, minHeight: '100%' },
    content: { paddingBottom: Spacing.huge + 20 },

    // Greeting Header
    greetingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.m,
    },
    greetingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.m,
    },
    avatarSmall: {
        ...circle(44),
    },
    greetingText: {
        flex: 1,
        gap: 2,
    },
    greetingLabel: {
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1.5,
    },
    greetingName: {
        fontSize: 20,
        fontFamily: 'Manrope-Bold',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'Manrope-SemiBold',
    },

    // Chart
    chartWrapper: {
        paddingHorizontal: Spacing.xl,
    },
    biorhythmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    biorhythmViewAll: {
        fontSize: 14,
        fontFamily: 'Manrope-SemiBold',
    },

    // Sections
    sectionWrapper: {
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.l,
    },
    sectionTitle: {
        ...Typography.sectionTitle,
        marginBottom: Spacing.l,
    },

    // Top Insights
    insightsRow: {
        flexDirection: 'row',
        gap: Spacing.m,
        alignItems: 'stretch',
    },
    insightCardWrapper: {
        flex: 1,
    },
    insightCard: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    insightIcon: {
        ...circle(36),
        marginBottom: Spacing.s,
    },
    insightLabel: {
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    insightNumber: {
        fontSize: 26,
        fontFamily: 'Manrope-Bold',
    },
    insightNote: {
        fontSize: 9,
        fontFamily: 'Manrope-SemiBold',
        textAlign: 'center' as const,
        marginTop: 2,
        opacity: 0.7,
    },

    // Compatibility
    compatCard: {
        flexDirection: 'row',
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        paddingVertical: Spacing.xxl,
        minHeight: 170,
        borderWidth: 1,
        alignItems: 'center',
    },
    compatLeft: {
        flex: 1,
        marginRight: Spacing.m,
    },
    compatTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.s,
    },
    compatTitle: {
        ...Typography.chartTitle,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    premiumText: {
        color: '#fff',
        fontSize: 8,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 0.5,
    },
    compatSub: {
        fontSize: 13,
        lineHeight: 18,
    },
    compatDivider: {
        height: 1,
        marginTop: Spacing.l,
    },
    compatCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.l,
    },
    compatCtaText: {
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
    },
    compatIcon: {
        ...circle(56),
    },

    // Accordion
    accordionWrapper: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    accordionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    accordionIcon: {
        ...circle(36),
    },
    accordionTitle: {
        ...Typography.chartTitle,
    },
    accordionContent: {
        paddingHorizontal: Spacing.m,
        paddingBottom: Spacing.xl,
    },
    tapHint: {
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1.5,
        textAlign: 'center',
        marginBottom: Spacing.m,
    },
    accordionGrid: {
        gap: Spacing.s,
    },
    accordionGrid2x2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    gridCell: {
        width: '48.5%',
    },
    miniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.m,
        minHeight: 66,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
        gap: Spacing.s,
    },
    miniCardIcon: {
        ...circle(28),
    },
    miniCardTitle: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Manrope-SemiBold',
    },
});
