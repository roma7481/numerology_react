import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    ScrollView, View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import { NumbersCalculator, NumerologyContext } from '../utils/NumbersCalculator';
import { dbService } from '../services/DatabaseService';
import { Colors } from '../theme/Colors';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Typography } from '../theme/Typography';
import { Shadow } from '../theme/SharedStyles';
import { useTranslation } from '../i18n';
import BannerAdWrapper from '../components/ads/BannerAdWrapper';

// ─── Constants ─────────────────────────────────────────────────
type TabKey = 'psychomatrix' | 'biorhythm' | 'lifepath';
const TABS: { key: TabKey; icon: string }[] = [
    { key: 'psychomatrix', icon: 'grid' },
    { key: 'biorhythm', icon: 'pulse' },
    { key: 'lifepath', icon: 'trail-sign' },
];

const PSYCHO_CELL_NAMES = [
    'personality', 'energy', 'interest',
    'health', 'logic', 'labor',
    'luck', 'duty', 'memory',
];

const PSYCHO_CELL_ICONS = [
    'person', 'flash', 'book',
    'fitness', 'analytics', 'hammer',
    'star', 'shield', 'bulb',
];

// Line categories matching DB table `psychomatrix_compat`
// Order: cols (Purpose, Family, Stability), rows (Esteem, Finance, Talents), diags (Temperament, Spirituality)
const LINE_CATEGORIES = [
    'PURPOSE', 'FAMILY', 'STABILITY',
    'ESTEEM', 'FINANCE', 'TALENTS',
    'TEMPERAMENT', 'SPIRITUALITY',
];

const LINE_LABELS: Record<string, string> = {
    PURPOSE: 'Purpose', FAMILY: 'Family', STABILITY: 'Stability',
    ESTEEM: 'Self-Esteem', FINANCE: 'Finance', TALENTS: 'Talents',
    TEMPERAMENT: 'Temperament', SPIRITUALITY: 'Spirituality',
};

const LINE_ICONS: Record<string, string> = {
    PURPOSE: 'compass', FAMILY: 'people', STABILITY: 'shield-checkmark',
    ESTEEM: 'ribbon', FINANCE: 'cash', TALENTS: 'diamond',
    TEMPERAMENT: 'flame', SPIRITUALITY: 'sparkles',
};

// Indices into the 9-cell array (0-based) for each line
// Cells: 0=1, 1=2, 2=3, 3=4, 4=5, 5=6, 6=7, 7=8, 8=9
const LINE_INDICES: number[][] = [
    [0, 3, 6], // Purpose:      cells 1, 4, 7
    [1, 4, 7], // Family:       cells 2, 5, 8
    [2, 5, 8], // Stability:    cells 3, 6, 9
    [0, 1, 2], // Esteem:       cells 1, 2, 3
    [3, 4, 5], // Finance:      cells 4, 5, 6
    [6, 7, 8], // Talents:      cells 7, 8, 9
    [2, 4, 6], // Temperament:  cells 3, 5, 7
    [0, 4, 8], // Spirituality: cells 1, 5, 9
];

const BIO_TYPES = ['physical', 'emotional', 'intellectual'] as const;
const BIO_COLORS = { physical: '#d55289', emotional: '#63a4d6', intellectual: '#e6a800' };

// ─── Collapsible Card ──────────────────────────────────────────
function CollapsibleCard({ icon, title, isDark, colors, children, iconColor, iconBg }: {
    icon: string; title: string; isDark: boolean;
    colors: any; children: React.ReactNode;
    iconColor?: string; iconBg?: string;
}) {
    const [expanded, setExpanded] = useState(true);
    const defaultIconColor = isDark ? '#c084fc' : '#7c3aed';
    const defaultIconBg = isDark ? 'rgba(124,58,237,0.15)' : '#ede9fe';
    return (
        <View style={[styles.descCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder, flexDirection: 'column' }]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(!expanded)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.m }}
            >
                <View style={[styles.descIcon, { backgroundColor: iconBg || defaultIconBg }]}>
                    <Ionicons name={icon as any} size={18} color={iconColor || defaultIconColor} />
                </View>
                <Text style={[styles.descTitle, { color: colors.textTitle, flex: 1 }]}>
                    {title}
                </Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>
            {expanded && children}
        </View>
    );
}

