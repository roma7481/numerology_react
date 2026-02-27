import React, { useState, useCallback } from 'react';
import {
    Modal, View, Text, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n';
import { Colors } from '../theme/Colors';
import { Spacing, BorderRadius } from '../theme/Spacing';

const RATE_THRESHOLD = 8;
const PACKAGE_NAME = 'numerology.dailymistika.ru';

/**
 * Hook that manages the Rate Us dialog trigger logic.
 * Call `triggerRateCheck()` on each app open.
 * It increments the counter and, when the threshold is exceeded and the user
 * hasn't already rated, sets `visible` to true.
 */
export function useRateDialog() {
    const [visible, setVisible] = useState(false);
    const hasRated = useStore((s) => s.hasRated);
    const incrementRateCount = useStore((s) => s.incrementRateCount);
    const resetRateCount = useStore((s) => s.resetRateCount);

    const triggerRateCheck = useCallback(() => {
        if (hasRated) return;

        const newCount = incrementRateCount();
        if (newCount > RATE_THRESHOLD) {
            resetRateCount();
            setVisible(true);
        }
    }, [hasRated, incrementRateCount, resetRateCount]);

    const dismiss = useCallback(() => setVisible(false), []);

    return { visible, setVisible, triggerRateCheck, dismiss };
}

interface RateUsDialogProps {
    visible: boolean;
    onDismiss: () => void;
}

type Phase = 'like' | 'rate';

export default function RateUsDialog({ visible, onDismiss }: RateUsDialogProps) {
    const [phase, setPhase] = useState<Phase>('like');
    const { theme } = useStore();
    const { setHasRated } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Reset phase when dialog opens
    React.useEffect(() => {
        if (visible) setPhase('like');
    }, [visible]);

    // ── Phase 1: "Do you like our app?" ──
    const handleLikeYes = () => setPhase('rate');
    const handleLikeNo = () => {
        setHasRated(true);
        onDismiss();
    };

    // ── Phase 2: "Rate our App" ──
    const handleRateOk = async () => {
        setHasRated(true);
        onDismiss();
        try {
            await Linking.openURL(`market://details?id=${PACKAGE_NAME}`);
        } catch {
            Linking.openURL(`https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`);
        }
    };

    const handleRateCancel = () => {
        // Will ask again after another threshold of opens
        setHasRated(false);
        onDismiss();
    };

    const handleRateNo = () => {
        setHasRated(true);
        onDismiss();
    };

    const cardBg = isDark ? 'rgba(15, 60, 90, 0.98)' : '#ffffff';
    const purpleAccent = isDark ? '#a78bfa' : '#7c3aed';
    const goldAccent = isDark ? '#fbbf24' : '#d4a017';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={[styles.card, {
                    backgroundColor: cardBg,
                    borderColor: isDark ? 'rgba(186,230,253,0.2)' : '#f1f5f9',
                }]}>
                    {phase === 'like' ? (
                        /* ═══════ PHASE 1: Do you like our app? ═══════ */
                        <>
                            {/* Heart icon */}
                            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(167,139,250,0.15)' : '#faf5ff' }]}>
                                <Ionicons name="heart" size={30} color={isDark ? '#f472b6' : '#e05555'} />
                            </View>

                            <Text style={[styles.title, { color: colors.textTitle }]}>
                                {t('rate_dialog.like_title')}
                            </Text>

                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('rate_dialog.like_message')}
                            </Text>

                            {/* Primary: Yes */}
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: purpleAccent }]}
                                onPress={handleLikeYes}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {t('rate_dialog.like_yes')} 😊
                                </Text>
                            </TouchableOpacity>

                            {/* Text link: Not really */}
                            <TouchableOpacity
                                style={styles.textLink}
                                onPress={handleLikeNo}
                                activeOpacity={0.6}
                            >
                                <Text style={[styles.textLinkLabel, { color: colors.textSecondary }]}>
                                    {t('rate_dialog.like_no')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* ═══════ PHASE 2: Rate our App ═══════ */
                        <>
                            {/* Star icon */}
                            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : '#fffbeb' }]}>
                                <Ionicons name="star" size={30} color={goldAccent} />
                            </View>

                            <Text style={[styles.title, { color: colors.textTitle }]}>
                                {t('rate_dialog.rate_title')}
                            </Text>

                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('rate_dialog.rate_message')}
                            </Text>

                            {/* Primary: Rate now */}
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: goldAccent }]}
                                onPress={handleRateOk}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {t('rate_dialog.rate_ok')}
                                </Text>
                            </TouchableOpacity>

                            {/* Secondary outline: Later */}
                            <TouchableOpacity
                                style={[styles.outlineButton, {
                                    borderColor: isDark ? 'rgba(251,191,36,0.4)' : '#e5e7eb',
                                }]}
                                onPress={handleRateCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.outlineButtonText, { color: colors.textPrimary }]}>
                                    {t('rate_dialog.rate_later')}
                                </Text>
                            </TouchableOpacity>

                            {/* Text link: No, thanks */}
                            <TouchableOpacity
                                style={styles.textLink}
                                onPress={handleRateNo}
                                activeOpacity={0.6}
                            >
                                <Text style={[styles.textLinkLabel, { color: colors.textSecondary }]}>
                                    {t('rate_dialog.rate_no')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 24,
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 28,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Manrope-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Manrope-Regular',
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
        color: '#ffffff',
    },
    outlineButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        marginBottom: 8,
    },
    outlineButtonText: {
        fontSize: 15,
        fontFamily: 'Manrope-SemiBold',
    },
    textLink: {
        paddingVertical: 8,
    },
    textLinkLabel: {
        fontSize: 14,
        fontFamily: 'Manrope-Regular',
    },
});
