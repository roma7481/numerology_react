import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';
import { circle } from '../theme/SharedStyles';

const WRAPPER_SIZE = 300;
const CIRCLE_SIZE = 170;
const RINGS = [195, 220, 245, 270];

interface Props {
    dailyNumber: number;
    guidanceText: string;
    onPress?: () => void;
}

export default function HeroDailyNumber({ dailyNumber, guidanceText, onPress }: Props) {
    const { theme } = useStore();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const animation = useSharedValue(0);

    useEffect(() => {
        animation.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
        );
    }, [animation]);

    const animatedRingsStyle = useAnimatedStyle(() => ({
        opacity: interpolate(animation.value, [0, 1], [0.4, 0.8]),
        transform: [{ scale: interpolate(animation.value, [0, 1], [0.98, 1.02]) }],
    }));

    const ringStrokeColor = isDark
        ? 'rgba(186, 230, 253, 0.4)'
        : 'rgba(157, 78, 221, 0.3)';

    const content = (
        <View style={styles.container}>
            <Animated.View entering={FadeInDown.duration(600).delay(150)}>
                <View style={styles.heroWrapper}>
                    {/* Atmospheric Glow and Rings */}
                    <Animated.View style={[StyleSheet.absoluteFill, animatedRingsStyle]}>
                        <Svg width={WRAPPER_SIZE} height={WRAPPER_SIZE} viewBox={`0 0 ${WRAPPER_SIZE} ${WRAPPER_SIZE}`}>
                            <Defs>
                                <RadialGradient
                                    id="glow"
                                    cx="50%"
                                    cy="50%"
                                    rx="50%"
                                    ry="50%"
                                    fx="50%"
                                    fy="50%"
                                >
                                    <Stop offset="0%" stopColor={colors.heroGlowColor} stopOpacity="0.6" />
                                    <Stop offset="100%" stopColor={colors.heroGlowColor} stopOpacity="0" />
                                </RadialGradient>
                            </Defs>

                            {/* Background Glow */}
                            <Circle
                                cx={WRAPPER_SIZE / 2}
                                cy={WRAPPER_SIZE / 2}
                                r={WRAPPER_SIZE / 2}
                                fill="url(#glow)"
                            />

                            {/* Concentric Dotted Rings */}
                            {RINGS.map((diameter, index) => (
                                <Circle
                                    key={index}
                                    cx={WRAPPER_SIZE / 2}
                                    cy={WRAPPER_SIZE / 2}
                                    r={diameter / 2}
                                    fill="none"
                                    stroke={ringStrokeColor}
                                    strokeWidth={0.8}
                                    strokeDasharray="1, 8"
                                    strokeLinecap="round"
                                />
                            ))}
                        </Svg>
                    </Animated.View>

                    {/* Main number circle */}
                    <View style={[
                        styles.mainCircle,
                        {
                            backgroundColor: colors.dailyNumberCircleInner,
                            shadowColor: isDark ? 'transparent' : colors.primary,
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
                            borderWidth: isDark ? 1.5 : 0.5,
                        }
                    ]}>
                        <Text style={[styles.heroLabel, { color: colors.heroLabelColor }]}>
                            {isDark ? 'DAILY NUMBER' : 'DAILY'}
                        </Text>
                        <Text style={[styles.numberText, { color: colors.heroNumberColor }]}>{dailyNumber}</Text>
                    </View>
                </View>
            </Animated.View>

            <Animated.Text
                entering={FadeInDown.duration(500).delay(250)}
                style={[styles.guidanceTitle, { color: colors.guidanceTitle }]}
            >
                DAILY GUIDANCE
            </Animated.Text>
            <Animated.Text
                entering={FadeInDown.duration(500).delay(350)}
                style={[styles.guidanceText, { color: colors.guidanceText }]}
            >
                "{guidanceText}"
            </Animated.Text>
            {onPress && (
                <Animated.View entering={FadeInDown.duration(400).delay(450)} style={styles.tapHintRow}>
                    <Text style={[styles.tapHintText, { color: colors.primary }]}>Tap to read more</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                </Animated.View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }
    return content;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: Spacing.l,
    },
    heroWrapper: {
        width: WRAPPER_SIZE,
        height: WRAPPER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCircle: {
        ...circle(CIRCLE_SIZE),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    heroLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    numberText: {
        fontSize: 56,
        fontWeight: '300',
        fontFamily: 'Manrope-Regular',
        marginTop: -Spacing.xs,
    },
    guidanceTitle: {
        ...Typography.labelWide,
        marginTop: Spacing.l,
    },
    guidanceText: {
        ...Typography.bodyItalic,
        textAlign: 'center',
        paddingHorizontal: Spacing.huge,
        marginTop: Spacing.m,
    },
    tapHintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: Spacing.s,
    },
    tapHintText: {
        fontSize: 12,
        fontFamily: 'Manrope-SemiBold',
    },
});
