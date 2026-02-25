import { TextStyle } from 'react-native';

export const Typography = {
    hero: {
        fontSize: 80,
        fontWeight: '300',
        fontFamily: 'Manrope-Regular',
    } as TextStyle,

    screenHeader: {
        //fontSize: 30,
        //fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 28,
        fontFamily: 'PlusJakartaSans-Bold',
        letterSpacing: -0.5,
    } as TextStyle,

    title: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Manrope-ExtraBold',
    } as TextStyle,

    screenTitle: {
        fontSize: 36,
        fontWeight: '800',
        fontFamily: 'Manrope-ExtraBold',
    } as TextStyle,

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Manrope-Bold',
    } as TextStyle,

    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Manrope-Bold',
    } as TextStyle,

    body: {
        fontSize: 16,
        fontWeight: 'normal',
        fontFamily: 'Manrope-Regular',
    } as TextStyle,

    bodyItalic: {
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: 'Manrope-Regular',
        lineHeight: 24,
    } as TextStyle,

    settingLabel: {
        fontSize: 18,
        fontWeight: '500',
        fontFamily: 'Manrope-Medium',
    } as TextStyle,

    label: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontFamily: 'Manrope-Bold',
    } as TextStyle,

    labelWide: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontFamily: 'Manrope-Bold',
    } as TextStyle,

    caption: {
        fontSize: 11,
        fontWeight: 'normal',
        fontFamily: 'Manrope-Regular',
    } as TextStyle,
};
