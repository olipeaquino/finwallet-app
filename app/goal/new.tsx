import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Calendar, Palette, Lightbulb, CheckCircle } from 'lucide-react-native';
import { useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input, AnimatedView, showAlert } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useGoalStore } from '@/stores';
import { colors } from '@/constants';

const GOAL_COLORS = [
    '#047857',
    '#0D9488',
    '#0891B2',
    '#2563EB',
    '#D97706',
    '#E11D48',
    '#DB2777',
    '#475569',
];

export default function NewGoalScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const { addGoal, isLoading } = useGoalStore();
    const amountInputRef = useRef<TextInput>(null);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
    });
    const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

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

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDeadlineDate(selectedDate);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showAlert('Erro', 'Informe um nome para a meta');
            return;
        }

        if (!amount || parseAmount(amount) === 0) {
            showAlert('Erro', 'Informe um valor alvo válido');
            return;
        }

        try {
            await addGoal({
                name: name.trim(),
                target_amount: parseAmount(amount),
                deadline: deadlineDate.toISOString().split('T')[0],
                color: selectedColor,
                icon: 'target',
            });

            router.back();
        } catch (error) {
            showAlert('Erro', 'Não foi possível criar a meta');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient
                    colors={[selectedColor, selectedColor + 'BB']}
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
                            height: '60%',
                            backgroundColor: 'rgba(255,255,255,0.12)',
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

                    <View className="px-4 pt-4 pb-0 flex-row items-center justify-between">
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
                            <X color="white" size={22} />
                        </Pressable>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.2 }}>
                            Nova Meta
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Pressable
                        onPress={focusAmountInput}
                        style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}
                    >
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.75)',
                            letterSpacing: 1.3,
                            textTransform: 'uppercase',
                            marginBottom: 4,
                        }}>
                            Valor da Meta
                        </Text>
                        <Text style={{
                            fontSize: 42,
                            fontWeight: '800',
                            color: '#FFFFFF',
                            letterSpacing: -1,
                            marginTop: 4,
                        }}>
                            {formatAmountDisplay(amount)}
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.65)',
                            marginTop: 6,
                            fontWeight: '500',
                        }}>
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
                </LinearGradient>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View style={{ marginTop: -12 }}>
                        <AnimatedView animation="fadeInUp" delay={80}>
                            <Card variant="elevated" elevation="md" style={{ borderRadius: 24, marginHorizontal: 16, marginBottom: 12 }}>
                                <Input
                                    label="Nome da Meta"
                                    placeholder="Ex: Viagem para Europa"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <View style={{ marginTop: 16 }}>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: '600',
                                        color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                        marginBottom: 8,
                                    }}>
                                        Prazo
                                    </Text>
                                    <Pressable
                                        onPress={() => setShowDatePicker(true)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                                            borderRadius: 12,
                                            paddingHorizontal: 14,
                                            paddingVertical: 12,
                                            borderWidth: 1,
                                            borderColor: isDark ? colors.dark.border : colors.light.border,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 10,
                                                backgroundColor: selectedColor + '18',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12,
                                            }}
                                        >
                                            <Calendar color={selectedColor} size={18} />
                                        </View>
                                        <Text style={{
                                            flex: 1,
                                            fontSize: 15,
                                            fontWeight: '500',
                                            color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                        }}>
                                            {deadlineDate.toLocaleDateString('pt-BR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: '600', color: selectedColor }}>
                                            Alterar
                                        </Text>
                                    </Pressable>
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={deadlineDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                        locale="pt-BR"
                                    />
                                )}

                                <View style={{ marginTop: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <View
                                            style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: 10,
                                                backgroundColor: selectedColor + '18',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 8,
                                            }}
                                        >
                                            <Palette color={selectedColor} size={16} />
                                        </View>
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                        }}>
                                            Cor da Meta
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                        {GOAL_COLORS.map((color) => (
                                            <Pressable
                                                key={color}
                                                onPress={() => setSelectedColor(color)}
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 22,
                                                    backgroundColor: color,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: selectedColor === color ? 3 : 2,
                                                    borderColor: selectedColor === color
                                                        ? (isDark ? '#FFFFFF' : '#1C1917')
                                                        : 'transparent',
                                                    shadowColor: selectedColor === color ? color : 'transparent',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: selectedColor === color ? 0.5 : 0,
                                                    shadowRadius: 8,
                                                    elevation: selectedColor === color ? 6 : 0,
                                                }}
                                            >
                                                {selectedColor === color && (
                                                    <CheckCircle color="white" size={20} />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </Card>
                        </AnimatedView>

                        <AnimatedView animation="fadeInUp" delay={140}>
                            <Card variant="filled" style={{ borderRadius: 20, marginHorizontal: 16, marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <View
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 10,
                                            backgroundColor: colors.warning + '18',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10,
                                        }}
                                    >
                                        <Lightbulb color={colors.warning} size={17} />
                                    </View>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '700',
                                        color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    }}>
                                        Dicas para suas metas
                                    </Text>
                                </View>
                                {[
                                    'Seja específico: "Viagem para Paris" é melhor que "Reserva"',
                                    'Defina prazos realistas para manter a motivação',
                                    'Faça depósitos regulares, mesmo que pequenos',
                                ].map((tip, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: i > 0 ? 6 : 0 }}>
                                        <View
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: colors.warning,
                                                marginTop: 6,
                                                marginRight: 8,
                                            }}
                                        />
                                        <Text style={{
                                            flex: 1,
                                            fontSize: 13,
                                            color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                            lineHeight: 18,
                                        }}>
                                            {tip}
                                        </Text>
                                    </View>
                                ))}
                            </Card>
                        </AnimatedView>

                        <AnimatedView animation="fadeInUp" delay={200}>
                            <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    onPress={handleSave}
                                    loading={isLoading}
                                >
                                    Criar Meta
                                </Button>
                            </View>
                        </AnimatedView>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
