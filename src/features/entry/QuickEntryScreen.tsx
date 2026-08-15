import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { CATEGORY_META, EXPENSE_CATEGORIES } from '../../constants/categories';
import { getCurrencyInfo } from '../../domain/currencies';
import { EntryCategory, TransactionType } from '../../domain/types';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickEntry'>;

export function QuickEntryScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const currency = useAppStore((s) => s.settings.currency);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const symbol = getCurrencyInfo(currency).symbol;

  const [type, setType] = useState<TransactionType>(route.params?.type ?? 'expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<EntryCategory>('food');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = Number(amount) > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addTransaction({
        type,
        amount: Number(amount),
        category: type === 'income' ? 'income' : category,
        note: note.trim(),
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.segmented}>
        <SegmentButton label="Expense" active={type === 'expense'} onPress={() => setType('expense')} />
        <SegmentButton label="Income" active={type === 'income'} onPress={() => setType('income')} />
      </View>

      <View style={styles.amountBlock}>
        <TextField
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          prefix={symbol}
          autoFocus
          returnKeyType={type === 'income' ? 'done' : 'next'}
        />
      </View>

      {type === 'expense' ? (
        <View style={styles.categoryBlock}>
          <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>Category</Text>
          <View style={styles.chipRow}>
            {EXPENSE_CATEGORIES.map((c) => (
              <Chip key={c} label={CATEGORY_META[c].label} icon={CATEGORY_META[c].icon as any} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.noteBlock}>
        <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was it for?" returnKeyType="done" />
      </View>

      <Button label={type === 'expense' ? 'Save expense' : 'Save income'} onPress={handleSave} disabled={!canSave} loading={saving} />
      <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={styles.cancel} />
    </Screen>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.segment,
        { backgroundColor: active ? theme.colors.surface : 'transparent', borderRadius: theme.radius.md },
      ]}
    >
      <Text style={{ color: active ? theme.colors.text : theme.colors.textMuted, fontWeight: theme.fontWeight.semibold as any }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', backgroundColor: 'rgba(128,128,128,0.12)', borderRadius: 14, padding: 4, marginBottom: 20 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  amountBlock: { marginBottom: 20 },
  categoryBlock: { marginBottom: 20 },
  label: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  noteBlock: { marginBottom: 24 },
  cancel: { marginTop: 8 },
});
