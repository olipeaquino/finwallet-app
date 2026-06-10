import { View, Text, ScrollView, Switch, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Moon,
    Sun,
    Fingerprint,
    Trash2,
    ChevronRight,
    FileSpreadsheet,
    Save,
    Clock,
    BellRing,
    Settings,
    Sparkles,
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { GradientCard, AnimatedView, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useSettingsStore, useTransactionStore, useGoalStore } from '@/stores';
import { exportService, notificationService } from '@/services';
import { colors, glow, elevation } from '@/constants';

interface SettingsItemProps {
    icon: React.ReactNode;
    iconBgColor: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    loading?: boolean;
    isLast?: boolean;
    destructive?: boolean;
    isDark: boolean;
}

function SettingsItem({
    icon,
    iconBgColor,
    title,
    subtitle,
    rightElement,
    onPress,
    loading,
    isLast,
    destructive,
    isDark,
}: SettingsItemProps) {
    const borderColor = isDark
        ? 'rgba(63,63,70,0.7)'
        : 'rgba(228,228,231,0.9)';

    return (
        <Pressable
            onPress={loading ? undefined : onPress}
            disabled={!onPress || loading}
            style={({ pressed }) => [
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    opacity: pressed && onPress ? 0.7 : 1,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: borderColor,
                },
            ]}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: iconBgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                    flexShrink: 0,
                }}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                    icon
                )}
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text
                    style={{
                        fontSize: 15,
                        fontFamily: 'Inter_500Medium',
                        color: destructive
                            ? colors.error
                            : isDark
                            ? colors.dark.textPrimary
                            : colors.light.textPrimary,
                        letterSpacing: -0.1,
                    }}
                >
                    {title}
                </Text>
                {subtitle ? (
                    <Text
                        style={{
                            fontSize: 12,
                            fontFamily: 'Inter_400Regular',
                            color: isDark
                                ? colors.dark.textSecondary
                                : colors.light.textSecondary,
                            marginTop: 2,
                        }}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {rightElement ? (
                <View style={{ marginLeft: 12, alignItems: 'center', justifyContent: 'center' }}>
                    {rightElement}
                </View>
            ) : null}
        </Pressable>
    );
}

interface SectionCardProps {
    label: string;
    labelColor?: string;
    children: React.ReactNode;
    isDark: boolean;
    delay?: number;
}

function SectionCard({ label, labelColor, children, isDark, delay = 0 }: SectionCardProps) {
    return (
        <AnimatedView animation="fadeInUp" delay={delay}>
            <Text
                style={{
                    fontSize: 11,
                    fontFamily: 'Inter_600SemiBold',
                    color: labelColor ?? (isDark ? colors.dark.textSecondary : colors.light.textSecondary),
                    letterSpacing: 1.3,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    marginLeft: 2,
                }}
            >
                {label}
            </Text>
            <View
                style={[
                    {
                        borderRadius: 20,
                        overflow: 'hidden',
                        backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                        borderWidth: 1,
                        borderColor: isDark ? colors.dark.border : colors.light.border,
                        marginBottom: 20,
                    },
                    elevation.sm,
                ]}
            >
                {children}
            </View>
        </AnimatedView>
    );
}

