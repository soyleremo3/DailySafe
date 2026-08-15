import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addMonths, format } from 'date-fns';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { DateField } from '../../components/DateField';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { FREE_LIMITS } from '../../constants/entitlements';
import { getCurrencyInfo } from '../../domain/currencies';
import { GoalKind } from '../../domain/types';
import { useEntitlement } from '../../hooks/useEntitlement';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalForm'>;

export function GoalFormScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const currency = useAppStore((s) => s.settings.currency);
  const goals = useAppStore((s) => s.goals);
  const upsertGoal = useAppStore((s) => s.upsertGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const { canAddGoal, isPro } = useEntitlement();
  const symbol = getCurrencyInfo(currency).symbol;

  const existing = goals.find((g) => g.id === route.params?.goalId);
  const isEditing = !!existing;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [kind, setKind] = useState<GoalKind>(existing?.kind ?? 'big_expense');
  const [targetAmount, setTargetAmount] = useState(existing ? String(existing.targetAmount) : '');
  const [savedAmount, setSavedAmount] = useState(existing ? String(existing.savedAmount) : '0');
  const [targetDate, setTargetDate] = useState(existing?.targetDate ?? format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  const canSave = label.trim().length > 0 && Number(targetAmount) > 0;

  const handleSave = async () => {
    if (!isEditing && !canAddGoal(goals.length)) {
      navigation.replace('Paywall', { feature: 'more than 1 goal' });
      return;
    }
    setSaving(true);
    try {
      await upsertGoal({
        id: existing?.id,
        label: label.trim(),
        kind,
        targetAmount: Number(targetAmount),
        savedAmount: Number(savedAmount) || 0,
        targetDate,
        active: existing?.active ?? true,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete goal', `Remove "${existing.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGoal(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any, marginBottom: 20 }}>
        {isEditing ? 'Edit goal' : 'New goal'}
      </Text>

      {!isEditing && !isPro ? (
        <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs, marginBottom: 16 }}>
          Free plan: {goals.length}/{FREE_LIMITS.maxGoals} goal used
        </Text>
      ) : null}

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>Type</Text>
        <View style={styles.chipRow}>
          <Chip label="Big expense" selected={kind === 'big_expense'} onPress={() => setKind('big_expense')} />
          <Chip label="Savings goal" selected={kind === 'savings'} onPress={() => setKind('savings')} />
        </View>
      </View>

      <View style={styles.field}>
        <TextField label="What is it?" value={label} onChangeText={setLabel} placeholder="e.g. New laptop, Emergency fund" />
      </View>
      <View style={styles.field}>
        <TextField
          label="Target amount"
          value={targetAmount}
          onChangeText={setTargetAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          prefix={symbol}
        />
      </View>
      <View style={styles.field}>
        <TextField
          label="Already saved (optional)"
          value={savedAmount}
          onChangeText={setSavedAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          prefix={symbol}
        />
      </View>
      <View style={styles.field}>
        <DateField label="Target date" valueISO={targetDate} onChange={setTargetDate} />
      </View>

      <Button label={isEditing ? 'Save changes' : 'Add goal'} onPress={handleSave} disabled={!canSave} loading={saving} />
      <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={styles.spacer} />
      {isEditing ? <Button label="Delete goal" onPress={handleDelete} variant="danger" style={styles.spacer} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spacer: { marginTop: 10 },
});
