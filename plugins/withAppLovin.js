const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins');

function withAppLovinAndroid(config, { androidSdkKey }) {
    return withAndroidManifest(config, (config) => {
        const mainApplication = config.modResults.manifest.application[0];
        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        // Remove existing AppLovin key if present
        mainApplication['meta-data'] = mainApplication['meta-data'].filter(
            (item) => item.$?.['android:name'] !== 'applovin.sdk.key'
        );

        // Add AppLovin SDK key
        mainApplication['meta-data'].push({
            $: {
                'android:name': 'applovin.sdk.key',
                'android:value': androidSdkKey,
            },
        });

        return config;
    });
}

function withAppLovinIOS(config, { iosSdkKey }) {
    return withInfoPlist(config, (config) => {
        config.modResults.AppLovinSdkKey = iosSdkKey;
        return config;
    });
}

module.exports = function withAppLovin(config, props = {}) {
    const { androidSdkKey, iosSdkKey } = props;

    if (androidSdkKey) {
        config = withAppLovinAndroid(config, { androidSdkKey });
    }
    if (iosSdkKey) {
        config = withAppLovinIOS(config, { iosSdkKey });
    }

    return config;
};
