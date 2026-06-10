import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/providers';
import { colors } from '@/constants';

interface AmountDisplayProps {
    amount: number;
    type?: 'income' | 'expense' | 'neutral';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showSign?: boolean;
    currency?: string;
    className?: string;
    adaptive?: boolean;
}

const baseFontSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

const getAdaptiveFontSize = (amount: number, baseSize: number): number => {
    const absAmount = Math.abs(amount / 100);

    if (absAmount >= 10000000) {
        return baseSize * 0.5;
    } else if (absAmount >= 1000000) {
        return baseSize * 0.6;
    } else if (absAmount >= 100000) {
        return baseSize * 0.7;
    } else if (absAmount >= 10000) {
        return baseSize * 0.85;
    }
    return baseSize;
};

const colorMap = {
    income: colors.income,
    expense: colors.expense,
};

export function AmountDisplay({
    amount,
    type = 'neutral',
    size = 'md',
    showSign = false,
    currency = 'BRL',
    className,
    adaptive = true,
}: AmountDisplayProps) {
    const { isDark } = useThemeContext();

    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount / 100);

    const sign = showSign && amount > 0 ? '+' : '';
    const displayAmount = type === 'expense' && showSign
        ? `-${formattedAmount.replace('-', '')}`
        : `${sign}${formattedAmount}`;

    const baseSize = baseFontSizes[size];
    const fontSize = adaptive ? getAdaptiveFontSize(amount, baseSize) : baseSize;

    const textColor = type === 'neutral'
        ? (isDark ? colors.dark.textPrimary : colors.light.textPrimary)
        : colorMap[type];

    return (
        <Text
            style={{
                fontSize,
                fontWeight: 'bold',
                color: textColor,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
        >
            {displayAmount}
        </Text>
    );
}
