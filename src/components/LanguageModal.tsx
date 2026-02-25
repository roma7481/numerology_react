import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { useTranslation } from '../i18n';
import { LanguageType } from '../i18n/translations';

interface LanguageModalProps {
    visible: boolean;
    onClose: () => void;
}

const LANGUAGES: { code: LanguageType; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
    const { theme, language, setLanguage } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const renderItem = ({ item, index }: { item: typeof LANGUAGES[0]; index: number }) => {
        const isSelected = language === item.code;
        return (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
                <TouchableOpacity
                    style={[
                        styles.langItem,
                        {
                            backgroundColor: isSelected ? colors.primary : colors.settingsIconBg,
                            borderColor: isSelected ? colors.primary : colors.cardBorder
                        }
                    ]}
                    onPress={() => {
                        setLanguage(item.code);
                        onClose();
                    }}
                >
                    <View>
                        <Text style={[
                            styles.langNativeName,
                            { color: isSelected ? (isDark ? colors.background : '#fff') : colors.textPrimary }
                        ]}>
                            {item.nativeName}
                        </Text>
                        <Text style={[
                            styles.langName,
                            { color: isSelected ? (isDark ? colors.background : '#fff') : colors.textSecondary, opacity: 0.7 }
                        ]}>
                            {item.name}
                        </Text>
                    </View>
                    {isSelected && (
                        <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={isDark ? colors.background : '#fff'}
                        />
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    entering={FadeInUp}
                    style={[
                        styles.modalContent,
                        { backgroundColor: colors.background, borderTopColor: colors.cardBorder }
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            {t('settings.language_selection')}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={LANGUAGES}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.code}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        maxHeight: '95%',
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContainer: {
        gap: 8,
        paddingBottom: 40,
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    langNativeName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    langName: {
        fontSize: 11,
        marginTop: 1,
    },
});
