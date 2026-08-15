import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { CURRENCIES, getCurrencyInfo } from '../../domain/currencies';
import { formatMoney } from '../../domain/money';
import { ThemeModeSetting } from '../../domain/types';
import { useEntitlement } from '../../hooks/useEntitlement';
import { RootStackParamList } from '../../navigation/types';
import { requestNotificationPermission } from '../../notifications/scheduler';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const THEME_OPTIONS: { value: ThemeModeSetting; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const settings = useAppStore((s) => s.settings);
  const incomeSources = useAppStore((s) => s.incomeSources);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const { isPro, setDevProOverride } = useEntitlement();

  const [balanceDraft, setBalanceDraft] = useState(String(settings.currentBalance));
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const commitBalance = () => {
    const value = Number(balanceDraft);
    if (!Number.isNaN(value)) {
      updateSettings({ currentBalance: value });
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
  };

  const handleReset = () => {
    Alert.alert('Reset all data', 'This permanently deletes every entry, bill, goal and setting on this device. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetAllData() },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold as any, marginBottom: 20 }}>
        Settings
      </Text>

      <SectionLabel text="Balance & currency" />
      <Card style={styles.card}>
        <TextField
          label="Current balance"
          value={balanceDraft}
          onChangeText={setBalanceDraft}
          onSubmitEditing={commitBalance}
          keyboardType="decimal-pad"
          prefix={getCurrencyInfo(settings.currency).symbol}
          returnKeyType="done"
        />
        <View style={styles.divider} />
        <Pressable onPress={() => setCurrencyOpen((v) => !v)} style={styles.row} accessibilityRole="button">
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>Currency</Text>
          <View style={styles.rowRight}>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.md, marginRight: 6 }}>{settings.currency}</Text>
            <Ionicons name={currencyOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textMuted} />
          </View>
        </Pressable>
        {currencyOpen ? (
          <View style={styles.chipWrap}>
            {CURRENCIES.map((c) => (
              <Chip
                key={c.code}
                label={c.code}
                selected={settings.currency === c.code}
                onPress={() => {
                  updateSettings({ currency: c.code });
                  setCurrencyOpen(false);
                }}
              />
            ))}
          </View>
        ) : null}
      </Card>

      <SectionLabel text="Income sources" />
      <Card style={styles.card}>
        {incomeSources.length === 0 ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginBottom: 8 }}>No income sources yet.</Text>
        ) : (
          incomeSources.map((source) => (
            <Pressable
              key={source.id}
              style={styles.row}
              onPress={() => navigation.navigate('IncomeForm', { incomeId: source.id })}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>{source.label}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>
                {formatMoney(source.amount, settings.currency)} · {source.frequency}
              </Text>
            </Pressable>
          ))
        )}
        <Button label="Add income source" onPress={() => navigation.navigate('IncomeForm', undefined)} variant="secondary" style={styles.addButton} />
      </Card>

      <SectionLabel text="Savings target" />
      <Card style={styles.card}>
        <View style={styles.chipWrap}>
          <Chip
            label="None"
            selected={settings.savingsTarget.type === 'none'}
            onPress={() => updateSettings({ savingsTarget: { type: 'none' } })}
          />
          <Chip
            label="Monthly amount"
            selected={settings.savingsTarget.type === 'monthly'}
            onPress={() => updateSettings({ savingsTarget: { type: 'monthly', amount: settings.savingsTarget.type === 'monthly' ? settings.savingsTarget.amount : 0 } })}
          />
        </View>
        {settings.savingsTarget.type === 'monthly' ? (
          <View style={styles.divider}>
            <TextField
              label="Monthly savings target"
              value={String(settings.savingsTarget.amount)}
              onChangeText={(text) => updateSettings({ savingsTarget: { type: 'monthly', amount: Number(text) || 0 } })}
              keyboardType="decimal-pad"
              prefix={getCurrencyInfo(settings.currency).symbol}
            />
          </View>
        ) : null}
      </Card>

      <SectionLabel text="Appearance" />
      <Card style={styles.card}>
        <View style={styles.chipWrap}>
          {THEME_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} selected={settings.themeMode === opt.value} onPress={() => updateSettings({ themeMode: opt.value })} />
          ))}
        </View>
      </Card>

      <SectionLabel text="Notifications" />
      <Card style={styles.card}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginBottom: 12 }}>
          Bill reminders are scheduled locally on this device. No data is sent anywhere.
        </Text>
        <Button label="Enable notifications" onPress={handleEnableNotifications} variant="secondary" />
        {notifStatus === 'denied' ? (
          <Pressable onPress={() => Linking.openSettings()} style={styles.link}>
            <Text style={{ color: theme.colors.primaryText, fontSize: theme.fontSize.sm }}>Open system settings</Text>
          </Pressable>
        ) : null}
      </Card>

      <SectionLabel text="DailySafe Pro" />
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>Status</Text>
          <Text style={{ color: isPro ? theme.colors.success : theme.colors.textMuted, fontWeight: theme.fontWeight.semibold as any }}>
            {isPro ? 'Pro' : 'Free'}
          </Text>
        </View>
        <Button label="See Pro features" onPress={() => navigation.navigate('Paywall', undefined)} variant="secondary" style={styles.addButton} />
        <View style={[styles.row, styles.divider]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>Developer: force Pro</Text>
            <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs }}>Mock entitlement for testing — no billing wired up</Text>
          </View>
          <Switch value={isPro} onValueChange={setDevProOverride} trackColor={{ true: theme.colors.primary }} />
        </View>
      </Card>

      <SectionLabel text="About" />
      <Card style={styles.card}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, marginBottom: 4 }}>DailySafe 1.0.0</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>
          Local-first. No accounts, no cloud, no ads, no tracking — your financial data never leaves this device.
        </Text>
      </Card>

      <SectionLabel text="Danger zone" />
      <Card style={styles.card}>
        <Button label="Reset all data" onPress={handleReset} variant="danger" />
      </Card>
    </Screen>
  );
}

function SectionLabel({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold as any, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  divider: { marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128,128,128,0.2)' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  addButton: { marginTop: 8 },
  link: { marginTop: 10 },
});
