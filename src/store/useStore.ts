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
    partnerFirstName?: string;
    partnerLastName?: string;
    weddingDay?: string;
    theme: ThemeType;
    hasCompletedOnboarding: boolean;

    profiles: Profile[];
    activeProfileId: string | null;

    notificationsEnabled: boolean;
    notificationTime: string; // HH:mm

    // Rate dialog state
    rateClickCount: number;
    hasRated: boolean;

    // Ad state
    interstitialClickCount: number;

    // Purchase state
    purchases: {
        premium: boolean;
        compatibility: boolean;
        profiles: boolean;
        noAds: boolean;
    };

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
    setPurchase: (productId: string, owned: boolean) => void;
    incrementRateCount: () => number;
    resetRateCount: () => void;
    setHasRated: (value: boolean) => void;
    incrementInterstitialCount: () => number;
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
            partnerFirstName: '',
            partnerLastName: '',
            theme: 'dark',
            hasCompletedOnboarding: false,
            profiles: [],
            activeProfileId: null,
            notificationsEnabled: false,
            notificationTime: '09:00',
            rateClickCount: 0,
            hasRated: false,
            interstitialClickCount: 0,
            purchases: { premium: false, compatibility: false, profiles: false, noAds: false },

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
            setPurchase: (productId: string, owned: boolean) => set((state) => {
                const map: Record<string, keyof AppState['purchases']> = {
                    'numerology_premium': 'premium',
                    'compatibility_numerology': 'compatibility',
                    'numerology_profiles': 'profiles',
                    'numerology_no_ads': 'noAds',
                };
                const key = map[productId];
                if (!key) return state;
                return { purchases: { ...state.purchases, [key]: owned } };
            }),
            incrementRateCount: () => {
                const newCount = get().rateClickCount + 1;
                set({ rateClickCount: newCount });
                return newCount;
            },
            resetRateCount: () => set({ rateClickCount: 0 }),
            setHasRated: (value: boolean) => set({ hasRated: value }),
            incrementInterstitialCount: () => {
                const newCount = get().interstitialClickCount + 1;
                set({ interstitialClickCount: newCount });
                return newCount;
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
