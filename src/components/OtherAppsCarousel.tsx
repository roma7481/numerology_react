import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchOtherApps, OtherApp } from '../services/FirebaseService';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { useTranslation } from '../i18n';

export default function OtherAppsCarousel() {
    const { theme, language } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [apps, setApps] = useState<OtherApp[]>([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const data = await fetchOtherApps(language);
            if (mounted) setApps(data);
        };
        load();
        return () => { mounted = false; };
    }, [language]);

    if (apps.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={[styles.sectionTitle, { color: colors.settingsSectionTitle }]}>
                    MORE APPS
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.settingsSectionTitle} />
            </View>
            <FlatList
                horizontal
                data={apps}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.appItem}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(item.link)}
                    >
                        <View style={styles.iconWrapper}>
                            <Image
                                source={{ uri: item.imageLink }}
                                style={[
                                    styles.appIcon,
                                    {
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                    },
                                ]}
                                resizeMode="cover"
                            />
                            <View style={[styles.adBadge, { backgroundColor: isDark ? '#6366f1' : '#3b82f6' }]}>
                                <Text style={styles.adBadgeText}>AD</Text>
                            </View>
                        </View>
                        <Text
                            style={[styles.appName, { color: colors.textPrimary }]}
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    listContent: {
        paddingRight: 8,
    },
    appItem: {
        width: 80,
        alignItems: 'center',
        marginRight: 14,
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: 8,
    },
    appIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
    },
    adBadge: {
        position: 'absolute',
        top: -4,
        left: -4,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    appName: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 14,
    },
});
