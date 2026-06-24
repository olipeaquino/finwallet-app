import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, TextInput, InputAccessoryView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Wallet, Check, Info } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { Button, Card, AnimatedView, getStaggerDelay, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { budgetService, categoryService } from '@/services';
import { colors, elevation } from '@/constants';
import { Category } from '@/types';

const AMOUNT_ACCESSORY_ID = 'budgetNewAmountAccessory';

export default function NewBudgetScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const inputRef = useRef<TextInput>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const selectedMonth = new Date().getMonth() + 1;
    const selectedYear = new Date().getFullYear();

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    const surfaceBg = isDark ? colors.dark.surface : '#FFFFFF';
    const surfaceVariant = isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant;
    const borderColor = isDark ? colors.dark.border : colors.light.border;
    const textPrimary = isDark ? colors.dark.textPrimary : colors.light.textPrimary;
    const textSecondary = isDark ? colors.dark.textSecondary : colors.light.textSecondary;
    const textTertiary = isDark ? colors.dark.textTertiary : colors.light.textTertiary;

    useEffect(() => {
        const loadCategories = async () => {
            const data = await categoryService.getAll();
            setCategories(data.filter(c => c.type === 'expense' || c.type === 'both'));
        };
        loadCategories();
    }, []);

    const formatAmount = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const amount = parseInt(numbers || '0', 10);
        return (amount / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleAmountChange = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        setAmount(numbers);
    };

    const handleSave = async () => {
        if (!selectedCategory) {
            showAlert('Erro', 'Selecione uma categoria');
            return;
        }

        const amountNumber = parseInt(amount || '0', 10);
        if (amountNumber <= 0) {
            showAlert('Erro', 'Informe um valor válido');
            return;
        }

        setIsLoading(true);
        try {
            const exists = await budgetService.existsForCategory(
                selectedCategory.id,
                selectedMonth,
                selectedYear
            );

            if (exists) {
                showAlert('Aviso', 'Já existe um orçamento para esta categoria neste mês');
                setIsLoading(false);
                return;
            }

            await budgetService.create({
                category_id: selectedCategory.id,
                amount: amountNumber,
                month: selectedMonth,
                year: selectedYear,
            });

            router.back();
        } catch (error) {
            console.error('Error creating budget:', error);
            showAlert('Erro', 'Não foi possível criar o orçamento');
        } finally {
            setIsLoading(false);
        }
    };

    const isValid = !!selectedCategory && !!amount && parseInt(amount, 10) > 0;

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
                                <X color={iconColor} size={20} />
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
                                    Criar
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: '800',
                                        letterSpacing: -0.5,
                                        color: textPrimary,
                                    }}
                                >
                                    Novo Orçamento
                                </Text>
                            </View>
                        </View>
                    </View>
                </AnimatedView>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <AnimatedView animation="fadeInDown" delay={80}>
                        <View
                            style={[
                                {
                                    backgroundColor: surfaceBg,
                                    borderRadius: 24,
                                    padding: 24,
                                    marginBottom: 24,
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
                                        color: amount && parseInt(amount, 10) > 0 ? colors.primary[500] : textTertiary,
                                        letterSpacing: -0.5,
                                        marginRight: 4,
                                    }}
                                >
                                    R$
                                </Text>
                                <TextInput
                                    ref={inputRef}
                                    value={formatAmount(amount)}
                                    onChangeText={handleAmountChange}
                                    placeholder="0,00"
                                    keyboardType="numeric"
                                    inputAccessoryViewID={Platform.OS === 'ios' ? AMOUNT_ACCESSORY_ID : undefined}
                                    style={{
                                        fontSize: 40,
                                        fontWeight: '800',
                                        letterSpacing: -1,
                                        color: amount && parseInt(amount, 10) > 0 ? textPrimary : textTertiary,
                                        minWidth: 120,
                                    }}
                                    placeholderTextColor={textTertiary}
                                />
                            </View>

                            {selectedCategory && (
                                <View
                                    style={{
                                        marginTop: 14,
                                        alignSelf: 'flex-start',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: (selectedCategory.color || colors.primary[500]) + '1A',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 999,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: selectedCategory.color || colors.primary[500],
                                            marginRight: 6,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: selectedCategory.color || colors.primary[500],
                                        }}
                                    >
                                        {selectedCategory.name}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </AnimatedView>

                    <AnimatedView animation="fadeInDown" delay={140}>
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
                                    color: textPrimary,
                                }}
                            >
                                Selecione a Categoria
                            </Text>
                        </View>
                    </AnimatedView>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {categories.map((category, index) => {
                            const isSelected = selectedCategory?.id === category.id;
                            const categoryColor = category.color || colors.primary[500];
                            return (
                                <AnimatedView
                                    key={category.id}
                                    animation="fadeInUp"
                                    delay={180 + getStaggerDelay(index, 40)}
                                >
                                    <Pressable
                                        onPress={() => setSelectedCategory(category)}
                                        style={[
                                            {
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                borderRadius: 14,
                                                borderWidth: 2,
                                                borderColor: isSelected ? categoryColor : 'transparent',
                                                overflow: 'hidden',
                                            },
                                            isSelected ? elevation.sm : {},
                                        ]}
                                    >
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: isSelected
                                                    ? categoryColor + '15'
                                                    : surfaceVariant,
                                            }}
                                        />

                                        <View
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 10,
                                                backgroundColor: categoryColor + '20',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 8,
                                            }}
                                        >
                                            <Wallet color={categoryColor} size={15} />
                                        </View>

                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: isSelected ? '700' : '500',
                                                color: isSelected ? categoryColor : textSecondary,
                                            }}
                                        >
                                            {category.name}
                                        </Text>

                                        {isSelected && (
                                            <View
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    backgroundColor: categoryColor,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginLeft: 8,
                                                }}
                                            >
                                                <Check color="#FFFFFF" size={12} />
                                            </View>
                                        )}
                                    </Pressable>
                                </AnimatedView>
                            );
                        })}
                    </View>

                    <AnimatedView animation="fadeInUp" delay={300}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                backgroundColor: colors.warning + '12',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 8,
                                borderWidth: 1,
                                borderColor: colors.warning + '25',
                            }}
                        >
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    backgroundColor: colors.warning + '20',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    flexShrink: 0,
                                }}
                            >
                                <Info color={colors.warning} size={18} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: colors.warning,
                                        marginBottom: 4,
                                    }}
                                >
                                    Dica
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        lineHeight: 18,
                                        color: textSecondary,
                                    }}
                                >
                                    Você receberá alertas quando atingir 80% do limite definido. Isso ajuda a controlar os gastos antes de exceder o orçamento.
                                </Text>
                            </View>
                        </View>
                    </AnimatedView>
                </ScrollView>

                <AnimatedView animation="fadeInUp" delay={0}>
                    <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}>
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onPress={handleSave}
                            disabled={!isValid || isLoading}
                            loading={isLoading}
                        >
                            {isLoading ? 'Salvando...' : 'Criar Orçamento'}
                        </Button>
                    </View>
                </AnimatedView>

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
