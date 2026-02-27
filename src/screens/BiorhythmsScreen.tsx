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
import BannerAdWrapper from '../components/ads/BannerAdWrapper';

// ─── Chart colors are now sourced from Colors.ts (biorhythmChartLine1/2/3) ───

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
    const chartColors = {
        physical: colors.biorhythmChartLine1,
        emotional: colors.biorhythmChartLine2,
        intellectual: colors.biorhythmChartLine3,
    };
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
                    <View style={[styles.legendDot, { backgroundColor: chartColors.physical }]} />
                    <Text style={[styles.legendText, { color: chartColors.physical }]}>PHY</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: chartColors.emotional }]} />
                    <Text style={[styles.legendText, { color: chartColors.emotional }]}>EMO</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: chartColors.intellectual }]} />
                    <Text style={[styles.legendText, { color: chartColors.intellectual }]}>INT</Text>
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
                            <Stop offset="0" stopColor={chartColors.physical} stopOpacity="0.15" />
                            <Stop offset="1" stopColor={chartColors.physical} stopOpacity="0" />
                        </SvgGradient>
                        <SvgGradient id="emoFill" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={chartColors.emotional} stopOpacity="0.15" />
                            <Stop offset="1" stopColor={chartColors.emotional} stopOpacity="0" />
                        </SvgGradient>
                    </Defs>

                    {/* Physical wave */}
                    <Path
                        d={physPath}
                        fill="none"
                        stroke={chartColors.physical}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                        opacity={0.7}
                    />
                    {/* Emotional wave */}
                    <Path
                        d={emoPath}
                        fill="none"
                        stroke={chartColors.emotional}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                        opacity={0.7}
                    />
                    {/* Intellectual wave */}
                    <Path
                        d={intPath}
                        fill="none"
                        stroke={chartColors.intellectual}
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
                    <Circle cx={selX} cy={selPhysY} r={3} fill={chartColors.physical} />
                    <Circle cx={selX} cy={selEmoY} r={3} fill={chartColors.emotional} />
                    <Circle cx={selX} cy={selIntY} r={4.5} fill={isDark ? '#1a1a2e' : '#fff'} stroke={chartColors.intellectual} strokeWidth={2} />
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

// ─── Secondary constants ───────────────────────────────────────
const SECONDARY_COLORS = {
    spiritual: '#9d4edd',
    awareness: '#06b6d4',
    aesthetic: '#f472b6',
    intuition: '#f59e0b',
};
const SECONDARY_CYCLES = { spiritual: 53, awareness: 48, aesthetic: 43, intuition: 38 };
type SecKey = keyof typeof SECONDARY_CYCLES;
const SEC_KEYS: SecKey[] = ['spiritual', 'awareness', 'aesthetic', 'intuition'];
const SEC_ICONS: Record<SecKey, string> = { spiritual: 'sparkles', awareness: 'eye', aesthetic: 'color-palette', intuition: 'flash' };

function calcBio(days: number, period: number): number {
    const v = Math.sin(2 * Math.PI * days / period) * 100;
    return (v > -0.1 && v < 0) ? 0 : v;
}

