import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeType } from '../theme/Colors';

export interface Profile {
    id: string;
    profileName: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    fatherName?: string;
    dateOfBirth: string; // DD/MM/YYYY
    partnerDateOfBirth?: string;
    weddingDay?: string;
}

export interface AppState {
    language: string;
    profileName: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    fatherName?: string; // Kept for legacy compatibility
    dateOfBirth: string; // DD/MM/YYYY
    partnerDateOfBirth?: string;
    weddingDay?: string;
    theme: ThemeType;
    hasCompletedOnboarding: boolean;

    profiles: Profile[];
    activeProfileId: string | null;

    notificationsEnabled: boolean;
    notificationTime: string; // HH:mm

    // Actions
    setLanguage: (lang: string) => void;
    setProfile: (profile: Partial<AppState>) => void;
    setTheme: (theme: ThemeType) => void;
    completeOnboarding: () => void;

    saveProfile: (profile: Profile) => void;
    deleteProfile: (id: string) => void;
    setActiveProfile: (id: string) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setNotificationTime: (time: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            language: 'en',
            profileName: '',
            firstName: '',
            lastName: '',
            middleName: '',
            dateOfBirth: '01/01/1990',
            theme: 'dark',
            hasCompletedOnboarding: false,
            profiles: [],
            activeProfileId: null,
            notificationsEnabled: false,
            notificationTime: '09:00',

            setLanguage: (lang) => set({ language: lang }),
            setProfile: (profile) => set((state) => ({ ...state, ...profile })),
            setTheme: (theme) => set({ theme }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),

            saveProfile: (profile) => set((state) => {
                const exists = state.profiles.find(p => p.id === profile.id);
                const newProfiles = exists
                    ? state.profiles.map(p => p.id === profile.id ? profile : p)
                    : [...state.profiles, profile];
                return { profiles: newProfiles };
            }),

            deleteProfile: (id) => set((state) => ({
                profiles: state.profiles.filter(p => p.id !== id),
                activeProfileId: state.activeProfileId === id ? null : state.activeProfileId
            })),

            setActiveProfile: (id) => set((state) => {
                const profile = state.profiles.find(p => p.id === id);
                if (!profile) return state;
                return {
                    activeProfileId: id,
                    profileName: profile.profileName,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    middleName: profile.middleName,
                    fatherName: profile.fatherName,
                    dateOfBirth: profile.dateOfBirth,
                    partnerDateOfBirth: profile.partnerDateOfBirth,
                    weddingDay: profile.weddingDay
                };
            }),

            setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),
            setNotificationTime: (time: string) => set({ notificationTime: time }),
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
