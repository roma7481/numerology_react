/**
 * withFirebaseFixed.js
 *
 * Custom Expo config plugin that ensures the Firebase Crashlytics &
 * Google-services Gradle plugins are applied on every `npx expo prebuild`.
 *
 * Without this, `expo prebuild --clean` will regenerate the android/
 * directory and lose any manual Gradle edits.
 */
const {
    withProjectBuildGradle,
    withAppBuildGradle,
} = require('expo/config-plugins');

/**
 * Step 1: Inject the Firebase classpath dependencies into the
 * root-level android/build.gradle `buildscript.dependencies` block.
 */
function withFirebaseClasspath(config) {
    return withProjectBuildGradle(config, (mod) => {
        if (mod.modResults.language !== 'groovy') return mod;

        const contents = mod.modResults.contents;

        // Google-services classpath
        if (!contents.includes('com.google.gms:google-services')) {
            mod.modResults.contents = contents.replace(
                /dependencies\s*{/,
                `dependencies {
        classpath 'com.google.gms:google-services:4.4.1'
        classpath 'com.google.firebase:firebase-crashlytics-gradle:3.0.6'`
            );
        }

        return mod;
    });
}

/**
 * Step 2: Apply the google-services and crashlytics plugins at
 * the bottom of android/app/build.gradle.
 */
function withFirebaseApplyPlugins(config) {
    return withAppBuildGradle(config, (mod) => {
        if (mod.modResults.language !== 'groovy') return mod;

        const contents = mod.modResults.contents;

        if (!contents.includes("apply plugin: 'com.google.gms.google-services'")) {
            mod.modResults.contents +=
                "\napply plugin: 'com.google.gms.google-services'\n";
        }

        if (!contents.includes("apply plugin: 'com.google.firebase.crashlytics'")) {
            mod.modResults.contents +=
                "apply plugin: 'com.google.firebase.crashlytics'\n";
        }

        return mod;
    });
}

/**
 * Combined plugin — chain both modifications.
 */
module.exports = function withFirebaseFixed(config) {
    config = withFirebaseClasspath(config);
    config = withFirebaseApplyPlugins(config);
    return config;
};
