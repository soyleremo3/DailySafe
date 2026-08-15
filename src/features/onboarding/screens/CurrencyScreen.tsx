import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TextField } from '../../../components/TextField';
import { CURRENCIES } from '../../../domain/currencies';
import { OnboardingStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/ThemeProvider';
import { useOnboarding } from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Currency'>;

export function CurrencyScreen({ navigation }: Props) {
  const theme = useTheme();
  const { draft, setCurrency } = useOnboarding();
  const [query, setQuery] = useState('');

  const filtered = CURRENCIES.filter(
    (c) => c.code.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <OnboardingLayout
      step={2}
      totalSteps={6}
      title="What's your currency?"
      subtitle="DailySafe works in one currency at a time — no conversions, no exchange rates to worry about."
      primaryLabel="Continue"
      onPrimary={() => navigation.navigate('Balance')}
    >
      <TextField label="Search" value={query} onChangeText={setQuery} placeholder="Search currency" />
      <View style={styles.list}>
        {filtered.map((item) => {
          const selected = draft.currency === item.code;
          return (
            <Pressable
              key={item.code}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setCurrency(item.code)}
              style={[
                styles.row,
                {
                  backgroundColor: selected ? theme.colors.surfaceAlt : 'transparent',
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text style={[styles.symbol, { color: theme.colors.textMuted }]}>{item.symbol}</Text>
              <View style={styles.rowText}>
                <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium as any }}>
                  {item.code}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>{item.name}</Text>
              </View>
              {selected ? <Text style={{ color: theme.colors.primary }}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 12 },
  symbol: { width: 28, textAlign: 'center', fontSize: 16 },
  rowText: { flex: 1 },
});
