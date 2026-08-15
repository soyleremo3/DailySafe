import { getDb } from '../client';
import { AppSettings, SavingsTarget, ThemeModeSetting } from '../../domain/types';

interface SettingsRow {
  currency: string;
  current_balance: number;
  savings_target_type: 'none' | 'monthly';
  savings_target_amount: number;
  onboarding_complete: number;
  theme_mode: ThemeModeSetting;
  week_starts_on: number;
  is_pro_dev: number;
}

function rowToSettings(row: SettingsRow): AppSettings {
  const savingsTarget: SavingsTarget =
    row.savings_target_type === 'monthly' ? { type: 'monthly', amount: row.savings_target_amount } : { type: 'none' };

  return {
    currency: row.currency,
    currentBalance: row.current_balance,
    savingsTarget,
    onboardingComplete: row.onboarding_complete === 1,
    themeMode: row.theme_mode,
    weekStartsOn: row.week_starts_on === 1 ? 1 : 0,
    isProDev: row.is_pro_dev === 1,
  };
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const row = await db.getFirstAsync<SettingsRow>('SELECT * FROM settings WHERE id = 1');
  if (!row) {
    throw new Error('Settings row missing; database was not migrated correctly.');
  }
  return rowToSettings(row);
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDb();
  const current = await getSettings();
  const next: AppSettings = { ...current, ...patch };

  await db.runAsync(
    `UPDATE settings SET
      currency = ?,
      current_balance = ?,
      savings_target_type = ?,
      savings_target_amount = ?,
      onboarding_complete = ?,
      theme_mode = ?,
      week_starts_on = ?,
      is_pro_dev = ?
    WHERE id = 1`,
    [
      next.currency,
      next.currentBalance,
      next.savingsTarget.type,
      next.savingsTarget.type === 'monthly' ? next.savingsTarget.amount : 0,
      next.onboardingComplete ? 1 : 0,
      next.themeMode,
      next.weekStartsOn,
      next.isProDev ? 1 : 0,
    ]
  );

  return next;
}

export async function adjustCurrentBalance(delta: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE settings SET current_balance = current_balance + ? WHERE id = 1', [delta]);
}
