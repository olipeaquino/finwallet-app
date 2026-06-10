import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, AppState, AppStateStatus } from 'react-native';
import { Fingerprint, ShieldCheck, AlertCircle } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/services';
import { useSettingsStore } from '@/stores';
import { colors, glow } from '@/constants';

interface AuthGateProps {
    children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [biometricLabel, setBiometricLabel] = useState('Biometria');

    const { biometric_enabled } = useSettingsStore();

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const authenticate = async () => {
        setError(null);
        setIsLoading(true);

        try {
            if (!biometric_enabled) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            const isAvailable = await authService.isAvailable();
            if (!isAvailable) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            const label = await authService.getBiometricLabel();
            setBiometricLabel(label);

            const result = await authService.authenticate();

            if (result.success) {
                setIsAuthenticated(true);
            } else {
                setError(result.error || 'Falha na autenticação');
            }
        } catch (err) {
            setError('Erro durante autenticação');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active' && biometric_enabled && isAuthenticated) {
            } else if (nextAppState === 'background' && biometric_enabled) {
                setIsAuthenticated(false);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [biometric_enabled, isAuthenticated]);

    useEffect(() => {
        authenticate();
    }, [biometric_enabled]);

    if (isAuthenticated) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <View style={[{ borderRadius: 28 }, glow.primary]}>
                    <LinearGradient
                        colors={colors.gradients.primary as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ShieldCheck color="#FFFFFF" size={44} />
                    </LinearGradient>
                </View>
                <Text className="text-text-primary-light dark:text-text-primary-dark text-lg font-inter-semibold mt-5">
                    Verificando...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-8">
            <View style={[{ borderRadius: 32, marginBottom: 24 }, glow.primary]}>
                <LinearGradient
                    colors={colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ShieldCheck color="#FFFFFF" size={48} />
                </LinearGradient>
            </View>

            <Text className="text-text-primary-light dark:text-text-primary-dark text-3xl font-inter-bold mb-2 tracking-tight">
                FinWallet
            </Text>

            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base font-inter-regular text-center mb-10">
                Use {biometricLabel} para desbloquear
            </Text>

            {error && (
                <View className="flex-row items-center bg-error/10 px-4 py-3 rounded-xl mb-8">
                    <AlertCircle color={colors.error} size={20} />
                    <Text className="text-error font-inter-medium ml-2">
                        {error}
                    </Text>
                </View>
            )}

            <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
                <Pressable onPress={authenticate}>
                    <Animated.View style={[animatedStyle, glow.primary, { borderRadius: 999 }]}>
                        <LinearGradient
                            colors={colors.gradients.primary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Fingerprint color="#FFFFFF" size={40} />
                        </LinearGradient>
                    </Animated.View>
                </Pressable>
            </View>

            <Text className="text-text-tertiary-light dark:text-text-tertiary-dark text-sm font-inter-regular mt-5">
                Toque para autenticar
            </Text>
        </View>
    );
}
