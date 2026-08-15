import { getDb } from '../client';
import { EntryCategory, Transaction, TransactionType } from '../../domain/types';

interface TransactionRow {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: EntryCategory;
  note: string;
  created_at: string;
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    date: row.date,
    category: row.category,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function listTransactions(limit = 200): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT ?',
    [limit]
  );
  return rows.map(rowToTransaction);
}

export async function listTransactionsInRange(startISO: string, endISO: string): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startISO, endISO]
  );
  return rows.map(rowToTransaction);
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO transactions (id, type, amount, date, category, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tx.id, tx.type, tx.amount, tx.date, tx.category, tx.note, tx.createdAt]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}
