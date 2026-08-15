import { getDb } from '../client';
import { IncomeSource, RecurrenceFrequency } from '../../domain/types';

interface IncomeRow {
  id: string;
  label: string;
  amount: number;
  frequency: RecurrenceFrequency;
  anchor_date: string;
  active: number;
}

function rowToIncome(row: IncomeRow): IncomeSource {
  return {
    id: row.id,
    label: row.label,
    amount: row.amount,
    frequency: row.frequency,
    anchorDate: row.anchor_date,
    active: row.active === 1,
  };
}

export async function listIncomeSources(): Promise<IncomeSource[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<IncomeRow>('SELECT * FROM income_sources ORDER BY anchor_date ASC');
  return rows.map(rowToIncome);
}

export async function upsertIncomeSource(source: IncomeSource): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO income_sources (id, label, amount, frequency, anchor_date, active)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       amount = excluded.amount,
       frequency = excluded.frequency,
       anchor_date = excluded.anchor_date,
       active = excluded.active`,
    [source.id, source.label, source.amount, source.frequency, source.anchorDate, source.active ? 1 : 0]
  );
}

export async function deleteIncomeSource(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM income_sources WHERE id = ?', [id]);
}