// ─── Secondary Wave Chart ──────────────────────────────────────
function SecondaryWaveChart({ daysAlive, selectedOffset, onSelectOffset }: {
    daysAlive: number; selectedOffset: number; onSelectOffset: (offset: number) => void;
}) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const chartWidthRef = useRef(0);
    const { t } = useTranslation();
    const CHART_W = 320, CHART_H = 160, DAYS_RANGE = 15, TODAY_IDX = 7;

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

    const paths = SEC_KEYS.map(k => ({ key: k, path: generatePath(SECONDARY_CYCLES[k]), color: SECONDARY_COLORS[k] }));
    const selectedIdx = TODAY_IDX + selectedOffset;
    const selX = (selectedIdx / DAYS_RANGE) * CHART_W;
    const selDays = daysAlive + selectedOffset;
    const selDots = SEC_KEYS.map(k => {
        const val = calcBio(selDays, SECONDARY_CYCLES[k]);
        const y = CHART_H / 2 - (val / 100) * (CHART_H / 2 - 10);
        return { key: k, y, color: SECONDARY_COLORS[k] };
    });
    const gridLines = [0, 1, 2, 3].map(i => CHART_H * i / 3);

    const xToOffset = useCallback((pageX: number) => {
        const w = chartWidthRef.current;
        if (w <= 0) return 0;
        return Math.round(Math.max(0, Math.min(1, pageX / w)) * DAYS_RANGE) - TODAY_IDX;
    }, []);

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => onSelectOffset(xToOffset(evt.nativeEvent.locationX)),
        onPanResponderMove: (evt) => onSelectOffset(xToOffset(evt.nativeEvent.locationX)),
    })).current;

    const onLayout = (e: LayoutChangeEvent) => { chartWidthRef.current = e.nativeEvent.layout.width; };
    const badgeText = useMemo(() => {
        if (selectedOffset === 0) return 'TODAY';
        const d = new Date(); d.setDate(d.getDate() + selectedOffset);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }, [selectedOffset]);

    return (
        <Animated.View entering={FadeInDown.duration(500).delay(100)}
            style={[styles.chartCard, { backgroundColor: colors.chartBackground, borderColor: colors.cardBorder }, !isDark && Shadow.light]}>
            <View style={styles.legend}>
                {SEC_KEYS.map(k => (
                    <View key={k} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: SECONDARY_COLORS[k] }]} />
                        <Text style={[styles.legendText, { color: SECONDARY_COLORS[k] }]}>
                            {(t(`biorhythms.${k}` as any) || k).toUpperCase().slice(0, 3)}
                        </Text>
                    </View>
                ))}
            </View>
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
                <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>{badgeText}</Text></View>
            </View>
        </Animated.View>
    );
}

