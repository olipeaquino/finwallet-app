import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores';
import { colors } from '@/constants';

export function useTheme() {
    const systemColorScheme = useColorScheme();
    const { theme: themePreference, setTheme } = useSettingsStore();

    const isDark =
        themePreference === 'dark' ||
        (themePreference === 'system' && systemColorScheme === 'dark');

    const themeColors = isDark ? colors.dark : colors.light;

    return {
        isDark,
        themePreference,
        setTheme,
        colors: {
            ...colors,
            ...themeColors,
            primary: colors.primary,
        },
    };
}
