import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Plus, Wallet,
    AlertTriangle, CheckCircle, TrendingUp, Target,
} from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { Card, GradientCard, Button, AnimatedView, getStaggerDelay, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { budgetService, categoryService } from '@/services';
import { colors, glow, elevation } from '@/constants';
import { Budget, BudgetSummary, Category } from '@/types';

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function BudgetsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [budgetsData, summaryData, categoriesData] = await Promise.all([
                budgetService.getAll(selectedMonth, selectedYear),
                budgetService.getSummary(selectedMonth, selectedYear),
                categoryService.getAll(),
            ]);
            setBudgets(budgetsData);
            setSummary(summaryData);
            setCategories(categoriesData.filter(c => c.type === 'expense' || c.type === 'both'));
        } catch (error) {
            console.error('Error loading budgets:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedMonth, selectedYear])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const goToPreviousMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const getBudgetStatus = (spent: number, amount: number) => {
        const percentage = amount > 0 ? (spent / amount) * 100 : 0;
        if (percentage >= 100) {
            return {
                color: colors.error,
                gradientColors: colors.gradients.expense as [string, string],
                icon: AlertTriangle,
                label: 'Excedido',
                badgeBg: 'rgba(239,68,68,0.15)',
            };
        } else if (percentage >= 80) {
            return {
                color: colors.warning,
                gradientColors: ['#FBBF24', '#F59E0B'] as [string, string],
                icon: TrendingUp,
                label: 'Atenção',
                badgeBg: 'rgba(245,158,11,0.15)',
            };
        }
        return {
            color: colors.income,
            gradientColors: colors.gradients.income as [string, string],
            icon: CheckCircle,
            label: 'OK',
            badgeBg: 'rgba(16,185,129,0.15)',
        };
    };

    const overallPercentage = summary && summary.totalBudget > 0
        ? (summary.totalSpent / summary.totalBudget) * 100
        : 0;

    const handleBudgetPress = (budget: Budget) => {
        showAlert(
            budget.category_name || 'Orçamento',
            `Limite: R$ ${(budget.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Editar Limite',
                    onPress: () => handleEditBudget(budget),
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => handleDeleteBudget(budget),
                },
            ]
        );
    };

    const handleEditBudget = (budget: Budget) => {
        router.push({ pathname: '/budget/edit/[id]', params: { id: budget.id } } as any);
    };

    const handleDeleteBudget = (budget: Budget) => {
        showAlert(
            'Excluir Orçamento',
            `Deseja excluir o orçamento de ${budget.category_name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await budgetService.delete(budget.id);
                            await loadData();
                        } catch (error) {
                            showAlert('Erro', 'Não foi possível excluir');
                        }
                    },
                },
            ]
        );
    };

    const renderBudgetCard = (budget: Budget, index: number) => {
        const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
        const status = getBudgetStatus(budget.spent, budget.amount);
        const StatusIcon = status.icon;
        const categoryColor = budget.category_color || colors.primary[500];

        return (
            <AnimatedView
                key={budget.id}
                animation="fadeInUp"
                delay={getStaggerDelay(index, 60)}
            >
                <Pressable
                    onPress={() => handleBudgetPress(budget)}
                    style={[
                        {
                            backgroundColor: isDark ? colors.dark.surface : '#FFFFFF',
                            borderRadius: 20,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: isDark ? colors.dark.border : colors.light.border,
                        },
                        elevation.sm,
                    ]}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 14,
                                    backgroundColor: categoryColor + '1A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}
                            >
                                <Wallet color={categoryColor} size={20} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: '600',
                                        color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                        letterSpacing: -0.2,
                                    }}
                                >
                                    {budget.category_name || 'Categoria'}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                        marginTop: 2,
                                    }}
                                >
                                    R$ {(budget.spent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    {' '}de R$ {(budget.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: status.badgeBg,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 999,
                            }}
                        >
                            <StatusIcon color={status.color} size={13} />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '700',
                                    color: status.color,
                                    marginLeft: 5,
                                    letterSpacing: -0.2,
                                }}
                            >
                                {percentage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            height: 10,
                            backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                            borderRadius: 999,
                            overflow: 'hidden',
                        }}
                    >
                        <LinearGradient
                            colors={status.gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: '100%',
                                width: `${Math.min(percentage, 100)}%`,
                                borderRadius: 999,
                            }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: status.badgeBg,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={{ fontSize: 11, fontWeight: '600', color: status.color }}>
                                {status.label}
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontSize: 10,
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                letterSpacing: 0.2,
                            }}
                        >
                            Toque para gerenciar
                        </Text>
                    </View>
                </Pressable>
            </AnimatedView>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <AnimatedView animation="fadeInDown" delay={0}>
                <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                            }}
                        >
                            <ArrowLeft color={iconColor} size={20} />
                        </Pressable>
                        <View>
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    letterSpacing: 1.4,
                                    textTransform: 'uppercase',
                                    color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                }}
                            >
                                Controle
                            </Text>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: '800',
                                    letterSpacing: -0.5,
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                }}
                            >
                                Orçamentos
                            </Text>
                        </View>
                    </View>

                    <View style={[{ borderRadius: 14 }, glow.primary]}>
                        <Pressable
                            onPress={() => router.push('/budget/new' as any)}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                overflow: 'hidden',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <LinearGradient
                                colors={colors.gradients.primary as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Plus color="#FFFFFF" size={20} />
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </AnimatedView>

            <AnimatedView animation="fadeInDown" delay={60}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginHorizontal: 16,
                        marginVertical: 12,
                        backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                        borderRadius: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                    }}
                >
                    <Pressable
                        onPress={goToPreviousMonth}
                        style={{
                            width: 40,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                        }}
                    >
                        <ChevronLeft color={colors.primary[500]} size={22} />
                    </Pressable>

                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                letterSpacing: -0.3,
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                            }}
                        >
                            {MONTH_NAMES[selectedMonth - 1]}
                        </Text>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: '500',
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                marginTop: 1,
                            }}
                        >
                            {selectedYear}
                        </Text>
                    </View>

                    <Pressable
                        onPress={goToNextMonth}
                        style={{
                            width: 40,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                        }}
                    >
                        <ChevronRight color={colors.primary[500]} size={22} />
                    </Pressable>
                </View>
            </AnimatedView>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {summary && summary.budgetsCount > 0 && (
                    <AnimatedView animation="fadeInDown" delay={120}>
                        <View style={[{ borderRadius: 28, marginBottom: 24 }, glow.primary]}>
                            <GradientCard
                                colors={colors.gradients.primary as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 28, padding: 24, overflow: 'hidden' }}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '55%',
                                        backgroundColor: 'rgba(255,255,255,0.10)',
                                    }}
                                />
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: -40,
                                        right: -30,
                                        width: 130,
                                        height: 130,
                                        borderRadius: 65,
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    }}
                                />

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10,
                                        }}
                                    >
                                        <Target color="#FFFFFF" size={20} />
                                    </View>
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: '600',
                                                color: 'rgba(255,255,255,0.70)',
                                                letterSpacing: 1.4,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            ORÇAMENTO TOTAL
                                        </Text>
                                        <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.60)' }}>
                                            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={{
                                        fontSize: 40,
                                        fontWeight: '800',
                                        color: '#FFFFFF',
                                        letterSpacing: -1,
                                        marginBottom: 4,
                                    }}
                                >
                                    R$ {(summary.totalSpent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: '500', marginBottom: 16 }}>
                                    de R$ {(summary.totalBudget / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>

                                <View
                                    style={{
                                        height: 10,
                                        backgroundColor: 'rgba(255,255,255,0.25)',
                                        borderRadius: 999,
                                        overflow: 'hidden',
                                        marginBottom: 14,
                                    }}
                                >
                                    <View
                                        style={{
                                            height: '100%',
                                            width: `${Math.min(overallPercentage, 100)}%`,
                                            backgroundColor: overallPercentage >= 100 ? colors.error : '#FFFFFF',
                                            borderRadius: 999,
                                        }}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {summary.overLimitCount > 0 && (
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(239,68,68,0.30)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 5,
                                                    borderRadius: 999,
                                                }}
                                            >
                                                <AlertTriangle color="#FFFFFF" size={12} />
                                                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                                    {summary.overLimitCount} excedido{summary.overLimitCount !== 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                        )}
                                        {summary.nearLimitCount > 0 && (
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(245,158,11,0.30)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 5,
                                                    borderRadius: 999,
                                                }}
                                            >
                                                <TrendingUp color="#FFFFFF" size={12} />
                                                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                                    {summary.nearLimitCount} atenção
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.20)',
                                            paddingHorizontal: 12,
                                            paddingVertical: 5,
                                            borderRadius: 999,
                                        }}
                                    >
                                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: -0.3 }}>
                                            {overallPercentage.toFixed(0)}%
                                        </Text>
                                    </View>
                                </View>
                            </GradientCard>
                        </View>
                    </AnimatedView>
                )}

                {budgets.length > 0 ? (
                    <>
                        <AnimatedView animation="fadeInDown" delay={180}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                                <View
                                    style={{
                                        width: 4,
                                        height: 18,
                                        borderRadius: 2,
                                        backgroundColor: colors.primary[500],
                                        marginRight: 8,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 17,
                                        fontWeight: '700',
                                        letterSpacing: -0.3,
                                        color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    }}
                                >
                                    Por Categoria
                                </Text>
                                <View
                                    style={{
                                        marginLeft: 8,
                                        backgroundColor: colors.primary[500] + '1A',
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 999,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            color: colors.primary[500],
                                        }}
                                    >
                                        {budgets.length}
                                    </Text>
                                </View>
                            </View>
                        </AnimatedView>

                        {budgets.map((budget, index) => renderBudgetCard(budget, index))}
                    </>
                ) : (
                    <AnimatedView animation="zoomIn" delay={160}>
                        <Card variant="filled" style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
                            <View
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 36,
                                    backgroundColor: colors.primary[500] + '1A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 16,
                                }}
                            >
                                <Target color={colors.primary[500]} size={32} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 17,
                                    fontWeight: '700',
                                    letterSpacing: -0.3,
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    marginBottom: 6,
                                    textAlign: 'center',
                                }}
                            >
                                Nenhum orçamento definido
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                    textAlign: 'center',
                                    lineHeight: 20,
                                    marginBottom: 24,
                                    maxWidth: 260,
                                }}
                            >
                                Defina limites para controlar seus gastos por categoria e receba alertas antes de exceder
                            </Text>
                            <Button
                                variant="primary"
                                size="md"
                                leftIcon={<Plus color="#FFFFFF" size={18} />}
                                onPress={() => router.push('/budget/new' as any)}
                            >
                                Criar Orçamento
                            </Button>
                        </Card>
                    </AnimatedView>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
