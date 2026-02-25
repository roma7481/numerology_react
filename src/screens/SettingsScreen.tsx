import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Pressable,
    Share,
    Platform,
    Alert,
    Linking,
    Clipboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { useStore, AppState } from '../store/useStore';
import { NotificationService } from '../services/NotificationService';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { Shadow, circle } from '../theme/SharedStyles';
import { NumbersCalculator } from '../utils/NumbersCalculator';
import { ProfileModal } from '../components/ProfileModal';
import { LanguageModal } from '../components/LanguageModal';
import { useTranslation } from '../i18n';
import { LanguageType } from '../i18n/translations';

export default function SettingsScreen({ navigation }: any) {
    const {
        theme, setTheme, profileName, firstName, lastName, middleName, dateOfBirth,
        language, setLanguage, activeProfileId,
        notificationsEnabled, setNotificationsEnabled, notificationTime, setNotificationTime
    } = useStore();
    const { t } = useTranslation();
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [isLanguageModalVisible, setIsLanguageModalVisible] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const isDark = theme === 'dark';

    const syncNotifications = React.useCallback(async (enabled: boolean, timeStr: string) => {
        if (enabled) {
            const hasPermission = await NotificationService.registerForPushNotificationsAsync();
            if (hasPermission) {
                const [hour, minute] = timeStr.split(':').map(Number);
                await NotificationService.scheduleDailyNotification(
                    hour,
                    minute,
                    t('settings.notification_title'),
                    t('settings.notification_body')
                );
            } else {
                setNotificationsEnabled(false);
                Alert.alert(t('common.error'), "Notification permissions are required for reminders.");
            }
        } else {
            await NotificationService.cancelAllNotifications();
        }
    }, [t, setNotificationsEnabled]);

    const handleToggleNotifications = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        await syncNotifications(newValue, notificationTime);
    };

    const onTimeChange = async (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const newTime = `${hours}:${minutes}`;
            setNotificationTime(newTime);
            // Proactively turn on notifications when time is picked
            if (!notificationsEnabled) {
                setNotificationsEnabled(true);
                await syncNotifications(true, newTime);
            } else {
                await syncNotifications(true, newTime);
            }
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${t('settings.share_message')} https://play.google.com/store/apps/details?id=numerology.dailymistika.ru`,
                title: t('settings.share_title'),
            });
        } catch (error: any) {
            console.error(error.message);
        }
    };

    const handleContactUs = async () => {
        const supportEmail = "cbeeapps@gmail.com";
        const subject = "Support: Numerology App";
        const body = `
        
--- Technical Info ---
App version: ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})
Platform: ${Platform.OS} ${Platform.Version}
Device: ${Device.modelName || 'Unknown'}
----------------------
        `;

        const url = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        try {
            await Linking.openURL(url);
        } catch (e) {
            Alert.alert(
                t('settings.contact_us'),
                `${t('common.ok')}: ${supportEmail}`,
                [
                    {
                        text: "Copy Email",
                        onPress: () => {
                            Clipboard.setString(supportEmail);
                        }
                    },
                    { text: t('common.ok'), style: 'cancel' }
                ]
            );
        }
    };

    const lifePathNum = React.useMemo(() => {
        if (!dateOfBirth) return 0;
        return NumbersCalculator.calcLifeNumberMethod1({
            language,
            dateOfBirth,
            firstName: firstName || '',
            lastName: lastName || '',
            fatherName: middleName || ''
        });
    }, [dateOfBirth, language, firstName, lastName, middleName]);

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

    const formattedDob = React.useMemo(() => {
        if (!dateOfBirth) return t('common.not_set');
        const [d, m, y] = dateOfBirth.split('/');
        const date = new Date(Number(y), Number(m) - 1, Number(d));

        const langMap: Record<string, string> = {
            en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
        };

        return date.toLocaleDateString(langMap[language] || 'en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }, [dateOfBirth, language, t]);

    const renderSectionTitle = (title: string) => (
        <Text style={[styles.sectionTitle, { color: colors.settingsSectionTitle }]}>{title}</Text>
    );

    const SettingRow = ({ icon, label, subLabel, value, onToggle, onPress, hasArrow, destructive }: any) => (
        <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }]}
            activeOpacity={0.7}
            onPress={onPress || onToggle}
        >
            <View style={[styles.rowLeft, { flex: 1, marginRight: Spacing.m }]}>
                <View style={[styles.iconContainer, { backgroundColor: destructive ? colors.logoutBg : colors.settingsIconBg }]}>
                    {icon}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: destructive ? colors.logoutText : colors.textPrimary }]}>{label}</Text>
                    {subLabel && <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>{subLabel}</Text>}
                </View>
            </View>
            <View style={styles.rowRight}>
                {onToggle && typeof value === 'boolean' && (
                    <TouchableOpacity
                        onPress={onToggle}
                        style={[styles.toggleBackground, { backgroundColor: value ? colors.toggleActive : colors.toggleInactive }]}
                    >
                        <Animated.View
                            layout={Layout.springify()}
                            style={[styles.toggleThumb, {
                                alignSelf: value ? 'flex-end' : 'flex-start',
                                backgroundColor: '#fff'
                            }]}
                        />
                    </TouchableOpacity>
                )}
                {hasArrow && <Feather name="chevron-right" size={20} color={colors.settingsChevron} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textTitle }]}>{t('settings.title')}</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <Animated.View entering={FadeInDown.duration(600)} style={[styles.profileCard, { backgroundColor: colors.cardBackground, shadowColor: colors.categoryCardShadow }]}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { backgroundColor: colors.settingsAvatarCircle }]}>
                            <MaterialCommunityIcons name="meditation" size={32} color={colors.settingsAvatarIcon} />
                        </View>
                    </View>
                    <View style={[styles.profileText, { flex: 1, marginRight: Spacing.m }]}>
                        <Text style={[styles.profileName, { color: colors.textPrimary }]} numberOfLines={1}>{profileName || fullName || t('settings.profile_card_new_user')}</Text>

                        <View style={styles.birthRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                            <Text style={[styles.profileSub, { color: colors.primary }]}>{formattedDob}</Text>
                        </View>

                        <View style={styles.birthRow}>
                            <MaterialCommunityIcons name="leaf" size={14} color={colors.primary} />
                            <Text style={[styles.profileSub, { color: colors.primary }]}>
                                {firstName?.[0]}{lastName?.[0]}  {t('menu.life_path')} {lifePathNum}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        style={[styles.editButton, { backgroundColor: isDark ? 'rgba(0,229,255,0.1)' : '#f1f5f9' }]}
                    >
                        <Feather name="edit-2" size={18} color={isDark ? colors.primary : colors.textPrimary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Appearance */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    {renderSectionTitle(t('settings.appearance'))}
                    <View style={[styles.appearanceCard, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.rowLeft, { flex: 1, marginRight: Spacing.m }]}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.settingsIconBg }]}>
                                <Ionicons name="color-palette" size={20} color="#8b5cf6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t('settings.app_theme')}</Text>
                            </View>
                        </View>

                        <View style={[styles.themeSelector, { backgroundColor: colors.themeSwitchBg }]}>
                            <Pressable
                                onPress={() => setTheme('light')}
                                style={[
                                    styles.themeOption,
                                    theme === 'light' && [styles.themeOptionActive, { backgroundColor: colors.themeSwitchActiveBg }]
                                ]}
                            >
                                <Ionicons
                                    name="sunny"
                                    size={14}
                                    color={theme === 'light' ? colors.themeSwitchTextActive : colors.themeSwitchTextInactive}
                                />
                                <Text style={[
                                    styles.themeOptionText,
                                    { color: theme === 'light' ? colors.themeSwitchTextActive : colors.themeSwitchTextInactive }
                                ]}>{t('settings.theme_aura')}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setTheme('dark')}
                                style={[
                                    styles.themeOption,
                                    theme === 'dark' && [styles.themeOptionActive, { backgroundColor: colors.themeSwitchActiveBg }]
                                ]}
                            >
                                <Ionicons
                                    name="moon"
                                    size={14}
                                    color={theme === 'dark' ? colors.themeSwitchTextActive : colors.themeSwitchTextInactive}
                                />
                                <Text style={[
                                    styles.themeOptionText,
                                    { color: theme === 'dark' ? colors.themeSwitchTextActive : colors.themeSwitchTextInactive }
                                ]}>{t('settings.theme_cosmos')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>

                {/* Notifications */}
                <Animated.View entering={FadeInDown.duration(600).delay(150)}>
                    {renderSectionTitle(t('settings.notifications'))}
                    <View style={styles.groupWrapper}>
                        <SettingRow
                            icon={<Ionicons name="notifications" size={20} color="#f59e0b" />}
                            label={t('settings.daily_reminder')}
                            subLabel={t('settings.daily_reminder_sub', { time: notificationTime })}
                            value={notificationsEnabled}
                            onToggle={handleToggleNotifications}
                            onPress={() => setShowTimePicker(true)}
                        />
                    </View>
                </Animated.View>

                {showTimePicker && (
                    <DateTimePicker
                        value={(() => {
                            const [h, m] = notificationTime.split(':').map(Number);
                            const d = new Date();
                            d.setHours(h, m, 0, 0);
                            return d;
                        })()}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                    />
                )}

                {/* Language */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    {renderSectionTitle(t('settings.language'))}
                    <View style={styles.groupWrapper}>
                        <SettingRow
                            icon={<Ionicons name="globe-outline" size={20} color="#0ea5e9" />}
                            label={t('settings.language')}
                            subLabel={language.toUpperCase()}
                            hasArrow
                            onPress={() => setIsLanguageModalVisible(true)}
                        />
                    </View>
                </Animated.View>

                {/* Account */}
                <Animated.View entering={FadeInDown.duration(600).delay(250)}>
                    {renderSectionTitle(t('settings.account'))}
                    <View style={[styles.groupWrapper, { overflow: 'hidden', borderRadius: BorderRadius.m }]}>
                        <SettingRow
                            icon={<Ionicons name="card" size={20} color="#10b981" />}
                            label={t('settings.premium')}
                            hasArrow
                        />
                        <SettingRow
                            icon={<Ionicons name="chatbubbles" size={20} color="#06b6d4" />}
                            label={t('settings.contact_us')}
                            hasArrow
                            onPress={handleContactUs}
                        />
                        <SettingRow
                            icon={<Ionicons name="share-social" size={20} color="#ec4899" />}
                            label={t('settings.share_app')}
                            hasArrow
                            onPress={handleShare}
                        />
                        <SettingRow
                            icon={<Ionicons name="shield-checkmark" size={20} color="#3b82f6" />}
                            label={t('settings.privacy_policy')}
                            hasArrow
                            onPress={() => Linking.openURL('https://cbeeapps.wixsite.com/numerologyprivacy')}
                        />
                    </View>
                </Animated.View>

                <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                    {t('common.version')} 1.0.0 ({theme.toUpperCase()})
                </Text>
            </ScrollView>

            <ProfileModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                editingProfileId={activeProfileId}
            />

            <LanguageModal
                visible={isLanguageModalVisible}
                onClose={() => setIsLanguageModalVisible(false)}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.m,
    },
    headerButton: {
        width: 60,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        ...Typography.chartTitle,
        fontSize: 18,
    },
    doneButton: {
        fontWeight: 'bold',
        textAlign: 'right',
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.m,
        paddingBottom: Spacing.huge,
    },
    profileCard: {
        flexDirection: 'row',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl, // Matching the very rounded look
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xxl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: Spacing.l,
    },
    avatarCircle: {
        ...circle(80),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    proBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    proBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    profileText: {
        gap: 2,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileSub: {
        fontSize: 14,
        fontWeight: '600',
    },
    birthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberSince: {
        fontSize: 12,
        marginTop: 2,
    },
    editButton: {
        ...circle(36),
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: Spacing.m,
        marginLeft: Spacing.s,
    },
    appearanceCard: {
        flexDirection: 'row',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xxl,
    },
    settingRow: {
        flexDirection: 'row',
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    groupWrapper: {
        marginBottom: Spacing.xxl,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.l,
    },
    iconContainer: {
        ...circle(40),
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowSubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeSelector: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 20,
        width: 150,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    themeOptionActive: {
        ...Shadow.light,
        elevation: 2,
    },
    themeOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    toggleBackground: {
        width: 48,
        height: 26,
        borderRadius: 13,
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 10,
        letterSpacing: 1,
        marginTop: Spacing.m,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    langChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        minWidth: 60,
        alignItems: 'center',
    },
    langChipText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
