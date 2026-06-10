import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Calendar, CalendarCheck, TrendingUp, Banknote } from 'lucide-react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, ProgressRing, AmountDisplay, Input, AnimatedView, getStaggerDelay, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useGoalStore } from '@/stores';
import { colors, getGlow } from '@/constants';
import { TextInput } from 'react-native';

export default function GoalDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useThemeContext();
    const {
        selectedGoal,
        deposits,
        isLoading,
        fetchGoal,
        fetchDeposits,
        addDeposit,
        deleteDeposit,
        deleteGoal,
        clearSelectedGoal,
    } = useGoalStore();

    const [refreshing, setRefreshing] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositNote, setDepositNote] = useState('');
    const depositInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (id) {
            fetchGoal(id);
            fetchDeposits(id);
        }
        return () => clearSelectedGoal();
    }, [id]);

    const onRefresh = useCallback(async () => {
        if (!id) return;
        setRefreshing(true);
        await Promise.all([fetchGoal(id), fetchDeposits(id)]);
        setRefreshing(false);
    }, [id]);

    const parseAmount = (value: string): number => {
        const cleaned = value.replace(/[^\d]/g, '');
        return parseInt(cleaned) || 0;
    };

    const formatAmount = (value: string): string => {
        const cents = parseAmount(value);
        if (cents === 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const handleAddDeposit = async () => {
        if (!id || !depositAmount || parseAmount(depositAmount) === 0) {
            showAlert('Erro', 'Informe um valor válido');
            return;
        }

        try {
            await addDeposit({
                goal_id: id,
                amount: parseAmount(depositAmount),
                date: new Date().toISOString().split('T')[0],
                note: depositNote.trim() || undefined,
            });
            setDepositAmount('');
            setDepositNote('');
            setShowDepositModal(false);
        } catch (error) {
            showAlert('Erro', 'Não foi possível adicionar o depósito');
        }
    };

    const handleDeleteGoal = () => {
        showAlert(
            'Excluir Meta',
            'Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        if (!id) return;
                        await deleteGoal(id);
                        router.back();
                    },
                },
            ]
        );
    };

    const handleDeleteDeposit = (depositId: string) => {
        showAlert(
            'Excluir Depósito',
            'Tem certeza que deseja excluir este depósito?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => deleteDeposit(depositId),
                },
            ]
        );
    };

    if (!selectedGoal) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    Carregando...
                </Text>
            </SafeAreaView>
        );
    }

    const goalColor = selectedGoal.color || colors.primary[500];
    const progress = selectedGoal.target_amount > 0
        ? (selectedGoal.current_amount / selectedGoal.target_amount) * 100
        : 0;

    const remaining = Math.max(0, selectedGoal.target_amount - selectedGoal.current_amount);

    const daysLeft = Math.ceil(
        (new Date(selectedGoal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <LinearGradient
                colors={[goalColor, goalColor + 'BB']}
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
                        width: 130,
                        height: 130,
                        borderRadius: 65,
                        backgroundColor: 'rgba(255,255,255,0.07)',
                    }}
                />

                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft color="white" size={22} />
                    </Pressable>
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: '700',
                            color: '#FFFFFF',
                            letterSpacing: -0.2,
                            flex: 1,
                            textAlign: 'center',
                            marginHorizontal: 8,
                        }}
                        numberOfLines={1}
                    >
                        {selectedGoal.name}
                    </Text>
                    <Pressable
                        onPress={handleDeleteGoal}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Trash2 color="white" size={18} />
                    </Pressable>
                </View>

                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 28 }}>
                    <ProgressRing
                        progress={progress}
                        size={148}
                        strokeWidth={11}
                        color={'#FFFFFF'}
                        gradientColors={['#FFFFFF', 'rgba(255,255,255,0.55)'] as any}
                        backgroundColor="rgba(255,255,255,0.2)"
                        isDark={true}
                        showPercentage={true}
                    />
                    <Text style={{
                        fontSize: 28,
                        fontWeight: '800',
                        color: '#FFFFFF',
                        marginTop: 14,
                        letterSpacing: -0.8,
                    }}>
                        R$ {(selectedGoal.current_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: 'rgba(255,255,255,0.7)',
                        marginTop: 3,
                        fontWeight: '500',
                    }}>
                        de R$ {(selectedGoal.target_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <AnimatedView animation="fadeInUp" delay={80}>
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, marginTop: 4 }}>
                        <Card variant="default" elevation="sm" style={{ flex: 1, borderRadius: 20 }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: colors.expense + '18',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8,
                            }}>
                                <TrendingUp color={colors.expense} size={20} />
                            </View>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                marginBottom: 1,
                            }}>
                                Faltam
                            </Text>
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '800',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                marginTop: 3,
                                letterSpacing: -0.3,
                            }}>
                                R$ {(remaining / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                        </Card>

                        <Card variant="default" elevation="sm" style={{ flex: 1, borderRadius: 20 }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: (daysLeft >= 0 ? goalColor : colors.error) + '18',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8,
                            }}>
                                <Calendar color={daysLeft >= 0 ? goalColor : colors.error} size={20} />
                            </View>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                marginBottom: 1,
                            }}>
                                {daysLeft >= 0 ? 'Dias restantes' : 'Dias atrasado'}
                            </Text>
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '800',
                                color: daysLeft >= 0 ? (isDark ? colors.dark.textPrimary : colors.light.textPrimary) : colors.error,
                                marginTop: 3,
                                letterSpacing: -0.3,
                            }}>
                                {Math.abs(daysLeft)} dias
                            </Text>
                        </Card>
                    </View>
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={120}>
                    <Card variant="default" elevation="sm" style={{ borderRadius: 20, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                            }}>
                                Progresso
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: goalColor,
                            }}>
                                {Math.min(Math.round(progress), 100)}%
                            </Text>
                        </View>
                        <View style={{
                            height: 10,
                            borderRadius: 999,
                            backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                            overflow: 'hidden',
                        }}>
                            <LinearGradient
                                colors={[goalColor, goalColor + 'AA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: '100%',
                                    width: `${Math.min(progress, 100)}%`,
                                    borderRadius: 999,
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                            <Text style={{
                                fontSize: 11,
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                fontWeight: '500',
                            }}>
                                R$ {(selectedGoal.current_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={{
                                fontSize: 11,
                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                fontWeight: '500',
                            }}>
                                R$ {(selectedGoal.target_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    </Card>
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={160}>
                    {!selectedGoal.is_completed ? (
                        <View style={[{ borderRadius: 16, marginBottom: 24 }, getGlow(goalColor, 0.35)]}>
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                leftIcon={<Plus color="white" size={20} />}
                                onPress={() => setShowDepositModal(true)}
                            >
                                Adicionar Depósito
                            </Button>
                        </View>
                    ) : (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24,
                            backgroundColor: colors.income + '18',
                            paddingVertical: 14,
                            borderRadius: 16,
                        }}>
                            <CalendarCheck color={colors.income} size={20} />
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '700',
                                color: colors.income,
                                marginLeft: 8,
                            }}>
                                Meta Concluída!
                            </Text>
                        </View>
                    )}
                </AnimatedView>

                <AnimatedView animation="fadeInUp" delay={200}>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                            letterSpacing: -0.3,
                        }}>
                            Histórico de Depósitos
                        </Text>
                        {deposits.length > 0 && (
                            <View style={{
                                backgroundColor: colors.income + '18',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 999,
                            }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: '700',
                                    color: colors.income,
                                }}>
                                    {deposits.length}
                                </Text>
                            </View>
                        )}
                    </View>

                    {deposits.length > 0 ? (
                        <Card variant="default" style={{ borderRadius: 20 }}>
                            {deposits.map((deposit, index) => (
                                <AnimatedView key={deposit.id} animation="fadeIn" delay={getStaggerDelay(index)}>
                                    <Pressable
                                        onLongPress={() => handleDeleteDeposit(deposit.id)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingTop: index > 0 ? 14 : 0,
                                            marginTop: index > 0 ? 14 : 0,
                                            borderTopWidth: index > 0 ? 1 : 0,
                                            borderTopColor: isDark ? colors.dark.border : colors.light.border,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                backgroundColor: goalColor + '18',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12,
                                            }}
                                        >
                                            <Banknote color={goalColor} size={18} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                            }}>
                                                {deposit.note || 'Depósito'}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                                marginTop: 2,
                                                fontWeight: '500',
                                            }}>
                                                {new Date(deposit.date).toLocaleDateString('pt-BR')}
                                            </Text>
                                        </View>
                                        <AmountDisplay amount={deposit.amount} type="income" size="sm" showSign />
                                    </Pressable>
                                </AnimatedView>
                            ))}
                        </Card>
                    ) : (
                        <Card variant="filled" style={{ borderRadius: 20, alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 }}>
                            <View style={{
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                backgroundColor: goalColor + '18',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 14,
                            }}>
                                <Banknote color={goalColor} size={28} />
                            </View>
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '700',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                textAlign: 'center',
                            }}>
                                Nenhum depósito ainda
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                textAlign: 'center',
                                marginTop: 6,
                            }}>
                                Comece a guardar dinheiro para esta meta!
                            </Text>
                        </Card>
                    )}

                    <Text style={{
                        fontSize: 11,
                        color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                        textAlign: 'center',
                        marginTop: 12,
                        fontWeight: '500',
                    }}>
                        Pressione e segure para excluir um depósito
                    </Text>
                </AnimatedView>
            </ScrollView>

            {showDepositModal && (
                <Pressable
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        justifyContent: 'flex-end',
                    }}
                    onPress={() => {
                        setShowDepositModal(false);
                        setDepositAmount('');
                        setDepositNote('');
                    }}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Card
                            variant="elevated"
                            elevation="xl"
                            style={{
                                borderTopLeftRadius: 28,
                                borderTopRightRadius: 28,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                paddingBottom: 32,
                            }}
                        >
                            <View style={{
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: isDark ? colors.dark.border : colors.light.border,
                                alignSelf: 'center',
                                marginBottom: 20,
                            }} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: colors.income + '18',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}>
                                    <Banknote color={colors.income} size={20} />
                                </View>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '800',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    letterSpacing: -0.3,
                                }}>
                                    Novo Depósito
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => depositInputRef.current?.focus()}
                                style={{
                                    alignItems: 'center',
                                    paddingVertical: 20,
                                    marginBottom: 16,
                                    borderRadius: 16,
                                    backgroundColor: goalColor + '12',
                                    borderWidth: 1.5,
                                    borderColor: goalColor + '30',
                                }}
                            >
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '600',
                                    color: goalColor,
                                    letterSpacing: 1.2,
                                    textTransform: 'uppercase',
                                    marginBottom: 6,
                                }}>
                                    Valor
                                </Text>
                                <Text style={{
                                    fontSize: 36,
                                    fontWeight: '800',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    letterSpacing: -1,
                                }}>
                                    {formatAmount(depositAmount)}
                                </Text>
                                <TextInput
                                    ref={depositInputRef}
                                    value={depositAmount}
                                    onChangeText={(t) => setDepositAmount(t.replace(/[^\d]/g, ''))}
                                    keyboardType="numeric"
                                    style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
                                    autoFocus
                                />
                            </Pressable>

                            <Input
                                label="Observação (opcional)"
                                placeholder="Ex: Economia do mês"
                                value={depositNote}
                                onChangeText={setDepositNote}
                            />

                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                                <View style={{ flex: 1 }}>
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        fullWidth
                                        onPress={() => {
                                            setShowDepositModal(false);
                                            setDepositAmount('');
                                            setDepositNote('');
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </View>
                                <View style={[{ flex: 1, borderRadius: 12 }, getGlow(colors.income, 0.3)]}>
                                    <Button
                                        variant="income"
                                        size="md"
                                        onPress={handleAddDeposit}
                                        loading={isLoading}
                                        fullWidth
                                    >
                                        Depositar
                                    </Button>
                                </View>
                            </View>
                        </Card>
                    </Pressable>
                </Pressable>
            )}
        </SafeAreaView>
    );
}
