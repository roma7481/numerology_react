import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdView, AdFormat } from 'react-native-applovin-max';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adService } from '../../services/AdService';
import { useStore } from '../../store/useStore';

interface BannerAdWrapperProps {
    style?: any;
}

export default function BannerAdWrapper({ style }: BannerAdWrapperProps) {
    const purchases = useStore((s) => s.purchases);
    const isPremium = purchases.premium || purchases.noAds;
    const insets = useSafeAreaInsets();
    const [loaded, setLoaded] = useState(false);

    if (isPremium) return null;

    const provider = adService.getProvider();
    const bottomPad = Math.max(insets.bottom, 8);

    if (provider === 'applovin') {
        return (
            <View style={[
                styles.container,
                { paddingBottom: bottomPad, marginBottom: 6 },
                !loaded && styles.hidden,
                style,
            ]}>
                <AdView
                    adUnitId={adService.getBannerAdUnitId()}
                    adFormat={AdFormat.BANNER}
                    adaptiveBannerEnabled={true}
                    style={styles.appLovinBanner}
                    // @ts-ignore
                    onAdLoaded={() => setLoaded(true)}
                />
            </View>
        );
    }

    // AdMob banner
    return (
        <View style={[
            styles.container,
            { paddingBottom: bottomPad },
            !loaded && styles.hidden,
            style,
        ]}>
            <BannerAd
                unitId={adService.getBannerAdUnitId()}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                onAdLoaded={() => setLoaded(true)}
                onAdFailedToLoad={(error) => console.warn('[BannerAd] Load failed:', error)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    hidden: {
        height: 0,
        overflow: 'hidden',
        opacity: 0,
    },
    appLovinBanner: {
        width: '100%',
        height: 50,
    },
});
