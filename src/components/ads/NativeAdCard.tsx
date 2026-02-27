import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import {
    NativeAd,
    NativeAdView,
    NativeMediaView,
    NativeAsset,
    NativeAssetType,
} from 'react-native-google-mobile-ads';
import { adService } from '../../services/AdService';
import { AdView as AppLovinAdView, AdFormat as AppLovinAdFormat } from 'react-native-applovin-max';
import { useStore } from '../../store/useStore';
import { Colors } from '../../theme/Colors';
import { Spacing, BorderRadius } from '../../theme/Spacing';

interface NativeAdCardProps {
    variant?: 'default' | 'compact';
    style?: any;
}

export default function NativeAdCard({ variant = 'default', style }: NativeAdCardProps) {
    const purchases = useStore((s) => s.purchases);
    const theme = useStore((s) => s.theme);
    const isPremium = purchases.premium || purchases.noAds;
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    if (isPremium) return null;

    const provider = adService.getProvider();

    if (provider === 'applovin') {
        return <AppLovinMREC isDark={isDark} colors={colors} style={style} />;
    }

    return <AdMobNativeAd variant={variant} isDark={isDark} colors={colors} style={style} />;
}

// ─── AppLovin MREC ──────────────────────────────────────────────
function AppLovinMREC({ isDark, colors, style }: { isDark: boolean; colors: any; style?: any }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <View style={[styles.mrecContainer, style, !loaded && { height: 0, overflow: 'hidden' as const }]}>
            <AppLovinAdView
                adUnitId={adService.getNativeAdUnitId()}
                adFormat={AppLovinAdFormat.MREC}
                style={styles.mrec}
                onAdLoaded={() => {
                    console.log('[NativeAdCard] AppLovin MREC loaded');
                    setLoaded(true);
                }}
                onAdLoadFailed={(error: any) => {
                    console.warn('[NativeAdCard] AppLovin MREC load failed:', error);
                }}
            />
        </View>
    );
}

// ─── AdMob Native Ad ────────────────────────────────────────────
function AdMobNativeAd({ variant, isDark, colors, style }: {
    variant: 'default' | 'compact'; isDark: boolean; colors: any; style?: any;
}) {
    const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        let ad: NativeAd | null = null;

        (async () => {
            try {
                ad = await NativeAd.createForAdRequest(adService.getNativeAdUnitId());
                if (mounted) {
                    setNativeAd(ad);
                }
            } catch (e) {
                console.warn('[NativeAdCard] AdMob load error:', e);
                if (mounted) setError(true);
            }
        })();

        return () => {
            mounted = false;
            if (ad) {
                try { ad.destroy(); } catch { /* ignore */ }
            }
        };
    }, []);

    if (error || !nativeAd) return null;

    // ─── Default layout: full card with header, body, image, CTA ───
    if (variant === 'default') {
        return (
            <View style={[
                styles.card,
                {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderColor: colors.cardBorder,
                    shadowColor: isDark ? 'transparent' : '#000',
                },
                style,
            ]}>
                <NativeAdView nativeAd={nativeAd} style={{ width: '100%' }}>
                    {/* Header row: Ad badge + Headline */}
                    <View style={styles.headerRow}>
                        <View style={styles.adBadge}>
                            <Text style={styles.adBadgeText}>Ad</Text>
                        </View>
                        <NativeAsset assetType={NativeAssetType.HEADLINE}>
                            <Text style={[styles.headline, { color: colors.textTitle }]} numberOfLines={1}>
                                {nativeAd.headline}
                            </Text>
                        </NativeAsset>
                    </View>

                    {/* Body text */}
                    {nativeAd.body ? (
                        <NativeAsset assetType={NativeAssetType.BODY}>
                            <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
                                {nativeAd.body}
                            </Text>
                        </NativeAsset>
                    ) : null}

                    {/* Media */}
                    {nativeAd.mediaContent ? (
                        <View style={[styles.mediaContainer, {
                            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        }]}>
                            <NativeMediaView style={styles.media} />
                        </View>
                    ) : null}

                    {/* CTA button */}
                    <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                        <View style={[styles.ctaButton, { backgroundColor: isDark ? '#a78bfa' : '#7c3aed' }]}>
                            <Text style={styles.ctaText}>
                                {(nativeAd.callToAction || 'Learn More').toUpperCase()}
                            </Text>
                        </View>
                    </NativeAsset>
                </NativeAdView>
            </View>
        );
    }

    // ─── Compact layout: horizontal with small image ───
    return (
        <View style={[
            styles.compactCard,
            {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                borderColor: colors.cardBorder,
                shadowColor: isDark ? 'transparent' : '#000',
            },
            style,
        ]}>
            <NativeAdView nativeAd={nativeAd} style={{ width: '100%' }}>
                {/* Ad badge */}
                <View style={styles.compactBadgeRow}>
                    <View style={styles.adBadge}>
                        <Text style={styles.adBadgeText}>Ad</Text>
                    </View>
                </View>

                {/* Horizontal row: image + text */}
                <View style={styles.compactRow}>
                    {/* Small square media */}
                    {nativeAd.mediaContent ? (
                        <View style={[styles.compactMediaWrap, {
                            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                        }]}>
                            <NativeMediaView style={styles.compactMedia} />
                        </View>
                    ) : null}

                    {/* Text column */}
                    <View style={styles.compactTextCol}>
                        <NativeAsset assetType={NativeAssetType.HEADLINE}>
                            <Text style={[styles.compactHeadline, { color: colors.textTitle }]} numberOfLines={2}>
                                {nativeAd.headline}
                            </Text>
                        </NativeAsset>

                        {nativeAd.body ? (
                            <NativeAsset assetType={NativeAssetType.BODY}>
                                <Text style={[styles.compactBody, { color: colors.textSecondary }]} numberOfLines={2}>
                                    {nativeAd.body}
                                </Text>
                            </NativeAsset>
                        ) : null}

                        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                            <View style={[styles.compactCta, { backgroundColor: isDark ? '#f87171' : '#e74c5e' }]}>
                                <Text style={styles.compactCtaText}>
                                    {nativeAd.callToAction || 'Learn More'}
                                </Text>
                            </View>
                        </NativeAsset>
                    </View>
                </View>
            </NativeAdView>
        </View>
    );
}

