import React, { useEffect, useState, useCallback } from 'react';
import {
    ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { purchaseService } from '../services/PurchaseService';
import { useTranslation } from '../i18n';
import type { Product } from 'react-native-iap';

const PRODUCT_CONFIG = [
    {
        productId: 'numerology_premium',
        storeKey: 'premium' as const,
        icon: 'diamond-stone',
        iconSet: 'material' as const,
        iconColor: '#8c2bee',
        iconBg: '#E6E6FA',
        iconBgDark: 'rgba(140, 43, 238, 0.2)',
        featured: true,
    },
    {
        productId: 'compatibility_numerology',
        storeKey: 'compatibility' as const,
        icon: 'heart',
        iconSet: 'ionicons' as const,
        iconColor: '#f97316',
        iconBg: '#fff7ed',
        iconBgDark: 'rgba(249, 115, 22, 0.2)',
        featured: false,
    },
    {
        productId: 'numerology_profiles',
        storeKey: 'profiles' as const,
        icon: 'person-add',
        iconSet: 'ionicons' as const,
        iconColor: '#3b82f6',
        iconBg: '#eff6ff',
        iconBgDark: 'rgba(59, 130, 246, 0.2)',
        featured: false,
    },
    {
        productId: 'numerology_no_ads',
        storeKey: 'noAds' as const,
        icon: 'ban',
        iconSet: 'ionicons' as const,
        iconColor: '#10b981',
        iconBg: '#ecfdf5',
        iconBgDark: 'rgba(16, 185, 129, 0.2)',
        featured: false,
    },
];

const TITLE_MAP: Record<string, string> = {
    numerology_premium: 'paywall.full_access',
    compatibility_numerology: 'paywall.compatibility',
    numerology_profiles: 'paywall.extra_profiles',
    numerology_no_ads: 'paywall.ad_removal',
};

const DESC_MAP: Record<string, string> = {
    numerology_premium: 'paywall.full_access_desc',
    compatibility_numerology: 'paywall.compatibility_desc',
    numerology_profiles: 'paywall.extra_profiles_desc',
    numerology_no_ads: 'paywall.ad_removal_desc',
};

export default function PaywallScreen() {
    const { theme, purchases } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            await purchaseService.init();
            setProducts(purchaseService.getProducts());
        } catch (e) {
            console.error('Failed to load products:', e);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = useCallback(async (productId: string) => {
        setPurchasing(productId);
        try {
            await purchaseService.purchase(productId);
        } catch (e: any) {
            if (e.code !== 'E_USER_CANCELLED') {
                Alert.alert('Purchase Error', e.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setPurchasing(null);
        }
    }, []);

    const handleRestore = useCallback(async () => {
        setPurchasing('restore');
        try {
            await purchaseService.restore();
            Alert.alert(t('paywall.restore_done_title') || 'Restore Complete', t('paywall.restore_done_msg') || 'Your purchases have been restored.');
        } catch (e) {
            Alert.alert('Error', 'Failed to restore purchases.');
        } finally {
            setPurchasing(null);
        }
    }, [t]);

    const getPrice = (productId: string): string => {
        const product = products.find(p => p.id === productId);
        return product?.displayPrice || '—';
    };

    const isOwned = (storeKey: string): boolean => {
        if (purchases.premium) return true; // Premium unlocks all
        return purchases[storeKey as keyof typeof purchases] || false;
    };

    return (
        <ScrollView style={styles.container} bounces={false}>
            <LinearGradient colors={colors.backgroundGradient} style={styles.fullBackground}>
                <View style={[styles.content, { paddingTop: insets.top }]}>

                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <Ionicons name="close" size={24} color={colors.textTitle} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: '#8c2bee' }]}>
                            {t('paywall.title') || 'PREMIUM'}
                        </Text>
                        <TouchableOpacity onPress={handleRestore} style={styles.headerBtn} disabled={purchasing === 'restore'}>
                            {purchasing === 'restore' ? (
                                <ActivityIndicator size="small" color="#8c2bee" />
                            ) : (
                                <Text style={[styles.restoreText, { color: '#8c2bee' }]}>
                                    {t('paywall.restore') || 'Restore'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Hero */}
                    <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.heroSection}>
                        <View style={[styles.heroIcon, { backgroundColor: isDark ? 'rgba(140,43,238,0.2)' : 'rgba(140,43,238,0.05)' }]}>
                            <MaterialCommunityIcons name="auto-fix" size={32} color="#8c2bee" />
                        </View>
                        <Text style={[styles.headline, { color: colors.textTitle }]}>
                            {t('paywall.headline') || 'Unlock Your Sacred'}
                        </Text>
                        <Text style={styles.headlineAccent}>
                            {t('paywall.headline_accent') || 'Numbers'}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t('paywall.subtitle') || 'Unlock ancient wisdom with a one-time purchase. No subscriptions, just clarity.'}
                        </Text>
                    </Animated.View>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <View style={styles.productsSection}>
                            {PRODUCT_CONFIG.map((config, index) => {
                                const owned = isOwned(config.storeKey);
                                const price = getPrice(config.productId);
                                const title = t(TITLE_MAP[config.productId] as any) || config.productId;
                                const desc = t(DESC_MAP[config.productId] as any) || '';

                                if (config.featured) {
                                    // Featured Full Access card
                                    return (
                                        <Animated.View key={config.productId} entering={FadeInUp.duration(400).delay(200)}>
                                            {/* Glow border */}
                                            <View style={styles.featuredGlow}>
                                                <LinearGradient
                                                    colors={['rgba(140,43,238,0.3)', 'rgba(212,175,55,0.3)']}
                                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                                    style={styles.featuredGlowGradient}
                                                />
                                            </View>
                                            <View style={[styles.featuredCard, {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
                                                borderColor: isDark ? 'rgba(140,43,238,0.3)' : 'rgba(140,43,238,0.1)',
                                            }]}>
                                                <View style={styles.featuredHeader}>
                                                    <View style={styles.featuredLeft}>
                                                        <View style={[styles.productIcon, {
                                                            backgroundColor: isDark ? config.iconBgDark : config.iconBg,
                                                        }]}>
                                                            <MaterialCommunityIcons name="diamond-stone" size={22} color={config.iconColor} />
                                                        </View>
                                                        <View>
                                                            <Text style={[styles.featuredTitle, { color: colors.textTitle }]}>
                                                                {title}
                                                            </Text>
                                                            <Text style={[styles.bestValueBadge, { color: '#8c2bee' }]}>
                                                                {t('paywall.best_value') || 'BEST VALUE'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {owned ? (
                                                        <View style={styles.purchasedBadge}>
                                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                                            <Text style={styles.purchasedText}>{t('paywall.purchased') || 'Purchased'}</Text>
                                                        </View>
                                                    ) : (
                                                        <Text style={[styles.featuredPrice, { color: colors.textTitle }]}>
                                                            {price}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={[styles.featuredDesc, { color: colors.textSecondary }]}>
                                                    {desc}
                                                </Text>
                                                {!owned && (
                                                    <>
                                                        <TouchableOpacity
                                                            style={styles.ctaButton}
                                                            activeOpacity={0.8}
                                                            onPress={() => handlePurchase(config.productId)}
                                                            disabled={!!purchasing}
                                                        >
                                                            {purchasing === config.productId ? (
                                                                <ActivityIndicator size="small" color="#fff" />
                                                            ) : (
                                                                <>
                                                                    <Text style={styles.ctaText}>
                                                                        {t('paywall.unlock_forever') || 'Unlock Forever'}
                                                                    </Text>
                                                                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                                                                </>
                                                            )}
                                                        </TouchableOpacity>
                                                        <Text style={[styles.oneTimeNote, { color: colors.textSecondary }]}>
                                                            {t('paywall.one_time_note') || 'One-time payment • Lifetime access'}
                                                        </Text>
                                                    </>
                                                )}
                                            </View>
                                        </Animated.View>
                                    );
                                }

                                // Standard product card
                                return (
                                    <Animated.View key={config.productId} entering={FadeInUp.duration(400).delay(300 + index * 80)}>
                                        <TouchableOpacity
                                            style={[styles.productCard, {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                            }]}
                                            activeOpacity={owned ? 1 : 0.7}
                                            onPress={() => !owned && handlePurchase(config.productId)}
                                            disabled={owned || !!purchasing}
                                        >
                                            <View style={styles.productLeft}>
                                                <View style={[styles.productIcon, {
                                                    backgroundColor: isDark ? config.iconBgDark : config.iconBg,
                                                }]}>
                                                    {config.iconSet === 'material' ? (
                                                        <MaterialCommunityIcons name={config.icon as any} size={22} color={config.iconColor} />
                                                    ) : (
                                                        <Ionicons name={config.icon as any} size={22} color={config.iconColor} />
                                                    )}
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.productTitle, { color: colors.textTitle }]}>
                                                        {title}
                                                    </Text>
                                                    <Text style={[styles.productDesc, { color: colors.textSecondary }]}>
                                                        {desc}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.productRight}>
                                                {purchasing === config.productId ? (
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                ) : owned ? (
                                                    <View style={styles.purchasedBadge}>
                                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                                    </View>
                                                ) : (
                                                    <>
                                                        <Text style={[styles.productPrice, { color: colors.textTitle }]}>
                                                            {price}
                                                        </Text>
                                                        <View style={[styles.oneTimeBadge, {
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                        }]}>
                                                            <Text style={[styles.oneTimeBadgeText, { color: colors.textSecondary }]}>
                                                                {t('paywall.one_time') || 'ONE-TIME'}
                                                            </Text>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    )}

                    {/* Footer */}
                    <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.footer}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://cbeeapps.wixsite.com/numerologyprivacy')}>
                            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>
                                {t('paywall.terms') || 'Terms of Service'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://cbeeapps.wixsite.com/numerologyprivacy')}>
                            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>
                                {t('paywall.privacy') || 'Privacy Policy'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={{ height: insets.bottom + 20 }} />
                </View>
            </LinearGradient>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fullBackground: { flex: 1, minHeight: '100%' },
    content: { paddingBottom: Spacing.huge },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.s,
    },
    headerBtn: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 12,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    restoreText: {
        fontSize: 14,
        fontFamily: 'Manrope-Bold',
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
        paddingTop: Spacing.m,
    },
    heroIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    headline: {
        fontSize: 30,
        fontFamily: 'NotoSerif-Regular',
        textAlign: 'center',
        lineHeight: 38,
    },
    headlineAccent: {
        fontSize: 36,
        fontFamily: 'NotoSerif-Italic',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#D4AF37',
        marginBottom: Spacing.m,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Manrope-Regular',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },

    // Products
    productsSection: {
        paddingHorizontal: Spacing.l,
        gap: Spacing.m,
    },

    // Featured card
    featuredGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: BorderRadius.m + 2,
        overflow: 'hidden',
        opacity: 0.6,
    },
    featuredGlowGradient: {
        flex: 1,
        borderRadius: BorderRadius.m + 2,
    },
    featuredCard: {
        padding: Spacing.l,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.s,
    },
    featuredLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    featuredTitle: {
        fontSize: 18,
        fontFamily: 'Manrope-Bold',
    },
    bestValueBadge: {
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    featuredPrice: {
        fontSize: 20,
        fontFamily: 'Manrope-Bold',
    },
    featuredDesc: {
        fontSize: 13,
        fontFamily: 'Manrope-Regular',
        lineHeight: 20,
        marginBottom: Spacing.m,
    },

    // CTA Button
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#8c2bee',
        paddingVertical: 14,
        borderRadius: BorderRadius.s,
        shadowColor: '#8c2bee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Manrope-Bold',
    },
    oneTimeNote: {
        fontSize: 10,
        fontFamily: 'Manrope-Regular',
        textAlign: 'center',
        marginTop: Spacing.s,
    },

    // Product card (non-featured)
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.l,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
    },
    productIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
        flex: 1,
    },
    productTitle: {
        fontSize: 15,
        fontFamily: 'Manrope-Bold',
    },
    productDesc: {
        fontSize: 11,
        fontFamily: 'Manrope-Regular',
        marginTop: 2,
    },
    productRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        marginLeft: Spacing.m,
    },
    productPrice: {
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
    },
    oneTimeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    oneTimeBadgeText: {
        fontSize: 9,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    // Purchased badge
    purchasedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    purchasedText: {
        fontSize: 13,
        fontFamily: 'Manrope-Bold',
        color: '#10b981',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xl,
        marginTop: Spacing.xxl,
    },
    footerLink: {
        fontSize: 10,
        fontFamily: 'Manrope-Regular',
        textDecorationLine: 'underline',
    },
});
