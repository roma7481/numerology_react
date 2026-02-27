import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    ScrollView, View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { NumbersCalculator, NumerologyContext } from '../utils/NumbersCalculator';
import { dbService } from '../services/DatabaseService';
import { Colors } from '../theme/Colors';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Typography } from '../theme/Typography';
import { Shadow } from '../theme/SharedStyles';
import { useTranslation } from '../i18n';
import { adService } from '../services/AdService';
import NativeAdCard from '../components/ads/NativeAdCard';

// ─── Types ─────────────────────────────────────────────────────
type ForecastType = 'personal_day' | 'daily_lucky_number' | 'personal_month' | 'personal_year';

const FORECAST_SECTIONS: {
    key: ForecastType;
    icon: string;
    color: string;
    chipType: 'day' | 'month' | 'year';
    sectionLabel: string;
    categoryId: string;
}[] = [
        { key: 'personal_day', icon: 'today', color: '#7c3aed', chipType: 'day', sectionLabel: 'Daily Forecast', categoryId: 'personal_day' },
        { key: 'daily_lucky_number', icon: 'star', color: '#e0aa3e', chipType: 'day', sectionLabel: 'Lucky Forecast', categoryId: 'daily_lucky_number' },
        { key: 'personal_month', icon: 'calendar', color: '#3b82f6', chipType: 'month', sectionLabel: 'Monthly Forecast', categoryId: 'personal_month' },
        { key: 'personal_year', icon: 'ribbon', color: '#e05555', chipType: 'year', sectionLabel: 'Annual Forecast', categoryId: 'personal_year' },
    ];

// ─── Helpers ────────────────────────────────────────────────────
function formatDayChip(offset: number, locale: string): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const month = d.toLocaleDateString(locale, { month: 'short' });
    return `${month} ${d.getDate()}`;
}

