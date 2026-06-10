import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants';

interface MonthlyData {
    month: string;
    year: number;
    income: number;
    expense: number;
}

interface BarChartProps {
    data: MonthlyData[];
    isDark?: boolean;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 190;
const PADDING = { top: 20, right: 16, bottom: 40, left: 50 };
const BAR_WIDTH = 13;
const BAR_GAP = 5;

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function BarChart({ data, isDark = false }: BarChartProps) {
    if (data.length === 0) {
        return (
            <View style={{ alignItems: 'center', padding: 24 }}>
                <Text style={{ color: isDark ? '#A1A1AA' : '#71717A', fontSize: 14, fontWeight: '500' }}>
                    Adicione transações para ver o gráfico
                </Text>
            </View>
        );
    }

    const chartAreaWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const chartAreaHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense))) / 100;
    const scale = maxValue > 0 ? Math.ceil(maxValue / 1000) * 1000 || 100 : 100;
    const groupWidth = chartAreaWidth / data.length;

    const textColor = isDark ? '#A1A1AA' : '#71717A';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    const yLabels = [0, scale * 0.25, scale * 0.5, scale * 0.75, scale];

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.income, marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: textColor, fontWeight: '500' }}>Receitas</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.expense, marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: textColor, fontWeight: '500' }}>Despesas</Text>
                </View>
            </View>

            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Defs>
                    <LinearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#34D399" />
                        <Stop offset="1" stopColor="#10B981" />
                    </LinearGradient>
                    <LinearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#FB7185" />
                        <Stop offset="1" stopColor="#F43F5E" />
                    </LinearGradient>
                </Defs>

                {yLabels.map((label, i) => {
                    const y = PADDING.top + chartAreaHeight - (label / scale) * chartAreaHeight;
                    return (
                        <G key={i}>
                            <Line
                                x1={PADDING.left}
                                y1={y}
                                x2={CHART_WIDTH - PADDING.right}
                                y2={y}
                                stroke={gridColor}
                                strokeWidth={1}
                            />
                            <SvgText
                                x={PADDING.left - 8}
                                y={y + 4}
                                textAnchor="end"
                                fontSize={10}
                                fill={textColor}
                            >
                                {label >= 1000 ? `${label / 1000}k` : label}
                            </SvgText>
                        </G>
                    );
                })}

                {data.map((item, index) => {
                    const groupX = PADDING.left + index * groupWidth + groupWidth / 2;
                    const incomeHeight = (item.income / 100 / scale) * chartAreaHeight;
                    const expenseHeight = (item.expense / 100 / scale) * chartAreaHeight;

                    const monthName = MONTH_NAMES[parseInt(item.month) - 1] || item.month;

                    return (
                        <G key={index}>
                            <Rect
                                x={groupX - BAR_WIDTH - BAR_GAP / 2}
                                y={PADDING.top + chartAreaHeight - incomeHeight}
                                width={BAR_WIDTH}
                                height={incomeHeight || 2}
                                fill="url(#barIncome)"
                                rx={5}
                            />
                            <Rect
                                x={groupX + BAR_GAP / 2}
                                y={PADDING.top + chartAreaHeight - expenseHeight}
                                width={BAR_WIDTH}
                                height={expenseHeight || 2}
                                fill="url(#barExpense)"
                                rx={5}
                            />
                            <SvgText
                                x={groupX}
                                y={CHART_HEIGHT - 10}
                                textAnchor="middle"
                                fontSize={10}
                                fontWeight="500"
                                fill={textColor}
                            >
                                {monthName}
                            </SvgText>
                        </G>
                    );
                })}
            </Svg>
        </View>
    );
}
