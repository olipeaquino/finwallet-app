import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, InputAccessoryView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Wallet, Trash2, TrendingUp } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { Button, Card, GradientCard, AnimatedView, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { budgetService } from '@/services';
import { colors, elevation, glow } from '@/constants';
import { Budget } from '@/types';

const AMOUNT_ACCESSORY_ID = 'budgetEditAmountAccessory';

export default function EditBudgetScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useThemeContext();
    const inputRef = useRef<TextInput>(null);

    const [budget, setBudget] = useState<Budget | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    const surfaceBg = isDark ? colors.dark.surface : '#FFFFFF';
    const surfaceVariant = isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant;
    const borderColor = isDark ? colors.dark.border : colors.light.border;
    const textPrimary = isDark ? colors.dark.textPrimary : colors.light.textPrimary;
    const textSecondary = isDark ? colors.dark.textSecondary : colors.light.textSecondary;
    const textTertiary = isDark ? colors.dark.textTertiary : colors.light.textTertiary;

    useEffect(() => {
        const loadBudget = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await budgetService.getById(id);
                if (data) {
                    setBudget(data);
                    setAmount((data.amount / 100).toString());
                }
            } catch (error) {
                console.error('Error loading budget:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBudget();
    }, [id]);

    const formatAmount = (value: string) => {
        const numbers = value.replace(/[^\d,\.]/g, '').replace(',', '.');
        return numbers;
    };

    const handleAmountChange = (value: string) => {
        setAmount(formatAmount(value));
    };

    const handleSave = async () => {
        if (!budget) return;

        const newAmount = parseFloat(amount.replace(',', '.')) * 100;
        if (isNaN(newAmount) || newAmount <= 0) {
            showAlert('Erro', 'Informe um valor válido');
            return;
        }

        setIsSaving(true);
        try {
            await budgetService.update(budget.id, { amount: newAmount });
            router.back();
        } catch (error) {
            console.error('Error updating budget:', error);
            showAlert('Erro', 'Não foi possível atualizar o orçamento');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (!budget) return;

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
                            router.back();
                        } catch (error) {
                            showAlert('Erro', 'Não foi possível excluir');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading || !budget) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <View
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 20,
                        backgroundColor: colors.primary[500] + '1A',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                    }}
                >
                    <Wallet color={colors.primary[500]} size={28} />
                </View>
                <Text
                    style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                    }}
                >
                    Carregando...
                </Text>
            </SafeAreaView>
        );
    }

    const categoryColor = budget.category_color || colors.primary[500];
    const newAmountCents = parseFloat(amount.replace(',', '.')) * 100 || 1;
    const usagePercent = ((budget.spent / newAmountCents) * 100);
    const clampedPercent = Math.min(usagePercent, 100);

    const progressColor = usagePercent >= 100 ? colors.error
        : usagePercent >= 80 ? colors.warning
        : colors.income;

    const progressGradient: [string, string] = usagePercent >= 100
        ? [colors.gradients.expense[0], colors.gradients.expense[1]]
        : usagePercent >= 80
        ? ['#FBBF24', '#F59E0B']
        : [colors.gradients.income[0], colors.gradients.income[1]];

    const isValid = !!amount && parseFloat(amount.replace(',', '.')) > 0;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <AnimatedView animation="fadeInDown" delay={0}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: borderColor,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Pressable
                                onPress={() => router.back()}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: surfaceVariant,
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
                                        color: textTertiary,
                                    }}
                                >
                                    Ajustar
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: '800',
                                        letterSpacing: -0.5,
                                        color: textPrimary,
                                    }}
                                >
                                    Editar Orçamento
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleDelete}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: colors.error + '12',
                                borderWidth: 1,
                                borderColor: colors.error + '25',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Trash2 color={colors.error} size={18} />
                        </Pressable>
                    </View>
                </AnimatedView>

                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                <View style={{ padding: 16 }}>
                    <AnimatedView animation="fadeInDown" delay={80}>
                        <View
                            style={[
                                {
                                    backgroundColor: surfaceBg,
                                    borderRadius: 20,
                                    padding: 16,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: borderColor,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                },
                                elevation.sm,
                            ]}
                        >
                            <View
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 16,
                                    backgroundColor: categoryColor + '1A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}
                            >
                                <Wallet color={categoryColor} size={24} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 17,
                                        fontWeight: '700',
                                        letterSpacing: -0.3,
                                        color: textPrimary,
                                        marginBottom: 3,
                                    }}
                                >
                                    {budget.category_name}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TrendingUp color={textTertiary} size={12} style={{ marginRight: 4 }} />
                                    <Text style={{ fontSize: 13, color: textSecondary }}>
                                        Gasto atual:{' '}
                                        <Text style={{ fontWeight: '700', color: categoryColor }}>
                                            R$ {(budget.spent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Text>
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: categoryColor,
                                }}
                            />
                        </View>
                    </AnimatedView>

                    <AnimatedView animation="fadeInDown" delay={140}>
                        <View
                            style={[
                                {
                                    backgroundColor: surfaceBg,
                                    borderRadius: 24,
                                    padding: 24,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: borderColor,
                                },
                                elevation.md,
                            ]}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    letterSpacing: 1.4,
                                    textTransform: 'uppercase',
                                    color: textTertiary,
                                    marginBottom: 12,
                                }}
                            >
                                LIMITE MENSAL
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text
                                    style={{
                                        fontSize: 28,
                                        fontWeight: '800',
                                        color: isValid ? colors.primary[500] : textTertiary,
                                        letterSpacing: -0.5,
                                        marginRight: 4,
                                    }}
                                >
                                    R$
                                </Text>
                                <TextInput
                                    ref={inputRef}
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    placeholder="0,00"
                                    keyboardType="numeric"
                                    autoFocus
                                    inputAccessoryViewID={Platform.OS === 'ios' ? AMOUNT_ACCESSORY_ID : undefined}
                                    style={{
                                        fontSize: 40,
                                        fontWeight: '800',
                                        letterSpacing: -1,
                                        color: isValid ? textPrimary : textTertiary,
                                        minWidth: 120,
                                        paddingVertical: 4,
                                    }}
                                    placeholderTextColor={textTertiary}
                                />
                            </View>
                        </View>
                    </AnimatedView>

                    <AnimatedView animation="fadeInUp" delay={200}>
                        <View
                            style={{
                                backgroundColor: surfaceVariant,
                                borderRadius: 20,
                                padding: 16,
                                marginBottom: 8,
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        letterSpacing: 0.8,
                                        textTransform: 'uppercase',
                                        color: textTertiary,
                                    }}
                                >
                                    Uso com este limite
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: progressColor + '20',
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 999,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '800',
                                            color: progressColor,
                                            letterSpacing: -0.3,
                                        }}
                                    >
                                        {budget.spent > 0 ? `${usagePercent.toFixed(0)}%` : '0%'}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    height: 10,
                                    backgroundColor: isDark ? colors.dark.border : colors.light.border,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                    marginBottom: 8,
                                }}
                            >
                                <LinearGradient
                                    colors={progressGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        height: '100%',
                                        width: `${clampedPercent}%`,
                                        borderRadius: 999,
                                    }}
                                />
                            </View>

                            <Text style={{ fontSize: 12, color: textSecondary, lineHeight: 18 }}>
                                {budget.spent > 0 ? (
                                    usagePercent >= 100
                                        ? 'Orçamento excedido com este limite'
                                        : usagePercent >= 80
                                        ? 'Próximo do limite — considere aumentar o valor'
                                        : 'Dentro do orçamento'
                                ) : (
                                    'Nenhum gasto registrado nesta categoria'
                                )}
                            </Text>
                        </View>
                    </AnimatedView>
                </View>
                </TouchableWithoutFeedback>

                <View style={{ paddingHorizontal: 16, paddingBottom: 16, marginTop: 'auto' }}>
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onPress={handleSave}
                        loading={isSaving}
                        disabled={!isValid}
                    >
                        Salvar Alterações
                    </Button>
                </View>

                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID={AMOUNT_ACCESSORY_ID}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: surfaceVariant, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: borderColor }}>
                            <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
                                <Text style={{ color: colors.primary[500], fontWeight: '700', fontSize: 16 }}>Concluir</Text>
                            </Pressable>
                        </View>
                    </InputAccessoryView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