const styles = StyleSheet.create({
    // ─── MREC (AppLovin) ────────────────────────
    mrecContainer: {
        alignItems: 'center',
        marginVertical: Spacing.m,
    },
    mrec: {
        width: 300,
        height: 250,
    },

    // ─── Default card ───────────────────────────
    card: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },

    // ─── Compact card ───────────────────────────
    compactCard: {
        borderRadius: 12,
        padding: 16,
        marginVertical: Spacing.s,
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },

    // Header: [Ad] badge + headline
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    adBadge: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
        alignSelf: 'flex-start',
    },
    adBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
    },
    headline: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Manrope-Bold',
    },

    // Body
    body: {
        fontSize: 14,
        fontFamily: 'Manrope-Regular',
        lineHeight: 20,
        marginBottom: 12,
    },

    // Media container + view (matches moon_calendar pattern)
    mediaContainer: {
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1,
    },
    media: {
        width: '100%',
        aspectRatio: 1.77, // 16:9
    },

    // CTA button — pill shape, 45px tall
    ctaButton: {
        height: 45,
        paddingHorizontal: 28,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    ctaText: {
        color: '#fff',
        fontFamily: 'Manrope-Bold',
        fontSize: 14,
        letterSpacing: 0.5,
    },

    // ─── Compact-specific styles ────────────────
    compactBadgeRow: {
        marginBottom: 8,
    },
    compactRow: {
        flexDirection: 'row',
    },
    compactMediaWrap: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
    },
    compactMedia: {
        width: 100,
        height: 100,
    },
    compactTextCol: {
        flex: 1,
        justifyContent: 'center',
    },
    compactHeadline: {
        fontSize: 14,
        fontFamily: 'Manrope-Bold',
        marginBottom: 4,
    },
    compactBody: {
        fontSize: 12,
        fontFamily: 'Manrope-Regular',
        lineHeight: 17,
        marginBottom: 8,
    },
    compactCta: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    compactCtaText: {
        color: '#fff',
        fontFamily: 'Manrope-Bold',
        fontSize: 12,
    },
});
