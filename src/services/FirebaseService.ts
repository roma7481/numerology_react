import { Platform } from 'react-native';

const PROJECT_ID = 'numerology-c8fb4';

export interface OtherApp {
    id: string;
    name: string;
    imageLink: string;
    link: string;
}

/**
 * Fetches "other apps" from Firestore REST API.
 * Structure: /{lang}/other_apps/{platform}
 * Falls back to 'en' if the requested language has no data.
 */
export const fetchOtherApps = async (language: string = 'en'): Promise<OtherApp[]> => {
    try {
        const platformCollection = Platform.OS === 'ios' ? 'ios' : 'android';
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${language}/other_apps/${platformCollection}`;

        console.log('[OtherApps] Fetching from:', url);

        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`[OtherApps] Failed for ${language}: ${response.status}`);
            if (language !== 'en') {
                console.log('[OtherApps] Falling back to EN');
                return fetchOtherApps('en');
            }
            return [];
        }

        const json = await response.json();

        if (!json.documents) {
            return [];
        }

        const apps: OtherApp[] = json.documents.map((doc: any) => {
            const fields = doc.fields;
            const id = doc.name.split('/').pop();

            return {
                id: id,
                name: fields.name?.stringValue || '',
                imageLink: fields.imageLink?.stringValue || '',
                link: fields.link?.stringValue || '',
            };
        });

        return apps;

    } catch (error) {
        console.error('[OtherApps] Error fetching:', error);
        return [];
    }
};
