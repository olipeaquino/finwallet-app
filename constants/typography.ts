export const typography = {
    fontFamily: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semibold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    letterSpacing: {
        tighter: -0.6,
        tight: -0.3,
        normal: 0,
        wide: 0.4,
        wider: 0.8,
        widest: 1.4,
    },
} as const;

export const rhythm = {
    screenPadding: 16,
    sectionGap: 24,
    cardPadding: 16,
    cardGap: 12,
    itemGap: 8,
} as const;
