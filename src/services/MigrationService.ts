import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SharedPreferences from 'expo-shared-preferences';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { useStore, Profile } from '../store/useStore';

const MIGRATION_KEY = 'MIGRATION_COMPLETE';
const MIGRATION_PROFILES_KEY = 'MIGRATION_PROFILES_COMPLETE';
const LEGACY_PREFS_NAME = 'APP_PREFS';
const LEGACY_DB_NAME = 'profiles_1.db';

export class MigrationService {
    static async runMigration() {
        if (Platform.OS !== 'android') return;

        await this.migrateSharedPreferences();
        await this.migrateProfilesContent();
    }

    private static async migrateSharedPreferences() {
        try {
            const isMigrated = await AsyncStorage.getItem(MIGRATION_KEY);
            if (isMigrated === 'true') {
                console.log('[Migration] Prefs: Already migrated.');
                return;
            }

            console.log('[Migration] Starting migration from legacy APP_PREFS...');

            const legacyData: any = {};
            const keysToMigrate = [
                'language',
                'date_of_birth',
                'first_name',
                'last_name',
                'father_name',
                'partner_date_of_birth',
                'wedding_day'
            ];

            for (const key of keysToMigrate) {
                try {
                    const value = await SharedPreferences.getItemAsync(key, { name: LEGACY_PREFS_NAME });
                    if (value) legacyData[key] = value;
                } catch (e) { }
            }

            if (Object.keys(legacyData).length > 0) {
                const { setProfile, completeOnboarding } = useStore.getState();
                const profileUpdate: any = {};
                if (legacyData.language) profileUpdate.language = legacyData.language;
                if (legacyData.date_of_birth) profileUpdate.dateOfBirth = legacyData.date_of_birth;
                if (legacyData.first_name) profileUpdate.firstName = legacyData.first_name;
                if (legacyData.last_name) profileUpdate.lastName = legacyData.last_name;
                if (legacyData.father_name) {
                    profileUpdate.fatherName = legacyData.father_name;
                    profileUpdate.middleName = legacyData.father_name;
                }
                if (legacyData.partner_date_of_birth) profileUpdate.partnerDateOfBirth = legacyData.partner_date_of_birth;
                if (legacyData.wedding_day) profileUpdate.weddingDay = legacyData.wedding_day;

                setProfile(profileUpdate);
                if (profileUpdate.language && profileUpdate.dateOfBirth) {
                    completeOnboarding();
                }
            }

            await AsyncStorage.setItem(MIGRATION_KEY, 'true');
            console.log('[Migration] Prefs: Completed.');

        } catch (error) {
            console.error('[Migration] Prefs Error:', error);
            await AsyncStorage.setItem(MIGRATION_KEY, 'true');
        }
    }

    private static async migrateProfilesContent() {
        try {
            const isMigrated = await AsyncStorage.getItem(MIGRATION_PROFILES_KEY);
            if (isMigrated === 'true') {
                console.log('[Migration] Profiles: Already migrated.');
                return;
            }

            // Expo SQLite looks in documentDirectory/SQLite
            // Legacy Android path is /data/data/com.package/databases/profiles_1.db
            // We can try to copy it if it exists in the legacy location, 
            // but usually expo-sqlite on Android might find it if name matches 
            // and we ensure directory structure.

            console.log('[Migration] Starting profile database migration...');

            const db = await SQLite.openDatabaseSync(LEGACY_DB_NAME);
            const profiles = await db.getAllAsync<any>('SELECT * FROM profiles');

            if (profiles && profiles.length > 0) {
                console.log(`[Migration] Found ${profiles.length} legacy profiles.`);
                const { saveProfile, setActiveProfile } = useStore.getState();

                let selectedId: string | null = null;

                profiles.forEach((p: any) => {
                    const newProfile: Profile = {
                        id: p.profile_id?.toString() || Math.random().toString(),
                        profileName: p.profileName || p.firstName || 'Unnamed',
                        firstName: p.firstName || '',
                        lastName: p.lastName || '',
                        middleName: p.middleName || '',
                        fatherName: p.middleName || '',
                        dateOfBirth: p.dob || '01/01/1990',
                        partnerDateOfBirth: p.partnerDate || p.wedPartnerDate || '',
                        weddingDay: p.wedPartnerDate || ''
                    };
                    saveProfile(newProfile);
                    if (p.isSelected === 1) {
                        selectedId = newProfile.id;
                    }
                });

                if (selectedId) {
                    setActiveProfile(selectedId);
                }
            }

            await AsyncStorage.setItem(MIGRATION_PROFILES_KEY, 'true');
            console.log('[Migration] Profiles: Completed.');
        } catch (error) {
            console.log('[Migration] Profiles Migration Not Found or Error:', error);
            // We set the key anyway to avoid repeated fails if DB doesn't exist
            await AsyncStorage.setItem(MIGRATION_PROFILES_KEY, 'true');
        }
    }
}
