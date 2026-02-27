import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Typography } from '../theme/Typography';
import { Shadow } from '../theme/SharedStyles';
import { useTranslation } from '../i18n';
import { dbService } from '../services/DatabaseService';
import BannerAdWrapper from '../components/ads/BannerAdWrapper';

// ─── Constants ─────────────────────────────────────────────────
const CYCLES = {
    spiritual: { period: 53, icon: 'sparkles' as const, color: '#9d4edd', dbType: 'spiritual' },
    awareness: { period: 48, icon: 'eye' as const, color: '#06b6d4', dbType: 'self-awareness' },
    aesthetic: { period: 43, icon: 'color-palette' as const, color: '#f472b6', dbType: 'aesthetic' },
    intuition: { period: 38, icon: 'flash' as const, color: '#f59e0b', dbType: 'intuitive' },
};

type CycleKey = keyof typeof CYCLES;
const CYCLE_KEYS: CycleKey[] = ['spiritual', 'awareness', 'aesthetic', 'intuition'];

function calcBio(days: number, period: number): number {
    const v = Math.sin(2 * Math.PI * days / period) * 100;
    return (v > -0.1 && v < 0) ? 0 : v;
}

// ─── Wave Chart ────────────────────────────────────────────────
function SecondaryWaveChart({ daysAlive, selectedOffset, onSelectOffset }: {
    daysAlive: number;
    selectedOffset: number;
    onSelectOffset: (offset: number) => void;
}) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const chartWidthRef = useRef(0);

    const CHART_W = 320;
    const CHART_H = 160;
    const DAYS_RANGE = 15;
    const TODAY_IDX = 7;

    const generatePath = (period: number): string => {
        const pts: string[] = [];
        for (let i = 0; i <= DAYS_RANGE; i++) {
            const d = daysAlive - TODAY_IDX + i;
            const val = calcBio(d, period);
            const x = (i / DAYS_RANGE) * CHART_W;
            const y = CHART_H / 2 - (val / 100) * (CHART_H / 2 - 10);
            pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return pts.join(' ');
    };

    const paths = CYCLE_KEYS.map(k => ({ key: k, path: generatePath(CYCLES[k].period), color: CYCLES[k].color }));

    const selectedIdx = TODAY_IDX + selectedOffset;
    const selX = (selectedIdx / DAYS_RANGE) * CHART_W;
    const selDays = daysAlive + selectedOffset;

    const selDots = CYCLE_KEYS.map(k => {
        const val = calcBio(selDays, CYCLES[k].period);
        const y = CHART_H / 2 - (val / 100) * (CHART_H / 2 - 10);
        return { key: k, y, color: CYCLES[k].color };
    });

    const gridLines = [0, 1, 2, 3].map(i => CHART_H * i / 3);

    const xToOffset = useCallback((pageX: number) => {
        const w = chartWidthRef.current;
        if (w <= 0) return 0;
        const ratio = Math.max(0, Math.min(1, pageX / w));
        return Math.round(ratio * DAYS_RANGE) - TODAY_IDX;
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => onSelectOffset(xToOffset(evt.nativeEvent.locationX)),
            onPanResponderMove: (evt) => onSelectOffset(xToOffset(evt.nativeEvent.locationX)),
        })
    ).current;

    const onLayout = (e: LayoutChangeEvent) => { chartWidthRef.current = e.nativeEvent.layout.width; };

    const badgeText = useMemo(() => {
        if (selectedOffset === 0) return 'TODAY';
        const d = new Date();
        d.setDate(d.getDate() + selectedOffset);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }, [selectedOffset]);

    const { t } = useTranslation();

    return (
        <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={[styles.chartCard, { backgroundColor: colors.chartBackground, borderColor: colors.cardBorder }, !isDark && Shadow.light]}
        >
            {/* Legend */}
            <View style={styles.legend}>
                {CYCLE_KEYS.map(k => (
                    <View key={k} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: CYCLES[k].color }]} />
                        <Text style={[styles.legendText, { color: isDark ? CYCLES[k].color : CYCLES[k].color }]}>
                            {t(`biorhythms.${k}` as any)?.toUpperCase().slice(0, 3) || k.slice(0, 3).toUpperCase()}
                        </Text>
                    </View>
                ))}
            </View>

            {/* SVG Chart */}
            <View style={styles.chartContainer} onLayout={onLayout} {...panResponder.panHandlers}>
                <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
                    {gridLines.map((y, i) => (
                        <Line key={`g-${i}`} x1={0} y1={y} x2={CHART_W} y2={y}
                            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={1} />
                    ))}
                    <Line x1={0} y1={CHART_H / 2} x2={CHART_W} y2={CHART_H / 2}
                        stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} strokeDasharray="4,4" />
                    {paths.map(p => (
                        <Path key={p.key} d={p.path} fill="none" stroke={p.color} strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />
                    ))}
                    <Line x1={selX} y1={0} x2={selX} y2={CHART_H}
                        stroke="rgba(255,215,0,0.3)" strokeWidth={1} strokeDasharray="3,3" />
                    {selDots.map(d => (
                        <Circle key={d.key} cx={selX} cy={d.y} r={3.5} fill={d.color} />
                    ))}
                </Svg>
            </View>

            <View style={styles.todayBadgeRow}>
                <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>{badgeText}</Text>
                </View>
            </View>
        </Animated.View>
    );
}

