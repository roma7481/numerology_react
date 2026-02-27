import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Alert,
    Platform,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, Profile } from '../store/useStore';
import { useFocusEffect } from '@react-navigation/native';
import { ProfileModal } from '../components/ProfileModal';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';
import { getZodiacSign, formatProfileDate } from '../utils/ZodiacUtils';
import { useTranslation } from '../i18n';

export default function ProfilesScreen({ navigation, route }: any) {
    const { theme, profiles, language, activeProfileId, setActiveProfile, deleteProfile, saveProfile } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

    const handleSwitchProfile = (id: string) => {
        setActiveProfile(id);
    };

    const handleEditProfile = (profile: Profile) => {
        setEditingProfileId(profile.id);
        setIsModalVisible(true);
    };

    const handleDeleteProfile = (id: string, name: string) => {
        Alert.alert(
            t('profiles.delete_confirm_title'),
            t('profiles.delete_confirm_msg', { name }),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.delete'),
                    style: "destructive",
                    onPress: () => deleteProfile(id)
                }
            ]
        );
    };

    const renderProfileItem = ({ item, index }: { item: Profile; index: number }) => {
        const isActive = activeProfileId === item.id;
        const zodiac = getZodiacSign(item.dateOfBirth);
        const formattedDate = formatProfileDate(item.dateOfBirth, language);
        const isDark = theme === 'dark';

        // Icons for avatars based on index
        const avatarIcons = ['star', 'moon-waning-crescent', 'weather-sunny'];
        const currentAvatarIcon = avatarIcons[index % avatarIcons.length];

        return (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 100)}>
                <TouchableOpacity
                    style={[
                        styles.profileCard,
                        {
                            backgroundColor: colors.dailyNumberCircleInner,
                            borderColor: isActive ? (isDark ? '#FFD700' : colors.primary) : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'),
                            borderWidth: isActive ? 2 : 1,
                            shadowColor: isDark ? 'transparent' : colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 15,
                            elevation: isDark ? 0 : 10,
                        }
                    ]}
                    onPress={() => handleSwitchProfile(item.id)}
                    onLongPress={() => !isActive && handleDeleteProfile(item.id, item.profileName)}
                >
                    <View style={[styles.cardMain, { backgroundColor: 'transparent' }]}>
                        <View style={[
                            styles.avatarCircle,
                            {
                                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(224, 170, 62, 0.12)',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(224, 170, 62, 0.2)'
                            }
                        ]}>
                            <MaterialCommunityIcons
                                name={currentAvatarIcon as any}
                                size={28}
                                color={isDark ? '#fbbf24' : '#e0aa3e'}
                            />
                        </View>

                        <View style={[styles.cardContent, { backgroundColor: 'transparent' }]}>
                            <View style={[styles.nameRow, { backgroundColor: 'transparent' }]}>
                                <Text numberOfLines={1} style={[styles.profileName, styles.notoBold, { color: colors.textPrimary }]}>
                                    {item.profileName}
                                    {isActive && index === 0 && <Text style={{ fontSize: 16 }}> ({t('common.me')})</Text>}
                                </Text>
                                {isActive && (
                                    <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.activeBadgeText}>{t('common.active')}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.profileDobText, { color: colors.textSecondary }]}>{formattedDate}</Text>
                            <View style={[styles.zodiacRow, { backgroundColor: 'transparent' }]}>
                                <MaterialCommunityIcons name={zodiac.icon as any} size={14} color={colors.primary} style={{ opacity: 0.7 }} />
                                <Text style={[styles.zodiacText, { color: colors.textSecondary, marginLeft: 4 }]}>{t(`zodiac.${zodiac.name.toLowerCase()}` as any)}</Text>
                            </View>
                        </View>

                        <View style={[styles.rightActions, { backgroundColor: 'transparent' }]}>
                            {isActive ? (
                                <View style={[styles.checkIcon, { backgroundColor: 'transparent' }]}>
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => handleDeleteProfile(item.id, item.profileName)}
                                    style={styles.actionIconButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => handleEditProfile(item)}
                                style={styles.actionIconButton}
                            >
                                <Ionicons name="pencil" size={18} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={colors.backgroundGradient}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.content, { paddingTop: insets.top + Spacing.m }]}>
                <View style={styles.header}>
                    <View style={styles.headerButton} />
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{t('profiles.title')}</Text>
                    <TouchableOpacity
                        style={[styles.headerAddButton, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f0ff' }]}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color={theme === 'dark' ? '#FFD700' : colors.primary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={profiles}
                    renderItem={renderProfileItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        <TouchableOpacity
                            style={[
                                styles.dashedButton,
                                {
                                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'transparent'
                                }
                            ]}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <View style={[styles.dashedIconCircle, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f0ff' }]}>
                                <Ionicons name="add" size={24} color={theme === 'dark' ? '#FFD700' : colors.primary} />
                            </View>
                            <Text style={[styles.dashedButtonText, styles.notoRegular, { color: colors.textSecondary }]}>{t('profiles.add_new')}</Text>
                        </TouchableOpacity>
                    }
                />
            </View>

            <ProfileModal
                visible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setEditingProfileId(null);
                }}
                editingProfileId={editingProfileId}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        ...Typography.chartTitle,
        fontSize: 18,
    },
    headerButton: {
        width: 48,
    },
    headerAddButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        paddingBottom: 120,
        gap: 16,
    },
    profileCard: {
        borderRadius: 24,
        padding: 16,
    },
    cardMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        flexWrap: 'nowrap',
    },
    profileName: {
        fontSize: 18,
        maxWidth: '65%',
    },
    activeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    profileDobText: {
        fontSize: 14,
        marginBottom: 2,
    },
    zodiacRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    zodiacText: {
        fontSize: 12,
    },
    rightActions: {
        alignItems: 'center',
        gap: 8,
    },
    checkIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconButton: {
        padding: 4,
    },
    dashedButton: {
        height: 84,
        borderRadius: 24,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.m,
    },
    dashedIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    dashedButtonText: {
        fontSize: 16,
        opacity: 0.7,
    },
    notoBold: {
        fontFamily: 'NotoSerif-Bold',
        fontWeight: 'bold',
    },
    notoRegular: {
        fontFamily: 'NotoSerif-Regular',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
    },
    form: {
        maxHeight: 400,
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputContainer: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    createButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    createButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});
