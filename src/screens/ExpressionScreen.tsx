import React, { useEffect, useState, useMemo } from 'react';
import {
    ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { NumbersCalculator, NumerologyContext } from '../utils/NumbersCalculator';
import { dbService } from '../services/DatabaseService';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Shadow } from '../theme/SharedStyles';
import { useTranslation } from '../i18n';

interface SubReading {
    title: string;
    number: number;
    data: Record<string, any> | null;
}

export default function ExpressionScreen() {
    const { language, dateOfBirth, firstName, lastName, fatherName, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [mainReading, setMainReading] = useState<Record<string, any> | null>(null);
    const [mainNumber, setMainNumber] = useState(0);
    const [subReadings, setSubReadings] = useState<SubReading[]>([]);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));

    const context: NumerologyContext = useMemo(() => ({
        language,
        dateOfBirth: dateOfBirth || '01/01/1990',
        firstName: firstName || '',
        lastName: lastName || '',
        fatherName,
    }), [language, dateOfBirth, firstName, lastName, fatherName]);

    useEffect(() => {
        loadData();
    }, [context]);

    const loadData = async () => {
        setLoading(true);
        try {
            const locale = language || 'en';

            // Main Expression number
            const exprNum = NumbersCalculator.calcExpressionNumber(context);
            setMainNumber(exprNum);
            const exprReading = await dbService.getByNumber('expression_number', locale, exprNum);
            setMainReading(exprReading);

            const readings: SubReading[] = [];

            // Personality Number
            const personalityNum = NumbersCalculator.calcPersonalityNumber(context);
            const personalityData = await dbService.getByNumber('personality_number', locale, personalityNum);
            readings.push({ title: t('category.personality_number'), number: personalityNum, data: personalityData });

            // Name Number
            const nameNum = NumbersCalculator.calcNameNumber(context);
            const nameData = await dbService.getByNumber('name_number', locale, nameNum);
            readings.push({ title: t('category.name_number'), number: nameNum, data: nameData });

            // Character Number
            const charNum = NumbersCalculator.calcCharacterNumber(context);
            const charData = await dbService.getByNumber('character_number', locale, charNum);
            readings.push({ title: t('category.character_number'), number: charNum, data: charData });

            // Intelligence Number
            const intellNum = NumbersCalculator.calcIntelligenceNumber(context);
            const intellData = await dbService.getByNumber('intelligence_number', locale, intellNum);
            readings.push({ title: t('category.intelligence_number'), number: intellNum, data: intellData });

            // Balance Number
            const balanceNum = NumbersCalculator.calcBalanceNumber(context);
            const balanceData = await dbService.getByNumber('balance_number', locale, balanceNum);
            readings.push({ title: t('category.balance_number'), number: balanceNum, data: balanceData });

            // Money Number
            const moneyNum = NumbersCalculator.calcMoneyNumber(context);
            const moneyData = await dbService.getByNumber('money_number', locale, moneyNum);
            readings.push({ title: t('category.money_number'), number: moneyNum, data: moneyData });

            // Lucky Gem
            const gemNum = NumbersCalculator.calcLuckyGem(context);
            const gemData = await dbService.getByNumber('lucky_gem', locale, gemNum);
            readings.push({ title: t('category.lucky_gem'), number: gemNum, data: gemData });

            setSubReadings(readings);
        } catch (e) {
            console.error('ExpressionScreen loadData error:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={28} color={colors.textTitle} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.textTitle }]}>
                            {t('menu.expression')}
                        </Text>
                        <View style={{ width: 28 }} />
                    </Animated.View>

                    {/* Main Number Badge */}
                    <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.numberBadgeWrapper}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryLight]}
                            style={styles.numberBadge}
                        >
                            <Text style={styles.numberBadgeText}>{mainNumber}</Text>
                        </LinearGradient>
                        <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                            {t('category.your_number')}
                        </Text>
                    </Animated.View>

                    {/* Main Reading Card */}
                    {mainReading && (
                        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
                            <TouchableOpacity
                                style={[styles.card, {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.categoryCardShadow,
                                }, theme === 'light' && Shadow.light]}
                                activeOpacity={0.8}
                                onPress={() => toggleSection('main')}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.textTitle }]}>
                                        {t('category.expression_reading')}
                                    </Text>
                                    <Ionicons
                                        name={expandedSections.has('main') ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </View>
                                {expandedSections.has('main') && (
                                    <View style={styles.cardContent}>
                                        {Object.entries(mainReading).map(([key, val]) => {
                                            if (!val || key === 'id' || key === 'locale' || key === 'number') return null;
                                            return (
                                                <View key={key} style={styles.fieldBlock}>
                                                    <Text style={[styles.fieldLabel, { color: colors.primary }]}>
                                                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                    </Text>
                                                    <Text style={[styles.fieldText, { color: colors.textPrimary }]}>
                                                        {String(val)}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Sub-Readings */}
                    {subReadings.map((sub, index) => {
                        if (!sub.data) return null;
                        const sectionKey = `sub_${index}`;
                        return (
                            <Animated.View key={sectionKey} entering={FadeInUp.duration(400).delay(300 + index * 60)}>
                                <TouchableOpacity
                                    style={[styles.card, {
                                        backgroundColor: colors.cardBackground,
                                        borderColor: colors.cardBorder,
                                        shadowColor: colors.categoryCardShadow,
                                    }, theme === 'light' && Shadow.light]}
                                    activeOpacity={0.8}
                                    onPress={() => toggleSection(sectionKey)}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardTitleRow}>
                                            <Text style={[styles.cardTitle, { color: colors.textTitle }]}>
                                                {sub.title}
                                            </Text>
                                            <View style={[styles.smallBadge, { backgroundColor: colors.primary + '20' }]}>
                                                <Text style={[styles.smallBadgeText, { color: colors.primary }]}>
                                                    {sub.number}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons
                                            name={expandedSections.has(sectionKey) ? 'chevron-up' : 'chevron-down'}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </View>
                                    {expandedSections.has(sectionKey) && (
                                        <View style={styles.cardContent}>
                                            {Object.entries(sub.data).map(([key, val]) => {
                                                if (!val || key === 'id' || key === 'locale' || key === 'number') return null;
                                                return (
                                                    <View key={key} style={styles.fieldBlock}>
                                                        <Text style={[styles.fieldLabel, { color: colors.primary }]}>
                                                            {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                        </Text>
                                                        <Text style={[styles.fieldText, { color: colors.textPrimary }]}>
                                                            {String(val)}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.l,
        marginBottom: Spacing.xl,
    },
    backButton: { padding: Spacing.xs },
    headerTitle: { ...Typography.sectionTitle, textAlign: 'center', flex: 1 },
    numberBadgeWrapper: { alignItems: 'center', marginBottom: Spacing.xxl },
    numberBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberBadgeText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: 'serif',
    },
    numberLabel: { ...Typography.label, marginTop: Spacing.s },
    card: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.l,
        borderRadius: BorderRadius.l,
        padding: Spacing.xl,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.s },
    cardTitle: { ...Typography.chartTitle },
    smallBadge: {
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: BorderRadius.s,
    },
    smallBadgeText: { fontSize: 14, fontWeight: 'bold' },
    cardContent: { marginTop: Spacing.l },
    fieldBlock: { marginBottom: Spacing.l },
    fieldLabel: { ...Typography.label, marginBottom: Spacing.xs },
    fieldText: { ...Typography.body, lineHeight: 24 },
});
