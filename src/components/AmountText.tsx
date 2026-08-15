import React from 'react';
import { Text, TextStyle } from 'react-native';
import { formatMoney } from '../domain/money';
import { useTheme } from '../theme/ThemeProvider';

interface AmountTextProps {
  amount: number;
  currency: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display';
  color?: string;
  style?: TextStyle;
}

const SIZE_KEY_MAP = {
  sm: 'sm',
  md: 'md',
  lg: 'xl',
  xl: 'xxl',
  display: 'display',
} as const;

export function AmountText({ amount, currency, size = 'md', color, style }: AmountTextProps) {
  const theme = useTheme();
  const fontSizeKey = SIZE_KEY_MAP[size];

  return (
    <Text
      style={[
        {
          color: color ?? theme.colors.text,
          fontSize: theme.fontSize[fontSizeKey],
          fontWeight: theme.fontWeight.bold as any,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
      accessibilityLabel={formatMoney(amount, currency)}
    >
      {formatMoney(amount, currency)}
    </Text>
  );
}
