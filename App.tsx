import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useStore } from './src/store/useStore';
import { MigrationService } from './src/services/MigrationService';
import { NotificationService } from './src/services/NotificationService';
import { Colors } from './src/theme/Colors';
import { analyticsService, installGlobalErrorHandler } from './src/services/AnalyticsService';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts, NotoSerif_400Regular, NotoSerif_700Bold } from '@expo-google-fonts/noto-serif';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

export default function App() {
  const { hasCompletedOnboarding, theme } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const colors = Colors[theme];
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  const [fontsLoaded] = useFonts({
    'NotoSerif-Regular': NotoSerif_400Regular,
    'NotoSerif-Bold': NotoSerif_700Bold,
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-Medium': Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    // Install Crashlytics global error handler once
    installGlobalErrorHandler();
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await MigrationService.runMigration();
      } catch (e) {
        console.error('Migration failed', e);
        if (e instanceof Error) {
          analyticsService.recordError(e, 'MigrationService.runMigration');
        }
      } finally {
        if (fontsLoaded) {
          setIsInitializing(false);
        }
      }
    }
    init();
  }, [fontsLoaded]);

  if (isInitializing || !fontsLoaded) return null; // Or a splash screen

  const onNavigationReady = () => {
    routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
  };

  const onNavigationStateChange = () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    if (currentRouteName && previousRouteName !== currentRouteName) {
      analyticsService.logScreenView(currentRouteName);
    }

    routeNameRef.current = currentRouteName;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <NavigationContainer
          ref={navigationRef}
          onReady={onNavigationReady}
          onStateChange={onNavigationStateChange}
        >
          {hasCompletedOnboarding ? <AppNavigator /> : <OnboardingScreen />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

