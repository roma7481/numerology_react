import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    TextInput,
    Modal,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore, Profile } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';
import { useTranslation } from '../i18n';

interface ProfileModalProps {
    visible: boolean;
    onClose: () => void;
    editingProfileId?: string | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, editingProfileId }) => {
    const { theme, profiles, saveProfile, language, activeProfileId, setActiveProfile } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const [newName, setNewName] = useState('');
    const [newFirst, setNewFirst] = useState('');
    const [newLast, setNewLast] = useState('');
    const [newMiddle, setNewMiddle] = useState('');
    const [newDob, setNewDob] = useState(new Date(1995, 0, 1));
    const [newPartnerDob, setNewPartnerDob] = useState<Date | null>(null);
    const [newWeddingDate, setNewWeddingDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showPartnerPicker, setShowPartnerPicker] = useState(false);
    const [showWeddingPicker, setShowWeddingPicker] = useState(false);

    useEffect(() => {
        if (visible && editingProfileId) {
            const profile = profiles.find(p => p.id === editingProfileId);
            if (profile) {
                setNewName(profile.profileName);
                setNewFirst(profile.firstName);
                setNewLast(profile.lastName || '');
                setNewMiddle(profile.middleName || '');

                const [d, m, y] = profile.dateOfBirth.split('/').map(Number);
                setNewDob(new Date(y, m - 1, d));

                if (profile.partnerDateOfBirth) {
                    const [pd, pm, py] = profile.partnerDateOfBirth.split('/').map(Number);
                    setNewPartnerDob(new Date(py, pm - 1, pd));
                } else {
                    setNewPartnerDob(null);
                }

                if (profile.weddingDay) {
                    const [wd, wm, wy] = profile.weddingDay.split('/').map(Number);
                    setNewWeddingDate(new Date(wy, wm - 1, wd));
                } else {
                    setNewWeddingDate(null);
                }
            }
        } else if (visible && !editingProfileId) {
            // Reset for new profile
            setNewName('');
            setNewFirst('');
            setNewLast('');
            setNewMiddle('');
            setNewDob(new Date(1995, 0, 1));
            setNewPartnerDob(null);
            setNewWeddingDate(null);
        }
    }, [visible, editingProfileId, profiles]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            setShowPartnerPicker(false);
            setShowWeddingPicker(false);
            if (event.type === 'dismissed') return;
        }

        if (selectedDate) {
            if (showPicker) setNewDob(selectedDate);
            if (showPartnerPicker) setNewPartnerDob(selectedDate);
            if (showWeddingPicker) setNewWeddingDate(selectedDate);
        }
    };

    const handleSaveProfile = () => {
        const formattedDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

        const profileData: Profile = {
            id: editingProfileId || Date.now().toString(),
            profileName: newName.trim() || newFirst.trim() || 'Profile',
            firstName: newFirst.trim(),
            lastName: newLast.trim(),
            middleName: newMiddle.trim(),
            dateOfBirth: formattedDate(newDob),
            partnerDateOfBirth: newPartnerDob ? formattedDate(newPartnerDob) : undefined,
            weddingDay: newWeddingDate ? formattedDate(newWeddingDate) : undefined,
        };

        saveProfile(profileData);

        if (editingProfileId && editingProfileId === activeProfileId) {
            setActiveProfile(editingProfileId);
        }

        onClose();
    };

    const formatDateLocalized = (date: Date) => {
        const langMap: Record<string, string> = {
            en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU'
        };
        return date.toLocaleDateString(langMap[language] || 'en-US');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    entering={FadeInUp}
                    style={[styles.modalContent, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, styles.notoBold, { color: colors.textPrimary }]}>
                            {editingProfileId ? t('modal.title_edit') : t('modal.title_new')}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('modal.field_label')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder={t('modal.field_label_placeholder')}
                                placeholderTextColor={colors.textSecondary}
                                value={newName}
                                onChangeText={setNewName}
                            />
                        </View>

                        <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('modal.field_first_name')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder={t('common.optional')}
                                placeholderTextColor={colors.textSecondary}
                                value={newFirst}
                                onChangeText={setNewFirst}
                            />
                        </View>

                        <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('modal.field_last_name')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder={t('common.optional')}
                                placeholderTextColor={colors.textSecondary}
                                value={newLast}
                                onChangeText={setNewLast}
                            />
                        </View>

                        <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('modal.field_middle_name')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder={t('common.optional')}
                                placeholderTextColor={colors.textSecondary}
                                value={newMiddle}
                                onChangeText={setNewMiddle}
                            />
                        </View>

                        <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('modal.field_dob')}</Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder, justifyContent: 'center' }]}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text style={{ color: colors.textPrimary }}>
                                {formatDateLocalized(newDob)}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ position: 'absolute', right: 16 }} />
                        </TouchableOpacity>

                        {(showPicker || showPartnerPicker || showWeddingPicker) && (
                            <DateTimePicker
                                value={showPicker ? newDob : (showPartnerPicker ? (newPartnerDob || new Date()) : (newWeddingDate || new Date()))}
                                mode="date"
                                display="spinner"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                                minimumDate={new Date(1850, 0, 1)}
                                textColor={theme === 'dark' ? '#fff' : '#000'}
                                themeVariant={theme}
                            />
                        )}

                        <Text style={[styles.fieldLabel, { color: colors.primary, marginTop: 10 }]}>{t('modal.field_partner_dob')}</Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder, justifyContent: 'center' }]}
                            onPress={() => setShowPartnerPicker(true)}
                        >
                            <Text style={{ color: newPartnerDob ? colors.textPrimary : colors.textSecondary }}>
                                {newPartnerDob ? formatDateLocalized(newPartnerDob) : t('modal.field_partner_dob_placeholder')}
                            </Text>
                            <Ionicons name="heart-outline" size={20} color={colors.primary} style={{ position: 'absolute', right: 16 }} />
                        </TouchableOpacity>

                        <Text style={[styles.fieldLabel, { color: colors.primary, marginTop: 10 }]}>{t('modal.field_wedding_date')}</Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder, justifyContent: 'center' }]}
                            onPress={() => setShowWeddingPicker(true)}
                        >
                            <Text style={{ color: newWeddingDate ? colors.textPrimary : colors.textSecondary }}>
                                {newWeddingDate ? formatDateLocalized(newWeddingDate) : t('modal.field_wedding_date_placeholder')}
                            </Text>
                            <Ionicons name="rose-outline" size={20} color={colors.primary} style={{ position: 'absolute', right: 16 }} />
                        </TouchableOpacity>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: colors.primary }]}
                        onPress={handleSaveProfile}
                    >
                        <Text style={[styles.createButtonText, { color: theme === 'dark' ? colors.background : '#fff' }]}>
                            {editingProfileId ? t('common.save_changes') : t('modal.create_profile')}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        height: '80%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        borderTopWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
    },
    form: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 16,
    },
    inputContainer: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        height: '100%',
    },
    createButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notoBold: {
        fontFamily: 'NotoSerif-Bold',
        fontWeight: 'bold',
    },
});
