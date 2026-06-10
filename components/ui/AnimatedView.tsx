import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

interface AnimatedViewProps {
    children: React.ReactNode;
    animation?:
    | 'fadeIn' | 'fadeInDown' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight'
    | 'slideInDown' | 'slideInUp' | 'slideInLeft' | 'slideInRight'
    | 'zoomIn' | 'scale' | 'custom';
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    className?: string;
}

const offsetFor = (animation: string): { x: number; y: number } => {
    switch (animation) {
        case 'fadeInUp':
        case 'slideInUp':
            return { x: 0, y: 8 };
        case 'fadeInDown':
        case 'slideInDown':
            return { x: 0, y: -8 };
        case 'fadeInLeft':
        case 'slideInLeft':
            return { x: -8, y: 0 };
        case 'fadeInRight':
        case 'slideInRight':
            return { x: 8, y: 0 };
        default:
            return { x: 0, y: 0 };
    }
};

export function AnimatedView({
    children,
    animation = 'fadeIn',
    delay = 0,
    duration = 300,
    style,
    className,
}: AnimatedViewProps) {
    const progress = useSharedValue(0);
    const start = offsetFor(animation);

    useEffect(() => {
        progress.value = withDelay(
            delay,
            withTiming(1, { duration, easing: Easing.out(Easing.quad) })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [
            { translateX: start.x * (1 - progress.value) },
            { translateY: start.y * (1 - progress.value) },
        ],
    }));

    return (
        <Animated.View style={[animatedStyle, style]} className={className}>
            {children}
        </Animated.View>
    );
}

export function getStaggerDelay(index: number, baseDelay: number = 40): number {
    return index * baseDelay;
}
