import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { useTranslation } from '../i18n';

interface NameEntryModalProps {
    visible: boolean;
    onClose: () => void;
    onCancel?: () => void;
}

export const NameEntryModal: React.FC<NameEntryModalProps> = ({ visible, onClose, onCancel }) => {
    const { theme, firstName, lastName, fatherName, saveProfile, activeProfileId, profiles } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const [first, setFirst] = useState(firstName || '');
    const [last, setLast] = useState(lastName || '');
    const [middle, setMiddle] = useState(fatherName || '');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (visible) {
            setFirst(firstName || '');
            setLast(lastName || '');
            setMiddle(fatherName || '');
            setError(false);
        }
    }, [visible, firstName, lastName, fatherName]);

    const handleSave = () => {
        if (!first.trim() || !last.trim()) {
            setError(true);
            return;
        }

        const activeProfile = profiles.find(p => p.id === activeProfileId);

        saveProfile({
            ...(activeProfile || { id: activeProfileId || 'default', profileName: first.trim(), dateOfBirth: '01/01/1990' }),
            firstName: first.trim(),
            lastName: last.trim(),
            middleName: middle.trim(),
            fatherName: middle.trim(),
        });

        onClose();
    };

    const handleClose = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            {t('modal.enter_name_title') || 'Enter Your Name'}
                        </Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView
                        style={styles.formScroll}
                        contentContainerStyle={styles.formContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.form}>
                            <Text style={[styles.fieldLabel, { color: colors.primary }]}>
                                {t('modal.field_first_name')} *
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: error && !first.trim() ? '#ff4444' : colors.cardBorder }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder={t('modal.field_first_name_placeholder') || 'First Name'}
                                    placeholderTextColor={colors.textSecondary}
                                    value={first}
                                    onChangeText={(val) => { setFirst(val); setError(false); }}
                                    autoFocus
                                />
                            </View>

                            <Text style={[styles.fieldLabel, { color: colors.primary }]}>
                                {t('modal.field_last_name')} *
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: error && !last.trim() ? '#ff4444' : colors.cardBorder }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder={t('modal.field_last_name_placeholder') || 'Last Name'}
                                    placeholderTextColor={colors.textSecondary}
                                    value={last}
                                    onChangeText={(val) => { setLast(val); setError(false); }}
                                />
                            </View>

                            <Text style={[styles.fieldLabel, { color: colors.primary }]}>
                                {t('modal.field_middle_name')} ({t('common.optional')})
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.settingsIconBg, borderColor: colors.cardBorder }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder={t('modal.field_middle_name_placeholder') || 'Middle Name'}
                                    placeholderTextColor={colors.textSecondary}
                                    value={middle}
                                    onChangeText={setMiddle}
                                />
                            </View>
                            <View style={styles.noteContainer}>
                                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                                <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                                    {t('modal.note_middle_name')}
                                </Text>
                            </View>

                            {error && (
                                <Text style={styles.errorText}>
                                    {t('modal.name_required_error') || 'First and Last name are required'}
                                </Text>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.primary }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                {t('common.save_changes') || 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    formScroll: {
        flex: 1,
    },
    formContainer: {
        padding: 24,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 80 : 40,
        paddingBottom: 16,
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
    form: {
        width: '100%',
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
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
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noteContainer: {
        flexDirection: 'row',
        marginTop: 12,
        paddingHorizontal: 4,
        gap: 8,
        alignItems: 'flex-start',
    },
    noteText: {
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
        opacity: 0.8,
    },
});