// ─── Center Bar (for secondary) ────────────────────────────────
function CenterBar({ value, trendValue, color, icon, label }: {
    value: number; trendValue: number; color: string; icon: string; label: string;
}) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const isPositive = value >= 0;
    const barWidth = Math.abs(value) / 2;
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
                    <View style={[styles.barCenter, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
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

// ─── Main Screen ───────────────────────────────────────────────
export default function BiorhythmsScreen() {
    const { dateOfBirth, language, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const chartColors = {
        physical: colors.biorhythmChartLine1,
        emotional: colors.biorhythmChartLine2,
        intellectual: colors.biorhythmChartLine3,
    };
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [selectedDayOffset, setSelectedDayOffset] = useState(0);
    const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');

    const { daysAlive, physical, emotional, intellectual } = useMemo(() => {
        const parts = (dateOfBirth || '01/01/1990').split('/');
        const d = parseInt(parts[0], 10) || 1;
        const m = parseInt(parts[1], 10) || 1;
        const y = parseInt(parts[2], 10) || 1990;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(y, m - 1, d);
        const alive = Math.floor(Math.abs(today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        const selectedDays = alive + selectedDayOffset;
        return {
            daysAlive: alive,
            physical: Math.sin(2 * Math.PI * selectedDays / 23) * 100,
            emotional: Math.sin(2 * Math.PI * selectedDays / 28) * 100,
            intellectual: Math.sin(2 * Math.PI * selectedDays / 33) * 100,
        };
    }, [dateOfBirth, selectedDayOffset]);

    const { secValues, secTomorrow } = useMemo(() => {
        const days = daysAlive + selectedDayOffset;
        const tmrw = days + 1;
        const vals: Record<SecKey, number> = {} as any;
        const tmrwVals: Record<SecKey, number> = {} as any;
        for (const k of SEC_KEYS) {
            vals[k] = calcBio(days, SECONDARY_CYCLES[k]);
            tmrwVals[k] = calcBio(tmrw, SECONDARY_CYCLES[k]);
        }
        return { secValues: vals, secTomorrow: tmrwVals };
    }, [daysAlive, selectedDayOffset]);

    const [descriptions, setDescriptions] = useState({ physical: '', emotional: '', intellectual: '' });
    const [bioInfo, setBioInfo] = useState('');
    const [secDescriptions, setSecDescriptions] = useState<Record<SecKey, string>>({
        spiritual: '', awareness: '', aesthetic: '', intuition: '',
    });

    useEffect(() => {
        (async () => {
            try {
                const [physDesc, emoDesc, intDesc] = await Promise.all([
                    dbService.getBiorhythm(language, 'physical', getBioLevel(physical)),
                    dbService.getBiorhythm(language, 'emotional', getBioLevel(emotional)),
                    dbService.getBiorhythm(language, 'intellectual', getBioLevel(intellectual)),
                ]);
                setDescriptions({
                    physical: physDesc || '', emotional: emoDesc || '', intellectual: intDesc || '',
                });
            } catch (e) { /* keep empty */ }
        })();
    }, [physical, emotional, intellectual, language]);

    useEffect(() => {
        if (activeTab !== 'secondary') return;
        (async () => {
            try {
                const results: Record<SecKey, string> = {} as any;
                const dbTypeMap: Record<SecKey, string> = {
                    spiritual: 'spiritual', awareness: 'self-awareness',
                    aesthetic: 'aesthetic', intuition: 'intuitive',
                };
                for (const k of SEC_KEYS) {
                    results[k] = await dbService.getSecondaryBiorhythm(language, dbTypeMap[k], secValues[k] >= 0 ? 'high' : 'low');
                }
                setSecDescriptions(results);
            } catch (e) { /* keep empty */ }
        })();
    }, [secValues, language, activeTab]);

    useEffect(() => {
        (async () => { try { setBioInfo(await dbService.getTableDescription('biorhythms', language)); } catch (e) { /**/ } })();
    }, [language]);

    const formattedDate = useMemo(() => {
        const d = new Date(); d.setDate(d.getDate() + selectedDayOffset);
        const langMap: Record<string, string> = { en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU' };
        return d.toLocaleDateString(langMap[language] || 'en-US', { month: 'short', day: 'numeric' });
    }, [language, selectedDayOffset]);

    const isToday = selectedDayOffset === 0;
    const statusLabel = isToday ? "TODAY'S STATUS" : 'STATUS';
    const physTitle = physical >= 70 ? 'Physical Peak' : physical >= 30 ? 'Physical Moderate' : 'Physical Low';
    const emoTitle = emotional >= 70 ? 'Emotional Peak' : emotional >= 30 ? 'Emotional Balance' : 'Emotional Low';
    const intTitle = intellectual >= 70 ? 'Intellectual High' : intellectual >= 30 ? 'Intellectual Moderate' : 'Intellectual Low';

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
                            <Text style={[styles.title, { color: colors.textTitle }]}>{t('biorhythms.title')}</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {activeTab === 'primary' ? 'Daily energy forecast' : (t('biorhythms.secondary_subtitle') || 'Subtle energy cycles')}
                            </Text>
                        </Animated.View>

                        {/* Chip Tabs */}
                        <View style={styles.chipRow}>
                            <TouchableOpacity
                                style={[styles.chip,
                                activeTab === 'primary'
                                    ? { backgroundColor: isDark ? 'rgba(125,211,252,0.2)' : '#ede9fe', borderColor: isDark ? 'rgba(125,211,252,0.4)' : '#c4b5fd' }
                                    : { backgroundColor: 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
                                ]}
                                activeOpacity={0.7} onPress={() => setActiveTab('primary')}>
                                <Ionicons name="pulse" size={14} color={activeTab === 'primary' ? (isDark ? '#7dd3fc' : '#7c3aed') : colors.textSecondary} />
                                <Text style={[styles.chipText, { color: activeTab === 'primary' ? (isDark ? '#7dd3fc' : '#7c3aed') : colors.textSecondary }]}>
                                    Primary
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.chip,
                                activeTab === 'secondary'
                                    ? { backgroundColor: isDark ? 'rgba(157,78,221,0.2)' : '#f5f0ff', borderColor: isDark ? 'rgba(157,78,221,0.4)' : '#d8b4fe' }
                                    : { backgroundColor: 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
                                ]}
                                activeOpacity={0.7} onPress={() => setActiveTab('secondary')}>
                                <Ionicons name="sparkles" size={14} color={activeTab === 'secondary' ? (isDark ? '#c084fc' : '#9333ea') : colors.textSecondary} />
                                <Text style={[styles.chipText, { color: activeTab === 'secondary' ? (isDark ? '#c084fc' : '#9333ea') : colors.textSecondary }]}>
                                    Secondary
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* ─── PRIMARY TAB ─── */}
                        {activeTab === 'primary' && (
                            <>
                                <View style={styles.sectionPad}>
                                    <WaveChart daysAlive={daysAlive} selectedOffset={selectedDayOffset} onSelectOffset={setSelectedDayOffset} />
                                </View>
                                <Animated.View entering={FadeInDown.duration(500).delay(200)}
                                    style={[styles.statusCard, { backgroundColor: colors.chartBackground, borderColor: colors.cardBorder }, !isDark && Shadow.light]}>
                                    <View style={styles.statusHeader}>
                                        <Text style={[styles.statusTitle, { color: colors.textSecondary }]}>{statusLabel}</Text>
                                        <Text style={[styles.statusDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                                    </View>
                                    <View style={styles.gaugesRow}>
                                        <StatusGauge percentage={physical} color={chartColors.physical} label={t('biorhythms.physical')} />
                                        <StatusGauge percentage={emotional} color={chartColors.emotional} label={t('biorhythms.emotional')} />
                                        <StatusGauge percentage={intellectual} color={chartColors.intellectual} label={t('biorhythms.intellectual')} />
                                    </View>
                                </Animated.View>
                                <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.meaningSection}>
                                    <Text style={[styles.meaningSectionTitle, { color: colors.textTitle }]}>{t('biorhythms.cycles_meaning') || 'Cycles Meaning'}</Text>
                                    <MeaningCard icon="fitness" iconColor={chartColors.physical}
                                        iconBg={isDark ? 'rgba(213,82,137,0.2)' : '#fce7f3'} title={physTitle} description={descriptions.physical} />
                                    <MeaningCard icon="heart" iconColor={chartColors.emotional}
                                        iconBg={isDark ? 'rgba(99,164,214,0.2)' : '#dbeafe'} title={emoTitle} description={descriptions.emotional} />
                                    <MeaningCard icon="bulb" iconColor="#e6a800"
                                        iconBg={isDark ? 'rgba(255,215,0,0.2)' : '#fef9c3'} title={intTitle} description={descriptions.intellectual} />
                                </Animated.View>
                            </>
                        )}

                        {/* ─── SECONDARY TAB ─── */}
                        {activeTab === 'secondary' && (
                            <>
                                <View style={styles.sectionPad}>
                                    <SecondaryWaveChart daysAlive={daysAlive} selectedOffset={selectedDayOffset} onSelectOffset={setSelectedDayOffset} />
                                </View>
                                <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.barsSection}>
                                    <View style={styles.statusHeader}>
                                        <Text style={[styles.statusTitle, { color: colors.textSecondary }]}>{statusLabel}</Text>
                                        <Text style={[styles.statusDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                                    </View>
                                    {SEC_KEYS.map(k => (
                                        <CenterBar key={k} value={secValues[k]} trendValue={secTomorrow[k]}
                                            color={SECONDARY_COLORS[k]} icon={SEC_ICONS[k]} label={t(`biorhythms.${k}` as any) || k} />
                                    ))}
                                </Animated.View>
                                <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.meaningSection}>
                                    <Text style={[styles.meaningSectionTitle, { color: colors.textTitle }]}>{t('biorhythms.cycles_meaning') || 'Cycles Meaning'}</Text>
                                    {SEC_KEYS.map(k => {
                                        const val = secValues[k];
                                        return (
                                            <MeaningCard key={k} icon={SEC_ICONS[k]} iconColor={SECONDARY_COLORS[k]}
                                                iconBg={isDark ? `${SECONDARY_COLORS[k]}33` : `${SECONDARY_COLORS[k]}18`}
                                                title={`${t(`biorhythms.${k}` as any) || k} — ${val >= 0 ? 'High' : 'Low'}`}
                                                description={secDescriptions[k] || ''} />
                                        );
                                    })}
                                </Animated.View>
                            </>
                        )}

                        {/* About Biorhythms */}
                        {bioInfo ? (
                            <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.infoSection}>
                                <View style={[styles.meaningCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
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

    // ─── Chip Tabs ───
    chipRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.l,
        gap: Spacing.s,
        marginTop: Spacing.m,
        marginBottom: Spacing.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontFamily: 'Manrope-SemiBold',
    },

    // ─── Secondary Bars ───
    barsSection: {
        paddingHorizontal: Spacing.l,
        marginTop: Spacing.l,
        gap: Spacing.s,
    },
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
});