// ─── Center Bar (bidirectional progress) ───────────────────────
function CenterBar({ value, trendValue, color, icon, label }: {
    value: number; trendValue: number; color: string; icon: string; label: string;
}) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const isPositive = value >= 0;
    const barWidth = Math.abs(value) / 2; // max 50% of bar width
    const trendUp = trendValue > value;
    const trendDown = trendValue < value;

    return (
        <View style={[styles.barRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
            <View style={[styles.barIcon, { backgroundColor: isDark ? `${color}22` : `${color}15` }]}>
                <Ionicons name={icon as any} size={18} color={color} />
            </View>
            <View style={styles.barContent}>
                <View style={styles.barLabelRow}>
                    <Text style={[styles.barLabel, { color: colors.textTitle }]}>{label}</Text>
                    <View style={styles.barValueRow}>
                        <Text style={[styles.barValue, { color }]}>{value > 0 ? '+' : ''}{value.toFixed(0)}%</Text>
                        {trendUp && <Ionicons name="arrow-up" size={12} color="#10b981" style={{ marginLeft: 2 }} />}
                        {trendDown && <Ionicons name="arrow-down" size={12} color="#ef4444" style={{ marginLeft: 2 }} />}
                    </View>
                </View>
                <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]}>
                    {/* Center marker */}
                    <View style={[styles.barCenter, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
                    {/* Fill */}
                    <View style={[
                        styles.barFill,
                        {
                            backgroundColor: isPositive ? color : '#ef4444',
                            width: `${barWidth}%`,
                            left: isPositive ? '50%' : undefined,
                            right: !isPositive ? '50%' : undefined,
                        },
                    ]} />
                </View>
            </View>
        </View>
    );
}

// ─── Meaning Card ──────────────────────────────────────────────
function MeaningCard({ icon, iconColor, iconBg, title, description }: {
    icon: string; iconColor: string; iconBg: string; title: string; description: string;
}) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <View style={[styles.meaningCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
            <View style={[styles.meaningIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <View style={styles.meaningContent}>
                <Text style={[styles.meaningTitle, { color: colors.textTitle }]}>{title}</Text>
                <Text style={[styles.meaningDesc, { color: colors.textSecondary }]}>{description}</Text>
            </View>
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function SecondaryBiorhythmsScreen() {
    const { dateOfBirth, language, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [selectedDayOffset, setSelectedDayOffset] = useState(0);

    const { daysAlive, values, tomorrowValues } = useMemo(() => {
        const parts = (dateOfBirth || '01/01/1990').split('/');
        const d = parseInt(parts[0], 10) || 1;
        const m = parseInt(parts[1], 10) || 1;
        const y = parseInt(parts[2], 10) || 1990;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(y, m - 1, d);
        const alive = Math.floor(Math.abs(today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        const selectedDays = alive + selectedDayOffset;
        const tomorrowDays = selectedDays + 1;

        const vals: Record<CycleKey, number> = {} as any;
        const tmrw: Record<CycleKey, number> = {} as any;
        for (const k of CYCLE_KEYS) {
            vals[k] = calcBio(selectedDays, CYCLES[k].period);
            tmrw[k] = calcBio(tomorrowDays, CYCLES[k].period);
        }
        return { daysAlive: alive, values: vals, tomorrowValues: tmrw };
    }, [dateOfBirth, selectedDayOffset]);

    // Fetch descriptions from DB
    const [descriptions, setDescriptions] = useState<Record<CycleKey, string>>({
        spiritual: '', awareness: '', aesthetic: '', intuition: '',
    });

    useEffect(() => {
        (async () => {
            try {
                const results: Record<CycleKey, string> = {} as any;
                for (const k of CYCLE_KEYS) {
                    const level = values[k] >= 0 ? 'high' : 'low';
                    results[k] = await dbService.getSecondaryBiorhythm(language, CYCLES[k].dbType, level);
                }
                setDescriptions(results);
            } catch (e) {
                // Keep empty descriptions
            }
        })();
    }, [values, language]);

    const formattedDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + selectedDayOffset);
        const langMap: Record<string, string> = {
            en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
        };
        return d.toLocaleDateString(langMap[language] || 'en-US', { month: 'short', day: 'numeric' });
    }, [language, selectedDayOffset]);

    const isToday = selectedDayOffset === 0;
    const statusLabel = isToday ? "TODAY'S STATUS" : 'STATUS';

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]} bounces={false}>
                <LinearGradient colors={colors.backgroundGradient} style={styles.fullBg}>
                    <View style={{ paddingTop: insets.top }}>
                        {/* Header */}
                        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                            <View style={styles.headerTopRow}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                    <Ionicons name="arrow-back" size={24} color={colors.textTitle} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.title, { color: colors.textTitle }]}>{t('biorhythms.secondary_title') || 'Secondary Biorhythms'}</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('biorhythms.secondary_subtitle') || 'Subtle energy cycles'}
                            </Text>
                        </Animated.View>

                        {/* Wave Chart */}
                        <View style={styles.sectionPad}>
                            <SecondaryWaveChart
                                daysAlive={daysAlive}
                                selectedOffset={selectedDayOffset}
                                onSelectOffset={setSelectedDayOffset}
                            />
                        </View>

                        {/* Status Bars */}
                        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.barsSection}>
                            <View style={styles.statusHeader}>
                                <Text style={[styles.statusTitle, { color: colors.textSecondary }]}>{statusLabel}</Text>
                                <Text style={[styles.statusDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                            </View>
                            {CYCLE_KEYS.map((k, idx) => (
                                <Animated.View key={k} entering={FadeInDown.duration(400).delay(250 + idx * 60)}>
                                    <CenterBar
                                        value={values[k]}
                                        trendValue={tomorrowValues[k]}
                                        color={CYCLES[k].color}
                                        icon={CYCLES[k].icon}
                                        label={t(`biorhythms.${k}` as any) || k}
                                    />
                                </Animated.View>
                            ))}
                        </Animated.View>

                        {/* Cycle Descriptions */}
                        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.meaningSection}>
                            <Text style={[styles.meaningSectionTitle, { color: colors.textTitle }]}>
                                {t('biorhythms.cycles_meaning') || 'Cycles Meaning'}
                            </Text>
                            {CYCLE_KEYS.map(k => {
                                const val = values[k];
                                const levelLabel = val >= 0 ? 'High' : 'Low';
                                const titleStr = `${t(`biorhythms.${k}` as any) || k} — ${levelLabel}`;
                                return (
                                    <MeaningCard
                                        key={k}
                                        icon={CYCLES[k].icon}
                                        iconColor={CYCLES[k].color}
                                        iconBg={isDark ? `${CYCLES[k].color}33` : `${CYCLES[k].color}18`}
                                        title={titleStr}
                                        description={descriptions[k] || ''}
                                    />
                                );
                            })}
                        </Animated.View>

                        <View style={{ height: insets.bottom + 40 }} />
                    </View>
                </LinearGradient>
            </ScrollView>
            <BannerAdWrapper />
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    fullBg: { flex: 1, minHeight: '100%' },

    header: {
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.m,
        paddingBottom: Spacing.s,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    backBtn: {
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
    subtitle: {
        fontSize: 13,
        fontFamily: 'Manrope-Regular',
        marginTop: 2,
        textAlign: 'center',
    },

    sectionPad: {
        paddingHorizontal: Spacing.l,
        marginTop: Spacing.m,
    },

    // Chart Card
    chartCard: {
        borderRadius: BorderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
        overflow: 'hidden',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.m,
        marginBottom: Spacing.m,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendText: {
        fontSize: 9,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1.5,
    },
    chartContainer: {
        width: '100%',
        overflow: 'hidden',
    },
    todayBadgeRow: {
        alignItems: 'center',
        marginTop: Spacing.s,
    },
    todayBadge: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    todayBadgeText: {
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 2,
        color: '#d4a017',
    },

    // Status Bars
    barsSection: {
        paddingHorizontal: Spacing.l,
        marginTop: Spacing.l,
        gap: Spacing.s,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    statusTitle: {
        fontSize: 11,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1.5,
    },
    statusDate: {
        fontSize: 12,
        fontFamily: 'Manrope-Regular',
    },

    // Bar Row
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
        gap: Spacing.m,
    },
    barIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    barContent: {
        flex: 1,
    },
    barLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    barLabel: {
        fontSize: 14,
        fontFamily: 'Manrope-SemiBold',
    },
    barValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    barValue: {
        fontSize: 13,
        fontFamily: 'Manrope-Bold',
    },
    barTrack: {
        height: 8,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    barCenter: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1.5,
        marginLeft: -0.75,
        zIndex: 1,
    },
    barFill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderRadius: 4,
    },

    // Meaning Section
    meaningSection: {
        paddingHorizontal: Spacing.l,
        marginTop: Spacing.xl,
        gap: Spacing.m,
    },
    meaningSectionTitle: {
        fontSize: 18,
        fontFamily: 'NotoSerif-Bold',
        marginBottom: Spacing.xs,
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
    meaningContent: {
        flex: 1,
    },
    meaningTitle: {
        fontSize: 15,
        fontFamily: 'Manrope-SemiBold',
    },
    meaningDesc: {
        fontSize: 13,
        fontFamily: 'Manrope-Regular',
        lineHeight: 20,
        marginTop: 4,
    },
});
