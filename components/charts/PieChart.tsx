import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants';

interface CategoryData {
    category_id: string;
    category_name: string;
    category_color: string;
    total: number;
    percentage: number;
}

interface PieChartProps {
    data: CategoryData[];
    isDark?: boolean;
}

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width - 100, 200);
const CENTER = CHART_SIZE / 2;
const RADIUS = CHART_SIZE / 2 - 10;
const INNER_RADIUS = RADIUS * 0.62;

const adjust = (hex: string, amt: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
    return '#' + (r * 65536 + g * 256 + b).toString(16).padStart(6, '0');
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function createArcPath(startAngle: number, endAngle: number, outerRadius: number, innerRadius: number): string {
    const start = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
    const end = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
    const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
    const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
        'M', start.x, start.y,
        'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z',
    ].join(' ');

    return d;
}

export function PieChart({ data, isDark = false }: PieChartProps) {
    if (data.length === 0) {
        return (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                <View
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        borderWidth: 14,
                        borderColor: isDark ? '#27272A' : '#F4F4F5',
                        marginBottom: 14,
                    }}
                />
                <Text style={{ color: isDark ? '#A1A1AA' : '#71717A', fontSize: 14, fontWeight: '500' }}>
                    Adicione despesas para ver o gráfico
                </Text>
            </View>
        );
    }

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

    let currentAngle = 0;
    const slices = data.map((item) => {
        const sliceAngle = (item.total / totalAmount) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        currentAngle = endAngle;

        return {
            ...item,
            startAngle,
            endAngle,
            path: createArcPath(startAngle, endAngle - 1.2, RADIUS, INNER_RADIUS),
        };
    });

    const textPrimary = isDark ? '#FAFAFA' : '#18181B';
    const textSecondary = isDark ? '#A1A1AA' : '#71717A';

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ width: CHART_SIZE, height: CHART_SIZE, marginBottom: 16 }}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                    <Defs>
                        {slices.map((slice) => (
                            <LinearGradient key={`g-${slice.category_id}`} id={`slice-${slice.category_id}`} x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={adjust(slice.category_color, 28)} />
                                <Stop offset="1" stopColor={adjust(slice.category_color, -18)} />
                            </LinearGradient>
                        ))}
                    </Defs>
                    <G>
                        {slices.map((slice) => (
                            <Path
                                key={slice.category_id}
                                d={slice.path}
                                fill={`url(#slice-${slice.category_id})`}
                            />
                        ))}
                        <SvgText
                            x={CENTER}
                            y={CENTER - 6}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight="500"
                            fill={textSecondary}
                        >
                            Total
                        </SvgText>
                        <SvgText
                            x={CENTER}
                            y={CENTER + 14}
                            textAnchor="middle"
                            fontSize={15}
                            fontWeight="bold"
                            fill={textPrimary}
                        >
                            {`R$ ${(totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        </SvgText>
                    </G>
                </Svg>
            </View>

            <View style={{ width: '100%' }}>
                {data.map((item, index) => (
                    <View
                        key={item.category_id}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: index > 0 ? 10 : 0,
                            paddingHorizontal: 2,
                        }}
                    >
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: item.category_color,
                                marginRight: 10,
                            }}
                        />
                        <Text
                            style={{ flex: 1, fontSize: 13, fontWeight: '500', color: textPrimary }}
                            numberOfLines={1}
                        >
                            {item.category_name}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: textSecondary,
                                marginRight: 10,
                                minWidth: 36,
                                textAlign: 'right',
                            }}
                        >
                            {item.percentage.toFixed(0)}%
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: textPrimary,
                                minWidth: 84,
                                textAlign: 'right',
                            }}
                        >
                            R$ {(item.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