// ─── Partner Input Section ─────────────────────────────────────
function PartnerInput({ onComplete }: { onComplete: () => void }) {
    const { theme, language, partnerDateOfBirth, profiles, activeProfileId, setProfile, saveProfile } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        if (partnerDateOfBirth) {
            const p = partnerDateOfBirth.split('/');
            return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
        }
        return new Date(1990, 0, 1);
    });
    const [hasPickedDate, setHasPickedDate] = useState(!!partnerDateOfBirth);

    const formatDob = (d: Date): string => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const formatDateLocalized = (date: Date) => {
        const langMap: Record<string, string> = {
            en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
        };
        return date.toLocaleDateString(langMap[language] || 'en-US');
    };

    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (event.type === 'dismissed') return;
        }
        if (date) {
            setSelectedDate(date);
            setHasPickedDate(true);
        }
    };

    const handleSave = () => {
        if (!hasPickedDate) return;
        const dobStr = formatDob(selectedDate);
        // Update top-level state
        setProfile({ partnerDateOfBirth: dobStr } as any);
        // Also persist to the active profile
        if (activeProfileId) {
            const activeProfile = profiles.find(p => p.id === activeProfileId);
            if (activeProfile) {
                saveProfile({ ...activeProfile, partnerDateOfBirth: dobStr });
            }
        }
        onComplete();
    };

    const canSave = hasPickedDate;

    return (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.partnerSection}>
            <View style={[styles.partnerCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
                <View style={[styles.partnerIconCircle, { backgroundColor: isDark ? 'rgba(224,85,85,0.15)' : '#fef2f2' }]}>
                    <Ionicons name="heart" size={28} color="#e05555" />
                </View>
                <Text style={[styles.partnerTitle, { color: colors.textTitle }]}>
                    {t('compatibility.enter_partner_info') || "Enter Partner's Info"}
                </Text>
                <Text style={[styles.partnerSubtitle, { color: colors.textSecondary }]}>
                    {t('compatibility.partner_info_desc') || 'Date of birth is required for compatibility analysis'}
                </Text>

                {/* Date picker trigger */}
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f8f9fa', borderColor: colors.cardBorder }]}
                    onPress={() => setShowPicker(!showPicker)}
                >
                    <Ionicons name="calendar-outline" size={20} color={hasPickedDate ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.dateText, { color: hasPickedDate ? colors.textTitle : colors.textSecondary }]}>
                        {hasPickedDate ? formatDateLocalized(selectedDate) : (t('compatibility.enter_partner_dob') || 'Select date of birth')}
                    </Text>
                    <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                {/* Inline spinner picker (same as ProfileModal) */}
                {showPicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1850, 0, 1)}
                        textColor={isDark ? '#fff' : '#000'}
                        themeVariant={theme}
                    />
                )}

                {/* Save */}
                <TouchableOpacity
                    style={[styles.saveButton, { opacity: canSave ? 1 : 0.5, backgroundColor: isDark ? '#7c3aed' : '#6d28d9' }]}
                    disabled={!canSave}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>{t('compatibility.analyze') || 'Analyze Compatibility'}</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// ─── Circular Gauge ────────────────────────────────────────────
