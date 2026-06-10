import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, Text, LogBox } from 'react-native';
import { useEffect, useState } from 'react';
import { ThemeProvider, useThemeContext } from '@/providers';
import { initializeDatabase } from '@/db';
import { useTransactionStore } from '@/stores';
import { AuthGate } from '@/components/AuthGate';
import { DialogHost } from '@/components/ui';
import { colors, glow } from '@/constants';
import '../global.css';

LogBox.ignoreLogs([
    'expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go',
    'Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go',
]);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
        },
    },
});

function BrandSplash({ label }: { label?: string }) {
    return (
        <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
            <View style={[{ borderRadius: 28 }, glow.primary]}>
                <LinearGradient
                    colors={colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 92, height: 92, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: '#FFFFFF', fontSize: 42, fontWeight: '800' }}>F</Text>
                </LinearGradient>
            </View>
            <Text style={{ marginTop: 20, fontSize: 22, fontWeight: '700', color: colors.primary[500], letterSpacing: -0.5 }}>
                FinWallet
            </Text>
            <ActivityIndicator size="small" color={colors.primary[500]} style={{ marginTop: 16 }} />
            {label ? (
                <Text className="text-text-secondary-light dark:text-text-secondary-dark" style={{ marginTop: 10 }}>
                    {label}
                </Text>
            ) : null}
        </View>
    );
}

function RootLayoutContent() {
    const { isDark } = useThemeContext();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: isDark ? '#0C0A09' : '#FAFAF9',
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="transaction/new"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="goal/new"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
            </Stack>
        </>
    );
}

function AppInitializer({ children }: { children: React.ReactNode }) {
    const [isDbReady, setIsDbReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshAll } = useTransactionStore();

    useEffect(() => {
        async function init() {
            try {
                await initializeDatabase();
                await refreshAll();
                setIsDbReady(true);
            } catch (e) {
                console.error('Database initialization failed:', e);
                setError((e as Error).message);
            }
        }
        init();
    }, []);

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark p-4">
                <Text className="text-error text-center mb-2">Database Error</Text>
                <Text className="text-text-secondary-light text-center">{error}</Text>
            </View>
        );
    }

    if (!isDbReady) {
        return <BrandSplash label="Carregando seus dados..." />;
    }

    return <>{children}</>;
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    if (!fontsLoaded) {
        return <BrandSplash />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AppInitializer>
                        <AuthGate>
                            <RootLayoutContent />
                        </AuthGate>
                    </AppInitializer>
                    <DialogHost />
                </ThemeProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
