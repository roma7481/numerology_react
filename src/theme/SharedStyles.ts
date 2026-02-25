import { ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from './Spacing';

export const Shadow = {
    light: {
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
    } as ViewStyle,

    medium: {
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 15,
        elevation: 5,
    } as ViewStyle,

    heavy: {
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 10,
    } as ViewStyle,
};

export const CardStyle = {
    borderRadius: BorderRadius.l,
    padding: Spacing.xl,
    borderWidth: 1,
    ...Shadow.light,
} as ViewStyle;

export const circle = (size: number): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center',
});
