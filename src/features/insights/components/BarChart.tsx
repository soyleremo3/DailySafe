import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  highlightColor?: string;
}

export function BarChart({ data, height = 120, highlightColor }: BarChartProps) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = data.length > 0 ? Math.min(28, 280 / data.length - 6) : 0;
  const gap = 6;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${Math.max(chartWidth, 1)} ${height}`} preserveAspectRatio="xMidYMax meet">
        {data.map((d, i) => {
          const barHeight = Math.max(2, (d.value / max) * (height - 20));
          const x = i * (barWidth + gap);
          const y = height - barHeight - 16;
          return (
            <Rect
              key={d.label + i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={d.value > 0 ? highlightColor ?? theme.colors.primary : theme.colors.surfaceAlt}
            />
          );
        })}
      </Svg>
      <View style={styles.labelRow}>
        {data.map((d, i) => (
          <Text
            key={d.label + i}
            style={[styles.label, { color: theme.colors.textFaint, width: barWidth + gap }]}
            numberOfLines={1}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row' },
  label: { fontSize: 10, textAlign: 'center' },
});