function SyncGauge({ percentage, color, label }: { percentage: number; color: string; label: string }) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const rounded = Math.round(percentage);

    return (
        <View style={styles.gaugeItem}>
            <View style={[styles.gaugeCircle, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
                <View style={[styles.gaugeProgress, {
                    borderColor: color,
                    borderTopColor: 'transparent',
                    transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
                }]} />
                <Text style={[styles.gaugePercent, { color: colors.textTitle }]}>{rounded}%</Text>
            </View>
            <Text style={[styles.gaugeLabel, { color }]}>{label}</Text>
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function CompatibilityScreen() {
    const { dateOfBirth, partnerDateOfBirth,
        firstName, lastName, fatherName, language, theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [activeTab, setActiveTab] = useState<TabKey>('psychomatrix');
    const [hasPartner, setHasPartner] = useState(!!partnerDateOfBirth);
    const [loading, setLoading] = useState(false);
    const [editingPartner, setEditingPartner] = useState(!partnerDateOfBirth);

    // ─── Calculations ───
    const context: NumerologyContext = useMemo(() => ({
        language,
        dateOfBirth: dateOfBirth || '01/01/1990',
        firstName: firstName || '',
        lastName: lastName || '',
        fatherName,
        partnerDateOfBirth,
    }), [language, dateOfBirth, firstName, lastName, fatherName, partnerDateOfBirth]);

    // ─── Psychomatrix compat data ───
    const [psychoData, setPsychoData] = useState<{
        userCells: number[]; partnerCells: number[];
        descriptions: Record<string, string>;
        lineInfos: string[];
        compatInfo: string;
    }>({ userCells: [], partnerCells: [], descriptions: {}, lineInfos: [], compatInfo: '' });

    // ─── Biorhythm compat data ───
    const [bioData, setBioData] = useState<{
        values: number[]; descriptions: Record<string, string>; compatInfo: string;
    }>({ values: [0, 0, 0], descriptions: {}, compatInfo: '' });

    // ─── Life Path data ───
    const [lifePathData, setLifePathData] = useState<{
        userLP: number; partnerLP: number;
        loveNum: number; coupleNum: number;
        lifePathDesc: string; loveDesc: string; coupleDesc: string;
        compatInfo: string; fyiInfo: string;
    }>({ userLP: 0, partnerLP: 0, loveNum: 0, coupleNum: 0, lifePathDesc: '', loveDesc: '', coupleDesc: '', compatInfo: '', fyiInfo: '' });

    const loadPsychomatrix = useCallback(async () => {
        if (!partnerDateOfBirth) return;
        const locale = language || 'en';
        const userSquare = NumbersCalculator.calcPythagorosSquare(context, 'dateOfBirth');
        const partnerCtx: NumerologyContext = { ...context, dateOfBirth: partnerDateOfBirth };
        const partnerSquare = NumbersCalculator.calcPythagorosSquare(partnerCtx, 'dateOfBirth');

        const countDigits = (val: number) => val === 0 ? 0 : String(val).length;
        const userCounts = userSquare.map(countDigits);
        const partnerCounts = partnerSquare.map(countDigits);

        // Calculate line values and determine strength for each line
        const lineDescriptions: Record<string, string> = {};
        for (let l = 0; l < LINE_CATEGORIES.length; l++) {
            const indices = LINE_INDICES[l];
            const userLineVal = indices.reduce((sum, idx) => sum + userCounts[idx], 0);
            const partnerLineVal = indices.reduce((sum, idx) => sum + partnerCounts[idx], 0);

            let strength: string;
            if (userLineVal < 3 && partnerLineVal < 3) {
                // Both counts < 3
                strength = 'weak';
            } else if (userLineVal === 3 && partnerLineVal === 3) {
                // Both counts exactly 3
                strength = 'moderate';
            } else if (userLineVal > 3 && partnerLineVal > 3) {
                // Both counts > 3
                if (Math.abs(userLineVal - partnerLineVal) < 2) {
                    strength = 'strong';
                } else {
                    strength = userLineVal > partnerLineVal ? 'you_stronger' : 'partner_stronger';
                }
            } else {
                // Mixed: one > 3 and the other < 3, or one is 3 and the other isn't
                strength = userLineVal > partnerLineVal ? 'you_stronger' : 'partner_stronger';
            }
            lineDescriptions[LINE_CATEGORIES[l]] = await dbService.getPsychomatrixCompat(locale, LINE_CATEGORIES[l], strength);
        }

        // Fetch line info descriptions from table_description
        const lineInfos = await dbService.getTableDescriptions('psychomatrix_lines', locale);

        // Fetch general psychomatrix compatibility info
        const compatInfo = await dbService.getTableDescription('psychomatrix_compat', locale);

        setPsychoData({ userCells: userSquare, partnerCells: partnerSquare, descriptions: lineDescriptions, lineInfos, compatInfo });
    }, [partnerDateOfBirth, context, language]);

    const loadBiorhythm = useCallback(async () => {
        if (!partnerDateOfBirth) return;
        const locale = language || 'en';
        const userParts = (dateOfBirth || '01/01/1990').split('/');
        const partnerParts = partnerDateOfBirth.split('/');
        const myself = [parseInt(userParts[0]), parseInt(userParts[1]), parseInt(userParts[2])];
        const spouse = [parseInt(partnerParts[0]), parseInt(partnerParts[1]), parseInt(partnerParts[2])];
        const values = NumbersCalculator.calcCompBioRhytm(myself, spouse);

        const descriptions: Record<string, string> = {};
        for (let i = 0; i < 3; i++) {
            const v = values[i];
            let level: string;
            if (v >= 80) level = 'max';
            else if (v >= 50) level = 'good';
            else if (v >= 30) level = 'bad';
            else level = 'min';
            descriptions[BIO_TYPES[i]] = await dbService.getBiorhythmCompat(locale, BIO_TYPES[i], level);
        }

        // Fetch general biorhythm compatibility info
        const compatInfo = await dbService.getTableDescription('biorhythm_compatibility', locale);

        setBioData({ values, descriptions, compatInfo });
    }, [partnerDateOfBirth, dateOfBirth, language]);

    const loadLifePath = useCallback(async () => {
        if (!partnerDateOfBirth) return;
        const locale = language || 'en';
        const userLP = NumbersCalculator.calcLifeNumberMethod1(context);
        const partnerLP = NumbersCalculator.calcLifeNumberPartner(context);

        const partnerParts = partnerDateOfBirth.split('/');
        const pDay = parseInt(partnerParts[0]);
        const pMonth = parseInt(partnerParts[1]);
        const pYear = parseInt(partnerParts[2]);

        const loveNum = NumbersCalculator.calcLoveCompatibilityNum(pDay, pMonth, pYear, context);
        const coupleNum = NumbersCalculator.calcCoupleNumber(context);

        const [lifePathDesc, loveData, coupleData, compatInfo, fyiInfo] = await Promise.all([
            dbService.getLifePathCompat(locale, userLP, partnerLP),
            dbService.getByNumber('love_compatibility', locale, loveNum),
            dbService.getByNumber('couple_number', locale, coupleNum),
            dbService.getTableDescription('life_path_number_compat', locale),
            dbService.getTableDescription('fyi_compat', locale),
        ]);

        setLifePathData({
            userLP, partnerLP, loveNum, coupleNum,
            lifePathDesc,
            loveDesc: (loveData as any)?.description || '',
            coupleDesc: (coupleData as any)?.description || '',
            compatInfo, fyiInfo,
        });
    }, [partnerDateOfBirth, context, language]);

    useEffect(() => {
        if (!partnerDateOfBirth || editingPartner) return;
        setLoading(true);
        Promise.all([loadPsychomatrix(), loadBiorhythm(), loadLifePath()])
            .finally(() => setLoading(false));
    }, [partnerDateOfBirth, editingPartner, loadPsychomatrix, loadBiorhythm, loadLifePath]);

    const handlePartnerSaved = () => {
        setHasPartner(true);
        setEditingPartner(false);
    };

    const partnerDisplayName = t('compatibility.partner') || 'Partner';

    // ─── Tab labels ───
    const tabLabels: Record<TabKey, string> = {
        psychomatrix: t('compatibility.psychomatrix') || 'Psychomatrix',
        biorhythm: t('compatibility.biorhythm_sync') || 'Bio Sync',
        lifepath: t('compatibility.life_path') || 'Life Path',
    };

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
                                {hasPartner && !editingPartner && (
                                    <TouchableOpacity onPress={() => setEditingPartner(true)} style={styles.editBtn}>
                                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={[styles.title, { color: colors.textTitle }]}>
                                {t('compatibility.title') || 'Compatibility'}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {hasPartner && !editingPartner
                                    ? `${firstName || 'You'} & ${partnerDisplayName}`
                                    : (t('compatibility.subtitle') || 'Discover your connection')
                                }
                            </Text>
                        </Animated.View>

                        {/* Partner Input or Results */}
                        {(!hasPartner || editingPartner) ? (
                            <PartnerInput onComplete={handlePartnerSaved} />
                        ) : loading ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        ) : (
                            <>
                                {/* Chip Tabs */}
                                <View style={styles.chipRow}>
                                    {TABS.map(tab => {
                                        const isActive = activeTab === tab.key;
                                        return (
                                            <TouchableOpacity key={tab.key}
                                                style={[styles.chip,
                                                isActive
                                                    ? { backgroundColor: isDark ? 'rgba(124,58,237,0.2)' : '#ede9fe', borderColor: isDark ? 'rgba(124,58,237,0.4)' : '#c4b5fd' }
                                                    : { backgroundColor: 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
                                                ]}
                                                activeOpacity={0.7}
                                                onPress={() => setActiveTab(tab.key)}
                                            >
                                                <Ionicons name={tab.icon as any} size={14}
                                                    color={isActive ? (isDark ? '#c084fc' : '#7c3aed') : colors.textSecondary} />
                                                <Text style={[styles.chipText, {
                                                    color: isActive ? (isDark ? '#c084fc' : '#7c3aed') : colors.textSecondary
                                                }]}>
                                                    {tabLabels[tab.key]}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* ─── PSYCHOMATRIX TAB ─── */}
                                {activeTab === 'psychomatrix' && (
                                    <Animated.View entering={FadeInDown.duration(400)} style={styles.tabContent}>
                                        {/* 3×3 Grid comparison */}
                                        <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
                                            <View style={styles.gridCompareHeader}>
                                                <Text style={[styles.gridHeaderLabel, { color: isDark ? '#7dd3fc' : '#7c3aed' }]}>
                                                    {firstName || 'You'}
                                                </Text>
                                                <Text style={[styles.gridHeaderLabel, { color: '#e05555' }]}>
                                                    {partnerDisplayName}
                                                </Text>
                                            </View>
                                            {[0, 1, 2].map(row => (
                                                <View key={`row-${row}`} style={styles.psychoRow}>
                                                    {[0, 1, 2].map(col => {
                                                        const idx = col * 3 + row;
                                                        const uVal = psychoData.userCells[idx] || 0;
                                                        const pVal = psychoData.partnerCells[idx] || 0;
                                                        const uDisplay = uVal === 0 ? '—' : String(uVal);
                                                        const pDisplay = pVal === 0 ? '—' : String(pVal);
                                                        return (
                                                            <View key={`cell-${idx}`} style={[styles.psychoCell, {
                                                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8f9fa',
                                                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                            }]}>
                                                                <Ionicons name={PSYCHO_CELL_ICONS[idx] as any} size={14}
                                                                    color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
                                                                <Text style={[styles.psychoCellLabel, { color: colors.textSecondary }]}>
                                                                    {PSYCHO_CELL_NAMES[idx].slice(0, 4).toUpperCase()}
                                                                </Text>
                                                                <View style={styles.psychoValRow}>
                                                                    <Text style={[styles.psychoVal, { color: isDark ? '#7dd3fc' : '#7c3aed' }]}>
                                                                        {uDisplay}
                                                                    </Text>
                                                                    <Text style={[styles.psychoVsDivider, { color: colors.textSecondary }]}>|</Text>
                                                                    <Text style={[styles.psychoVal, { color: '#e05555' }]}>
                                                                        {pDisplay}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            ))}
                                        </View>

                                        {/* Line compatibility descriptions */}
                                        {LINE_CATEGORIES.map((cat, lineIdx) => {
                                            const desc = psychoData.descriptions[cat];
                                            const lineInfo = psychoData.lineInfos[lineIdx] || '';
                                            if (!desc && !lineInfo) return null;
                                            return (
                                                <CollapsibleCard
                                                    key={cat}
                                                    icon={LINE_ICONS[cat]}
                                                    title={LINE_LABELS[cat]}
                                                    isDark={isDark}
                                                    colors={colors}
                                                >
                                                    {!!desc && (
                                                        <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                            {desc}
                                                        </Text>
                                                    )}
                                                    {!!lineInfo && (
                                                        <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                            {lineInfo}
                                                        </Text>
                                                    )}
                                                </CollapsibleCard>
                                            );
                                        })}

                                        {/* General psychomatrix compatibility info */}
                                        {!!psychoData.compatInfo && (
                                            <CollapsibleCard
                                                icon="information-circle"
                                                title={t('compatibility.psychomatrix') || 'Psychomatrix'}
                                                isDark={isDark}
                                                colors={colors}
                                            >
                                                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                    {psychoData.compatInfo}
                                                </Text>
                                            </CollapsibleCard>
                                        )}
                                    </Animated.View>
                                )}

                                {/* ─── BIORHYTHM TAB ─── */}
                                {activeTab === 'biorhythm' && (
                                    <Animated.View entering={FadeInDown.duration(400)} style={styles.tabContent}>
                                        {/* Sync gauges */}
                                        <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
                                            <Text style={[styles.sectionCardTitle, { color: colors.textTitle }]}>
                                                {t('compatibility.relationship_sync') || 'Relationship Sync'}
                                            </Text>
                                            <View style={styles.gaugesRow}>
                                                {BIO_TYPES.map((type, i) => (
                                                    <SyncGauge key={type}
                                                        percentage={bioData.values[i] || 0}
                                                        color={BIO_COLORS[type]}
                                                        label={t(`biorhythms.${type}`) || type}
                                                    />
                                                ))}
                                            </View>
                                            <View style={[styles.avgRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }]}>
                                                <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>
                                                    {t('compatibility.overall_sync') || 'Overall Sync'}
                                                </Text>
                                                <Text style={[styles.avgValue, { color: isDark ? '#c084fc' : '#7c3aed' }]}>
                                                    {Math.round((bioData.values[0] + bioData.values[1] + bioData.values[2]) / 3)}%
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Bio descriptions */}
                                        {BIO_TYPES.map((type, i) => {
                                            const desc = bioData.descriptions[type];
                                            if (!desc) return null;
                                            const icons = { physical: 'fitness', emotional: 'heart', intellectual: 'bulb' };
                                            return (
                                                <CollapsibleCard
                                                    key={type}
                                                    icon={icons[type]}
                                                    title={`${t(`biorhythms.${type}`) || type} — ${Math.round(bioData.values[i])}%`}
                                                    isDark={isDark}
                                                    colors={colors}
                                                >
                                                    <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>{desc}</Text>
                                                </CollapsibleCard>
                                            );
                                        })}

                                        {/* General biorhythm compatibility info */}
                                        {!!bioData.compatInfo && (
                                            <CollapsibleCard
                                                icon="information-circle"
                                                title={t('compatibility.biorhythm_sync') || 'Biorhythm Sync'}
                                                isDark={isDark}
                                                colors={colors}
                                            >
                                                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                    {bioData.compatInfo}
                                                </Text>
                                            </CollapsibleCard>
                                        )}
                                    </Animated.View>
                                )}

                                {/* ─── LIFE PATH TAB ─── */}
                                {activeTab === 'lifepath' && (
                                    <Animated.View entering={FadeInDown.duration(400)} style={styles.tabContent}>
                                        {/* Numbers row */}
                                        <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.cardBorder }]}>
                                            <View style={styles.numbersRow}>
                                                <View style={styles.numberBlock}>
                                                    <Text style={[styles.numberName, { color: isDark ? '#fbbf24' : '#d97706' }]}>
                                                        {firstName || 'You'}
                                                    </Text>
                                                    <View style={[styles.numberCircle, { backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : '#fef9c3', borderColor: isDark ? 'rgba(251,191,36,0.3)' : '#fde68a' }]}>
                                                        <Text style={[styles.numberValue, { color: isDark ? '#fbbf24' : '#d97706' }]}>
                                                            {lifePathData.userLP}
                                                        </Text>
                                                    </View>
                                                    <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                                                        {t('compatibility.life_path_number') || 'Life Path'}
                                                    </Text>
                                                </View>
                                                <View style={styles.vsCircle}>
                                                    <Ionicons name="heart" size={20} color="#e05555" />
                                                </View>
                                                <View style={styles.numberBlock}>
                                                    <Text style={[styles.numberName, { color: '#e05555' }]}>
                                                        {partnerDisplayName}
                                                    </Text>
                                                    <View style={[styles.numberCircle, { backgroundColor: isDark ? 'rgba(224,85,85,0.15)' : '#fef2f2', borderColor: isDark ? 'rgba(224,85,85,0.3)' : '#fecaca' }]}>
                                                        <Text style={[styles.numberValue, { color: '#e05555' }]}>
                                                            {lifePathData.partnerLP}
                                                        </Text>
                                                    </View>
                                                    <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                                                        {t('compatibility.life_path_number') || 'Life Path'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Life path compatibility */}
                                        {lifePathData.lifePathDesc ? (
                                            <CollapsibleCard
                                                icon="trail-sign"
                                                title={`${t('compatibility.life_path_match') || 'Life Path Match'} (${lifePathData.userLP} & ${lifePathData.partnerLP})`}
                                                isDark={isDark}
                                                colors={colors}
                                                iconColor="#e05555"
                                                iconBg={isDark ? 'rgba(224,85,85,0.15)' : '#fef2f2'}
                                            >
                                                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                    {lifePathData.lifePathDesc}
                                                </Text>
                                            </CollapsibleCard>
                                        ) : null}

                                        {/* Love Number */}
                                        {lifePathData.loveDesc ? (
                                            <CollapsibleCard
                                                icon="heart"
                                                title={`${t('compatibility.love_number') || 'Love Number'} — ${lifePathData.loveNum}`}
                                                isDark={isDark}
                                                colors={colors}
                                                iconColor="#e05555"
                                                iconBg={isDark ? 'rgba(224,85,85,0.15)' : '#fef2f2'}
                                            >
                                                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                    {lifePathData.loveDesc}
                                                </Text>
                                            </CollapsibleCard>
                                        ) : null}

                                        {/* Couple Number */}
                                        {lifePathData.coupleDesc ? (
                                            <CollapsibleCard
                                                icon="people"
                                                title={`${t('compatibility.couple_number') || 'Couple Number'} — ${lifePathData.coupleNum}`}
                                                isDark={isDark}
                                                colors={colors}
                                                iconColor="#f59e0b"
                                                iconBg={isDark ? 'rgba(245,158,11,0.15)' : '#fef9c3'}
                                            >
                                                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                    {lifePathData.coupleDesc}
                                                </Text>
                                            </CollapsibleCard>
                                        ) : null}

                                        {/* General life path compatibility info */}
                                        {!!lifePathData.compatInfo && (
                                            <CollapsibleCard
                                                icon="information-circle"
                                                title={t('compatibility.life_path_number') || 'Life Path'}
                                                isDark={isDark}
                                                colors={colors}
                                            >
                                                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                    {lifePathData.compatInfo}
                                                </Text>
                                                {!!lifePathData.fyiInfo && (
                                                    <Text style={[styles.descText, { color: colors.textSecondary, marginTop: Spacing.m }]}>
                                                        {lifePathData.fyiInfo}
                                                    </Text>
                                                )}
                                            </CollapsibleCard>
                                        )}
                                    </Animated.View>
                                )}
                            </>
                        )}

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

    header: { paddingHorizontal: Spacing.l, paddingTop: Spacing.m, paddingBottom: Spacing.s },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.m },
    backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    editBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    title: { ...Typography.screenHeader, textAlign: 'center' },
    subtitle: { fontSize: 13, fontFamily: 'Manrope-Regular', marginTop: 2, textAlign: 'center' },

    // Partner Input
    partnerSection: { paddingHorizontal: Spacing.l, marginTop: Spacing.l },
    partnerCard: {
        borderRadius: BorderRadius.l, padding: Spacing.xl, borderWidth: 1,
        alignItems: 'center',
    },
    partnerIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.l },
    partnerTitle: { fontSize: 18, fontFamily: 'NotoSerif-Bold', marginBottom: Spacing.xs, textAlign: 'center' },
    partnerSubtitle: { fontSize: 13, fontFamily: 'Manrope-Regular', textAlign: 'center', marginBottom: Spacing.l, lineHeight: 20 },
    dateButton: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.s,
        width: '100%', height: 48, borderRadius: BorderRadius.m, borderWidth: 1,
        paddingHorizontal: Spacing.m, marginBottom: Spacing.l,
    },
    dateText: { fontSize: 14, fontFamily: 'Manrope-Regular' },
    saveButton: {
        width: '100%', height: 48, borderRadius: BorderRadius.m,
        justifyContent: 'center', alignItems: 'center',
    },
    saveButtonText: { color: '#fff', fontSize: 15, fontFamily: 'Manrope-Bold' },


    // Chip Tabs
    chipRow: { flexDirection: 'row', paddingHorizontal: Spacing.l, gap: Spacing.s, marginTop: Spacing.m, marginBottom: Spacing.xs },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    },
    chipText: { fontSize: 12, fontFamily: 'Manrope-SemiBold' },

    // Tab content
    tabContent: { paddingHorizontal: Spacing.l, marginTop: Spacing.m, gap: Spacing.m },

    // Loading
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },

    // Section Card
    sectionCard: { borderRadius: BorderRadius.l, padding: Spacing.l, borderWidth: 1 },
    sectionCardTitle: { fontSize: 16, fontFamily: 'NotoSerif-Bold', marginBottom: Spacing.m, textAlign: 'center' },

    // Psychomatrix grid
    gridCompareHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.m },
    gridHeaderLabel: { fontSize: 12, fontFamily: 'Manrope-Bold', letterSpacing: 1 },
    psychoRow: { flexDirection: 'row', gap: Spacing.s, marginBottom: Spacing.s },
    psychoCell: {
        flex: 1, borderRadius: BorderRadius.m, borderWidth: 1, padding: Spacing.s,
        alignItems: 'center', minHeight: 72, justifyContent: 'center',
    },
    psychoCellLabel: { fontSize: 8, fontFamily: 'Manrope-Bold', letterSpacing: 1, marginTop: 2 },
    psychoValRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    psychoVal: { fontSize: 14, fontFamily: 'Manrope-Bold' },
    psychoVsDivider: { fontSize: 12, opacity: 0.3 },

    // Gauges
    gaugesRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.m, marginBottom: Spacing.m },
    gaugeItem: { alignItems: 'center' },
    gaugeCircle: {
        width: 72, height: 72, borderRadius: 36, borderWidth: 4,
        justifyContent: 'center', alignItems: 'center', position: 'relative',
    },
    gaugeProgress: {
        position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 4,
    },
    gaugePercent: { fontSize: 16, fontFamily: 'Manrope-Bold' },
    gaugeLabel: { fontSize: 11, fontFamily: 'Manrope-Bold', marginTop: 6, letterSpacing: 0.5 },
    avgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.m, borderRadius: BorderRadius.m },
    avgLabel: { fontSize: 13, fontFamily: 'Manrope-SemiBold' },
    avgValue: { fontSize: 18, fontFamily: 'Manrope-Bold' },

    // Description cards
    descCard: {
        flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.l,
        borderRadius: BorderRadius.m, borderWidth: 1, gap: Spacing.m,
    },
    descIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    descTitle: { fontSize: 15, fontFamily: 'Manrope-SemiBold' },
    descTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    descText: { fontSize: 13, fontFamily: 'Manrope-Regular', lineHeight: 20, marginTop: 4 },
    descPercent: { fontSize: 13, fontFamily: 'Manrope-Bold' },

    // Life path numbers
    numbersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: Spacing.m },
    numberBlock: { alignItems: 'center' },
    numberName: { fontSize: 12, fontFamily: 'Manrope-Bold', letterSpacing: 0.5, marginBottom: Spacing.s },
    numberCircle: {
        width: 64, height: 64, borderRadius: 32, borderWidth: 2,
        justifyContent: 'center', alignItems: 'center',
    },
    numberValue: { fontSize: 26, fontFamily: 'NotoSerif-Bold' },
    numberLabel: { fontSize: 10, fontFamily: 'Manrope-Regular', marginTop: 4, letterSpacing: 0.5 },
    vsCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(224,85,85,0.1)' },
    numBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
});
