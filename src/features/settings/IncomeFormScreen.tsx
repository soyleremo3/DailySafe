import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { DateField } from '../../components/DateField';
import { FrequencyPicker } from '../../components/FrequencyPicker';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { FREE_LIMITS } from '../../constants/entitlements';
import { getCurrencyInfo } from '../../domain/currencies';
import { RecurrenceFrequency } from '../../domain/types';
import { useEntitlement } from '../../hooks/useEntitlement';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { showAlert } from '../../utils/alert';

type Props = NativeStackScreenProps<RootStackParamList, 'IncomeForm'>;

export function IncomeFormScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const currency = useAppStore((s) => s.settings.currency);
  const incomeSources = useAppStore((s) => s.incomeSources);
  const upsertIncomeSource = useAppStore((s) => s.upsertIncomeSource);
  const deleteIncomeSource = useAppStore((s) => s.deleteIncomeSource);
  const { canAddIncomeSource, isPro } = useEntitlement();
  const symbol = getCurrencyInfo(currency).symbol;

  const existing = incomeSources.find((s) => s.id === route.params?.incomeId);
  const isEditing = !!existing;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(existing?.frequency ?? 'monthly');
  const [anchorDate, setAnchorDate] = useState(existing?.anchorDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  const canSave = label.trim().length > 0 && Number(amount) > 0;

  const handleSave = async () => {
    if (!isEditing && !canAddIncomeSource(incomeSources.length)) {
      navigation.replace('Paywall', { feature: 'more than 1 income source' });
      return;
    }
    setSaving(true);
    try {
      await upsertIncomeSource({
        id: existing?.id,
        label: label.trim(),
        amount: Number(amount),
        frequency,
        anchorDate,
        active: existing?.active ?? true,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    showAlert('Delete income source', `Remove "${existing.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteIncomeSource(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any, marginBottom: 20 }}>
        {isEditing ? 'Edit income' : 'New income source'}
      </Text>

      {!isEditing && !isPro ? (
        <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs, marginBottom: 16 }}>
          Free plan: {incomeSources.length}/{FREE_LIMITS.maxIncomeSources} income source used
        </Text>
      ) : null}

      <View style={styles.field}>
        <TextField label="Source" value={label} onChangeText={setLabel} placeholder="e.g. Salary, Freelance" />
      </View>
      <View style={styles.field}>
        <TextField label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" prefix={symbol} />
      </View>
      <View style={styles.field}>
        <FrequencyPicker value={frequency} onChange={setFrequency} exclude={['once']} />
      </View>
      <View style={styles.field}>
        <DateField label="Next payday" valueISO={anchorDate} onChange={setAnchorDate} />
      </View>

      <Button label={isEditing ? 'Save changes' : 'Add income source'} onPress={handleSave} disabled={!canSave} loading={saving} />
      <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={styles.spacer} />
      {isEditing ? <Button label="Delete" onPress={handleDelete} variant="danger" style={styles.spacer} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  spacer: { marginTop: 10 },
});
