import { Platform } from 'react-native';
import { InterstitialAd as AdMobInterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AppLovinMAX, InterstitialAd as AppLovinInterstitialAd } from 'react-native-applovin-max';
import { adMobService } from './AdMobService';
import { purchaseService } from './PurchaseService';
import { useStore } from '../store/useStore';

// ─── Ad Unit IDs ────────────────────────────────────────────────
const AD_IDS = {
    admob: {
        banner: Platform.OS === 'android'
            ? 'ca-app-pub-1763151471947181/4566464616'
            : 'ca-app-pub-1763151471947181/2896133568',
        interstitial: Platform.OS === 'android'
            ? 'ca-app-pub-1763151471947181/6994135642'
            : 'ca-app-pub-1763151471947181/1583051892',
        native: Platform.OS === 'android'
            ? 'ca-app-pub-1763151471947181/5757182696'
            : 'ca-app-pub-1763151471947181/5330725218',
    },
    applovin: {
        banner: Platform.OS === 'android'
            ? '09943a54a91a68c9'
            : '6f6c6898944a7992',
        interstitial: Platform.OS === 'android'
            ? '2aea30fcec135c50'
            : '2099aa9ec2177d1c',
        mrec: Platform.OS === 'android'
            ? 'dd00ad848c70ea2f'
            : '1d58d48db5b5f50f',
    },
};

const APPLOVIN_SDK_KEY = 'qnL2sJHf5VT2RFA26vgN2heXM-Lpfdo4FPKD_09zl9TnHlPVSmGcSRPIQKwcsZwKIWCJZ62BtOONX_7JNmPDX_';
const INTERSTITIAL_FREQUENCY = 6;

export type AdProvider = 'admob' | 'applovin';

class AdService {
    private provider: AdProvider = 'admob';
    private initialized = false;
    private interstitialAd: AdMobInterstitialAd | null = null;
    private interstitialLoaded = false;
    private interstitialLoading = false;
    private onInterstitialClosed: (() => void) | null = null;
    private appLovinInitialized = false;

    constructor() {
        this.determineProvider();
    }

    private async determineProvider() {
        try {
            const Cellular = await import('expo-cellular');
            const country = Cellular.isoCountryCode?.toLowerCase();
            console.log('[AdService] SIM country:', country);
            if (country === 'ru') {
                this.provider = 'applovin';
            }
        } catch (e) {
            console.warn('[AdService] Could not read SIM country, defaulting to AdMob');
        }
    }

    getProvider(): AdProvider {
        return this.provider;
    }

    isRussianUser(): boolean {
        return this.provider === 'applovin';
    }

    isPremium(): boolean {
        const { purchases } = useStore.getState();
        return purchases.premium || purchases.noAds;
    }

    async init(): Promise<void> {
        if (this.initialized) return;
        if (this.isPremium()) {
            console.log('[AdService] User is premium, skipping ad init');
            return;
        }

        try {
            // Wait for provider detection to complete
            await this.determineProvider();

            if (this.provider === 'applovin') {
                await this.initAppLovin();
            } else {
                await this.initAdMob();
            }

            this.initialized = true;
            console.log('[AdService] Initialized with provider:', this.provider);

            // Preload first interstitial
            this.loadInterstitial();
        } catch (error) {
            console.error('[AdService] Init failed:', error);
        }

        // Also init IAP
        await purchaseService.init();
    }

    private async initAdMob(): Promise<void> {
        await adMobService.checkConsent();
    }

