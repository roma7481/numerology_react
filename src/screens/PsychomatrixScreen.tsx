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
import BannerAdWrapper from '../components/ads/BannerAdWrapper';

const CHARACTERISTICS = [
    'personality', 'energy', 'interest',
    'health', 'logic', 'labor',
    'luck', 'duty', 'memory',
];

const LINE_CATEGORIES = [
    'self-esteem', 'domestic', 'stability',
    'purpose', 'family', 'habits',
    'spirituality', 'temperament',
];

// How the 3x3 grid lines map: rows, cols, diags
const LINE_INDICES: number[][] = [
    [0, 1, 2], // Row 1 → self-esteem
    [3, 4, 5], // Row 2 → domestic
    [6, 7, 8], // Row 3 → stability
    [0, 3, 6], // Col 1 → purpose
    [1, 4, 7], // Col 2 → family
    [2, 5, 8], // Col 3 → habits
    [0, 4, 8], // Diag 1 → spirituality
    [2, 4, 6], // Diag 2 → temperament
];

interface GridCell {
    position: number;
    characteristic: string;
    count: number;
    displayValue: string;
    description: string;
}

interface LineReading {
    category: string;
    value: number;
    description: string;
}

export default function PsychomatrixScreen() {
    const { language, dateOfBirth, firstName, lastName, fatherName, partnerDateOfBirth, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [gridCells, setGridCells] = useState<GridCell[]>([]);
    const [lineReadings, setLineReadings] = useState<LineReading[]>([]);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['grid']));

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
            const dob = dateOfBirth || '01/01/1990';
            const square = NumbersCalculator.calcPythagorosSquare(context, dob);
            // square = [value_for_1, value_for_2, ..., value_for_9]
            // The count is the number of digits: e.g. 111 → 3 ones, 0 → no digit

            const cells: GridCell[] = [];
            for (let i = 0; i < 9; i++) {
                const rawVal = square[i]; // could be 0, single digit, or concatenated like 111
                const countStr = rawVal === 0 ? '' : String(rawVal);
                const count = countStr.length;
                const desc = await dbService.getPsychomatrix(locale, CHARACTERISTICS[i], count);
                cells.push({
                    position: i + 1,
                    characteristic: CHARACTERISTICS[i],
                    count,
                    displayValue: countStr || '—',
                    description: desc,
                });
            }
            setGridCells(cells);

            // Lines
            const lines: LineReading[] = [];
            for (let l = 0; l < LINE_CATEGORIES.length; l++) {
                const indices = LINE_INDICES[l];
                // Line value = sum of counts of each cell in the line
                let lineValue = 0;
                for (const idx of indices) {
                    lineValue += cells[idx].count;
                }
                const desc = await dbService.getPsychomatrixLine(locale, LINE_CATEGORIES[l], lineValue);
                lines.push({
                    category: LINE_CATEGORIES[l],
                    value: lineValue,
                    description: desc,
                });
            }
            setLineReadings(lines);
        } catch (e) {
            console.error('PsychomatrixScreen loadData error:', e);
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
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} bounces={false}>
                <LinearGradient colors={colors.backgroundGradient} style={styles.fullBackground}>
                    <View style={[styles.content, { paddingTop: insets.top }]}>
                        {/* Header */}
                        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={28} color={colors.textTitle} />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: colors.textTitle }]}>
                                {t('menu.psychomatrix')}
                            </Text>
                            <View style={{ width: 28 }} />
                        </Animated.View>

                        {/* 3×3 Grid */}
                        <Animated.View entering={FadeInUp.duration(500).delay(100)}>
                            <View style={[styles.gridCard, {
                                backgroundColor: colors.cardBackground,
                                borderColor: colors.cardBorder,
                                shadowColor: colors.categoryCardShadow,
                            }, theme === 'light' && Shadow.light]}>
                                <Text style={[styles.gridTitle, { color: colors.textTitle }]}>
                                    {t('category.pythagorean_square')}
                                </Text>
                                <View style={styles.gridContainer}>
                                    {[0, 1, 2].map(row => (
                                        <View key={`row_${row}`} style={styles.gridRow}>
                                            {[0, 1, 2].map(col => {
                                                const idx = row * 3 + col;
                                                const cell = gridCells[idx];
                                                return (
                                                    <TouchableOpacity
                                                        key={`cell_${idx}`}
                                                        style={[styles.gridCell, {
                                                            backgroundColor: colors.primary + '10',
                                                            borderColor: colors.primary + '30',
                                                        }]}
                                                        activeOpacity={0.7}
                                                        onPress={() => toggleSection(`cell_${idx}`)}
                                                    >
                                                        <Text style={[styles.cellValue, { color: colors.primary }]}>
                                                            {cell.displayValue}
                                                        </Text>
                                                        <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>
                                                            {cell.characteristic}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </Animated.View>

                        {/* Cell Descriptions */}
                        {gridCells.map((cell, idx) => {
                            const sectionKey = `cell_${idx}`;
                            if (!expandedSections.has(sectionKey)) return null;
                            return (
                                <Animated.View key={sectionKey} entering={FadeInUp.duration(300)}>
                                    <View style={[styles.card, {
                                        backgroundColor: colors.cardBackground,
                                        borderColor: colors.cardBorder,
                                        shadowColor: colors.categoryCardShadow,
                                    }, theme === 'light' && Shadow.light]}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardTitleRow}>
                                                <Text style={[styles.cardTitle, { color: colors.textTitle }]}>
                                                    {cell.characteristic.replace(/\b\w/g, c => c.toUpperCase())}
                                                </Text>
                                                <View style={[styles.smallBadge, { backgroundColor: colors.primary + '20' }]}>
                                                    <Text style={[styles.smallBadgeText, { color: colors.primary }]}>
                                                        {cell.displayValue}
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => toggleSection(sectionKey)}>
                                                <Ionicons name="close" size={20} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                        {cell.description ? (
                                            <Text style={[styles.fieldText, { color: colors.textPrimary, marginTop: Spacing.m }]}>
                                                {cell.description}
                                            </Text>
                                        ) : (
                                            <Text style={[styles.fieldText, { color: colors.textSecondary, marginTop: Spacing.m, fontStyle: 'italic' }]}>
                                                {t('category.no_data')}
                                            </Text>
                                        )}
                                    </View>
                                </Animated.View>
                            );
                        })}

                        {/* Lines Section */}
                        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
                            <TouchableOpacity
                                style={[styles.card, {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.categoryCardShadow,
                                }, theme === 'light' && Shadow.light]}
                                activeOpacity={0.8}
                                onPress={() => toggleSection('lines')}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.textTitle }]}>
                                        {t('category.matrix_lines')}
                                    </Text>
                                    <Ionicons
                                        name={expandedSections.has('lines') ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </View>
                                {expandedSections.has('lines') && (
                                    <View style={styles.cardContent}>
                                        {lineReadings.map(line => (
                                            <View key={line.category} style={styles.fieldBlock}>
                                                <View style={styles.cardTitleRow}>
                                                    <Text style={[styles.fieldLabel, { color: colors.primary }]}>
                                                        {line.category.replace(/\b\w/g, c => c.toUpperCase())}
                                                    </Text>
                                                    <View style={[styles.smallBadge, { backgroundColor: colors.primary + '20' }]}>
                                                        <Text style={[styles.smallBadgeText, { color: colors.primary }]}>
                                                            {line.value}
                                                        </Text>
                                                    </View>
                                                </View>
                                                {line.description ? (
                                                    <Text style={[styles.fieldText, { color: colors.textPrimary }]}>
                                                        {line.description}
                                                    </Text>
                                                ) : (
                                                    <Text style={[styles.fieldText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                                                        {t('category.no_data')}
                                                    </Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={{ height: Spacing.huge * 2 }} />
                    </View>
                </LinearGradient>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.l,
        marginBottom: Spacing.xl,
    },
    backButton: { padding: Spacing.xs },
    headerTitle: { ...Typography.sectionTitle, textAlign: 'center', flex: 1 },
    gridCard: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.l,
        borderRadius: BorderRadius.l,
        padding: Spacing.xl,
        borderWidth: 1,
    },
    gridTitle: { ...Typography.chartTitle, marginBottom: Spacing.l, textAlign: 'center' },
    gridContainer: { gap: Spacing.s },
    gridRow: { flexDirection: 'row', gap: Spacing.s, justifyContent: 'center' },
    gridCell: {
        flex: 1,
        aspectRatio: 1,
        maxWidth: 100,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.s,
    },
    cellValue: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
    cellLabel: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
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
