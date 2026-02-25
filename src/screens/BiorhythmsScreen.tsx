import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
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
import { NumbersCalculator } from '../utils/NumbersCalculator';
import { dbService } from '../services/DatabaseService';

// ─── Colors matching the reference ─────────────────────────────
const CHART_COLORS = {
    physical: '#D55289',    // Pink
    emotional: '#63A4D6',   // Blue
    intellectual: '#FFD700', // Gold
};

// ─── Helpers ───────────────────────────────────────────────────
function getBioLevel(rawValue: number): string {
    if (Math.abs(rawValue) < 5) return 'critical';
    return rawValue > 0 ? 'positive' : 'negative';
}

// ─── Wave Chart ────────────────────────────────────────────────
function WaveChart({ daysAlive, selectedOffset, onSelectOffset }: {
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
    const DAYS_RANGE = 15; // -7 to +7 from today
    const TODAY_IDX = 7;

    const generatePath = (cycle: number): string => {
        const points: string[] = [];
        for (let i = 0; i <= DAYS_RANGE; i++) {
            const d = daysAlive - TODAY_IDX + i;
            const val = Math.sin(2 * Math.PI * d / cycle) * 100;
            const x = (i / DAYS_RANGE) * CHART_W;
            const y = CHART_H / 2 - (val / 100) * (CHART_H / 2 - 10);
            points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return points.join(' ');
    };

    const physPath = generatePath(23);
    const emoPath = generatePath(28);
    const intPath = generatePath(33);

    // Selected day position
    const selectedIdx = TODAY_IDX + selectedOffset;
    const selX = (selectedIdx / DAYS_RANGE) * CHART_W;
    const selDays = daysAlive + selectedOffset;
    const selPhysVal = Math.sin(2 * Math.PI * selDays / 23) * 100;
    const selEmoVal = Math.sin(2 * Math.PI * selDays / 28) * 100;
    const selIntVal = Math.sin(2 * Math.PI * selDays / 33) * 100;
    const selPhysY = CHART_H / 2 - (selPhysVal / 100) * (CHART_H / 2 - 10);
    const selEmoY = CHART_H / 2 - (selEmoVal / 100) * (CHART_H / 2 - 10);
    const selIntY = CHART_H / 2 - (selIntVal / 100) * (CHART_H / 2 - 10);

    const gridLines = [0, 1, 2, 3].map(i => CHART_H * i / 3);

    const xToOffset = useCallback((pageX: number) => {
        const w = chartWidthRef.current;
        if (w <= 0) return 0;
        const ratio = Math.max(0, Math.min(1, pageX / w));
        const dayIdx = Math.round(ratio * DAYS_RANGE);
        return dayIdx - TODAY_IDX;
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const offset = xToOffset(evt.nativeEvent.locationX);
                onSelectOffset(offset);
            },
            onPanResponderMove: (evt) => {
                const offset = xToOffset(evt.nativeEvent.locationX);
                onSelectOffset(offset);
            },
        })
    ).current;

    const onLayout = (e: LayoutChangeEvent) => {
        chartWidthRef.current = e.nativeEvent.layout.width;
    };

    // Badge text
    const badgeText = useMemo(() => {
        if (selectedOffset === 0) return 'TODAY';
        const d = new Date();
        d.setDate(d.getDate() + selectedOffset);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }, [selectedOffset]);

    return (
        <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={[
                styles.chartCard,
                { backgroundColor: colors.chartBackground, borderColor: colors.cardBorder },
                !isDark && Shadow.light,
            ]}
        >
            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.physical }]} />
                    <Text style={[styles.legendText, { color: isDark ? '#f9a8d4' : '#D55289' }]}>PHY</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.emotional }]} />
                    <Text style={[styles.legendText, { color: isDark ? '#93c5fd' : '#63A4D6' }]}>EMO</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.intellectual }]} />
                    <Text style={[styles.legendText, { color: '#FFD700' }]}>INT</Text>
                </View>
            </View>

            {/* SVG Chart */}
            <View style={styles.chartContainer} onLayout={onLayout} {...panResponder.panHandlers}>
                <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
                    {/* Grid lines */}
                    {gridLines.map((y, i) => (
                        <Line
                            key={`grid-${i}`}
                            x1={0} y1={y} x2={CHART_W} y2={y}
                            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                            strokeWidth={1}
                        />
                    ))}
                    {/* Center line */}
                    <Line
                        x1={0} y1={CHART_H / 2} x2={CHART_W} y2={CHART_H / 2}
                        stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={1}
                        strokeDasharray="4,4"
                    />

                    {/* Wave fills (subtle) */}
                    <Defs>
                        <SvgGradient id="physFill" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={CHART_COLORS.physical} stopOpacity="0.15" />
                            <Stop offset="1" stopColor={CHART_COLORS.physical} stopOpacity="0" />
                        </SvgGradient>
                        <SvgGradient id="emoFill" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={CHART_COLORS.emotional} stopOpacity="0.15" />
                            <Stop offset="1" stopColor={CHART_COLORS.emotional} stopOpacity="0" />
                        </SvgGradient>
                    </Defs>

                    {/* Physical wave */}
                    <Path
                        d={physPath}
                        fill="none"
                        stroke={CHART_COLORS.physical}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                        opacity={0.7}
                    />
                    {/* Emotional wave */}
                    <Path
                        d={emoPath}
                        fill="none"
                        stroke={CHART_COLORS.emotional}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                        opacity={0.7}
                    />
                    {/* Intellectual wave */}
                    <Path
                        d={intPath}
                        fill="none"
                        stroke={CHART_COLORS.intellectual}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                    />

                    {/* Selected day vertical line */}
                    <Line
                        x1={selX} y1={0} x2={selX} y2={CHART_H}
                        stroke="rgba(255, 215, 0, 0.3)"
                        strokeWidth={1}
                        strokeDasharray="3,3"
                    />

                    {/* Selected day dots */}
                    <Circle cx={selX} cy={selPhysY} r={3} fill={CHART_COLORS.physical} />
                    <Circle cx={selX} cy={selEmoY} r={3} fill={CHART_COLORS.emotional} />
                    <Circle cx={selX} cy={selIntY} r={4.5} fill={isDark ? '#1a1a2e' : '#fff'} stroke={CHART_COLORS.intellectual} strokeWidth={2} />
                </Svg>
            </View>

            {/* Badge */}
            <View style={styles.todayBadgeRow}>
                <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>{badgeText}</Text>
                </View>
            </View>
        </Animated.View>
    );
}

