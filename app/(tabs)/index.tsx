import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, TrendingDown, BarChart2, Wallet, ArrowUpRight, ArrowDownRight, Hand } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Card, GradientCard, Button, AmountDisplay, AnimatedView, getStaggerDelay } from '@/components/ui';
import { PieChart, BarChart } from '@/components/charts';
import { useThemeContext } from '@/providers';
import { useTransactionStore } from '@/stores';
import { colors, glow } from '@/constants';
import { useEffect } from 'react';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function WavingHand() {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withDelay(
            300,
            withSequence(
                withTiming(-12, { duration: 130, easing: Easing.inOut(Easing.quad) }),
                withTiming(14, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(-8, { duration: 130, easing: Easing.inOut(Easing.quad) }),
                withTiming(12, { duration: 130, easing: Easing.inOut(Easing.quad) }),
                withTiming(-5, { duration: 120, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 120, easing: Easing.inOut(Easing.quad) }),
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View style={[{ marginLeft: 6, transformOrigin: 'bottom center' } as any, style]}>
            <Hand color={colors.warning} size={16} />
        </Animated.View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();

    const {
        transactions,
        totalIncome,
        totalExpense,
        balance,
        categoryDistribution,
        monthlyEvolution,
        fetchTransactions,
        fetchSummary,
        fetchCategoryDistribution,
        fetchMonthlyEvolution,
    } = useTransactionStore();

    useEffect(() => {
        const now = new Date();
        fetchSummary(now.getFullYear(), now.getMonth() + 1);
        fetchCategoryDistribution(now.getFullYear(), now.getMonth() + 1);
        fetchTransactions({ limit: 5 });
        fetchMonthlyEvolution();
    }, []);

    const recentTransactions = transactions.slice(0, 5);
    const now = new Date();
    const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const positive = balance >= 0;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <ScrollView
                className="flex-1"
                contentContainerClassName="p-4 pb-8"
                showsVerticalScrollIndicator={false}
            >
                <AnimatedView animation="fadeInDown" delay={0}>
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <View className="flex-row items-center">
                                <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    Bem-vindo de volta
                                </Text>
                                <WavingHand />
                            </View>
                            <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                                FinWallet
                            </Text>
                        </View>
                        <View className="flex-row" style={{ gap: 8 }}>
                            <Pressable
                                onPress={() => router.push('/budgets' as any)}
                                className="w-11 h-11 rounded-2xl bg-secondary-100 dark:bg-secondary-900 items-center justify-center"
                            >
                                <Wallet color={colors.secondary[500]} size={20} />
                            </Pressable>
                            <Pressable
                                onPress={() => router.push('/reports')}
                                className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900 items-center justify-center"
                            >
                                <BarChart2 color={colors.primary[500]} size={20} />
                            </Pressable>
                        </View>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInDown" delay={80}>
                    <View style={[{ borderRadius: 28, marginBottom: 16 }, glow.primary]}>
                        <GradientCard
                            colors={colors.gradients.primary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 28, padding: 24, overflow: 'hidden' }}
                        >
                            <View style={{ paddingVertical: 8 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.4 }}>
                                    SALDO ATUAL
                                </Text>
                                <Text style={{ fontSize: 44, fontWeight: '800', color: '#FFFFFF', marginTop: 6, letterSpacing: -1 }}>
                                    R$ {(balance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.18)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                            borderRadius: 999,
                                        }}
                                    >
                                        {positive ? (
                                            <TrendingUp color="#FFFFFF" size={14} />
                                        ) : (
                                            <TrendingDown color="#FFFFFF" size={14} />
                                        )}
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF', marginLeft: 5 }}>
                                            {positive ? 'Saldo positivo' : 'Saldo negativo'}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.75)', marginLeft: 10 }}>
                                        {monthLabel}
                                    </Text>
                                </View>
                            </View>
                        </GradientCard>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInDown" delay={140}>
                    <View className="flex-row gap-4 mb-6">
                        <Card variant="default" elevation="md" className="flex-1">
                            <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: colors.income + '1A' }}>
                                <ArrowUpRight color={colors.income} size={20} />
                            </View>
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                                Receitas
                            </Text>
                            <AmountDisplay amount={totalIncome} type="income" size="lg" />
                        </Card>

                        <Card variant="default" elevation="md" className="flex-1">
                            <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: colors.expense + '1A' }}>
                                <ArrowDownRight color={colors.expense} size={20} />
                            </View>
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                                Despesas
                            </Text>
                            <AmountDisplay amount={totalExpense} type="expense" size="lg" />
                        </Card>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInDown" delay={200}>
                    <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                        Ações Rápidas
                    </Text>
                    <View className="flex-row gap-3 mb-6">
                        <Button
                            variant="income"
                            size="md"
                            leftIcon={<Plus color="white" size={20} />}
                            onPress={() => router.push('/transaction/new?type=income')}
                            className="flex-1"
                        >
                            Receita
                        </Button>
                        <Button
                            variant="expense"
                            size="md"
                            leftIcon={<Plus color="white" size={20} />}
                            onPress={() => router.push('/transaction/new?type=expense')}
                            className="flex-1"
                        >
                            Despesa
                        </Button>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={240}>
                    <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                        Gastos por Categoria
                    </Text>
                    <Card variant="elevated" className="mb-6">
                        <PieChart data={categoryDistribution} isDark={isDark} />
                    </Card>
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={280}>
                    <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                        Evolução Mensal
                    </Text>
                    <Card variant="elevated" className="mb-6">
                        <BarChart data={monthlyEvolution} isDark={isDark} />
                    </Card>
                </AnimatedView>

                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                        Últimas Transações
                    </Text>
                    <Button variant="ghost" size="sm" onPress={() => router.push('/transactions')}>
                        Ver todas
                    </Button>
                </View>

                {recentTransactions.length > 0 ? (
                    <Card variant="default">
                        {recentTransactions.map((tx, index) => (
                            <View
                                key={tx.id}
                                className={`flex-row items-center justify-between ${index > 0 ? 'mt-4 pt-4 border-t border-border-light dark:border-border-dark' : ''}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                        style={{ backgroundColor: (tx.category_color || colors.primary[500]) + '1A' }}
                                    >
                                        <Text style={{ color: tx.category_color || colors.primary[500], fontWeight: '700', fontSize: 16 }}>
                                            {tx.category_name?.charAt(0).toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-inter-semibold text-text-primary-light dark:text-text-primary-dark" numberOfLines={1}>
                                            {tx.description}
                                        </Text>
                                        <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark">
                                            {tx.category_name || 'Sem categoria'} · {new Date(tx.date).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                </View>
                                <AmountDisplay
                                    amount={tx.amount}
                                    type={tx.type}
                                    size="sm"
                                    showSign
                                />
                            </View>
                        ))}
                    </Card>
                ) : (
                    <Card variant="filled" className="items-center py-10">
                        <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mb-3">
                            <Wallet color={colors.primary[500]} size={30} />
                        </View>
                        <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark text-center">
                            Nenhuma transação ainda
                        </Text>
                        <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark text-center mt-1 mb-4">
                            Adicione sua primeira transação!
                        </Text>
                        <Button
                            variant="primary"
                            size="md"
                            leftIcon={<Plus color="white" size={20} />}
                            onPress={() => router.push('/transaction/new')}
                        >
                            Nova Transação
                        </Button>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
