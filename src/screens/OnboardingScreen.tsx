import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing, BorderRadius } from '../theme/Spacing';
import { useTranslation } from '../i18n';

type OnboardingStep = 'language' | 'dob' | 'name';

const LANGUAGES = [
    { label: 'English', native: 'English', code: 'en', icon: 'translate' },
    { label: 'Russian', native: 'Русский', code: 'ru', icon: 'earth' },
    { label: 'Spanish', native: 'Español', code: 'es', icon: 'earth' },
    { label: 'Portuguese', native: 'Português', code: 'pt', icon: 'earth' },
    { label: 'French', native: 'Français', code: 'fr', icon: 'earth' },
    { label: 'German', native: 'Deutsch', code: 'de', icon: 'earth' },
    { label: 'Italian', native: 'Italiano', code: 'it', icon: 'earth' },
];

export default function OnboardingScreen() {
    const { theme, setTheme, setLanguage, setProfile, completeOnboarding, saveProfile, setActiveProfile } = useStore();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();

    const [step, setStep] = useState<OnboardingStep>('language');
    const [selectedLang, setSelectedLang] = useState('en');
    const [dob, setDob] = useState('');
    const [date, setDate] = useState(new Date(1995, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [hasOpenedPicker, setHasOpenedPicker] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');

    useEffect(() => {
        if (step === 'dob' && Platform.OS === 'android' && !hasOpenedPicker) {
            setShowDatePicker(true);
            setHasOpenedPicker(true);
        }
    }, [step, hasOpenedPicker]);

    const handleLanguageSelect = (lang: string) => {
        setSelectedLang(lang);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'dismissed') return;
        }

        if (selectedDate) {
            setDate(selectedDate);
            const formatted = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`;
            setDob(formatted);
        }
    };

    const isDobValid = useMemo(() => {
        return dob !== '';
    }, [dob]);

    const nextStep = () => {
        if (step === 'language' && selectedLang) {
            setStep('dob');
        } else if (step === 'dob' && isDobValid) {
            setStep('name');
        } else if (step === 'name') {
            finalize();
        }
    };

    const finalize = () => {
        setLanguage(selectedLang);

        const mainProfile = {
            id: 'primary',
            profileName: t('onboarding.default_profile_name'),
            firstName,
            lastName,
            middleName,
            fatherName: middleName,
            dateOfBirth: dob,
        };

        saveProfile(mainProfile);
        setActiveProfile('primary');
        completeOnboarding();
    };

    const renderProgress = (activeStep: number) => (
        <View style={styles.progressContainer}>
            {[0, 1, 2].map((i) => (
                <View
                    key={i}
                    style={[
                        styles.progressDot,
                        { backgroundColor: i === activeStep ? (theme === 'dark' ? '#FFD700' : colors.primary) : (theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)') },
                        i === activeStep && styles.progressDotActive
                    ]}
                />
            ))}
        </View>
    );

    const renderLanguageStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <View style={styles.headerIconContainer}>
                <View style={[styles.infinityCircle, { backgroundColor: 'rgba(255, 20, 147, 0.15)', borderColor: 'rgba(255, 105, 180, 0.4)' }]}>
                    <MaterialCommunityIcons name="all-inclusive" size={48} color="#FFD700" style={styles.headerIconGlow} />
                </View>
            </View>
            <Text style={[styles.title, styles.notoBold, { color: colors.textPrimary, textAlign: 'center', fontSize: 30 }]}>{t('onboarding.title_language')}</Text>
            <Text style={[styles.subtitle, styles.notoRegular, { color: '#E6E6FA', textAlign: 'center', letterSpacing: 2, fontSize: 13, textTransform: 'uppercase', fontWeight: '600', opacity: 0.9, marginBottom: Spacing.huge }]}>{t('onboarding.subtitle_language')}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsGap}>
                    {LANGUAGES.map((lang) => {
                        const isSelected = selectedLang === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: isSelected ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        borderColor: isSelected ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                        shadowOpacity: isSelected ? 0.3 : 0,
                                        shadowColor: '#FFD700',
                                        shadowRadius: 10,
                                    },
                                ]}
                                onPress={() => handleLanguageSelect(lang.code)}
                            >
                                <View style={styles.optionLeft}>
                                    <Text style={[styles.optionText, isSelected ? styles.notoBold : styles.notoRegular, { color: isSelected ? colors.textPrimary : colors.textSecondary, fontSize: 16 }]}>
                                        {lang.native}
                                    </Text>
                                </View>
                                <View style={[styles.radio, { borderColor: isSelected ? '#FFD700' : 'rgba(255, 255, 255, 0.3)', backgroundColor: isSelected ? 'rgba(255, 215, 0, 0.2)' : 'transparent' }]}>
                                    {isSelected && <View style={[styles.radioInner, { backgroundColor: '#FFD700' }]} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </Animated.View >
    );

    const renderDobStep = () => {
        const isDark = theme === 'dark';
        const accent = isDark ? '#FFD700' : colors.primary;
        return (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                {renderProgress(1)}

                {/* Theme Selector */}
                <Text style={[styles.smallLabel, { color: accent, textAlign: 'center', marginBottom: Spacing.s }]}>{t('settings.appearance') || 'APPEARANCE'}</Text>
                <View style={styles.themeRow}>
                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            {
                                backgroundColor: theme === 'light' ? (isDark ? 'rgba(255,255,255,0.15)' : `${accent}15`) : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fe'),
                                borderColor: theme === 'light' ? accent : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                            },
                        ]}
                        onPress={() => setTheme('light')}
                    >
                        <Ionicons name="sunny" size={18} color={theme === 'light' ? accent : colors.textSecondary} />
                        <Text style={{ color: theme === 'light' ? colors.textPrimary : colors.textSecondary, fontFamily: 'Manrope-SemiBold', fontSize: 13, marginLeft: 6 }}>Light</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            {
                                backgroundColor: theme === 'dark' ? (isDark ? 'rgba(255,255,255,0.15)' : `${accent}15`) : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fe'),
                                borderColor: theme === 'dark' ? accent : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                            },
                        ]}
                        onPress={() => setTheme('dark')}
                    >
                        <Ionicons name="moon" size={18} color={theme === 'dark' ? accent : colors.textSecondary} />
                        <Text style={{ color: theme === 'dark' ? colors.textPrimary : colors.textSecondary, fontFamily: 'Manrope-SemiBold', fontSize: 13, marginLeft: 6 }}>Dark</Text>
                    </TouchableOpacity>
                </View>

                {/* DOB Title */}
                <Text style={[styles.notoBold, { color: colors.textPrimary, textAlign: 'center', fontStyle: 'italic', fontSize: 18, marginTop: Spacing.s }]}>{t('onboarding.title_dob')}</Text>

                <View style={styles.pickerWrapper}>
                    {Platform.OS === 'ios' ? (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="spinner"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                            minimumDate={new Date(1850, 0, 1)}
                            textColor={colors.textPrimary}
                            themeVariant={theme}
                            style={[styles.picker, { height: 180 }]}
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.androidDateDisplay, { flex: 0 }]}
                        >
                            <View style={[styles.dateDisplayCircle, { backgroundColor: `${accent}15`, borderColor: `${accent}30` }]}>
                                <MaterialCommunityIcons name="calendar-edit" size={24} color={accent} />
                            </View>
                            <Text style={[styles.notoBold, { fontSize: 26, color: colors.textPrimary, marginTop: 6 }]}>
                                {dob || t('onboarding.pick_date')}
                            </Text>
                            <Text style={{ color: colors.textSecondary, marginTop: 2, fontSize: 12 }}>
                                {t('onboarding.tap_to_change')}
                            </Text>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="spinner"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1850, 0, 1)}
                                />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.dobFooter, { marginBottom: Spacing.m }]}>
                    <Ionicons name="sparkles" size={16} color={accent} />
                    <Text style={[styles.dobFooterText, styles.notoRegular, { color: colors.textSecondary, fontSize: 12 }]}>
                        {t('onboarding.dob_footer_1')}<Text style={{ fontWeight: 'bold' }}>{t('category_titles.life_path')}</Text>{t('onboarding.dob_footer_2')}<Text style={{ fontWeight: 'bold' }}>{t('biorhythms.title')}</Text>{t('onboarding.dob_footer_3')}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    const renderNameStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            {renderProgress(2)}
            <Text style={[styles.title, styles.notoBold, { color: colors.textPrimary, textAlign: 'center', fontStyle: 'italic' }]}>{t('onboarding.title_name')}</Text>
            <Text style={[styles.subtitle, styles.notoRegular, { color: colors.textSecondary, textAlign: 'center' }]}>
                {t('onboarding.subtitle_name')}
            </Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollInput}
                contentContainerStyle={{ paddingBottom: Spacing.xl }}
            >
                <View style={styles.inputGap}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.smallLabel, { color: theme === 'dark' ? '#FFD700' : colors.primary }]}>{t('onboarding.field_first_name')}</Text>
                        <TextInput
                            style={[styles.premiumInput, { color: colors.textPrimary, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.cardBorder, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.cardBackground }]}
                            placeholder={t('onboarding.placeholder_first_name')}
                            placeholderTextColor={colors.textSecondary}
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.smallLabel, { color: theme === 'dark' ? '#FFD700' : colors.primary }]}>{t('onboarding.field_last_name')}</Text>
                        <TextInput
                            style={[styles.premiumInput, { color: colors.textPrimary, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.cardBorder, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.cardBackground }]}
                            placeholder={t('onboarding.placeholder_last_name')}
                            placeholderTextColor={colors.textSecondary}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.smallLabel, { color: theme === 'dark' ? '#FFD700' : colors.primary }]}>{t('onboarding.field_middle_name')}</Text>
                        <TextInput
                            style={[styles.premiumInput, { color: colors.textPrimary, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.cardBorder, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.cardBackground }]}
                            placeholder={t('onboarding.placeholder_middle_name')}
                            placeholderTextColor={colors.textSecondary}
                            value={middleName}
                            onChangeText={setMiddleName}
                        />
                    </View>
                </View>

                <View style={[styles.legacyNote, { backgroundColor: theme === 'dark' ? 'rgba(255, 215, 0, 0.05)' : `${colors.primary}08`, borderColor: theme === 'dark' ? 'rgba(255, 215, 0, 0.2)' : `${colors.primary}30` }]}>
                    <Ionicons name="information-circle-outline" size={18} color={theme === 'dark' ? '#FFD700' : colors.primary} />
                    <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                        {t('onboarding.note_name_required')}
                    </Text>
                </View>

                <View style={[styles.legacyNote, { backgroundColor: theme === 'dark' ? 'rgba(255, 215, 0, 0.05)' : `${colors.primary}08`, borderColor: theme === 'dark' ? 'rgba(255, 215, 0, 0.2)' : `${colors.primary}30` }]}>
                    <Ionicons name="help-circle-outline" size={18} color={theme === 'dark' ? '#FFD700' : colors.primary} />
                    <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                        {t('onboarding.note_middle_name')}
                    </Text>
                </View>
            </ScrollView>
        </Animated.View>
    );

    const isNextDisabled =
        (step === 'language' && !selectedLang);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={[...colors.backgroundGradient]} style={StyleSheet.absoluteFill} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <View style={[styles.content, { paddingTop: insets.top + Spacing.m, paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
                    <View style={{ flex: 1 }}>
                        {step === 'language' && renderLanguageStep()}
                        {step === 'dob' && renderDobStep()}
                        {step === 'name' && renderNameStep()}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                {
                                    backgroundColor: isNextDisabled ? (theme === 'dark' ? 'rgba(255, 215, 0, 0.3)' : `${colors.primary}60`) : (theme === 'dark' ? '#FFD700' : colors.primary),
                                    shadowColor: theme === 'dark' ? '#FFD700' : colors.primary,
                                    borderColor: theme === 'dark' ? 'rgba(255, 215, 0, 0.3)' : `${colors.primary}50`
                                }
                            ]}
                            onPress={nextStep}
                            disabled={isNextDisabled}
                        >
                            <Text style={[styles.nextButtonText, { fontSize: 18, color: theme === 'dark' ? '#1A000D' : '#fff' }]}>
                                {step === 'dob' ? t('onboarding.button_next') : t('onboarding.button_continue')}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={theme === 'dark' ? '#1A000D' : '#fff'} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>

                        {step === 'name' && (
                            <TouchableOpacity onPress={finalize} style={styles.skipButton}>
                                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>{t('onboarding.button_skip')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
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
    stepContainer: {
        flex: 1,
    },
    themeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: Spacing.s,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    headerIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.huge,
        marginBottom: Spacing.xl,
    },
    infinityCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIconGlow: {
        textShadowColor: 'rgba(255, 215, 0, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    notoBold: {
        fontFamily: 'NotoSerif-Bold',
    },
    notoRegular: {
        fontFamily: 'NotoSerif-Regular',
    },
    textGlow: {
        textShadowColor: 'rgba(255, 215, 0, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.m,
        marginBottom: Spacing.xl,
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressDotActive: {
        width: 32,
        height: 6,
        borderRadius: 3,
    },
    title: {
        ...Typography.title,
        marginBottom: Spacing.s,
    },
    subtitle: {
        ...Typography.body,
    },
    optionsScroll: {
        flex: 1,
    },
    optionsGap: {
        gap: 12,
        paddingBottom: Spacing.xl,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
    },
    optionText: {
        fontSize: 16,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        shadowColor: 'rgba(255, 215, 0, 1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    pickerWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    picker: {
        height: 250,
        width: '100%',
    },
    androidDateDisplay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDisplayCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 20, 147, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 105, 180, 0.3)',
    },
    dobFooter: {
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.huge,
        paddingHorizontal: Spacing.xl,
    },
    dobFooterText: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    inputGap: {
        gap: Spacing.xl,
        marginBottom: Spacing.xxl,
        marginTop: Spacing.xxl,
    },
    inputWrapper: {
        gap: Spacing.s,
    },
    smallLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginLeft: Spacing.xs,
    },
    premiumInput: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: Spacing.xl,
        fontSize: 16,
    },
    scrollInput: {
        flex: 1,
    },
    legacyNote: {
        flexDirection: 'row',
        padding: Spacing.l,
        borderRadius: BorderRadius.m,
        borderWidth: 1,
        marginBottom: Spacing.m,
        gap: Spacing.m,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        marginTop: Spacing.xl,
    },
    nextButton: {
        height: 64,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
    },
    nextButtonText: {
        fontWeight: 'bold',
    },
    skipButton: {
        alignItems: 'center',
        marginTop: Spacing.l,
        padding: Spacing.s,
    },
    skipButtonText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
