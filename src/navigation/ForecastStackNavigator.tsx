import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/CalendarScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';

export type ForecastStackParamList = {
    ForecastMain: undefined;
    CategoryDetail: { categoryId: string };
};

const Stack = createNativeStackNavigator<ForecastStackParamList>();

export default function ForecastStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="ForecastMain" component={CalendarScreen} />
            <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        </Stack.Navigator>
    );
}
