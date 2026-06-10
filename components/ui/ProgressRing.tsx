import { View, Text } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { useEffect, useRef } from 'react';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showPercentage?: boolean;
    centerText?: string;
    isDark?: boolean;
    gradientColors?: [string, string];
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 10,
    color = '#047857',
    backgroundColor = '#E7E5E4',
    showPercentage = true,
    centerText,
    isDark = false,
    gradientColors,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    const gradId = useRef(`ringGrad-${Math.round(Math.random() * 1e9)}`).current;

    const clampedProgress = Math.min(100, Math.max(0, progress));

    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(clampedProgress, {
            duration: 650,
            easing: Easing.out(Easing.quad),
        });
    }, [clampedProgress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
        return {
            strokeDashoffset,
        };
    });

    const displayProgress = Math.round(clampedProgress);
    const strokeColor = gradientColors ? `url(#${gradId})` : color;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                {gradientColors && (
                    <Defs>
                        <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor={gradientColors[0]} />
                            <Stop offset="1" stopColor={gradientColors[1]} />
                        </SvgLinearGradient>
                    </Defs>
                )}
                <G rotation="-90" origin={`${center}, ${center}`}>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={isDark ? '#27272A' : backgroundColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                    />
                </G>
            </Svg>

            <View
                style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {showPercentage && (
                    <Text
                        style={{
                            fontSize: size / 4,
                            fontWeight: 'bold',
                            color: isDark ? '#FAFAFA' : '#18181B',
                        }}
                    >
                        {displayProgress}%
                    </Text>
                )}
                {centerText && (
                    <Text
                        style={{
                            fontSize: size / 11,
                            color: isDark ? '#A1A1AA' : '#71717A',
                            marginTop: 2,
                        }}
                    >
                        {centerText}
                    </Text>
                )}
            </View>
        </View>
    );
}
