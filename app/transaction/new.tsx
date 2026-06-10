import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, Input, GradientCard, AnimatedView, getStaggerDelay, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useTransactionStore } from '@/stores';
import { categoryService } from '@/services';
import { colors, glow } from '@/constants';
import { Category } from '@/types';

export default function NewTransactionScreen() {
    const router = useRouter();
    const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
    const { isDark } = useThemeContext();
    const { addTransaction, isLoading } = useTransactionStore();
    const amountInputRef = useRef<TextInput>(null);

    const [type, setType] = useState<'income' | 'expense'>(typeParam === 'income' ? 'income' : 'expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            setIsLoadingCategories(true);
            try {
                const cats = await categoryService.getAll(type);
                setCategories(cats);
                if (cats.length > 0) {
                    setSelectedCategory(cats[0]);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        }
        loadCategories();
    }, [type]);

    const parseAmount = (value: string): number => {
        const cleaned = value.replace(/[^\d]/g, '');
        return parseInt(cleaned) || 0;
    };

    const formatAmountDisplay = (value: string): string => {
        const cents = parseAmount(value);
        if (cents === 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/[^\d]/g, '');
        setAmount(cleaned);
    };

    const focusAmountInput = () => {
        amountInputRef.current?.focus();
    };

    const handleSave = async () => {
        if (!amount || parseAmount(amount) === 0) {
            showAlert('Erro', 'Informe um valor válido');
            return;
        }

        if (!description.trim()) {
            showAlert('Erro', 'Informe uma descrição');
            return;
        }

        if (!selectedCategory) {
            showAlert('Erro', 'Selecione uma categoria');
            return;
        }

        try {
            await addTransaction({
                type,
                amount: parseAmount(amount),
                description: description.trim(),
                category_id: selectedCategory.id,
                date: date.toISOString().split('T')[0],
            });

            router.back();
        } catch (error) {
            showAlert('Erro', 'Não foi possível salvar a transação');
        }
    };

    const isExpense = type === 'expense';
    const heroGradient = isExpense
        ? (colors.gradients.expense as [string, string])
        : (colors.gradients.income as [string, string]);
    const heroGlow = isExpense ? glow.expense : glow.income;
    const typeColor = isExpense ? colors.expense : colors.income;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <AnimatedView animation="fadeInDown" delay={0}>
                    <View style={[{ borderRadius: 0, marginBottom: 0 }, heroGlow]}>
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
                                    width: 160,
                                    height: 160,
                                    borderRadius: 80,
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -20,
                                    left: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                }}
                            />

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                                <Pressable
                                    onPress={() => router.back()}
                                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X color="white" size={20} />
                                </Pressable>
                                <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 }}>
                                    Nova {isExpense ? 'Despesa' : 'Receita'}
                                </Text>
                                <View style={{ width: 40 }} />
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 12, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 999, padding: 4 }}>
                                <Pressable
                                    style={{
                                        flex: 1,
                                        paddingVertical: 9,
                                        alignItems: 'center',
                                        borderRadius: 999,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        backgroundColor: isExpense ? 'rgba(255,255,255,0.25)' : 'transparent',
                                    }}
                                    onPress={() => {
                                        setType('expense');
                                        setSelectedCategory(null);
                                    }}
                                >
                                    <TrendingDown color="white" size={15} style={{ marginRight: 5 }} />
                                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Despesa</Text>
                                </Pressable>
                                <Pressable
                                    style={{
                                        flex: 1,
                                        paddingVertical: 9,
                                        alignItems: 'center',
                                        borderRadius: 999,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        backgroundColor: !isExpense ? 'rgba(255,255,255,0.25)' : 'transparent',
                                    }}
                                    onPress={() => {
                                        setType('income');
                                        setSelectedCategory(null);
                                    }}
                                >
                                    <TrendingUp color="white" size={15} style={{ marginRight: 5 }} />
                                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Receita</Text>
                                </Pressable>
                            </View>

                            <Pressable
                                onPress={focusAmountInput}
                                style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.4, marginBottom: 6, textTransform: 'uppercase' }}>
                                    VALOR
                                </Text>
                                <Text style={{ fontSize: 44, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 }}>
                                    {formatAmountDisplay(amount)}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.60)', marginTop: 6 }}>
                                    Toque para editar
                                </Text>
                                <TextInput
                                    ref={amountInputRef}
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    keyboardType="numeric"
                                    style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
                                />
                            </Pressable>
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
                        <Card variant="elevated" elevation="lg" style={{ marginHorizontal: 16, marginBottom: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                            <Input
                                label="Descrição"
                                placeholder="Ex: Almoço no restaurante"
                                value={description}
                                onChangeText={setDescription}
                                leftIcon={
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: typeColor + '1A', alignItems: 'center', justifyContent: 'center' }}>
                                        <DollarSign color={typeColor} size={18} />
                                    </View>
                                }
                            />

                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? colors.dark.textSecondary : colors.light.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
                                    Categoria
                                </Text>

                                {isLoadingCategories ? (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {[1, 2, 3, 4].map((i) => (
                                            <View
                                                key={i}
                                                style={{
                                                    height: 36,
                                                    width: 80 + i * 10,
                                                    borderRadius: 999,
                                                    backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                                                    opacity: 0.5,
                                                }}
                                            />
                                        ))}
                                    </View>
                                ) : categories.length === 0 ? (
                                    <Text style={{ fontSize: 14, color: isDark ? colors.dark.textTertiary : colors.light.textTertiary }}>
                                        Nenhuma categoria encontrada
                                    </Text>
                                ) : (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {categories.map((cat, index) => {
                                            const isSelected = selectedCategory?.id === cat.id;
                                            return (
                                                <AnimatedView
                                                    key={cat.id}
                                                    animation="zoomIn"
                                                    delay={getStaggerDelay(index, 40)}
                                                >
                                                    <Pressable
                                                        onPress={() => setSelectedCategory(cat)}
                                                        style={{
                                                            paddingHorizontal: 14,
                                                            paddingVertical: 8,
                                                            borderRadius: 999,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: isSelected
                                                                ? cat.color
                                                                : isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                                                            borderWidth: isSelected ? 0 : 1,
                                                            borderColor: isDark ? colors.dark.border : colors.light.border,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: 5,
                                                                backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : cat.color,
                                                                marginRight: 7,
                                                            }}
                                                        />
                                                        <Text
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: '600',
                                                                color: isSelected
                                                                    ? '#FFFFFF'
                                                                    : isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                                            }}
                                                        >
                                                            {cat.name}
                                                        </Text>
                                                        {isSelected && (
                                                            <Check color="white" size={13} style={{ marginLeft: 5 }} />
                                                        )}
                                                    </Pressable>
                                                </AnimatedView>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? colors.dark.textSecondary : colors.light.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
                                    Data
                                </Text>
                                <Pressable
                                    onPress={() => setShowDatePicker(true)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                                        borderRadius: 14,
                                        paddingHorizontal: 14,
                                        paddingVertical: 13,
                                        borderWidth: 1,
                                        borderColor: isDark ? colors.dark.border : colors.light.border,
                                    }}
                                >
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: typeColor + '1A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <Calendar color={typeColor} size={18} />
                                    </View>
                                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: isDark ? colors.dark.textPrimary : colors.light.textPrimary }}>
                                        {date.toLocaleDateString('pt-BR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: typeColor + '1A' }}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: typeColor }}>
                                            Alterar
                                        </Text>
                                    </View>
                                </Pressable>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(Platform.OS === 'ios');
                                            if (selectedDate) {
                                                setDate(selectedDate);
                                            }
                                        }}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </View>
                        </Card>
                    </AnimatedView>

                    <AnimatedView animation="fadeInUp" delay={160}>
                        <View style={{ paddingHorizontal: 16 }}>
                            <Button
                                variant={isExpense ? 'expense' : 'income'}
                                fullWidth
                                size="lg"
                                onPress={handleSave}
                                loading={isLoading}
                                disabled={isLoadingCategories || categories.length === 0}
                                leftIcon={isExpense
                                    ? <TrendingDown color="white" size={20} />
                                    : <TrendingUp color="white" size={20} />
                                }
                            >
                                Salvar {isExpense ? 'Despesa' : 'Receita'}
                            </Button>
                        </View>
                    </AnimatedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
