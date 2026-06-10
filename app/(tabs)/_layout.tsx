import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, Receipt, Target, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/providers';
import { colors } from '@/constants';

export default function TabLayout() {
    const { isDark } = useThemeContext();
    const insets = useSafeAreaInsets();

    const tabBarBackground = isDark ? colors.dark.surface : colors.light.surface;
    const tabBarBorder = isDark ? colors.dark.border : colors.light.border;
    const activeColor = colors.primary[500];
    const inactiveColor = isDark ? colors.dark.textTertiary : colors.light.textTertiary;
    const pillBg = isDark ? colors.primary[900] : colors.primary[100];

    const bottomPadding = Math.max(insets.bottom, 10);

    const renderIcon = (Icon: typeof Home) =>
        ({ color, focused }: { color: string; focused: boolean }) => (
            <View
                style={{
                    width: 52,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: focused ? pillBg : 'transparent',
                }}
            >
                <Icon color={color} size={22} strokeWidth={focused ? 2.4 : 2} />
            </View>
        );

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: tabBarBackground,
                    borderTopColor: tabBarBorder,
                    borderTopWidth: 0.5,
                    height: 64 + bottomPadding,
                    paddingTop: 8,
                    paddingBottom: bottomPadding,
                    shadowColor: '#0B0B14',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                    elevation: 16,
                },
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarLabelStyle: {
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 11,
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ title: 'Início', tabBarIcon: renderIcon(Home) }}
            />
            <Tabs.Screen
                name="transactions"
                options={{ title: 'Transações', tabBarIcon: renderIcon(Receipt) }}
            />
            <Tabs.Screen
                name="goals"
                options={{ title: 'Metas', tabBarIcon: renderIcon(Target) }}
            />
            <Tabs.Screen
                name="settings"
                options={{ title: 'Config.', tabBarIcon: renderIcon(Settings) }}
            />
        </Tabs>
    );
}
