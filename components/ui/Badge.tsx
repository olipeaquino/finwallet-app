import React from 'react';
import { View, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
    'flex-row items-center rounded-full',
    {
        variants: {
            variant: {
                default: 'bg-surface-variant-light dark:bg-surface-variant-dark',
                primary: 'bg-primary-100 dark:bg-primary-900',
                success: 'bg-green-100 dark:bg-green-900',
                warning: 'bg-amber-100 dark:bg-amber-900',
                error: 'bg-red-100 dark:bg-red-900',
            },
            size: {
                sm: 'px-2 py-1',
                md: 'px-3 py-1.5',
                lg: 'px-4 py-2',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

const textVariants = cva(
    'font-inter-medium',
    {
        variants: {
            variant: {
                default: 'text-text-secondary-light dark:text-text-secondary-dark',
                primary: 'text-primary-600 dark:text-primary-300',
                success: 'text-green-600 dark:text-green-300',
                warning: 'text-amber-600 dark:text-amber-300',
                error: 'text-red-600 dark:text-red-300',
            },
            size: {
                sm: 'text-xs',
                md: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export function Badge({ children, variant, size, icon, className }: BadgeProps) {
    return (
        <View className={`${badgeVariants({ variant, size })} ${className || ''}`}>
            {icon && <View className="mr-1">{icon}</View>}
            <Text className={textVariants({ variant, size })}>{children}</Text>
        </View>
    );
}
