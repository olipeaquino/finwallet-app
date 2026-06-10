import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useThemeContext } from '@/providers';
import { colors } from '@/constants';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
    const { isDark } = useThemeContext();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const backgroundColor = isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant;

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function TransactionSkeleton() {
    return (
        <View style={styles.transactionItem}>
            <Skeleton width={48} height={48} borderRadius={12} />
            <View style={styles.transactionContent}>
                <Skeleton width={120} height={16} style={{ marginBottom: 6 }} />
                <Skeleton width={80} height={12} />
            </View>
            <Skeleton width={70} height={16} />
        </View>
    );
}

export function CardSkeleton() {
    return (
        <View style={styles.card}>
            <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={24} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={8} borderRadius={4} />
        </View>
    );
}

export function GoalSkeleton() {
    return (
        <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Skeleton width={100} height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width={60} height={12} />
                </View>
                <Skeleton width={40} height={16} />
            </View>
            <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 12 }} />
        </View>
    );
}

interface ListSkeletonProps {
    count?: number;
    type?: 'transaction' | 'goal' | 'card';
}

export function ListSkeleton({ count = 3, type = 'transaction' }: ListSkeletonProps) {
    const Component = type === 'transaction'
        ? TransactionSkeleton
        : type === 'goal'
            ? GoalSkeleton
            : CardSkeleton;

    return (
        <View>
            {Array.from({ length: count }).map((_, index) => (
                <Component key={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    transactionContent: {
        flex: 1,
        marginLeft: 12,
    },
    card: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
    },
    goalItem: {
        padding: 16,
        marginBottom: 12,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