    private async initAppLovin(): Promise<void> {
        try {
            const configuration = await AppLovinMAX.initialize(APPLOVIN_SDK_KEY);
            console.log('[AdService] AppLovin MAX initialized', configuration);
            this.appLovinInitialized = true;

            // Set up event listeners using the new v9.5 InterstitialAd API
            AppLovinInterstitialAd.addAdLoadedEventListener(() => {
                console.log('[AdService] AppLovin interstitial loaded');
                this.interstitialLoaded = true;
                this.interstitialLoading = false;
            });
            AppLovinInterstitialAd.addAdLoadFailedEventListener((error: any) => {
                console.warn('[AdService] AppLovin interstitial load failed:', error);
                this.interstitialLoaded = false;
                this.interstitialLoading = false;
            });
            AppLovinInterstitialAd.addAdHiddenEventListener(() => {
                console.log('[AdService] AppLovin interstitial hidden');
                this.interstitialLoaded = false;
                if (this.onInterstitialClosed) {
                    this.onInterstitialClosed();
                    this.onInterstitialClosed = null;
                }
                this.loadInterstitial();
            });
            AppLovinInterstitialAd.addAdFailedToDisplayEventListener(() => {
                console.warn('[AdService] AppLovin interstitial display failed');
                this.interstitialLoaded = false;
                if (this.onInterstitialClosed) {
                    this.onInterstitialClosed();
                    this.onInterstitialClosed = null;
                }
                this.loadInterstitial();
            });
        } catch (e) {
            console.error('[AdService] AppLovin init error:', e);
        }
    }

    // ─── Interstitial Ads ───────────────────────────────────────
    checkInterstitial(onClose: () => void): void {
        if (this.isPremium()) {
            onClose();
            return;
        }

        const { interstitialClickCount, incrementInterstitialCount } = useStore.getState();
        const newCount = incrementInterstitialCount();

        if (newCount % INTERSTITIAL_FREQUENCY === 0 && this.interstitialLoaded) {
            this.showInterstitial(onClose);
        } else {
            onClose();
        }
    }

    loadInterstitial(): void {
        if (this.isPremium() || this.interstitialLoading) return;

        if (this.provider === 'applovin') {
            this.loadAppLovinInterstitial();
        } else {
            this.loadAdMobInterstitial();
        }
    }

    private loadAdMobInterstitial(): void {
        try {
            this.interstitialLoading = true;
            this.interstitialAd = AdMobInterstitialAd.createForAdRequest(AD_IDS.admob.interstitial);

            this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
                console.log('[AdService] AdMob interstitial loaded');
                this.interstitialLoaded = true;
                this.interstitialLoading = false;
            });

            this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
                console.warn('[AdService] AdMob interstitial load error:', error);
                this.interstitialLoaded = false;
                this.interstitialLoading = false;
            });

            this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
                console.log('[AdService] AdMob interstitial closed');
                this.interstitialLoaded = false;
                if (this.onInterstitialClosed) {
                    this.onInterstitialClosed();
                    this.onInterstitialClosed = null;
                }
                // Preload next
                this.loadInterstitial();
            });

            this.interstitialAd.load();
        } catch (e) {
            console.error('[AdService] AdMob interstitial setup error:', e);
            this.interstitialLoading = false;
        }
    }

    private loadAppLovinInterstitial(): void {
        if (!this.appLovinInitialized) return;
        try {
            this.interstitialLoading = true;
            AppLovinInterstitialAd.loadAd(AD_IDS.applovin.interstitial);
        } catch (e) {
            console.error('[AdService] AppLovin interstitial load error:', e);
            this.interstitialLoading = false;
        }
    }

    showInterstitial(onAdClosed?: () => void): void {
        this.onInterstitialClosed = onAdClosed || null;

        try {
            if (this.provider === 'applovin' && this.appLovinInitialized) {
                AppLovinInterstitialAd.showAd(AD_IDS.applovin.interstitial);
            } else if (this.interstitialAd) {
                this.interstitialAd.show();
            } else {
                // Ad not available, don't block the user
                if (onAdClosed) onAdClosed();
            }
        } catch (e) {
            console.error('[AdService] Show interstitial error:', e);
            // Never block the user
            if (onAdClosed) onAdClosed();
            this.loadInterstitial();
        }
    }

    // ─── Getters for ad unit IDs ────────────────────────────────
    getBannerAdUnitId(): string {
        return this.provider === 'applovin'
            ? AD_IDS.applovin.banner
            : AD_IDS.admob.banner;
    }

    getNativeAdUnitId(): string {
        return this.provider === 'applovin'
            ? AD_IDS.applovin.mrec
            : AD_IDS.admob.native;
    }

    getInterstitialAdUnitId(): string {
        return this.provider === 'applovin'
            ? AD_IDS.applovin.interstitial
            : AD_IDS.admob.interstitial;
    }
}

export const adService = new AdService();
