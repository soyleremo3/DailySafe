import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { DateField } from '../../components/DateField';
import { FrequencyPicker } from '../../components/FrequencyPicker';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { CATEGORY_META, EXPENSE_CATEGORIES } from '../../constants/categories';
import { FREE_LIMITS } from '../../constants/entitlements';
import { getCurrencyInfo } from '../../domain/currencies';
import { EntryCategory, RecurrenceFrequency } from '../../domain/types';
import { useEntitlement } from '../../hooks/useEntitlement';
import { RootStackParamList } from '../../navigation/types';
import { requestNotificationPermission } from '../../notifications/scheduler';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { showAlert } from '../../utils/alert';

type Props = NativeStackScreenProps<RootStackParamList, 'BillForm'>;

const REMINDER_OPTIONS = [1, 2, 3, 5, 7];

export function BillFormScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const currency = useAppStore((s) => s.settings.currency);
  const bills = useAppStore((s) => s.bills);
  const upsertBill = useAppStore((s) => s.upsertBill);
  const deleteBill = useAppStore((s) => s.deleteBill);
  const { canAddBill, isPro } = useEntitlement();
  const symbol = getCurrencyInfo(currency).symbol;

  const existing = bills.find((b) => b.id === route.params?.billId);
  const isEditing = !!existing;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(existing?.frequency ?? 'monthly');
  const [category, setCategory] = useState<EntryCategory>(existing?.category ?? 'utilities');
  const [anchorDate, setAnchorDate] = useState(existing?.anchorDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [remindersEnabled, setRemindersEnabled] = useState(existing?.remindersEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(existing?.reminderDaysBefore ?? 3);
  const [saving, setSaving] = useState(false);

  const canSave = label.trim().length > 0 && Number(amount) > 0;

  const handleSave = async () => {
    if (!isEditing && !canAddBill(bills.length)) {
      navigation.replace('Paywall', { feature: 'more than 3 bills' });
      return;
    }
    if (remindersEnabled) {
      await requestNotificationPermission();
    }
    setSaving(true);
    try {
      await upsertBill({
        id: existing?.id,
        label: label.trim(),
        amount: Number(amount),
        frequency,
        anchorDate,
        category,
        remindersEnabled,
        reminderDaysBefore,
        active: existing?.active ?? true,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    showAlert('Delete bill', `Remove "${existing.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBill(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any, marginBottom: 20 }}>
        {isEditing ? 'Edit bill' : 'New bill'}
      </Text>

      {!isEditing && !isPro ? (
        <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs, marginBottom: 16 }}>
          Free plan: {bills.length}/{FREE_LIMITS.maxBills} bills used
        </Text>
      ) : null}

      <View style={styles.field}>
        <TextField label="Name" value={label} onChangeText={setLabel} placeholder="e.g. Rent, Netflix" />
      </View>
      <View style={styles.field}>
        <TextField label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" prefix={symbol} />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>Category</Text>
        <View style={styles.chipRow}>
          {EXPENSE_CATEGORIES.map((c) => (
            <Chip key={c} label={CATEGORY_META[c].label} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <FrequencyPicker value={frequency} onChange={setFrequency} exclude={['once']} />
      </View>

      <View style={styles.field}>
        <DateField label="Next due date" valueISO={anchorDate} onChange={setAnchorDate} />
      </View>

      <View style={[styles.field, styles.switchRow]}>
        <View style={styles.switchText}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium as any }}>
            Remind me
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>A local notification before it&apos;s due</Text>
        </View>
        <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} trackColor={{ true: theme.colors.primary }} />
      </View>

      {remindersEnabled ? (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>Days before</Text>
          <View style={styles.chipRow}>
            {REMINDER_OPTIONS.map((d) => (
              <Chip key={d} label={`${d}d`} selected={reminderDaysBefore === d} onPress={() => setReminderDaysBefore(d)} />
            ))}
          </View>
        </View>
      ) : null}

      <Button label={isEditing ? 'Save changes' : 'Add bill'} onPress={handleSave} disabled={!canSave} loading={saving} />
      <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={styles.spacer} />
      {isEditing ? <Button label="Delete bill" onPress={handleDelete} variant="danger" style={styles.spacer} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchText: { flex: 1, marginRight: 12 },
  spacer: { marginTop: 10 },
});
