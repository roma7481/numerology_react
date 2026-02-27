import React, { useEffect, useState, useMemo } from 'react';
import {
    ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle as SvgCircle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { NumerologyContext } from '../utils/NumbersCalculator';
import { dbService } from '../services/DatabaseService';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Shadow } from '../theme/SharedStyles';
import { useTranslation } from '../i18n';
import { ALL_CATEGORIES, calculateForCategory } from '../config/CategoryConfig';
import { NameEntryModal } from '../components/NameEntryModal';
import { ProfileModal } from '../components/ProfileModal';
import BannerAdWrapper from '../components/ads/BannerAdWrapper';

type RouteParams = RouteProp<{ Detail: { categoryId: string } }, 'Detail'>;

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

export default function CategoryDetailScreen() {
    const route = useRoute<RouteParams>();
    const { categoryId } = route.params;
    const { language, dateOfBirth, firstName, lastName, fatherName, partnerDateOfBirth, weddingDay, theme, activeProfileId } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [mainNumber, setMainNumber] = useState<number | number[]>(0);
    const [readings, setReadings] = useState<{ number: number; data: Record<string, any> | null }[]>([]);
    const [categoryInfo, setCategoryInfo] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
    const [infoExpanded, setInfoExpanded] = useState(false);
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);

    const catDef = useMemo(() => ALL_CATEGORIES.find(c => c.id === categoryId), [categoryId]);

    const context: NumerologyContext = useMemo(() => ({
        language,
        dateOfBirth: dateOfBirth || '01/01/1990',
        firstName: firstName || '',
        lastName: lastName || '',
        fatherName,
        partnerDateOfBirth,
        weddingDay,
    }), [language, dateOfBirth, firstName, lastName, fatherName, partnerDateOfBirth, weddingDay]);

    useEffect(() => {
        if (catDef?.needsName && (!firstName || !lastName)) {
            setNameModalVisible(true);
        }
        loadData();
    }, [context, categoryId]);

    const loadData = async () => {
        if (!catDef) return;
        setLoading(true);
        try {
            const locale = language || 'en';
            const result = calculateForCategory(categoryId, context);
            setMainNumber(result);

            // Load category info/description from table_description
            const info = await dbService.getTableDescription(catDef.table, locale);
            setCategoryInfo(info);

            const results: { number: number; data: Record<string, any> | null }[] = [];

            if (catDef.type === 'multi') {
                // Multiple numbers (challenge 1-4, achievement 1-4)
                const nums = result as number[];
                for (const num of nums) {
                    const data = await dbService.getByNumber(catDef.table, locale, num);
                    results.push({ number: num, data });
                }
            } else if (catDef.type === 'karmic') {
                // Karmic lessons — show missing numbers
                const karmicArray = result as number[];
                for (let i = 1; i <= 9; i++) {
                    if (karmicArray[i] === 0) {
                        const data = await dbService.getByNumber(catDef.table, locale, i);
                        results.push({ number: i, data });
                    }
                }
                if (results.length === 0) {
                    // No missing numbers — nothing to show
                    results.push({ number: 0, data: { description: t('category.no_missing_numbers') } });
                }
            } else {
                // Simple — single number lookup
                const num = result as number;
                const data = await dbService.getByNumber(catDef.table, locale, num);
                results.push({ number: num, data });
            }

            setReadings(results);
        } catch (e) {
            console.error(`CategoryDetailScreen [${categoryId}] loadData error:`, e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (idx: number) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const displayNumber = Array.isArray(mainNumber)
        ? mainNumber.join(', ')
        : String(mainNumber);

    const title = t(`category_titles.${categoryId}` as any) || categoryId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (loading) {
        return (
            <LinearGradient colors={colors.backgroundGradient} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LinearGradient>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} bounces={false}>
                <LinearGradient colors={colors.backgroundGradient} style={styles.fullBackground}>
                    <View style={[styles.content, { paddingTop: insets.top }]}>
                        {/* Header */}
                        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                            <View style={styles.headerTopRow}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                    <Ionicons name="arrow-back" size={24} color={colors.textTitle} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    const shareText = readings
                                        .filter(r => r.data)
                                        .map(r => {
                                            const lines = Object.entries(r.data!)
                                                .filter(([k, v]) => v && !['id', 'locale', 'number', 'type', 'level'].includes(k))
                                                .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:\n${String(v)}`)
                                                .join('\n\n');
                                            return lines;
                                        })
                                        .join('\n\n---\n\n');
                                    Share.share({ message: `${title} — ${displayNumber}\n\n${shareText}` });
                                }} style={styles.shareBtn}>
                                    <Ionicons name="share-social" size={22} color={colors.textTitle} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.title, { color: colors.textTitle }]} numberOfLines={2}>
                                {title}
                            </Text>
                        </Animated.View>

                        {/* Number - category colored aura */}
                        {!(catDef?.needsName && (!firstName || !lastName)) && !(catDef?.needsPartner && !partnerDateOfBirth) && (() => {
                            const catColor = colors.categoryColors[catDef?.colorKey || 'lifePath'];
                            const glowColor = catColor?.color || colors.primary;
                            return (
                                <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.numberBadgeWrapper}>
                                    <View style={styles.heroWrapper}>
                                        {/* Glow + rings */}
                                        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                            <Svg width={270} height={270} viewBox="0 0 270 270">
                                                <Defs>
                                                    <RadialGradient id="catGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                                                        <Stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
                                                        <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
                                                    </RadialGradient>
                                                </Defs>
                                                <SvgCircle cx={135} cy={135} r={135} fill="url(#catGlow)" />
                                                {[180, 202, 225, 248].map((d, i) => (
                                                    <SvgCircle
                                                        key={i} cx={135} cy={135} r={d / 2}
                                                        fill="none"
                                                        stroke={glowColor}
                                                        strokeWidth={0.8}
                                                        strokeDasharray="1, 8"
                                                        strokeLinecap="round"
                                                        opacity={isDark ? 0.4 : 0.3}
                                                    />
                                                ))}
                                            </Svg>
                                        </View>
                                        {/* Main circle */}
                                        <View style={[styles.mainCircle, {
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : catColor?.bgFill || '#f3f0ff',
                                            borderColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                                            borderWidth: isDark ? 1.5 : 1,
                                            shadowColor: isDark ? 'transparent' : glowColor,
                                        }]}>
                                            <Text style={[styles.numberText, { color: glowColor }, Array.isArray(mainNumber) && { fontSize: 22 }]}>
                                                {displayNumber}
                                            </Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })()}

                        {/* Reading Cards - one card per field */}
                        <View style={styles.readingsSection}>
                            {readings.map((reading, rIndex) => {
                                if (!reading.data) return null;
                                const catColor = colors.categoryColors[catDef?.colorKey || 'lifePath'];
                                const iconColor = catColor?.color || colors.primary;
                                const iconBg = isDark ? 'rgba(255,255,255,0.1)' : (catColor?.bgFill || colors.primary + '15');

                                // Show period label for multi-reading categories
                                const showPeriodLabel = readings.length > 1;
                                const fields = Object.entries(reading.data)
                                    .filter(([k, v]) => v && !['id', 'locale', 'number', 'type', 'level'].includes(k));

                                return (
                                    <React.Fragment key={rIndex}>
                                        {showPeriodLabel && (
                                            <Text style={[styles.periodLabel, { color: colors.textTitle }]}>
                                                {title} {rIndex + 1}
                                            </Text>
                                        )}
                                        {fields.map(([key, val], fIndex) => {
                                            const cardIndex = rIndex * 100 + fIndex;
                                            const isExpanded = expandedSections.has(cardIndex);
                                            const fieldIcon = FIELD_ICONS[key] || { name: 'document-text', set: 'ionicons' };
                                            const fieldTitle = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                                            return (
                                                <Animated.View key={key} entering={FadeInUp.duration(400).delay(200 + fIndex * 60)}>
                                                    <TouchableOpacity
                                                        style={[styles.meaningCard, {
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                                            borderColor: colors.cardBorder,
                                                        }]}
                                                        activeOpacity={0.8}
                                                        onPress={() => toggleSection(cardIndex)}
                                                    >
                                                        <View style={[styles.meaningIcon, { backgroundColor: iconBg }]}>
                                                            {fieldIcon.set === 'material' ? (
                                                                <MaterialCommunityIcons name={fieldIcon.name as any} size={20} color={iconColor} />
                                                            ) : (
                                                                <Ionicons name={fieldIcon.name as any} size={20} color={iconColor} />
                                                            )}
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
                                    </React.Fragment>
                                );
                            })}
                        </View>

                        {/* No data state */}
                        {readings.length === 0 && (
                            <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.readingsSection}>
                                <View style={[styles.meaningCard, {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    borderColor: colors.cardBorder,
                                    justifyContent: 'center',
                                }]}>
                                    <Text style={[styles.fieldText, { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', marginBottom: Spacing.m }]}>
                                        {catDef?.needsName && (!firstName || !lastName)
                                            ? t('category.needs_name')
                                            : catDef?.needsPartner && !partnerDateOfBirth
                                                ? t('category.needs_partner')
                                                : t('category.no_data')}
                                    </Text>
                                    {catDef?.needsName && (!firstName || !lastName) ? (
                                        <TouchableOpacity
                                            style={[styles.editButton, { backgroundColor: colors.primary }]}
                                            onPress={() => setNameModalVisible(true)}
                                        >
                                            <Text style={styles.editButtonText}>{t('common.enter_name') || 'Enter Name'}</Text>
                                        </TouchableOpacity>
                                    ) : catDef?.needsPartner && !partnerDateOfBirth ? (
                                        <TouchableOpacity
                                            style={[styles.editButton, { backgroundColor: colors.primary }]}
                                            onPress={() => setProfileModalVisible(true)}
                                        >
                                            <Text style={styles.editButtonText}>{t('common.edit_profile')}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </Animated.View>
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
                                    <View style={[styles.meaningIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : (colors.categoryColors[catDef?.colorKey || 'lifePath']?.bgFill || colors.primary + '15') }]}>
                                        <Ionicons name="information-circle" size={20} color={colors.categoryColors[catDef?.colorKey || 'lifePath']?.color || colors.primary} />
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

                <NameEntryModal
                    visible={nameModalVisible}
                    onClose={() => setNameModalVisible(false)}
                    onCancel={() => {
                        setNameModalVisible(false);
                        navigation.goBack();
                    }}
                />

                <ProfileModal
                    visible={profileModalVisible}
                    onClose={() => setProfileModalVisible(false)}
                    editingProfileId={activeProfileId}
                />
            </ScrollView>
            <BannerAdWrapper />
        </View>
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

    // Number badge — home insight card style
    numberBadgeWrapper: {
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    heroWrapper: {
        width: 270,
        height: 270,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    heroLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    numberText: {
        fontSize: 54,
        fontWeight: '300',
        fontFamily: 'Manrope-Regular',
        marginTop: -2,
    },

    // Reading cards — biorhythm meaning-card style
    readingsSection: {
        paddingHorizontal: Spacing.l,
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
    meaningCard: {
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
    meaningIconText: {
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
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
    meaningBody: {
        marginTop: Spacing.m,
    },
    fieldBlock: { marginBottom: Spacing.l },
    fieldLabel: {
        fontSize: 11,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: Spacing.xs,
    },
    fieldText: {
        fontSize: 13,
        fontFamily: 'Manrope-Regular',
        lineHeight: 20,
    },
    periodLabel: {
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
        marginTop: Spacing.m,
        marginBottom: Spacing.xs,
    },
    editButton: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.s,
        borderRadius: BorderRadius.m,
        marginTop: Spacing.s,
    },
    editButtonText: {
        color: '#fff',
        fontFamily: 'Manrope-Bold',
        fontSize: 14,
    },
});
