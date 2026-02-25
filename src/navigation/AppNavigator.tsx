import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import CategoryStackNavigator from './CategoryStackNavigator';
import CalendarScreen from '../screens/CalendarScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';

export type RootTabParamList = {
    Home: undefined;
    Readings: undefined;
    Profiles: undefined;
    Settings: undefined;
};

const HIDE_TAB_SCREENS = ['CategoryDetail', 'Psychomatrix', 'Biorhythms', 'LifePath'];

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
    const { theme } = useStore();
    const colors = Colors[theme];

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
                const hideTabBar = HIDE_TAB_SCREENS.includes(routeName);

                return {
                    headerShown: false,
                    tabBarActiveTintColor: colors.tabBarActive,
                    tabBarInactiveTintColor: colors.tabBarInactive,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600' as const,
                        letterSpacing: 0.3,
                    },
                    tabBarStyle: hideTabBar
                        ? { display: 'none' as const }
                        : {
                            backgroundColor: colors.tabBarBackground,
                            borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            elevation: 10,
                            shadowOpacity: 0.05,
                            paddingBottom: Spacing.xs,
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            height: 65,
                            borderTopWidth: 1,
                        },
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: any = 'home';
                        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Readings') iconName = focused ? 'calendar' : 'calendar-outline';
                        else if (route.name === 'Profiles') iconName = focused ? 'people' : 'people-outline';
                        else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                };
            }}
        >
            <Tab.Screen name="Home" component={CategoryStackNavigator} />
            <Tab.Screen name="Readings" component={CalendarScreen} />
            <Tab.Screen name="Profiles" component={ProfilesScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}
