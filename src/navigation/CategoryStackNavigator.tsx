import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import PsychomatrixScreen from '../screens/PsychomatrixScreen';
import BiorhythmsScreen from '../screens/BiorhythmsScreen';
import LifePathScreen from '../screens/LifePathScreen';

export type CategoryStackParamList = {
    Home: undefined;
    CategoryDetail: { categoryId: string };
    Psychomatrix: undefined;
    Biorhythms: undefined;
    LifePath: undefined;
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
        </Stack.Navigator>
    );
}
