import React from 'react';
import { Pressable, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticService } from '@/services';
import { colors, glow, getGlow } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const buttonVariants = cva(
    'flex-row items-center justify-center rounded-xl',
    {
        variants: {
            variant: {
                primary: '',
                secondary: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark',
                destructive: '',
                ghost: 'bg-transparent',
                income: '',
                expense: '',
            },
            size: {
                sm: 'h-10 px-4',
                md: 'h-12 px-6',
                lg: 'h-14 px-8',
                icon: 'h-12 w-12',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

const textVariants = cva(
    'font-inter-semibold text-base',
    {
        variants: {
            variant: {
                primary: 'text-white',
                secondary: 'text-text-primary-light dark:text-text-primary-dark',
                destructive: 'text-white',
                ghost: 'text-primary-500',
                income: 'text-white',
                expense: 'text-white',
            },
            size: {
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
                icon: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'income' | 'expense';
type GradientTuple = readonly [string, string, ...string[]];

const GRADIENTS: Partial<Record<ButtonVariant, GradientTuple>> = {
    primary: colors.gradients.primary as unknown as GradientTuple,
    income: colors.gradients.income as unknown as GradientTuple,
    expense: colors.gradients.expense as unknown as GradientTuple,
    destructive: ['#F87171', '#EF4444'],
};

const GLOWS: Partial<Record<ButtonVariant, object>> = {
    primary: glow.primary,
    income: glow.income,
    expense: glow.expense,
    destructive: getGlow('#EF4444'),
};

interface ButtonProps extends VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}

export function Button({
    children,
    variant,
    size,
    fullWidth,
    onPress,
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
}: ButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 280 });
        hapticService.light();
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 18, stiffness: 280 });
    };

    const isDisabled = disabled || loading;
    const v = (variant as ButtonVariant) ?? 'primary';
    const gradient = GRADIENTS[v];
    const shadow = !isDisabled && GLOWS[v] ? GLOWS[v] : undefined;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            style={[shadow as any, animatedStyle]}
            className={`${buttonVariants({ variant, size, fullWidth })} ${isDisabled ? 'opacity-60' : ''} ${className || ''}`}
        >
            {gradient && (
                <LinearGradient
                    colors={gradient as readonly [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                />
            )}
            {loading ? (
                <ActivityIndicator
                    color={v === 'secondary' || v === 'ghost' ? colors.primary[500] : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <>
                    {leftIcon && <View className="mr-2">{leftIcon}</View>}
                    <Text className={textVariants({ variant, size })}>
                        {children}
                    </Text>
                    {rightIcon && <View className="ml-2">{rightIcon}</View>}
                </>
            )}
        </AnimatedPressable>
    );
}
