import { colors } from './colors';

export interface ShadowStyle {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
}

const make = (
    color: string,
    y: number,
    blur: number,
    opacity: number,
    elev: number
): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation: elev,
});

const SHADOW_INK = '#0B0B14';

export const elevation = {
    none: make('#000000', 0, 0, 0, 0),
    sm: make(SHADOW_INK, 2, 8, 0.06, 2),
    md: make(SHADOW_INK, 6, 16, 0.1, 5),
    lg: make(SHADOW_INK, 10, 24, 0.12, 8),
    xl: make(SHADOW_INK, 16, 34, 0.16, 14),
} as const;

export const glow = {
    primary: make(colors.primary[700], 8, 16, 0.16, 6),
    secondary: make(colors.secondary[600], 8, 16, 0.16, 6),
    income: make(colors.income, 8, 16, 0.16, 6),
    expense: make(colors.expense, 8, 16, 0.16, 6),
} as const;

export const getGlow = (hex: string, intensity = 0.16): ShadowStyle =>
    make(hex, 8, 16, intensity, 6);

export type ElevationLevel = keyof typeof elevation;
