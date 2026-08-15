import { getDb } from '../client';
import { Bill, EntryCategory, RecurrenceFrequency } from '../../domain/types';

interface BillRow {
  id: string;
  label: string;
  amount: number;
  frequency: RecurrenceFrequency;
  anchor_date: string;
  category: EntryCategory;
  reminder_days_before: number;
  reminders_enabled: number;
  active: number;
}

function rowToBill(row: BillRow): Bill {
  return {
    id: row.id,
    label: row.label,
    amount: row.amount,
    frequency: row.frequency,
    anchorDate: row.anchor_date,
    category: row.category,
    reminderDaysBefore: row.reminder_days_before,
    remindersEnabled: row.reminders_enabled === 1,
    active: row.active === 1,
  };
}

export async function listBills(): Promise<Bill[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<BillRow>('SELECT * FROM bills ORDER BY anchor_date ASC');
  return rows.map(rowToBill);
}

export async function upsertBill(bill: Bill): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO bills (id, label, amount, frequency, anchor_date, category, reminder_days_before, reminders_enabled, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       amount = excluded.amount,
       frequency = excluded.frequency,
       anchor_date = excluded.anchor_date,
       category = excluded.category,
       reminder_days_before = excluded.reminder_days_before,
       reminders_enabled = excluded.reminders_enabled,
       active = excluded.active`,
    [
      bill.id,
      bill.label,
      bill.amount,
      bill.frequency,
      bill.anchorDate,
      bill.category,
      bill.reminderDaysBefore,
      bill.remindersEnabled ? 1 : 0,
      bill.active ? 1 : 0,
    ]
  );
}

export async function deleteBill(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM bills WHERE id = ?', [id]);
}
