import React from 'react';
import { View, Pressable, ViewStyle, StyleProp } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { elevation as elevationTokens, type ElevationLevel } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const cardVariants = cva(
    'rounded-2xl',
    {
        variants: {
            variant: {
                default: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark',
                elevated: 'bg-surface-light dark:bg-surface-dark',
                outlined: 'bg-transparent border border-border-light dark:border-border-dark',
                filled: 'bg-surface-variant-light dark:bg-surface-variant-dark',
                glass: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark',
                accent: 'bg-surface-light dark:bg-surface-dark border-l-4 border-primary-500',
            },
            padding: {
                none: 'p-0',
                sm: 'p-3',
                md: 'p-4',
                lg: 'p-6',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
        },
    }
);

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'glass' | 'accent';

interface CardProps extends VariantProps<typeof cardVariants> {
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
    elevation?: ElevationLevel;
    style?: StyleProp<ViewStyle>;
}

const defaultElevation: Record<CardVariant, ElevationLevel> = {
    default: 'sm',
    elevated: 'lg',
    outlined: 'none',
    filled: 'none',
    glass: 'md',
    accent: 'sm',
};

export function Card({
    children,
    variant,
    padding,
    onPress,
    className,
    elevation,
    style,
}: CardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const level = elevation ?? defaultElevation[(variant as CardVariant) ?? 'default'] ?? 'sm';
    const shadow = elevationTokens[level];

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.99, { damping: 18, stiffness: 280 });
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1, { damping: 18, stiffness: 280 });
        }
    };

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[shadow, animatedStyle, style]}
                className={`${cardVariants({ variant, padding })} ${className || ''}`}
            >
                {children}
            </AnimatedPressable>
        );
    }

    return (
        <View
            style={[shadow, style]}
            className={`${cardVariants({ variant, padding })} ${className || ''}`}
        >
            {children}
        </View>
    );
}
