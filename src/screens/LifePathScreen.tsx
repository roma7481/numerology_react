import React, { useEffect, useState, useMemo } from 'react';
import {
    ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle as SvgCircle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { NumbersCalculator, NumerologyContext } from '../utils/NumbersCalculator';
import { dbService } from '../services/DatabaseService';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { useTranslation } from '../i18n';
import { ALL_CATEGORIES, ColorKey } from '../config/CategoryConfig';

// Icon map for each database field
const FIELD_ICONS: Record<string, { name: string; set: 'ionicons' | 'material' }> = {
    description: { name: 'document-text', set: 'ionicons' },
    negative: { name: 'alert-circle', set: 'ionicons' },
    profession: { name: 'briefcase', set: 'ionicons' },
    finances: { name: 'cash', set: 'ionicons' },
    relationships: { name: 'people', set: 'ionicons' },
    health: { name: 'fitness', set: 'ionicons' },
    love: { name: 'heart', set: 'ionicons' },
    man: { name: 'man', set: 'ionicons' },
    women: { name: 'woman', set: 'ionicons' },
    spirituality: { name: 'sparkles', set: 'ionicons' },
    career: { name: 'trending-up', set: 'ionicons' },
    compatibility: { name: 'git-compare', set: 'ionicons' },
    strengths: { name: 'shield-checkmark', set: 'ionicons' },
    weaknesses: { name: 'warning', set: 'ionicons' },
    lucky_color: { name: 'color-palette', set: 'ionicons' },
    lucky_day: { name: 'calendar', set: 'ionicons' },
    advice: { name: 'bulb', set: 'ionicons' },
    personality: { name: 'person', set: 'ionicons' },
    characteristics: { name: 'list', set: 'ionicons' },
};

export default function LifePathScreen() {
    const { language, dateOfBirth, firstName, lastName, fatherName, partnerDateOfBirth, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const catDef = ALL_CATEGORIES.find((c: { id: string }) => c.id === 'life_path');
    // Use same colors as Top Insights card on home screen
    const iconColor = isDark ? '#7dd3fc' : '#9d4edd';
    const iconBg = isDark ? 'rgba(255,255,255,0.1)' : '#f3f0ff';

    const [loading, setLoading] = useState(true);
    const [mainReading, setMainReading] = useState<Record<string, any> | null>(null);
    const [mainNumber, setMainNumber] = useState(0);
    const [categoryInfo, setCategoryInfo] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
    const [infoExpanded, setInfoExpanded] = useState(false);

    const context: NumerologyContext = useMemo(() => ({
        language,
        dateOfBirth: dateOfBirth || '01/01/1990',
        firstName: firstName || '',
        lastName: lastName || '',
        fatherName,
        partnerDateOfBirth,
    }), [language, dateOfBirth, firstName, lastName, fatherName, partnerDateOfBirth]);

    useEffect(() => {
        loadData();
    }, [context]);

    const loadData = async () => {
        setLoading(true);
        try {
            const locale = language || 'en';

            // Main life path number
            const lifePathNum = NumbersCalculator.calcLifeNumberMethod1(context);
            setMainNumber(lifePathNum);
            const lifePathReading = await dbService.getByNumber('life_path_number', locale, lifePathNum);
            setMainReading(lifePathReading);

            // Load category info from table_description
            const info = await dbService.getTableDescription('life_path_number', locale);
            setCategoryInfo(info);
        } catch (e) {
            console.error('LifePathScreen loadData error:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (key: number) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleShare = () => {
        let text = `${t('menu.life_path')} — ${mainNumber}\n\n`;
        if (mainReading) {
            Object.entries(mainReading).forEach(([k, v]) => {
                if (v && !['id', 'locale', 'number', 'type', 'level'].includes(k)) {
                    text += `${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:\n${String(v)}\n\n`;
                }
            });
        }
        Share.share({ message: text });
    };

    if (loading) {
        return (
            <LinearGradient colors={colors.backgroundGradient} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LinearGradient>
        );
    }

    return (
        <ScrollView style={styles.container} bounces={false}>
            <LinearGradient colors={colors.backgroundGradient} style={styles.fullBackground}>
                <View style={[styles.content, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                        <View style={styles.headerTopRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color={colors.textTitle} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                                <Ionicons name="share-social" size={22} color={colors.textTitle} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.title, { color: colors.textTitle }]}>
                            {t('category_titles.life_path' as any)}
                        </Text>
                    </Animated.View>

                    {/* Number Circle */}
                    <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.numberBadgeWrapper}>
                        <View style={styles.heroWrapper}>
                            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                <Svg width={270} height={270} viewBox="0 0 270 270">
                                    <Defs>
                                        <RadialGradient id="lpGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                                            <Stop offset="0%" stopColor={iconColor} stopOpacity="0.35" />
                                            <Stop offset="100%" stopColor={iconColor} stopOpacity="0" />
                                        </RadialGradient>
                                    </Defs>
                                    <SvgCircle cx={135} cy={135} r={135} fill="url(#lpGlow)" />
                                    {[180, 202, 225, 248].map((d, i) => (
                                        <SvgCircle
                                            key={i} cx={135} cy={135} r={d / 2}
                                            fill="none"
                                            stroke={iconColor}
                                            strokeWidth={0.8}
                                            strokeDasharray="1, 8"
                                            strokeLinecap="round"
                                            opacity={isDark ? 0.4 : 0.3}
                                        />
                                    ))}
                                </Svg>
                            </View>
                            <View style={[styles.mainCircle, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : iconBg,
                                borderColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                                borderWidth: isDark ? 1.5 : 1,
                                shadowColor: isDark ? 'transparent' : iconColor,
                            }]}>
                                <Text style={[styles.numberText, { color: iconColor }]}>
                                    {mainNumber}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Main Reading - each field as separate card */}
                    {mainReading && (
                        <View style={styles.readingsSection}>
                            <Text style={[styles.sectionLabel, { color: colors.textTitle }]}>
                                {t('category.life_path_reading')}
                            </Text>
                            {Object.entries(mainReading)
                                .filter(([k, v]) => v && !['id', 'locale', 'number', 'type', 'level'].includes(k))
                                .map(([key, val], fIndex) => {
                                    const isExpanded = expandedSections.has(fIndex);
                                    const fIcon = FIELD_ICONS[key] || { name: 'document-text', set: 'ionicons' };
                                    const fieldTitle = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                                    return (
                                        <Animated.View key={key} entering={FadeInUp.duration(400).delay(200 + fIndex * 60)}>
                                            <TouchableOpacity
                                                style={[styles.meaningCard, {
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                                    borderColor: colors.cardBorder,
                                                }]}
                                                activeOpacity={0.8}
                                                onPress={() => toggleSection(fIndex)}
                                            >
                                                <View style={[styles.meaningIcon, { backgroundColor: iconBg }]}>
                                                    <Ionicons name={fIcon.name as any} size={20} color={iconColor} />
                                                </View>
                                                <View style={styles.meaningContent}>
                                                    <View style={styles.meaningHeaderRow}>
                                                        <Text style={[styles.meaningTitle, { color: colors.textTitle }]} numberOfLines={1}>
                                                            {fieldTitle}
                                                        </Text>
                                                        <Ionicons
                                                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                            size={18}
                                                            color={colors.textSecondary}
                                                        />
                                                    </View>
                                                    {isExpanded && (
                                                        <Text style={[styles.fieldText, { color: colors.textPrimary, marginTop: Spacing.s }]}>
                                                            {String(val)}
                                                        </Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                        </View>
                    )}

                    {/* Category Info - always last */}
                    {categoryInfo ? (
                        <Animated.View entering={FadeInUp.duration(400).delay(50)} style={styles.readingsSection}>
                            <TouchableOpacity
                                style={[styles.infoCard, {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    borderColor: colors.cardBorder,
                                }]}
                                activeOpacity={0.8}
                                onPress={() => setInfoExpanded(!infoExpanded)}
                            >
                                <View style={[styles.meaningIcon, { backgroundColor: iconBg }]}>
                                    <Ionicons name="information-circle" size={20} color={iconColor} />
                                </View>
                                <View style={styles.meaningContent}>
                                    <View style={styles.meaningHeaderRow}>
                                        <Text style={[styles.meaningTitle, { color: colors.textTitle }]} numberOfLines={1}>
                                            {t('category.about') || 'About'}
                                        </Text>
                                        <Ionicons
                                            name={infoExpanded ? 'chevron-up' : 'chevron-down'}
                                            size={18}
                                            color={colors.textSecondary}
                                        />
                                    </View>
                                    <Text
                                        style={[styles.fieldText, { color: colors.textSecondary, marginTop: Spacing.xs }]}
                                        numberOfLines={infoExpanded ? undefined : 2}
                                    >
                                        {categoryInfo}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ) : null}

                    <View style={{ height: Spacing.huge * 2 }} />
                </View>
            </LinearGradient>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fullBackground: { flex: 1, minHeight: '100%' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: Spacing.huge },
    header: {
        paddingHorizontal: Spacing.l,
        marginBottom: Spacing.m,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.m,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...Typography.screenHeader,
        textAlign: 'center',
    },
    numberBadgeWrapper: { alignItems: 'center', marginBottom: Spacing.l },
    heroWrapper: {
        width: 270,
        height: 270,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
    },
    numberText: {
        fontSize: 54,
        fontFamily: 'NotoSerif-Bold',
    },
    readingsSection: {
        paddingHorizontal: Spacing.l,
        gap: Spacing.s,
        marginBottom: Spacing.m,
    },
    sectionLabel: {
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
        marginBottom: Spacing.xs,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.xs,
    },
    smallBadge: {
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: BorderRadius.s,
    },
    smallBadgeText: { fontSize: 14, fontFamily: 'Manrope-Bold' },
    meaningCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.l,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
        gap: Spacing.m,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.l,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
        gap: Spacing.m,
    },
    meaningIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    meaningContent: {
        flex: 1,
    },
    meaningHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    meaningTitle: {
        fontSize: 15,
        fontFamily: 'Manrope-SemiBold',
        flex: 1,
    },
    fieldText: {
        fontSize: 13,
        fontFamily: 'Manrope-Regular',
        lineHeight: 20,
    },
});