// ─── Circular Gauge ────────────────────────────────────────────
function StatusGauge({ percentage, color, label }: { percentage: number; color: string; label: string }) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const absPerc = Math.abs(percentage);
    const offset = circumference - (circumference * absPerc) / 100;

    return (
        <View style={styles.gaugeContainer}>
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <Circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                        opacity={0.7}
                    />
                </Svg>
                <View style={[StyleSheet.absoluteFill, styles.gaugeValueWrap]}>
                    <Text style={[styles.gaugeValue, { color: colors.textTitle }]}>
                        {percentage.toFixed(1)}%
                    </Text>
                </View>
            </View>
            <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>{label}</Text>
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
        <View style={[
            styles.meaningCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder },
        ]}>
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
export default function BiorhythmsScreen() {
    const { dateOfBirth, language, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    // Selected day offset from today (-7 to +7)
    const [selectedDayOffset, setSelectedDayOffset] = useState(0);

    const { daysAlive, physical, emotional, intellectual } = useMemo(() => {
        const parts = (dateOfBirth || '01/01/1990').split('/');
        const d = parseInt(parts[0], 10) || 1;
        const m = parseInt(parts[1], 10) || 1;
        const y = parseInt(parts[2], 10) || 1990;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(y, m - 1, d);
        const alive = Math.floor(Math.abs(today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate for the selected day
        const selectedDays = alive + selectedDayOffset;
        const phys = Math.sin(2 * Math.PI * selectedDays / 23) * 100;
        const emo = Math.sin(2 * Math.PI * selectedDays / 28) * 100;
        const intell = Math.sin(2 * Math.PI * selectedDays / 33) * 100;

        return {
            daysAlive: alive,
            physical: phys,
            emotional: emo,
            intellectual: intell,
        };
    }, [dateOfBirth, selectedDayOffset]);

    // Fetch descriptions from DB
    const [descriptions, setDescriptions] = useState({
        physical: '',
        emotional: '',
        intellectual: '',
    });
    const [bioInfo, setBioInfo] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const physLevel = getBioLevel(physical);
                const emoLevel = getBioLevel(emotional);
                const intLevel = getBioLevel(intellectual);

                const [physDesc, emoDesc, intDesc] = await Promise.all([
                    dbService.getBiorhythm(language, 'physical', physLevel),
                    dbService.getBiorhythm(language, 'emotional', emoLevel),
                    dbService.getBiorhythm(language, 'intellectual', intLevel),
                ]);

                setDescriptions({
                    physical: physDesc || 'Your physical energy cycle reflects your body\'s strength and vitality.',
                    emotional: emoDesc || 'Your emotional cycle affects mood, creativity, and sensitivity.',
                    intellectual: intDesc || 'Your intellectual cycle influences memory, alertness, and analytical thinking.',
                });
            } catch (e) {
                setDescriptions({
                    physical: 'Your physical energy cycle reflects your body\'s strength and vitality.',
                    emotional: 'Your emotional cycle affects mood, creativity, and sensitivity.',
                    intellectual: 'Your intellectual cycle influences memory, alertness, and analytical thinking.',
                });
            }
        })();
    }, [physical, emotional, intellectual, language]);

    // Fetch general biorhythm info
    useEffect(() => {
        (async () => {
            try {
                const desc = await dbService.getTableDescription('biorhythms', language);
                setBioInfo(desc);
            } catch (e) {
                // keep empty
            }
        })();
    }, [language]);

    const formattedDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + selectedDayOffset);
        const langMap: Record<string, string> = {
            en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
        };
        return d.toLocaleDateString(langMap[language] || 'en-US', {
            month: 'short',
            day: 'numeric',
        });
    }, [language, selectedDayOffset]);

    const isToday = selectedDayOffset === 0;
    const statusLabel = isToday ? "TODAY'S STATUS" : 'STATUS';

    const physTitle = physical >= 70 ? 'Physical Peak' : physical >= 30 ? 'Physical Moderate' : 'Physical Low';
    const emoTitle = emotional >= 70 ? 'Emotional Peak' : emotional >= 30 ? 'Emotional Balance' : 'Emotional Low';
    const intTitle = intellectual >= 70 ? 'Intellectual High' : intellectual >= 30 ? 'Intellectual Moderate' : 'Intellectual Low';

    return (
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
                        <Text style={[styles.title, { color: colors.textTitle }]}>{t('biorhythms.title')}</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Daily energy forecast</Text>
                    </Animated.View>

                    {/* Wave Chart */}
                    <View style={styles.sectionPad}>
                        <WaveChart
                            daysAlive={daysAlive}
                            selectedOffset={selectedDayOffset}
                            onSelectOffset={setSelectedDayOffset}
                        />
                    </View>

                    {/* Today's Status */}
                    <Animated.View
                        entering={FadeInDown.duration(500).delay(200)}
                        style={[
                            styles.statusCard,
                            { backgroundColor: colors.chartBackground, borderColor: colors.cardBorder },
                            !isDark && Shadow.light,
                        ]}
                    >
                        <View style={styles.statusHeader}>
                            <Text style={[styles.statusTitle, { color: colors.textSecondary }]}>{statusLabel}</Text>
                            <Text style={[styles.statusDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                        </View>
                        <View style={styles.gaugesRow}>
                            <StatusGauge percentage={physical} color={CHART_COLORS.physical} label={t('biorhythms.physical')} />
                            <StatusGauge percentage={emotional} color={CHART_COLORS.emotional} label={t('biorhythms.emotional')} />
                            <StatusGauge percentage={intellectual} color={CHART_COLORS.intellectual} label={t('biorhythms.intellectual')} />
                        </View>
                    </Animated.View>

                    {/* Cycles Meaning */}
                    <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.meaningSection}>
                        <Text style={[styles.meaningSectionTitle, { color: colors.textTitle }]}>Cycles Meaning</Text>
                        <MeaningCard
                            icon="fitness"
                            iconColor={CHART_COLORS.physical}
                            iconBg={isDark ? 'rgba(213, 82, 137, 0.2)' : '#fce7f3'}
                            title={physTitle}
                            description={descriptions.physical}
                        />
                        <MeaningCard
                            icon="heart"
                            iconColor={CHART_COLORS.emotional}
                            iconBg={isDark ? 'rgba(99, 164, 214, 0.2)' : '#dbeafe'}
                            title={emoTitle}
                            description={descriptions.emotional}
                        />
                        <MeaningCard
                            icon="bulb"
                            iconColor="#e6a800"
                            iconBg={isDark ? 'rgba(255, 215, 0, 0.2)' : '#fef9c3'}
                            title={intTitle}
                            description={descriptions.intellectual}
                        />
                    </Animated.View>

                    {/* About Biorhythms */}
                    {bioInfo ? (
                        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.infoSection}>
                            <View style={[
                                styles.meaningCard,
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder },
                            ]}>
                                <View style={[styles.meaningIcon, { backgroundColor: isDark ? 'rgba(99, 164, 214, 0.2)' : '#e0f2fe' }]}>
                                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.meaningContent}>
                                    <Text style={[styles.meaningTitle, { color: colors.textTitle }]}>About Biorhythms</Text>
                                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>{bioInfo}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    ) : null}

                    <View style={{ height: insets.bottom + 40 }} />
                </View>
            </LinearGradient>
        </ScrollView>
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

    // ─── Chart Card ────
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

    // ─── Status Card ───
    statusCard: {
        marginHorizontal: Spacing.l,
        marginTop: Spacing.l,
        borderRadius: BorderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
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
    gaugesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    gaugeContainer: {
        alignItems: 'center',
    },
    gaugeValueWrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    gaugeValue: {
        fontSize: 13,
        fontFamily: 'Manrope-Bold',
    },
    gaugeLabel: {
        fontSize: 13,
        fontFamily: 'Manrope-Medium',
        marginTop: Spacing.s,
    },

    // ─── Meaning Section ───
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

    // ─── Info Section ───
    infoSection: {
        paddingHorizontal: Spacing.l,
        marginTop: Spacing.xl,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.m,
    },
    infoTitle: {
        fontSize: 16,
        fontFamily: 'NotoSerif-Bold',
    },
    infoText: {
        fontSize: 13,
        fontFamily: 'Manrope-Regular',
        lineHeight: 21,
    },
});
