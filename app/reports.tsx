import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, Minus,
    Lightbulb, Wallet, Target, PartyPopper,
    AlertTriangle, FileText, BarChart2,
    ArrowUpRight, ArrowDownRight,
    type LucideIcon,
} from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, GradientCard, AmountDisplay, AnimatedView, getStaggerDelay, Button } from '@/components/ui';
import { BarChart } from '@/components/charts';
import { useThemeContext } from '@/providers';
import { analyticsService } from '@/services';
import { colors, glow, elevation } from '@/constants';

interface Insight {
    type: 'warning' | 'success' | 'info';
    icon: string;
    title: string;
    description: string;
}

interface MonthlyReport {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    topCategories: Array<{
        category_id: string;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>;
    transactionCount: number;
}

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function ReportsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState<MonthlyReport | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [comparison, setComparison] = useState<{ incomeChange: number; expenseChange: number } | null>(null);
    const [chartData, setChartData] = useState<Array<{ month: string; year: number; income: number; expense: number }>>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [reportData, insightsData, comparisonData, last6Months] = await Promise.all([
                analyticsService.getMonthlyReport(selectedMonth, selectedYear),
                analyticsService.generateInsights(selectedMonth, selectedYear),
                analyticsService.getMonthComparison(selectedMonth, selectedYear),
                analyticsService.getLast6MonthsSummary(),
            ]);

            setReport(reportData);
            setInsights(insightsData);
            setComparison({
                incomeChange: comparisonData.incomeChange,
                expenseChange: comparisonData.expenseChange,
            });

            const now = new Date();
            setChartData(last6Months.map((item, index) => {
                const monthIndex = now.getMonth() - (5 - index);
                const date = new Date(now.getFullYear(), monthIndex, 1);
                return {
                    month: String(date.getMonth() + 1),
                    year: date.getFullYear(),
                    income: item.income,
                    expense: item.expense,
                };
            }));
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
        const now = new Date();
        const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
        if (isCurrentMonth) return;

        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();

