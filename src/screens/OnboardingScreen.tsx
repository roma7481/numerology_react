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
    const { theme, setLanguage, setProfile, completeOnboarding, saveProfile, setActiveProfile } = useStore();
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
                        { backgroundColor: i === activeStep ? '#3b82f6' : 'rgba(255,255,255,0.2)' },
                        i === activeStep && styles.progressDotActive
                    ]}
                />
            ))}
        </View>
    );

    const renderLanguageStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <View style={styles.headerIconContainer}>
                <View style={[styles.infinityCircle, { backgroundColor: 'rgba(30, 58, 138, 0.4)', borderColor: 'rgba(96, 165, 250, 0.5)' }]}>
                    <MaterialCommunityIcons name="all-inclusive" size={48} color="#bfdbfe" style={styles.headerIconGlow} />
                </View>
            </View>
            <Text style={[styles.title, styles.notoBold, { color: '#fff', textAlign: 'center', fontSize: 30 }]}>{t('onboarding.title_language')}</Text>
            <Text style={[styles.subtitle, styles.notoRegular, { color: '#bfdbfe', textAlign: 'center', letterSpacing: 2, fontSize: 13, textTransform: 'uppercase', fontWeight: '600', opacity: 0.9, marginBottom: Spacing.huge }]}>{t('onboarding.subtitle_language')}</Text>

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
                                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.3)',
                                        borderColor: isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(71, 85, 105, 0.3)',
                                        shadowOpacity: isSelected ? 0.3 : 0,
                                        shadowColor: '#3b82f6',
                                        shadowRadius: 10,
                                    },
                                ]}
                                onPress={() => handleLanguageSelect(lang.code)}
                            >
                                <View style={styles.optionLeft}>
                                    <Text style={[styles.optionText, isSelected ? styles.notoBold : styles.notoRegular, { color: isSelected ? '#fff' : '#e2e8f0', fontSize: 16 }]}>
                                        {lang.native}
                                    </Text>
                                </View>
                                <View style={[styles.radio, { borderColor: isSelected ? '#60a5fa' : 'rgba(148, 163, 184, 0.5)', backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }]}>
                                    {isSelected && <View style={[styles.radioInner, { backgroundColor: '#60a5fa' }]} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </Animated.View >
    );

    const renderDobStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            {renderProgress(1)}
            <Text style={[styles.title, styles.notoBold, { color: '#fff', textAlign: 'center', fontStyle: 'italic' }]}>{t('onboarding.title_dob')}</Text>

            <View style={styles.pickerWrapper}>
                {Platform.OS === 'ios' ? (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1850, 0, 1)}
                        textColor="#fff"
                        themeVariant="dark"
                        style={styles.picker}
                    />
                ) : (
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={styles.androidDateDisplay}
                    >
                        <View style={styles.dateDisplayCircle}>
                            <MaterialCommunityIcons name="calendar-edit" size={32} color="#3b82f6" />
                        </View>
                        <Text style={[styles.title, styles.notoBold, { fontSize: 42, color: '#fff', marginTop: 16 }]}>
                            {dob || t('onboarding.pick_date')}
                        </Text>
                        <Text style={[styles.subtitle, { color: '#bfdbfe', marginTop: 8, opacity: 0.7 }]}>
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

            <View style={styles.dobFooter}>
                <Ionicons name="sparkles" size={18} color="#3b82f6" />
                <Text style={[styles.dobFooterText, styles.notoRegular, { color: '#fff' }]}>
                    {t('onboarding.dob_footer_1')}<Text style={{ fontWeight: 'bold' }}>{t('category_titles.life_path')}</Text>{t('onboarding.dob_footer_2')}<Text style={{ fontWeight: 'bold' }}>{t('biorhythms.title')}</Text>{t('onboarding.dob_footer_3')}
                </Text>
            </View>
        </Animated.View>
    );

    const renderNameStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            {renderProgress(2)}
            <Text style={[styles.title, styles.notoBold, { color: '#fff', textAlign: 'center', fontStyle: 'italic' }]}>{t('onboarding.title_name')}</Text>
            <Text style={[styles.subtitle, styles.notoRegular, { color: 'rgba(255,255,255,0.7)', textAlign: 'center' }]}>
                {t('onboarding.subtitle_name')}
            </Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollInput}
                contentContainerStyle={{ paddingBottom: Spacing.xl }}
            >
                <View style={styles.inputGap}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.smallLabel, { color: '#3b82f6' }]}>{t('onboarding.field_first_name')}</Text>
                        <TextInput
                            style={[styles.premiumInput, { color: '#fff', borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }]}
                            placeholder={t('onboarding.placeholder_first_name')}
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.smallLabel, { color: '#3b82f6' }]}>{t('onboarding.field_last_name')}</Text>
                        <TextInput
                            style={[styles.premiumInput, { color: '#fff', borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }]}
                            placeholder={t('onboarding.placeholder_last_name')}
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.smallLabel, { color: '#3b82f6' }]}>{t('onboarding.field_middle_name')}</Text>
                        <TextInput
                            style={[styles.premiumInput, { color: '#fff', borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }]}
                            placeholder={t('onboarding.placeholder_middle_name')}
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={middleName}
                            onChangeText={setMiddleName}
                        />
                    </View>
                </View>

                <View style={[styles.legacyNote, { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
                    <Text style={[styles.noteText, { color: 'rgba(255,255,255,0.6)' }]}>
                        {t('onboarding.note_name_required')}
                    </Text>
                </View>

                <View style={[styles.legacyNote, { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <Ionicons name="help-circle-outline" size={18} color="#3b82f6" />
                    <Text style={[styles.noteText, { color: 'rgba(255,255,255,0.6)' }]}>
                        {t('onboarding.note_middle_name')}
                    </Text>
                </View>
            </ScrollView>
        </Animated.View>
    );

    const isNextDisabled =
        (step === 'language' && !selectedLang);

    return (
        <View style={[styles.container, { backgroundColor: '#0B1121' }]}>
            <LinearGradient colors={['#172554', '#0f172a', '#020617']} style={StyleSheet.absoluteFill} />

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
                                { backgroundColor: isNextDisabled ? 'rgba(37, 99, 235, 0.4)' : '#2563eb' }
                            ]}
                            onPress={nextStep}
                            disabled={isNextDisabled}
                        >
                            <Text style={[styles.nextButtonText, { fontSize: 18, color: '#fff' }]}>
                                {step === 'dob' ? t('onboarding.button_next') : t('onboarding.button_continue')}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>

                        {step === 'name' && (
                            <TouchableOpacity onPress={finalize} style={styles.skipButton}>
                                <Text style={[styles.skipButtonText, { color: 'rgba(255,255,255,0.5)' }]}>{t('onboarding.button_skip')}</Text>
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
        textShadowColor: 'rgba(96, 165, 250, 1)',
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
        textShadowColor: 'rgba(59, 130, 246, 0.6)',
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
        shadowColor: 'rgba(59, 130, 246, 1)',
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
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
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
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
