import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import PsychomatrixScreen from '../screens/PsychomatrixScreen';
import BiorhythmsScreen from '../screens/BiorhythmsScreen';
import LifePathScreen from '../screens/LifePathScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SecondaryBiorhythmsScreen from '../screens/SecondaryBiorhythmsScreen';
import CompatibilityScreen from '../screens/CompatibilityScreen';

export type CategoryStackParamList = {
    Home: undefined;
    CategoryDetail: { categoryId: string };
    Psychomatrix: undefined;
    Biorhythms: undefined;
    LifePath: undefined;
    Paywall: undefined;
    SecondaryBiorhythms: undefined;
    Compatibility: undefined;
};

const Stack = createNativeStackNavigator<CategoryStackParamList>();

export default function CategoryStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
            <Stack.Screen name="Psychomatrix" component={PsychomatrixScreen} />
            <Stack.Screen name="Biorhythms" component={BiorhythmsScreen} />
            <Stack.Screen name="LifePath" component={LifePathScreen} />
            <Stack.Screen name="SecondaryBiorhythms" component={SecondaryBiorhythmsScreen} />
            <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
            <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
    );
}
