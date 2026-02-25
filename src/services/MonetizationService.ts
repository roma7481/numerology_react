import mobileAds from 'react-native-google-mobile-ads';

class MonetizationService {
    async init() {
        try {
            // 1. Initialize AdMob
            await mobileAds().initialize();
            console.log('Google Mobile Ads initialized successfully');
        } catch (error) {
            console.error('Failed to initialize monetization services:', error);
        }
    }
}

export const monetizationService = new MonetizationService();
