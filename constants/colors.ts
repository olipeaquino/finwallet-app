export const colors = {
    primary: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#047857',
        600: '#065F46',
        700: '#064E3B',
        800: '#053A2C',
        900: '#022C22',
    },

    secondary: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#0D9488',
        600: '#0F766E',
        700: '#115E59',
        800: '#134E4A',
        900: '#042F2E',
    },

    success: '#059669',
    warning: '#D97706',
    error: '#E11D48',
    info: '#0891B2',

    income: '#059669',
    expense: '#E11D48',

    light: {
        background: '#FAFAF9',
        surface: '#FFFFFF',
        surfaceVariant: '#F5F5F4',
        surfaceElevated: '#FFFFFF',
        border: '#E7E5E4',
        borderLight: '#F5F5F4',
        textPrimary: '#1C1917',
        textSecondary: '#78716C',
        textTertiary: '#A8A29E',
        accent: '#047857',
    },

    dark: {
        background: '#0C0A09',
        surface: '#1C1917',
        surfaceVariant: '#292524',
        surfaceElevated: '#292524',
        border: '#44403C',
        borderLight: '#292524',
        textPrimary: '#FAFAF9',
        textSecondary: '#A8A29E',
        textTertiary: '#78716C',
        accent: '#34D399',
    },

    gradients: {
        primary: ['#059669', '#047857'],
        primaryDeep: ['#047857', '#064E3B'],
        primarySoft: ['#10B981', '#059669'],
        success: ['#10B981', '#059669'],
        income: ['#10B981', '#059669'],
        expense: ['#F43F5E', '#E11D48'],
        sunset: ['#F59E0B', '#D97706'],
        aurora: ['#10B981', '#0D9488'],
        dark: ['#1C1917', '#0C0A09'],
    },
} as const;

export const categoryColors = [
    '#059669',
    '#0D9488',
    '#0891B2',
    '#2563EB',
    '#D97706',
    '#E11D48',
    '#DB2777',
    '#EA580C',
    '#16A34A',
    '#475569',
];

export const goalColors = [
    '#059669',
    '#0D9488',
    '#0891B2',
    '#D97706',
    '#E11D48',
    '#2563EB',
];

export type ColorScheme = 'light' | 'dark';