export default function SettingsScreen() {
    const { isDark, toggleTheme } = useThemeContext();
    const {
        notifications_enabled,
        biometric_enabled,
        setNotificationsEnabled,
        setBiometricEnabled,
    } = useSettingsStore();

    const [exportingTransactions, setExportingTransactions] = useState(false);
    const [exportingGoals, setExportingGoals] = useState(false);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState({ hour: 20, minute: 0 });

    const chevronColor = isDark ? colors.dark.textTertiary : colors.light.textTertiary;

    useEffect(() => {
        const loadSettings = async () => {
            const enabled = await notificationService.isDailyReminderEnabled();
            const time = await notificationService.getReminderTime();
            setDailyReminderEnabled(enabled);
            setReminderTime(time);
        };
        loadSettings();
    }, []);

    const handleDailyReminderToggle = async (value: boolean) => {
        if (value) {
            const hasPermission = await notificationService.requestPermission();
            if (hasPermission) {
                await notificationService.scheduleDailyReminder(reminderTime.hour, reminderTime.minute);
                setDailyReminderEnabled(true);
                showAlert('✅ Lembrete Ativado', `Você receberá um lembrete às ${reminderTime.hour}:00 para registrar suas despesas.`);
            } else {
                showAlert('Permissão Negada', 'Por favor, habilite notificações nas configurações do seu dispositivo.');
            }
        } else {
            await notificationService.cancelDailyReminder();
            setDailyReminderEnabled(false);
        }
    };

    const handleTestNotification = async () => {
        const hasPermission = await notificationService.requestPermission();
        if (hasPermission) {
            await notificationService.sendInstantNotification(
                '🎉 Teste de Notificação',
                'As notificações do FinWallet estão funcionando!'
            );
        } else {
            showAlert('Permissão Negada', 'Por favor, habilite notificações nas configurações.');
        }
    };

    const handleExportTransactions = async () => {
        setExportingTransactions(true);
        try {
            const filePath = await exportService.exportTransactionsToCSV();
            const shared = await exportService.shareFile(filePath);
            if (!shared) {
                showAlert('Sucesso', 'Arquivo CSV criado com sucesso!');
            }
        } catch (error) {
            showAlert('Erro', 'Não foi possível exportar os dados');
        } finally {
            setExportingTransactions(false);
        }
    };

    const handleExportGoals = async () => {
        setExportingGoals(true);
        try {
            const filePath = await exportService.exportGoalsToCSV();
            const shared = await exportService.shareFile(filePath);
            if (!shared) {
                showAlert('Sucesso', 'Arquivo CSV criado com sucesso!');
            }
        } catch (error) {
            showAlert('Erro', 'Não foi possível exportar as metas');
        } finally {
            setExportingGoals(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            const filePath = await exportService.exportBackup();
            const shared = await exportService.shareFile(filePath);
            if (!shared) {
                showAlert('Sucesso', 'Backup criado com sucesso!');
            }
        } catch (error) {
            showAlert('Erro', 'Não foi possível criar o backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleClearData = () => {
        showAlert(
            'Limpar Todos os Dados',
            'Esta ação irá APAGAR PERMANENTEMENTE todas as suas transações, metas e depósitos. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => {
                        showAlert(
                            'Confirmação Final',
                            'Tem CERTEZA ABSOLUTA? Esta ação NÃO PODE ser desfeita!',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Sim, Apagar Tudo',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            const { clearAllData } = await import('@/db');
                                            await clearAllData();

                                            await useTransactionStore.getState().refreshAll();
                                            await useGoalStore.getState().refreshAll();

                                            showAlert('✅ Dados Apagados', 'Todos os seus dados foram removidos com sucesso.');
                                        } catch (error) {
                                            console.error('Error clearing data:', error);
                                            showAlert('Erro', 'Não foi possível limpar os dados.');
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const switchColors = {
        false: isDark ? '#3F3F46' : '#E4E4E7',
        true: colors.primary[200],
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : colors.light.background }}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <AnimatedView animation="fadeInDown" delay={0}>
                    <View style={[{ borderRadius: 0, marginBottom: 0 }, glow.primary]}>
                        <GradientCard
                            colors={colors.gradients.primaryDeep as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ paddingTop: 28, paddingBottom: 32, paddingHorizontal: 20, overflow: 'hidden' }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '55%',
                                    backgroundColor: 'rgba(255,255,255,0.09)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    top: -50,
                                    right: -40,
                                    width: 160,
                                    height: 160,
                                    borderRadius: 80,
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -30,
                                    left: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                }}
                            />

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 16,
                                        backgroundColor: 'rgba(255,255,255,0.18)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 14,
                                    }}
                                >
                                    <Settings color="#FFFFFF" size={24} />
                                </View>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            fontFamily: 'Inter_600SemiBold',
                                            color: 'rgba(255,255,255,0.70)',
                                            letterSpacing: 1.4,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        FINWALLET
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 26,
                                            fontFamily: 'Inter_800ExtraBold',
                                            color: '#FFFFFF',
                                            letterSpacing: -0.5,
                                            marginTop: 2,
                                        }}
                                    >
                                        Configurações
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    alignSelf: 'flex-start',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 999,
                                    marginTop: 16,
                                }}
                            >
                                <Sparkles color="rgba(255,255,255,0.9)" size={13} />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontFamily: 'Inter_500Medium',
                                        color: 'rgba(255,255,255,0.9)',
                                        marginLeft: 6,
                                    }}
                                >
                                    Personalize sua experiência
                                </Text>
                            </View>
                        </GradientCard>
                    </View>
                </AnimatedView>

                <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>

                    <SectionCard label="Aparência" isDark={isDark} delay={60}>
                        <SettingsItem
                            icon={
                                isDark
                                    ? <Moon color={colors.primary[500]} size={19} />
                                    : <Sun color={colors.warning} size={19} />
                            }
                            iconBgColor={isDark ? colors.primary[900] + 'CC' : colors.primary[100]}
                            title="Modo Escuro"
                            subtitle={isDark ? 'Tema escuro ativado' : 'Tema claro ativado'}
                            rightElement={
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={switchColors}
                                    thumbColor={isDark ? colors.primary[500] : '#FFFFFF'}
                                />
                            }
                            isDark={isDark}
                            isLast
                        />
                    </SectionCard>

                    <SectionCard label="Segurança" isDark={isDark} delay={110}>
                        <SettingsItem
                            icon={<Fingerprint color={colors.secondary[500]} size={19} />}
                            iconBgColor={isDark ? colors.secondary[900] + 'CC' : colors.secondary[100]}
                            title="Login Biométrico"
                            subtitle="Use digital ou Face ID"
                            rightElement={
                                <Switch
                                    value={biometric_enabled}
                                    onValueChange={setBiometricEnabled}
                                    trackColor={switchColors}
                                    thumbColor={biometric_enabled ? colors.primary[500] : '#FFFFFF'}
                                />
                            }
                            isDark={isDark}
                            isLast
                        />
                    </SectionCard>

                    <SectionCard label="Notificações" isDark={isDark} delay={160}>
                        <SettingsItem
                            icon={<Clock color={colors.primary[500]} size={19} />}
                            iconBgColor={isDark ? colors.primary[900] + 'CC' : colors.primary[100]}
                            title="Lembrete Diário"
                            subtitle={
                                dailyReminderEnabled
                                    ? `Ativo às ${reminderTime.hour}:00`
                                    : 'Receba um lembrete para registrar gastos'
                            }
                            rightElement={
                                <Switch
                                    value={dailyReminderEnabled}
                                    onValueChange={handleDailyReminderToggle}
                                    trackColor={switchColors}
                                    thumbColor={dailyReminderEnabled ? colors.primary[500] : '#FFFFFF'}
                                />
                            }
                            isDark={isDark}
                        />
                        <SettingsItem
                            icon={<BellRing color={colors.warning} size={19} />}
                            iconBgColor={isDark ? '#451A03CC' : '#FEF3C7'}
                            title="Testar Notificação"
                            subtitle="Enviar notificação de teste agora"
                            rightElement={<ChevronRight color={chevronColor} size={18} />}
                            onPress={handleTestNotification}
                            isDark={isDark}
                            isLast
                        />
                    </SectionCard>

                    <SectionCard label="Exportar Dados" isDark={isDark} delay={210}>
                        <SettingsItem
                            icon={<FileSpreadsheet color={colors.income} size={19} />}
                            iconBgColor={isDark ? '#064E3BCC' : '#D1FAE5'}
                            title="Exportar Transações"
                            subtitle="Gerar arquivo CSV para Excel"
                            rightElement={<ChevronRight color={chevronColor} size={18} />}
                            onPress={handleExportTransactions}
                            loading={exportingTransactions}
                            isDark={isDark}
                        />
                        <SettingsItem
                            icon={<FileSpreadsheet color={colors.primary[500]} size={19} />}
                            iconBgColor={isDark ? colors.primary[900] + 'CC' : colors.primary[100]}
                            title="Exportar Metas"
                            subtitle="Gerar arquivo CSV para Excel"
                            rightElement={<ChevronRight color={chevronColor} size={18} />}
                            onPress={handleExportGoals}
                            loading={exportingGoals}
                            isDark={isDark}
                            isLast
                        />
                    </SectionCard>

                    <SectionCard label="Backup" isDark={isDark} delay={260}>
                        <SettingsItem
                            icon={<Save color={colors.secondary[500]} size={19} />}
                            iconBgColor={isDark ? colors.secondary[900] + 'CC' : colors.secondary[100]}
                            title="Criar Backup Completo"
                            subtitle="Salvar todos os dados em JSON"
                            rightElement={<ChevronRight color={chevronColor} size={18} />}
                            onPress={handleCreateBackup}
                            loading={creatingBackup}
                            isDark={isDark}
                            isLast
                        />
                    </SectionCard>

                    <SectionCard
                        label="Zona de Perigo"
                        labelColor={colors.error}
                        isDark={isDark}
                        delay={310}
                    >
                        <SettingsItem
                            icon={<Trash2 color={colors.error} size={19} />}
                            iconBgColor={isDark ? '#450A0ACC' : '#FEE2E2'}
                            title="Limpar Todos os Dados"
                            subtitle="Esta ação não pode ser desfeita"
                            rightElement={<ChevronRight color={colors.error} size={18} />}
                            onPress={handleClearData}
                            destructive
                            isDark={isDark}
                            isLast
                        />
                    </SectionCard>

                    <AnimatedView animation="fadeIn" delay={360}>
                        <View style={{ alignItems: 'center', paddingTop: 4, paddingBottom: 8 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: isDark
                                        ? 'rgba(139,92,246,0.12)'
                                        : 'rgba(139,92,246,0.08)',
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                    marginBottom: 10,
                                }}
                            >
                                <View
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 7,
                                        backgroundColor: colors.primary[500],
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'Inter_800ExtraBold' }}>
                                        F
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontFamily: 'Inter_600SemiBold',
                                        color: colors.primary[500],
                                        letterSpacing: 0.2,
                                    }}
                                >
                                    FinWallet
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontFamily: 'Inter_400Regular',
                                        color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                        marginLeft: 8,
                                    }}
                                >
                                    v1.0.0
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontFamily: 'Inter_400Regular',
                                    color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                    textAlign: 'center',
                                }}
                            >
                                Desenvolvido com React Native
                            </Text>
                        </View>
                    </AnimatedView>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
