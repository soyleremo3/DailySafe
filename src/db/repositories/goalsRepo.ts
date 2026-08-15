import { getDb } from '../client';
import { Goal, GoalKind } from '../../domain/types';

interface GoalRow {
  id: string;
  label: string;
  kind: GoalKind;
  target_amount: number;
  saved_amount: number;
  target_date: string;
  active: number;
}

function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    label: row.label,
    kind: row.kind,
    targetAmount: row.target_amount,
    savedAmount: row.saved_amount,
    targetDate: row.target_date,
    active: row.active === 1,
  };
}

export async function listGoals(): Promise<Goal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<GoalRow>('SELECT * FROM goals ORDER BY target_date ASC');
  return rows.map(rowToGoal);
}

export async function upsertGoal(goal: Goal): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO goals (id, label, kind, target_amount, saved_amount, target_date, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       kind = excluded.kind,
       target_amount = excluded.target_amount,
       saved_amount = excluded.saved_amount,
       target_date = excluded.target_date,
       active = excluded.active`,
    [goal.id, goal.label, goal.kind, goal.targetAmount, goal.savedAmount, goal.targetDate, goal.active ? 1 : 0]
  );
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}
