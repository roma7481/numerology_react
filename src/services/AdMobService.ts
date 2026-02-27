import { Platform } from 'react-native';
import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

class AdMobService {
    private initialized = false;

    /**
     * Initialize the Mobile Ads SDK.
     * This should be called *after* consent is gathered or determined not required.
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;
        try {
            await mobileAds().initialize();
            console.log('[AdMob] SDK initialized');
            this.initialized = true;
        } catch (error) {
            console.error('[AdMob] Failed to initialize SDK:', error);
        }
    }

    /**
     * Request consent information and show form if necessary (UMP / GDPR).
     * Also handles iOS ATT prompt.
     * Returns true if ads can be shown (consent obtained or not required).
     */
    async checkConsent(debug = false): Promise<boolean> {
        try {
            // 1. iOS ATT prompt
            if (Platform.OS === 'ios') {
                try {
                    const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
                    const { status } = await requestTrackingPermissionsAsync();
                    console.log('[AdMob] ATT Status:', status);
                } catch (e) {
                    console.warn('[AdMob] ATT prompt failed:', e);
                }
            }

            // 2. Configure debug options if needed (for testing in non-EEA regions)
            const consentOptions: any = {};
            if (debug) {
                await AdsConsent.reset(); // Force reset to clear cached status
                consentOptions.debugGeography = 1; // 1 = EEA
                consentOptions.testDeviceIdentifiers = ['9F0BADB68CF2DEC5D8CCB2F52DD43672'];
                console.log('[AdMob] Debug Geography set to EEA (Reset + requestInfoUpdate)');
            }

            // 3. Request Consent Info Update
            const consentInfo = await AdsConsent.requestInfoUpdate(consentOptions);
            console.log('[AdMob] Consent Info:', consentInfo);

            // 4. Show form if required
            if (
                consentInfo.isConsentFormAvailable &&
                consentInfo.status === AdsConsentStatus.REQUIRED
            ) {
                const result = await AdsConsent.showForm();
                console.log('[AdMob] Form Result:', result);
            }

            // 5. Verify Final Status
            const updatedConsentInfo = await AdsConsent.requestInfoUpdate();
            const finalStatus = updatedConsentInfo.status;
            console.log('[AdMob] Final Consent Status:', finalStatus);

            // 6. Initialize SDK — UMP handles "npa" flags internally
            // We initialize regardless, but return whether personalized ads are available
            if (
                finalStatus === AdsConsentStatus.OBTAINED ||
                finalStatus === AdsConsentStatus.NOT_REQUIRED
            ) {
                await this.initialize();
                return true;
            }

            // Still initialize so at least non-personalized ads work
            await this.initialize();
            return true;

        } catch (error) {
            console.error('[AdMob] Consent Error:', error);
            // Fallback: Initialize anyway so at least non-personalized might work
            await this.initialize();
            return false;
        }
    }

    /**
     * Legacy init() — now delegates to checkConsent for proper flow.
     */
    async init(): Promise<void> {
        await this.checkConsent();
    }
}

export const adMobService = new AdMobService();
