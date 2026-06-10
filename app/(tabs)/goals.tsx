import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Target, Trophy, Sparkles, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import { useState, useCallback, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, GradientCard, Button, ProgressRing, AnimatedView, getStaggerDelay } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useGoalStore } from '@/stores';
import { colors, glow, getGlow } from '@/constants';
import { Goal } from '@/types';

export default function GoalsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const {
        goals,
        totalGoals,
        completedGoals,
        totalTarget,
        totalSaved,
        isLoading,
        fetchGoals,
        fetchSummary
    } = useGoalStore();

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchGoals();
        fetchSummary();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchGoals(), fetchSummary()]);
        setRefreshing(false);
    }, []);

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const activeGoals = goals.filter(g => !g.is_completed);
    const doneGoals = goals.filter(g => g.is_completed);

    const GoalCard = ({ goal, index }: { goal: Goal; index: number }) => {
        const progress = goal.target_amount > 0
            ? (goal.current_amount / goal.target_amount) * 100
            : 0;

        const daysLeft = Math.ceil(
            (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const daysLeftText = daysLeft > 0
            ? `${daysLeft} dias restantes`
            : daysLeft === 0
                ? 'Vence hoje!'
                : 'Prazo vencido';
        const isOverdue = daysLeft < 0;

        const goalColor = goal.color || colors.primary[500];
        const gradientEnd = goalColor + 'CC';

        return (
            <AnimatedView animation="fadeInUp" delay={getStaggerDelay(index)}>
                <Pressable
                    onPress={() => router.push({ pathname: '/goal/[id]', params: { id: goal.id } })}
                >
                    <View style={[{ borderRadius: 24, marginBottom: 12 }, getGlow(goalColor, 0.18)]}>
                        <Card variant="default" elevation="sm" style={{ borderRadius: 24, padding: 0, overflow: 'hidden' }}>
                            <View
                                style={{
                                    height: 4,
                                    backgroundColor: goalColor,
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                }}
                            />
                            <View style={{ padding: 16 }}>
                                <View className="flex-row items-center">
                                    <ProgressRing
                                        progress={progress}
                                        size={72}
                                        strokeWidth={7}
                                        color={goalColor}
                                        gradientColors={[goalColor, goalColor + '88'] as any}
                                        isDark={isDark}
                                        showPercentage={true}
                                    />

                                    <View className="flex-1 ml-4">
                                        <View className="flex-row items-center justify-between">
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '700',
                                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                                    letterSpacing: -0.3,
                                                    flex: 1,
                                                }}
                                                numberOfLines={1}
                                            >
                                                {goal.name}
                                            </Text>
                                            {goal.is_completed && (
                                                <View
                                                    style={{
                                                        backgroundColor: colors.income + '20',
                                                        borderRadius: 20,
                                                        padding: 6,
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    <Trophy color={colors.income} size={16} />
                                                </View>
                                            )}
                                        </View>

                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 5,
                                                alignSelf: 'flex-start',
                                                backgroundColor: isOverdue
                                                    ? colors.error + '18'
                                                    : (isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant),
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 999,
                                            }}
                                        >
                                            <Calendar
                                                color={isOverdue ? colors.error : goalColor}
                                                size={11}
                                            />
                                            <Text style={{
                                                fontSize: 11,
                                                color: isOverdue ? colors.error : (isDark ? colors.dark.textSecondary : colors.light.textSecondary),
                                                marginLeft: 4,
                                                fontWeight: isOverdue ? '700' : '500',
                                            }}>
                                                {daysLeftText}
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
                                            <Text style={{ fontSize: 17, fontWeight: '800', color: goalColor, letterSpacing: -0.5 }}>
                                                R$ {(goal.current_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                                                marginHorizontal: 4,
                                            }}>
                                                /
                                            </Text>
                                            <Text style={{
                                                fontSize: 13,
                                                color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                                fontWeight: '500',
                                            }}>
                                                R$ {(goal.target_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ marginTop: 14 }}>
                                    <View
                                        style={{
                                            height: 6,
                                            borderRadius: 999,
                                            backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                                            overflow: 'hidden',
                                        }}
                                    >
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
                                </View>
                            </View>
                        </Card>
                    </View>
                </Pressable>
            </AnimatedView>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <AnimatedView animation="fadeInDown" delay={0}>
                <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
                    <View>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                letterSpacing: 1.2,
                                textTransform: 'uppercase',
                            }}
                        >
                            Suas Metas
                        </Text>
                        <Text
                            style={{
                                fontSize: 26,
                                fontWeight: '800',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                letterSpacing: -0.5,
                                marginTop: 2,
                            }}
                        >
                            Metas
                        </Text>
                    </View>
                    {totalGoals > 0 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary[500] + '18',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 999,
                            }}
                        >
                            <TrendingUp color={colors.primary[500]} size={14} />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '700',
                                    color: colors.primary[500],
                                    marginLeft: 5,
                                }}
                            >
                                {completedGoals}/{totalGoals}
                            </Text>
                        </View>
                    )}
                </View>
            </AnimatedView>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <AnimatedView animation="fadeInDown" delay={80}>
                    <View style={[{ borderRadius: 28, marginBottom: 24 }, glow.primary]}>
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
                                    right: -40,
                                    width: 160,
                                    height: 160,
                                    borderRadius: 80,
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -30,
                                    left: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                }}
                            />

                            <View className="flex-row items-center">
                                <ProgressRing
                                    progress={overallProgress}
                                    size={104}
                                    strokeWidth={9}
                                    color="#FFFFFF"
                                    gradientColors={['#FFFFFF', 'rgba(255,255,255,0.6)'] as any}
                                    backgroundColor="rgba(255,255,255,0.2)"
                                    isDark={true}
                                    showPercentage={true}
                                />

                                <View className="flex-1 ml-5">
                                    <Text style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: 'rgba(255,255,255,0.75)',
                                        letterSpacing: 1.3,
                                        textTransform: 'uppercase',
                                    }}>
                                        Total Guardado
                                    </Text>
                                    <Text style={{
                                        fontSize: 30,
                                        fontWeight: '800',
                                        color: '#FFFFFF',
                                        marginTop: 4,
                                        letterSpacing: -1,
                                    }}>
                                        R$ {(totalSaved / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        color: 'rgba(255,255,255,0.65)',
                                        marginTop: 2,
                                        fontWeight: '500',
                                    }}>
                                        de R$ {(totalTarget / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </Text>

                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 10,
                                        backgroundColor: 'rgba(255,255,255,0.18)',
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                        borderRadius: 999,
                                        alignSelf: 'flex-start',
                                    }}>
                                        <Trophy color="#FFFFFF" size={13} />
                                        <Text style={{
                                            color: '#FFFFFF',
                                            fontSize: 12,
                                            fontWeight: '700',
                                            marginLeft: 5,
                                        }}>
                                            {completedGoals} de {totalGoals} concluídas
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </GradientCard>
                    </View>
                </AnimatedView>

                {goals.length > 0 ? (
                    <>
                        {activeGoals.length > 0 && (
                            <AnimatedView animation="fadeInUp" delay={140}>
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text
                                        style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                            letterSpacing: -0.3,
                                        }}
                                    >
                                        Metas Ativas
                                    </Text>
                                    <View
                                        style={{
                                            backgroundColor: colors.primary[500] + '18',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 999,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            color: colors.primary[500],
                                        }}>
                                            {activeGoals.length}
                                        </Text>
                                    </View>
                                </View>
                                {activeGoals.map((goal, index) => (
                                    <GoalCard key={goal.id} goal={goal} index={index} />
                                ))}
                            </AnimatedView>
                        )}

                        {doneGoals.length > 0 && (
                            <AnimatedView animation="fadeInUp" delay={200}>
                                <View className="flex-row items-center mb-3" style={{ marginTop: activeGoals.length > 0 ? 12 : 0 }}>
                                    <View
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 12,
                                            backgroundColor: colors.income + '1A',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10,
                                        }}
                                    >
                                        <CheckCircle2 color={colors.income} size={18} />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                            letterSpacing: -0.3,
                                        }}
                                    >
                                        Metas Concluídas
                                    </Text>
                                </View>
                                {doneGoals.map((goal, index) => (
                                    <GoalCard key={goal.id} goal={goal} index={index} />
                                ))}
                            </AnimatedView>
                        )}
                    </>
                ) : (
                    <AnimatedView animation="zoomIn" delay={160}>
                        <Card variant="filled" style={{ borderRadius: 24, alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: colors.primary[500] + '18',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                <Target color={colors.primary[500]} size={38} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    textAlign: 'center',
                                    letterSpacing: -0.3,
                                }}
                            >
                                Nenhuma meta ainda
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                                    textAlign: 'center',
                                    marginTop: 8,
                                    paddingHorizontal: 16,
                                    lineHeight: 20,
                                }}
                            >
                                Comece a economizar criando sua primeira meta. Pode ser uma viagem, um eletrônico ou uma reserva de emergência!
                            </Text>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 16,
                                    backgroundColor: colors.warning + '18',
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                }}
                            >
                                <Sparkles color={colors.warning} size={15} />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: colors.warning,
                                        marginLeft: 6,
                                    }}
                                >
                                    Metas específicas são mais fáceis de alcançar!
                                </Text>
                            </View>

                            <View style={{ marginTop: 24, width: '100%' }}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    leftIcon={<Plus color="white" size={20} />}
                                    onPress={() => router.push('/goal/new')}
                                >
                                    Criar Primeira Meta
                                </Button>
                            </View>
                        </Card>
                    </AnimatedView>
                )}
            </ScrollView>

            {goals.length > 0 && (
                <View
                    style={[
                        {
                            position: 'absolute',
                            bottom: 28,
                            right: 20,
                        },
                        glow.primary,
                        { borderRadius: 30 },
                    ]}
                >
                    <Button
                        variant="primary"
                        size="icon"
                        onPress={() => router.push('/goal/new')}
                    >
                        <Plus color="white" size={28} />
                    </Button>
                </View>
            )}
        </SafeAreaView>
    );
}
