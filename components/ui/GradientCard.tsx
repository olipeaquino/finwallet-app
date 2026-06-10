import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants';

type GradientTuple = readonly [string, string, ...string[]];

interface GradientCardProps {
    colors?: GradientTuple;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export function GradientCard({
    colors: gradientColors = colors.gradients.primary as unknown as GradientTuple,
    start = { x: 0, y: 0 },
    end = { x: 1, y: 1 },
    style,
    children,
}: GradientCardProps) {
    return (
        <LinearGradient
            colors={gradientColors as unknown as readonly [string, string, ...string[]]}
            start={start}
            end={end}
            style={style}
        >
            {children}
        </LinearGradient>
    );
}