    const renderChangeIndicator = (change: number, label: string) => {
        const isPositive = change > 0;
        const isNegative = change < 0;
        const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
        const color = label === 'Receita'
            ? (isPositive ? colors.income : colors.expense)
            : (isPositive ? colors.expense : colors.income);

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: color + '18',
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 999,
                    alignSelf: 'flex-start',
                    marginTop: 4,
                }}
            >
                <Icon color={color} size={12} />
                <Text style={{ color, marginLeft: 3, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                    {Math.abs(change).toFixed(0)}%
                </Text>
            </View>
        );
    };

    const iconMap: Record<string, LucideIcon> = {
        TrendingUp,
        TrendingDown,
        Wallet,
        Target,
        PartyPopper,
        AlertTriangle,
        FileText,
    };

    const getInsightColor = (type: 'warning' | 'success' | 'info') => {
        switch (type) {
            case 'success': return colors.income;
            case 'warning': return colors.warning;
            case 'info': return colors.primary[500];
        }
    };

    const renderInsight = (insight: Insight, index: number) => {
        const accentColor = getInsightColor(insight.type);
        const IconComponent = iconMap[insight.icon] || Lightbulb;

        return (
            <AnimatedView key={index} animation="fadeInUp" delay={getStaggerDelay(index, 60) + 200}>
                <Card
                    variant="default"
                    elevation="sm"
                    style={{ marginBottom: 10, borderLeftWidth: 3, borderLeftColor: accentColor }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                backgroundColor: accentColor + '1A',
                            }}
                        >
                            <IconComponent color={accentColor} size={20} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Inter_600SemiBold',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    marginBottom: 2,
                                }}
                            >
                                {insight.title}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter_400Regular',
                                    color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                    lineHeight: 17,
                                }}
                            >
                                {insight.description}
                            </Text>
                        </View>
                    </View>
                </Card>
            </AnimatedView>
        );
    };

    const balancePositive = report ? report.balance >= 0 : true;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <AnimatedView animation="fadeInDown" delay={0}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingTop: 8,
                        paddingBottom: 4,
                    }}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        <ArrowLeft color={iconColor} size={20} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 10,
                                fontFamily: 'Inter_600SemiBold',
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                letterSpacing: 1.3,
                                textTransform: 'uppercase',
                            }}
                        >
                            Análise financeira
                        </Text>
                        <Text
                            style={{
                                fontSize: 22,
                                fontFamily: 'Inter_700Bold',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                letterSpacing: -0.5,
                            }}
                        >
                            Relatórios
                        </Text>
                    </View>
                    <View
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: colors.primary[500] + '1A',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <BarChart2 color={colors.primary[500]} size={20} />
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
                        marginTop: 12,
                        marginBottom: 4,
                        backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                        borderRadius: 16,
                        paddingVertical: 4,
                        paddingHorizontal: 4,
                    }}
                >
                    <Pressable
                        onPress={goToPreviousMonth}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                        }}
                    >
                        <ChevronLeft color={colors.primary[500]} size={22} />
                    </Pressable>

                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                fontSize: 17,
                                fontFamily: 'Inter_700Bold',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                letterSpacing: -0.3,
                            }}
                        >
                            {MONTH_NAMES[selectedMonth - 1]}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                fontFamily: 'Inter_500Medium',
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
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isCurrentMonth
                                ? 'transparent'
                                : (isDark ? colors.dark.surface : colors.light.surface),
                            opacity: isCurrentMonth ? 0.35 : 1,
                        }}
                        disabled={isCurrentMonth}
                    >
                        <ChevronRight
                            color={isCurrentMonth ? (isDark ? colors.dark.textTertiary : colors.light.textTertiary) : colors.primary[500]}
                            size={22}
                        />
                    </Pressable>
                </View>
            </AnimatedView>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 0 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                }
            >
                <AnimatedView animation="fadeInDown" delay={100} style={{ marginTop: 16, marginBottom: 16 }}>
                    <View style={[{ borderRadius: 28 }, glow.primary]}>
                        <GradientCard
                            colors={colors.gradients.primaryDeep as any}
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
                                    top: -50,
                                    right: -30,
                                    width: 150,
                                    height: 150,
                                    borderRadius: 75,
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -20,
                                    left: -20,
                                    width: 90,
                                    height: 90,
                                    borderRadius: 45,
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                }}
                            />

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
                                    Saldo do Mês
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 42,
                                        fontFamily: 'Inter_800ExtraBold',
                                        color: '#FFFFFF',
                                        marginTop: 6,
                                        letterSpacing: -1,
                                    }}
                                >
                                    R$ {((report?.balance || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 }}>
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
                                        {balancePositive ? (
                                            <TrendingUp color="#FFFFFF" size={13} />
                                        ) : (
                                            <TrendingDown color="#FFFFFF" size={13} />
                                        )}
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                fontFamily: 'Inter_600SemiBold',
                                                color: '#FFFFFF',
                                                marginLeft: 5,
                                            }}
                                        >
                                            {balancePositive ? 'Saldo positivo' : 'Saldo negativo'}
                                        </Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: 'Inter_500Medium',
                                            color: 'rgba(255,255,255,0.65)',
                                        }}
                                    >
                                        {report?.transactionCount || 0} transações
                                    </Text>
                                </View>
                            </View>
                        </GradientCard>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInDown" delay={160} style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Card variant="default" elevation="md" style={{ flex: 1 }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: colors.income + '1A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                <ArrowUpRight color={colors.income} size={20} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Inter_500Medium',
                                    color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                    marginBottom: 4,
                                }}
                            >
                                Receitas
                            </Text>
                            <AmountDisplay
                                amount={report?.totalIncome || 0}
                                type="income"
                                size="md"
                            />
                            {comparison && renderChangeIndicator(comparison.incomeChange, 'Receita')}
                        </Card>

                        <Card variant="default" elevation="md" style={{ flex: 1 }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: colors.expense + '1A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                <ArrowDownRight color={colors.expense} size={20} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Inter_500Medium',
                                    color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                    marginBottom: 4,
                                }}
                            >
                                Despesas
                            </Text>
                            <AmountDisplay
                                amount={report?.totalExpense || 0}
                                type="expense"
                                size="md"
                            />
                            {comparison && renderChangeIndicator(comparison.expenseChange, 'Despesa')}
                        </Card>
                    </View>
                </AnimatedView>

                {insights.length > 0 && (
                    <AnimatedView animation="fadeInUp" delay={180} style={{ marginBottom: 8 }}>
                        <Text
                            style={{
                                fontSize: 17,
                                fontFamily: 'Inter_600SemiBold',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                marginBottom: 12,
                            }}
                        >
                            Insights
                        </Text>
                        {insights.map((insight, index) => renderInsight(insight, index))}
                    </AnimatedView>
                )}

                {report?.topCategories && report.topCategories.length > 0 && (
                    <AnimatedView animation="fadeInUp" delay={240} style={{ marginBottom: 20 }}>
                        <Text
                            style={{
                                fontSize: 17,
                                fontFamily: 'Inter_600SemiBold',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                marginBottom: 12,
                            }}
                        >
                            Top Categorias
                        </Text>
                        <Card variant="elevated" elevation="md" padding="lg">
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontFamily: 'Inter_600SemiBold',
                                    color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                    letterSpacing: 1.3,
                                    textTransform: 'uppercase',
                                    marginBottom: 16,
                                }}
                            >
                                Despesas por categoria
                            </Text>
                            {report.topCategories.map((cat, index) => {
                                const catColor = cat.category_color || colors.primary[500];
                                const isLast = index === report.topCategories.length - 1;
                                return (
                                    <View
                                        key={cat.category_id || index}
                                        style={{
                                            marginBottom: isLast ? 0 : 16,
                                            paddingBottom: isLast ? 0 : 16,
                                            borderBottomWidth: isLast ? 0 : 1,
                                            borderBottomColor: isDark ? colors.dark.border : colors.light.border,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 8,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 8,
                                                    backgroundColor: catColor + '22',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 10,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: catColor,
                                                    }}
                                                />
                                            </View>
                                            <Text
                                                style={{
                                                    flex: 1,
                                                    fontSize: 14,
                                                    fontFamily: 'Inter_500Medium',
                                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                                }}
                                            >
                                                {cat.category_name || 'Sem categoria'}
                                            </Text>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text
                                                    style={{
                                                        fontSize: 13,
                                                        fontFamily: 'Inter_700Bold',
                                                        color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                                    }}
                                                >
                                                    R$ {(cat.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: 11,
                                                        fontFamily: 'Inter_500Medium',
                                                        color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                                    }}
                                                >
                                                    {cat.percentage.toFixed(0)}%
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
                                                colors={[catColor, catColor + 'AA']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{
                                                    width: `${Math.min(cat.percentage, 100)}%`,
                                                    height: '100%',
                                                    borderRadius: 999,
                                                }}
                                            />
                                        </View>
                                    </View>
                                );
                            })}
                        </Card>
                    </AnimatedView>
                )}

                {chartData.length > 0 && (
                    <AnimatedView animation="fadeInUp" delay={300} style={{ marginBottom: 20 }}>
                        <Text
                            style={{
                                fontSize: 17,
                                fontFamily: 'Inter_600SemiBold',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                marginBottom: 12,
                            }}
                        >
                            Evolução Mensal
                        </Text>
                        <Card variant="elevated" elevation="lg" padding="lg">
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontFamily: 'Inter_600SemiBold',
                                    color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                    letterSpacing: 1.3,
                                    textTransform: 'uppercase',
                                    marginBottom: 16,
                                }}
                            >
                                Últimos 6 meses
                            </Text>
                            <BarChart
                                data={chartData}
                                isDark={isDark}
                            />
                        </Card>
                    </AnimatedView>
                )}

                {!isLoading && report?.transactionCount === 0 && (
                    <AnimatedView animation="zoomIn" delay={120} style={{ marginTop: 16 }}>
                        <Card variant="filled" padding="lg" style={{ alignItems: 'center', paddingVertical: 48 }}>
                            <View
                                style={[
                                    {
                                        width: 72,
                                        height: 72,
                                        borderRadius: 36,
                                        backgroundColor: colors.primary[500] + '1A',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    },
                                    elevation.sm,
                                ]}
                            >
                                <FileText color={colors.primary[500]} size={32} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'Inter_600SemiBold',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    marginBottom: 6,
                                    textAlign: 'center',
                                }}
                            >
                                Sem dados para este mês
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Inter_400Regular',
                                    color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                    textAlign: 'center',
                                    lineHeight: 19,
                                    paddingHorizontal: 16,
                                    marginBottom: 24,
                                }}
                            >
                                Registre transações para ver seus relatórios e insights
                            </Text>
                            <Button
                                variant="primary"
                                size="md"
                                onPress={() => router.push('/transaction/new' as any)}
                            >
                                Adicionar Transação
                            </Button>
                        </Card>
                    </AnimatedView>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
