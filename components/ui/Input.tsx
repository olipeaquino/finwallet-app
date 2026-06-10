import React, { forwardRef } from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AlertCircle } from 'lucide-react-native';
import { useThemeContext } from '@/providers';
import { colors } from '@/constants';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className, onFocus, onBlur, ...props }, ref) => {
        const { isDark } = useThemeContext();
        const isFocused = useSharedValue(0);
        const theme = isDark ? colors.dark : colors.light;

        const animatedContainerStyle = useAnimatedStyle(() => {
            const focused = isFocused.value === 1;
            const focusBg = isDark ? colors.dark.surfaceVariant : colors.primary[50];
            return {
                borderColor: withTiming(
                    error ? colors.error : focused ? colors.primary[500] : theme.border,
                    { duration: 160 }
                ),
                backgroundColor: withTiming(focused && !error ? focusBg : theme.surface, {
                    duration: 160,
                }),
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 12,
                shadowOpacity: withTiming(focused && !error ? 0.22 : 0, { duration: 160 }),
            };
        });

        const handleFocus = (e: any) => {
            isFocused.value = 1;
            onFocus?.(e);
        };

        const handleBlur = (e: any) => {
            isFocused.value = 0;
            onBlur?.(e);
        };

        return (
            <View className="w-full">
                {label && (
                    <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        {label}
                    </Text>
                )}

                <Animated.View
                    style={animatedContainerStyle}
                    className="flex-row items-center rounded-xl border-2 px-4"
                >
                    {leftIcon && <View className="mr-3">{leftIcon}</View>}

                    <AnimatedTextInput
                        ref={ref}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholderTextColor={theme.textTertiary}
                        className={`flex-1 h-14 text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark ${className || ''}`}
                        {...props}
                    />

                    {rightIcon && <View className="ml-3">{rightIcon}</View>}
                </Animated.View>

                {error && (
                    <View className="flex-row items-center mt-1.5">
                        <AlertCircle color={colors.error} size={14} />
                        <Text className="text-sm font-inter-regular text-error ml-1">
                            {error}
                        </Text>
                    </View>
                )}

                {hint && !error && (
                    <Text className="text-sm font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark mt-1.5">
                        {hint}
                    </Text>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';
