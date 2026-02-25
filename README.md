npx expo start --android
Starts the Expo Dev Server and connects to the app via Expo Go or a development build.
Uses Metro bundler to serve JS over the network.
Faster iteration — no native compilation needed each time.
Requires Expo Go app installed on the device/emulator, or a pre-built dev client.
npx expo run:android
Compiles the native Android project locally and installs the APK on the device/emulator.
Runs a full Gradle build (like Android Studio would).
Required when you have custom native code, native modules, or modified android/ directory files.
Slower, but produces a standalone build that doesn't depend on Expo Go.
TL;DR: Use expo start --android for quick JS-only dev with Expo Go. Use expo run:android when you need to build native code (e.g., custom native modules, changed android/ configs).