import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, Calendar, FileText, Trash2, TrendingUp, TrendingDown, Clock, Pencil } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { Card, Button, GradientCard, AnimatedView, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { transactionService } from '@/services';
import { useTransactionStore } from '@/stores';
import { colors, glow } from '@/constants';
import { Transaction } from '@/types';

export default function TransactionDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useThemeContext();
    const { deleteTransaction } = useTransactionStore();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadTransaction = async () => {
                if (!id) return;
                try {
                    const tx = await transactionService.getById(id);
                    setTransaction(tx);
                } catch (error) {
                    console.error('Error loading transaction:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadTransaction();
        }, [id])
    );

    const handleEdit = () => {
        if (!transaction) return;
        router.push({ pathname: '/transaction/new', params: { id: transaction.id } } as any);
    };

    const handleDelete = () => {
        if (!transaction) return;

        showAlert(
            'Excluir Transação',
            `Deseja realmente excluir "${transaction.description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(transaction.id);
                        router.back();
                    },
                },
            ]
        );
    };

    if (isLoading || !transaction) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    Carregando...
                </Text>
            </SafeAreaView>
        );
    }

    const isExpense = transaction.type === 'expense';
    const heroGradient = isExpense
        ? (colors.gradients.expense as [string, string])
        : (colors.gradients.income as [string, string]);
    const heroGlow = isExpense ? glow.expense : glow.income;
    const typeColor = isExpense ? colors.expense : colors.income;
    const categoryColor = transaction.category_color || colors.primary[500];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <AnimatedView animation="fadeInDown" delay={0}>
                <View style={[{ marginBottom: 0 }, heroGlow]}>
                    <GradientCard
                        colors={heroGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ overflow: 'hidden' }}
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
                                width: 150,
                                height: 150,
                                borderRadius: 75,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                            }}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                bottom: -25,
                                left: -20,
                                width: 110,
                                height: 110,
                                borderRadius: 55,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                            }}
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                            <Pressable
                                onPress={() => router.back()}
                                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ArrowLeft color="white" size={20} />
                            </Pressable>
                            <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 }}>
                                Detalhes
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Pressable
                                    onPress={handleEdit}
                                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Pencil color="white" size={17} />
                                </Pressable>
                                <Pressable
                                    onPress={handleDelete}
                                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Trash2 color="white" size={18} />
                                </Pressable>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.18)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginBottom: 12 }}>
                                {isExpense
                                    ? <TrendingDown color="white" size={15} style={{ marginRight: 6 }} />
                                    : <TrendingUp color="white" size={15} style={{ marginRight: 6 }} />
                                }
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                                    {isExpense ? 'Despesa' : 'Receita'}
                                </Text>
                            </View>

                            <Text style={{ fontSize: 44, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1, marginBottom: 6 }}>
                                {isExpense ? '- ' : '+ '}R$ {(transaction.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.80)' }} numberOfLines={1}>
                                {transaction.description}
                            </Text>
                        </View>
                    </GradientCard>
                </View>
            </AnimatedView>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: -16 }}
            >
                <AnimatedView animation="fadeInUp" delay={80}>
                    <Card variant="elevated" elevation="lg" style={{ marginHorizontal: 16, marginBottom: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>

                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? colors.dark.border : colors.light.border }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: typeColor + '1A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                <FileText color={typeColor} size={18} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? colors.dark.textTertiary : colors.light.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>
                                    Descrição
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '500', color: isDark ? colors.dark.textPrimary : colors.light.textPrimary }}>
                                    {transaction.description}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? colors.dark.border : colors.light.border }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: categoryColor + '1A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: categoryColor }} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? colors.dark.textTertiary : colors.light.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>
                                    Categoria
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 15, fontWeight: '500', color: isDark ? colors.dark.textPrimary : colors.light.textPrimary }}>
                                        {transaction.category_name || 'Sem categoria'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: categoryColor + '1A' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: categoryColor }}>
                                    {transaction.category_name?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary[500] + '1A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                <Calendar color={colors.primary[500]} size={18} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? colors.dark.textTertiary : colors.light.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>
                                    Data
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '500', color: isDark ? colors.dark.textPrimary : colors.light.textPrimary }}>
                                    {new Date(transaction.date).toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={140}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <Clock color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} size={13} style={{ marginRight: 5 }} />
                        <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? colors.dark.textTertiary : colors.light.textTertiary }}>
                            Criada em{' '}
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={200}>
                    <View style={{ paddingHorizontal: 16, gap: 12 }}>
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onPress={handleEdit}
                            leftIcon={<Pencil color="white" size={20} />}
                        >
                            Editar Transação
                        </Button>
                        <Button
                            variant="destructive"
                            fullWidth
                            size="lg"
                            onPress={handleDelete}
                            leftIcon={<Trash2 color="white" size={20} />}
                        >
                            Excluir Transação
                        </Button>
                    </View>
                </AnimatedView>
            </ScrollView>
        </SafeAreaView>
    );
}
