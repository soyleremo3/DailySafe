import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { fromISODate, nextOccurrenceOnOrAfter } from '../domain/date';
import { formatMoney } from '../domain/money';
import { Bill } from '../domain/types';

const REMINDER_HOUR = 9;
const CHANNEL_ID = 'bill-reminders';

function reminderIdentifier(billId: string): string {
  return `bill-reminder-${billId}`;
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Bill reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function reminderDateFor(bill: Bill, currency: string, from: Date): Date | null {
  const anchor = fromISODate(bill.anchorDate);
  const nextDue = nextOccurrenceOnOrAfter(anchor, bill.frequency, from);
  if (!nextDue) return null;

  const reminderDate = new Date(nextDue);
  reminderDate.setDate(reminderDate.getDate() - bill.reminderDaysBefore);
  reminderDate.setHours(REMINDER_HOUR, 0, 0, 0);
  return reminderDate > from ? reminderDate : null;
}

/**
 * Cancels and reschedules the single upcoming local reminder for every active,
 * reminder-enabled bill. Safe to call repeatedly (e.g. on hydrate, after any
 * bill edit) — always converges to "one future notification per bill".
 */
export async function reconcileBillReminders(bills: Bill[], currency = 'USD', now = new Date()): Promise<void> {
  const granted = await Notifications.getPermissionsAsync();
  if (!granted.granted) return;

  await ensureAndroidChannel();

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const managedIds = new Set(scheduled.map((n) => n.identifier).filter((id) => id.startsWith('bill-reminder-')));

  for (const id of managedIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  for (const bill of bills) {
    if (!bill.active || !bill.remindersEnabled) continue;
    const date = reminderDateFor(bill, currency, now);
    if (!date) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: reminderIdentifier(bill.id),
      content: {
        title: `${bill.label} due soon`,
        body: `${formatMoney(bill.amount, currency)} is due in ${bill.reminderDaysBefore} day${bill.reminderDaysBefore === 1 ? '' : 's'}.`,
        data: { billId: bill.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelAllBillReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith('bill-reminder-'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}
