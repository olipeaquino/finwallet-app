import { View, Text, ScrollView, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, ArrowUpRight, ArrowDownRight, LayoutList, Trash2 } from 'lucide-react-native';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, AmountDisplay, AnimatedView, getStaggerDelay, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useTransactionStore } from '@/stores';
import { colors, glow, elevation } from '@/constants';
import { Transaction, TransactionType } from '@/types';

function groupByDate(txList: Transaction[]): [string, Transaction[]][] {
    const map = new Map<string, Transaction[]>();
    for (const tx of txList) {
        const key = tx.date.substring(0, 10);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tx);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatDateHeader(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

type FilterOption = 'all' | TransactionType;

interface FilterPill {
    key: FilterOption;
    label: string;
    activeGradient: [string, string];
    inactiveIconColor: string;
    icon: React.ReactNode;
}

export default function TransactionsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const {
        transactions,
        isLoading,
        fetchTransactions,
        deleteTransaction,
        setFilters,
        clearFilters,
        filters,
    } = useTransactionStore();

    const [searchText, setSearchText] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    const surfaceVariant = isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant;
    const borderColor = isDark ? colors.dark.border : colors.light.border;
    const textPrimary = isDark ? colors.dark.textPrimary : colors.light.textPrimary;
    const textSecondary = isDark ? colors.dark.textSecondary : colors.light.textSecondary;
    const textTertiary = isDark ? colors.dark.textTertiary : colors.light.textTertiary;
    const surface = isDark ? colors.dark.surface : colors.light.surface;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.trim()) {
            setFilters({ search: text.trim() });
        } else {
            setFilters({ search: undefined });
        }
    };

    const handleFilter = (filter: FilterOption) => {
        setActiveFilter(filter);
        if (filter === 'all') {
            setFilters({ type: undefined });
        } else {
            setFilters({ type: filter });
        }
    };

    const handleDelete = (id: string, description: string) => {
        showAlert(
            'Excluir Transação',
            `Deseja realmente excluir "${description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(id);
                    },
                },
            ]
        );
    };

    const grouped = useMemo(() => groupByDate(transactions), [transactions]);

    const filterPills: FilterPill[] = [
        {
            key: 'all',
            label: 'Todas',
            activeGradient: colors.gradients.primary as [string, string],
            inactiveIconColor: textSecondary,
            icon: <LayoutList size={14} color={activeFilter === 'all' ? '#FFFFFF' : textSecondary} />,
        },
        {
            key: 'income',
            label: 'Receitas',
            activeGradient: colors.gradients.income as [string, string],
            inactiveIconColor: colors.income,
            icon: <ArrowUpRight size={14} color={activeFilter === 'income' ? '#FFFFFF' : colors.income} />,
        },
        {
            key: 'expense',
            label: 'Despesas',
            activeGradient: colors.gradients.expense as [string, string],
            inactiveIconColor: colors.expense,
            icon: <ArrowDownRight size={14} color={activeFilter === 'expense' ? '#FFFFFF' : colors.expense} />,
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">

            <AnimatedView animation="fadeInDown" delay={0}>
                <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: '600',
                                    color: colors.primary[500],
                                    letterSpacing: 1.4,
                                    textTransform: 'uppercase',
                                    marginBottom: 2,
                                }}
                            >
                                HISTÓRICO
                            </Text>
                            <Text
                                style={{
                                    fontSize: 28,
                                    fontWeight: '800',
                                    color: textPrimary,
                                    letterSpacing: -0.5,
                                    lineHeight: 34,
                                }}
                            >
                                Transações
                            </Text>
                        </View>
                        {transactions.length > 0 && (
                            <View
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 5,
                                    borderRadius: 999,
                                    backgroundColor: colors.primary[500] + '1A',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: colors.primary[500],
                                    }}
                                >
                                    {transactions.length}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View
                        style={[
                            {
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: surface,
                                borderRadius: 16,
                                paddingHorizontal: 14,
                                paddingVertical: 0,
                                height: 50,
                                borderWidth: 1.5,
                                borderColor: searchFocused ? colors.primary[500] : borderColor,
                                marginBottom: 14,
                            },
                            searchFocused ? { shadowColor: colors.primary[500], shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 } : elevation.sm,
                        ]}
                    >
                        <Search
                            size={18}
                            color={searchFocused ? colors.primary[500] : textTertiary}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            placeholder="Buscar transações..."
                            placeholderTextColor={textTertiary}
                            value={searchText}
                            onChangeText={handleSearch}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            style={{
                                flex: 1,
                                fontSize: 15,
                                color: textPrimary,
                                paddingVertical: 0,
                                fontWeight: '500',
                            }}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                        />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
                    >
                        {filterPills.map((pill) => {
                            const isActive = activeFilter === pill.key;
                            return (
                                <Pressable
                                    key={pill.key}
                                    onPress={() => handleFilter(pill.key)}
                                    style={[
                                        { borderRadius: 999, overflow: 'hidden' },
                                        isActive ? {} : {},
                                    ]}
                                >
                                    {isActive ? (
                                        <LinearGradient
                                            colors={pill.activeGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 16,
                                                paddingVertical: 9,
                                                gap: 6,
                                                borderRadius: 999,
                                            }}
                                        >
                                            {pill.icon}
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: '600',
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                {pill.label}
                                            </Text>
                                        </LinearGradient>
                                    ) : (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 16,
                                                paddingVertical: 9,
                                                gap: 6,
                                                borderRadius: 999,
                                                backgroundColor: surfaceVariant,
                                                borderWidth: 1,
                                                borderColor: borderColor,
                                            }}
                                        >
                                            {pill.icon}
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: '500',
                                                    color: textSecondary,
                                                }}
                                            >
                                                {pill.label}
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </AnimatedView>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary[500]}
                        colors={[colors.primary[500]]}
                    />
                }
            >
                {transactions.length > 0 ? (
                    <>
                        {grouped.map(([dateKey, txGroup], groupIndex) => (
                            <AnimatedView
                                key={dateKey}
                                animation="fadeInUp"
                                delay={getStaggerDelay(groupIndex)}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: groupIndex === 0 ? 8 : 20,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            fontWeight: '700',
                                            color: colors.primary[500],
                                            letterSpacing: 1.2,
                                            textTransform: 'uppercase',
                                            marginRight: 10,
                                        }}
                                    >
                                        {formatDateHeader(dateKey)}
                                    </Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
                                </View>

                                <Card variant="default" elevation="sm" padding="none">
                                    {txGroup.map((tx, index) => (
                                        <Pressable
                                            key={tx.id}
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/transaction/[id]',
                                                    params: { id: tx.id },
                                                } as any)
                                            }
                                            onLongPress={() => handleDelete(tx.id, tx.description)}
                                            style={({ pressed }) => [
                                                {
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 14,
                                                    borderTopWidth: index > 0 ? 1 : 0,
                                                    borderTopColor: borderColor,
                                                    opacity: pressed ? 0.75 : 1,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 14,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 12,
                                                    backgroundColor: (tx.category_color || colors.primary[500]) + '1A',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: '800',
                                                        color: tx.category_color || colors.primary[500],
                                                        lineHeight: 22,
                                                    }}
                                                >
                                                    {tx.category_name?.charAt(0).toUpperCase() || '?'}
                                                </Text>
                                            </View>

                                            <View style={{ flex: 1, marginRight: 10 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: '600',
                                                        color: textPrimary,
                                                        marginBottom: 3,
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {tx.description}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <View
                                                        style={{
                                                            paddingHorizontal: 7,
                                                            paddingVertical: 2,
                                                            borderRadius: 6,
                                                            backgroundColor: (tx.category_color || colors.primary[500]) + '1A',
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontSize: 11,
                                                                fontWeight: '600',
                                                                color: tx.category_color || colors.primary[500],
                                                            }}
                                                            numberOfLines={1}
                                                        >
                                                            {tx.category_name || 'Sem categoria'}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={{
                                                            fontSize: 11,
                                                            fontWeight: '500',
                                                            color: textTertiary,
                                                        }}
                                                    >
                                                        · {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    </Text>
                                                </View>
                                            </View>

                                            <AmountDisplay
                                                amount={tx.amount}
                                                type={tx.type}
                                                size="md"
                                                showSign
                                            />
                                        </Pressable>
                                    ))}
                                </Card>
                            </AnimatedView>
                        ))}

                        <AnimatedView animation="fadeIn" delay={300}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 6 }}>
                                <Trash2 size={12} color={textTertiary} />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '500',
                                        color: textTertiary,
                                        textAlign: 'center',
                                    }}
                                >
                                    Pressione e segure para excluir
                                </Text>
                            </View>
                        </AnimatedView>
                    </>
                ) : (
                    <AnimatedView animation="zoomIn" delay={100}>
                        <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 }}>
                            <View
                                style={[
                                    {
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 20,
                                        backgroundColor: colors.primary[500] + '1A',
                                    },
                                    elevation.sm,
                                ]}
                            >
                                <LinearGradient
                                    colors={colors.gradients.primary as [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: searchText || activeFilter !== 'all' ? 0.55 : 1,
                                    }}
                                >
                                    {searchText || activeFilter !== 'all' ? (
                                        <Search size={34} color="#FFFFFF" />
                                    ) : (
                                        <LayoutList size={34} color="#FFFFFF" />
                                    )}
                                </LinearGradient>
                            </View>

                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: '700',
                                    color: textPrimary,
                                    textAlign: 'center',
                                    marginBottom: 8,
                                    letterSpacing: -0.3,
                                }}
                            >
                                {searchText || activeFilter !== 'all'
                                    ? 'Nenhum resultado'
                                    : 'Nenhuma transação ainda'}
                            </Text>

                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '400',
                                    color: textSecondary,
                                    textAlign: 'center',
                                    lineHeight: 20,
                                    marginBottom: 28,
                                    maxWidth: 260,
                                }}
                            >
                                {searchText || activeFilter !== 'all'
                                    ? 'Tente ajustar os filtros ou o texto de busca.'
                                    : 'Registre receitas e despesas para ter controle total das suas finanças.'}
                            </Text>

                            {!searchText && activeFilter === 'all' && (
                                <View style={[{ borderRadius: 14 }, glow.primary]}>
                                    <LinearGradient
                                        colors={colors.gradients.primary as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            borderRadius: 14,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Pressable
                                            onPress={() => router.push('/transaction/new')}
                                            style={({ pressed }) => ({
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 24,
                                                paddingVertical: 14,
                                                gap: 8,
                                                opacity: pressed ? 0.85 : 1,
                                            })}
                                        >
                                            <Plus size={20} color="#FFFFFF" />
                                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                                                Nova Transação
                                            </Text>
                                        </Pressable>
                                    </LinearGradient>
                                </View>
                            )}
                        </View>
                    </AnimatedView>
                )}
            </ScrollView>

            <View style={{ position: 'absolute', bottom: 28, right: 20 }}>
                <View style={[{ borderRadius: 30 }, glow.primary]}>
                    <LinearGradient
                        colors={colors.gradients.primary as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: 58,
                            height: 58,
                            borderRadius: 29,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        <Pressable
                            onPress={() => router.push('/transaction/new')}
                            style={({ pressed }) => ({
                                width: 58,
                                height: 58,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.8 : 1,
                            })}
                        >
                            <Plus size={28} color="#FFFFFF" />
                        </Pressable>
                    </LinearGradient>
                </View>
            </View>
        </SafeAreaView>
    );
}
