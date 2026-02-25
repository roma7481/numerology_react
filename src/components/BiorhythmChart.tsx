import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Shadow } from '../theme/SharedStyles';
import { useTranslation } from '../i18n';
import { useNavigation } from '@react-navigation/native';
import { NumbersCalculator } from '../utils/NumbersCalculator';

interface Props {
    day: number;
    month: number;
    year: number;
}

interface GaugeProps {
    percentage: number;
    color: string;
    trackColor: string;
    valueColor: string;
    labelColor: string;
    label: string;
    size: number;
}

function CircularGauge({ percentage, color, trackColor, valueColor, labelColor, label, size }: GaugeProps) {
    const strokeWidth = 5;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const absPercentage = Math.abs(percentage);
    const strokeDashoffset = circumference - (circumference * absPercentage) / 100;

    return (
        <View style={styles.gaugeContainer}>
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={[StyleSheet.absoluteFill, styles.gaugeValueContainer]}>
                    <Text style={[size > 80 ? styles.gaugeValueLarge : styles.gaugeValueSmall, { color: valueColor }]}>
                        {percentage.toFixed(1)}%
                    </Text>
                </View>
            </View>
            <Text style={[styles.gaugeLabel, { color: labelColor }]}>{label}</Text>
        </View>
    );
}

export default function BiorhythmChart({ day, month, year }: Props) {
    const { theme } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const biorhythms = useMemo(() => {
        const rhytms = NumbersCalculator.calcDailyBioRhytm(day, month, year);

        return {
            physical: rhytms[0],
            emotional: rhytms[1],
            intellectual: rhytms[2],
        };
    }, [day, month, year]);

    const navigation = useNavigation<any>();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Biorhythms')}
        >
            <Animated.View
                entering={FadeInDown.duration(600).delay(300)}
                style={[
                    styles.container,
                    { backgroundColor: colors.chartBackground, shadowColor: colors.categoryCardShadow, borderColor: colors.cardBorder },
                    theme === 'light' && Shadow.light,
                ]}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textTitle }]}>{t('biorhythms.title')}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.gaugesRow}>
                    <CircularGauge
                        percentage={biorhythms.physical}
                        color={colors.biorhythmChartLine1}
                        trackColor={colors.biorhythmTrack}
                        valueColor={colors.biorhythmValueColor}
                        labelColor={colors.biorhythmLabelColor}
                        label={t('biorhythms.physical')}
                        size={70}
                    />
                    <CircularGauge
                        percentage={biorhythms.emotional}
                        color={colors.biorhythmChartLine2}
                        trackColor={colors.biorhythmTrack}
                        valueColor={colors.biorhythmValueColor}
                        labelColor={colors.biorhythmLabelColor}
                        label={t('biorhythms.emotional')}
                        size={70}
                    />
                    <CircularGauge
                        percentage={biorhythms.intellectual}
                        color={colors.biorhythmChartLine3}
                        trackColor={colors.biorhythmTrack}
                        valueColor={colors.biorhythmValueColor}
                        labelColor={colors.biorhythmLabelColor}
                        label={t('biorhythms.intellectual')}
                        size={70}
                    />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.l,
        padding: Spacing.xl,
        marginVertical: Spacing.m,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    title: {
        ...Typography.chartTitle,
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gaugesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingVertical: Spacing.s,
    },
    gaugeContainer: {
        alignItems: 'center',
    },
    gaugeValueContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    gaugeValueSmall: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    gaugeValueLarge: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    gaugeLabel: {
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.3,
        marginTop: Spacing.s,
    },
});