function formatMonthChip(offset: number, locale: string): string {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

function formatYearChip(offset: number): string {
    return String(new Date().getFullYear() + offset);
}

function getLocaleCode(language: string): string {
    const map: Record<string, string> = {
        en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR',
        it: 'it-IT', pt: 'pt-BR', ru: 'ru-RU',
    };
    return map[language] || 'en-US';
}

// ─── Forecast Card (Preview + Navigate) ──────────────────────
function ForecastCard({
    icon, title, number, color, description, isDark, colors, onNavigate,
}: {
    icon: string; title: string; number: number; color: string;
    description: string;
    isDark: boolean; colors: any; onNavigate: () => void;
}) {
    const preview = description.length > 200
        ? description.substring(0, 200).trimEnd() + '…'
        : description;

    return (
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
            {/* Header row */}
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: isDark ? `${color}25` : `${color}15` }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.textTitle }]}>{title}</Text>
                </View>
                <View style={[styles.numBadge, { backgroundColor: isDark ? `${color}30` : `${color}15` }]}>
                    <Text style={{ color, fontFamily: 'Manrope-Bold', fontSize: 16 }}>{number}</Text>
                </View>
            </View>

            {/* Preview text */}
            <Text style={[styles.cardText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                {preview}
            </Text>

            {/* Navigate chevron */}
            <TouchableOpacity
                onPress={onNavigate}
                style={[styles.readMoreRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]}
                activeOpacity={0.7}
            >
                <Text style={{ color: isDark ? '#FFD700' : '#7c3aed', fontFamily: 'Manrope-SemiBold', fontSize: 13 }}>
                    Read more
                </Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#FFD700' : '#7c3aed'} />
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function CalendarScreen() {
    const { theme, language, dateOfBirth, firstName, lastName } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const localeCode = useMemo(() => getLocaleCode(language), [language]);

    // Selected offsets
    const [dayOffset, setDayOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);
    const [yearOffset, setYearOffset] = useState(0);

    // Data
    const [loading, setLoading] = useState(false);
    const [forecastData, setForecastData] = useState<Record<ForecastType, { number: number; description: string; info: string }>>({
        personal_day: { number: 0, description: '', info: '' },
        daily_lucky_number: { number: 0, description: '', info: '' },
        personal_month: { number: 0, description: '', info: '' },
        personal_year: { number: 0, description: '', info: '' },
    });

    const context: NumerologyContext = useMemo(() => ({
        language: language || 'en',
        dateOfBirth: dateOfBirth || '01/01/1990',
        firstName: firstName || '',
        lastName: lastName || '',
    }), [language, dateOfBirth, firstName, lastName]);

    const loadForecasts = useCallback(async () => {
        setLoading(true);
        try {
            const locale = language || 'en';

            // Compute numbers
            const personalDayNum = NumbersCalculator.calcPersonalDay(context, dayOffset);
            const luckyDailyNum = NumbersCalculator.calcLuckyDailyNumber(context, dayOffset);
            const personalMonthNum = NumbersCalculator.calcPersonalMonth(context, monthOffset);
            const personalYearNum = NumbersCalculator.calcPersonalYear(context, yearOffset);

            // Fetch descriptions + table info
            const [dayData, luckyData, monthData, yearData, dayInfo, luckyInfo, monthInfo, yearInfo] = await Promise.all([
                dbService.getByNumber('personal_day', locale, personalDayNum),
                dbService.getByNumber('daily_lucky_number', locale, luckyDailyNum),
                dbService.getByNumber('personal_month', locale, personalMonthNum),
                dbService.getByNumber('personal_year', locale, personalYearNum),
                dbService.getTableDescription('personal_day', locale),
                dbService.getTableDescription('daily_lucky_number', locale),
                dbService.getTableDescription('personal_month', locale),
                dbService.getTableDescription('personal_year', locale),
            ]);

            setForecastData({
                personal_day: { number: personalDayNum, description: (dayData as any)?.description || '', info: dayInfo },
                daily_lucky_number: { number: luckyDailyNum, description: (luckyData as any)?.description || '', info: luckyInfo },
                personal_month: { number: personalMonthNum, description: (monthData as any)?.description || '', info: monthInfo },
                personal_year: { number: personalYearNum, description: (yearData as any)?.description || '', info: yearInfo },
            });
        } catch (e) {
            console.warn('Forecast load error', e);
        } finally {
            setLoading(false);
        }
    }, [context, dayOffset, monthOffset, yearOffset, language]);

    useEffect(() => {
        loadForecasts();
    }, [loadForecasts]);

    // ─── Day Chips ──────────────────────────────────────────────
    const dayChips = useMemo(() => [0, 1, 2].map(i => ({
        offset: i,
        label: formatDayChip(i, localeCode),
    })), [localeCode]);

    const monthChips = useMemo(() => [0, 1, 2].map(i => ({
        offset: i,
        label: formatMonthChip(i, localeCode),
    })), [localeCode]);

    const yearChips = useMemo(() => [0, 1, 2].map(i => ({
        offset: i,
        label: formatYearChip(i),
    })), []);

    // ─── Labels ─────────────────────────────────────────────────
    const getTitle = (key: ForecastType): string => {
        switch (key) {
            case 'personal_day': return t('category.personal_day') || 'Personal Day';
            case 'daily_lucky_number': return t('category.daily_lucky_number') || 'Daily Lucky Number';
            case 'personal_month': return t('category.personal_month') || 'Personal Month';
            case 'personal_year': return t('category.personal_year') || 'Personal Year';
        }
    };

    // ─── Render ─────────────────────────────────────────────────
    const renderChipRow = (
        chips: { offset: number; label: string }[],
        selectedOffset: number,
        onSelect: (offset: number) => void,
        color: string,
        chipType?: string,
    ) => (
        <View style={styles.chipRow}>
            {chips.map(chip => {
                const isActive = chip.offset === selectedOffset;
                const useGlass = isDark && chipType === 'personal_day';
                return (
                    <TouchableOpacity
                        key={chip.offset}
                        onPress={() => onSelect(chip.offset)}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : (isActive ? `${color}15` : '#f8f9fe'),
                                borderColor: isActive ? (useGlass ? '#7dd3fc' : (isDark && chipType === 'personal_month' ? '#bae6fd' : color)) : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                            },
                        ]}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.chipText,
                            { color: isActive ? (useGlass ? colors.textPrimary : (isDark && chipType === 'personal_month' ? '#bae6fd' : color)) : colors.textSecondary },
                        ]}>
                            {chip.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={[...colors.backgroundGradient]} style={{ flex: 1, minHeight: '100%' }}>
                <View style={{ paddingTop: insets.top + Spacing.m }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textTitle }]}>
                            {t('home.daily_forecasts') || 'Forecast'}
                        </Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={isDark ? '#c084fc' : '#7c3aed'} />
                        </View>
                    ) : (
                        <View style={{ paddingBottom: insets.bottom + 90 }}>
                            {FORECAST_SECTIONS.map((section, sIdx) => {
                                const data = forecastData[section.key];
                                if (!data.description) return null;

                                // Choose chips based on type
                                let chips: { offset: number; label: string }[];
                                let selectedOffset: number;
                                let onSelect: (o: number) => void;

                                if (section.chipType === 'day') {
                                    chips = dayChips;
                                    selectedOffset = dayOffset;
                                    onSelect = setDayOffset;
                                } else if (section.chipType === 'month') {
                                    chips = monthChips;
                                    selectedOffset = monthOffset;
                                    onSelect = setMonthOffset;
                                } else {
                                    chips = yearChips;
                                    selectedOffset = yearOffset;
                                    onSelect = setYearOffset;
                                }

                                return (
                                    <React.Fragment key={section.key}>
                                        <Animated.View entering={FadeInDown.duration(400).delay(sIdx * 100)}>
                                            {/* Section header */}
                                            <Text style={[styles.sectionHeader, { color: colors.textTitle }]}>
                                                {section.sectionLabel}
                                            </Text>

                                            {/* Chip selector */}
                                            {renderChipRow(chips, selectedOffset, onSelect, section.color, section.key)}

                                            {/* Card */}
                                            <View style={{ paddingHorizontal: Spacing.l, marginBottom: Spacing.l }}>
                                                <ForecastCard
                                                    icon={section.icon}
                                                    title={getTitle(section.key)}
                                                    number={data.number}
                                                    color={isDark && section.key === 'personal_day' ? '#7dd3fc' : (isDark && section.key === 'personal_month' ? '#bae6fd' : section.color)}
                                                    description={data.description}
                                                    isDark={isDark}
                                                    colors={colors}
                                                    onNavigate={() => adService.checkInterstitial(() => navigation.navigate('CategoryDetail', { categoryId: section.categoryId }))}
                                                />
                                            </View>
                                        </Animated.View>
                                        {/* Native/MREC ad after 2nd forecast card only */}
                                        {sIdx === 1 && (
                                            <View style={{ paddingHorizontal: Spacing.l }}>
                                                <NativeAdCard variant="default" />
                                            </View>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    )}
                </View>
            </LinearGradient>
        </ScrollView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingBottom: Spacing.m,
    },
    title: { ...Typography.chartTitle, fontSize: 18 },

    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },

    chipRow: { flexDirection: 'row', paddingHorizontal: Spacing.l, gap: Spacing.s, marginBottom: Spacing.m },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    },
    chipText: { fontSize: 12, fontFamily: 'Manrope-SemiBold' },

    card: {
        borderRadius: BorderRadius.l, padding: Spacing.l, borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.m,
    },
    cardIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontFamily: 'Manrope-SemiBold' },
    cardText: { fontSize: 13, fontFamily: 'Manrope-Regular', lineHeight: 20 },
    numBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
    readMoreRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: Spacing.m, paddingTop: Spacing.m, borderTopWidth: 1,
    },
    sectionHeader: {
        fontSize: 18, fontFamily: 'NotoSerif-Bold', paddingHorizontal: Spacing.l,
        marginBottom: Spacing.s, marginTop: Spacing.s,
    },
});
