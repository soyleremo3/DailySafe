import { create } from 'zustand';
import { generateId } from '../utils/id';
import { toISODate } from '../domain/date';
import { AppSettings, Bill, EntryCategory, Goal, IncomeSource, Transaction, TransactionType } from '../domain/types';
import * as billsRepo from '../db/repositories/billsRepo';
import * as goalsRepo from '../db/repositories/goalsRepo';
import * as incomeRepo from '../db/repositories/incomeRepo';
import * as settingsRepo from '../db/repositories/settingsRepo';
import * as transactionsRepo from '../db/repositories/transactionsRepo';
import { resetAllData as resetAllDataInDb } from '../db/client';
import { cancelAllBillReminders, reconcileBillReminders } from '../notifications/scheduler';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  currentBalance: 0,
  savingsTarget: { type: 'none' },
  onboardingComplete: false,
  themeMode: 'system',
  weekStartsOn: 0,
  isProDev: false,
};

interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  category: EntryCategory;
  note?: string;
  date?: string;
}

interface AppState {
  hydrated: boolean;
  settings: AppSettings;
  incomeSources: IncomeSource[];
  bills: Bill[];
  goals: Goal[];
  transactions: Transaction[];

  hydrate: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  completeOnboarding: () => Promise<void>;

  addTransaction: (input: NewTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  upsertIncomeSource: (source: Omit<IncomeSource, 'id'> & { id?: string }) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;

  upsertBill: (bill: Omit<Bill, 'id'> & { id?: string }) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;

  upsertGoal: (goal: Omit<Goal, 'id'> & { id?: string }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  setProDev: (value: boolean) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  incomeSources: [],
  bills: [],
  goals: [],
  transactions: [],

  hydrate: async () => {
    const [settings, incomeSources, bills, goals, transactions] = await Promise.all([
      settingsRepo.getSettings(),
      incomeRepo.listIncomeSources(),
      billsRepo.listBills(),
      goalsRepo.listGoals(),
      transactionsRepo.listTransactions(),
    ]);
    set({ settings, incomeSources, bills, goals, transactions, hydrated: true });
    void reconcileBillReminders(bills);
  },

  updateSettings: async (patch) => {
    const next = await settingsRepo.updateSettings(patch);
    set({ settings: next });
  },

  completeOnboarding: async () => {
    const next = await settingsRepo.updateSettings({ onboardingComplete: true });
    set({ settings: next });
  },

  addTransaction: async (input) => {
    const tx: Transaction = {
      id: generateId('txn'),
      type: input.type,
      amount: Math.abs(input.amount),
      date: input.date ?? toISODate(new Date()),
      category: input.category,
      note: input.note ?? '',
      createdAt: new Date().toISOString(),
    };
    await transactionsRepo.addTransaction(tx);
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    await settingsRepo.adjustCurrentBalance(delta);
    const settings = await settingsRepo.getSettings();
    set((state) => ({ transactions: [tx, ...state.transactions], settings }));
  },

  deleteTransaction: async (id) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx) return;
    await transactionsRepo.deleteTransaction(id);
    const delta = tx.type === 'income' ? -tx.amount : tx.amount;
    await settingsRepo.adjustCurrentBalance(delta);
    const settings = await settingsRepo.getSettings();
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id), settings }));
  },

  upsertIncomeSource: async (source) => {
    const record: IncomeSource = { ...source, id: source.id ?? generateId('inc') };
    await incomeRepo.upsertIncomeSource(record);
    set((state) => ({
      incomeSources: upsertInList(state.incomeSources, record),
    }));
  },

  deleteIncomeSource: async (id) => {
    await incomeRepo.deleteIncomeSource(id);
    set((state) => ({ incomeSources: state.incomeSources.filter((s) => s.id !== id) }));
  },

  upsertBill: async (bill) => {
    const record: Bill = { ...bill, id: bill.id ?? generateId('bill') };
    await billsRepo.upsertBill(record);
    set((state) => ({ bills: upsertInList(state.bills, record) }));
    void reconcileBillReminders(get().bills);
  },

  deleteBill: async (id) => {
    await billsRepo.deleteBill(id);
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) }));
    void reconcileBillReminders(get().bills);
  },

  upsertGoal: async (goal) => {
    const record: Goal = { ...goal, id: goal.id ?? generateId('goal') };
    await goalsRepo.upsertGoal(record);
    set((state) => ({ goals: upsertInList(state.goals, record) }));
  },

  deleteGoal: async (id) => {
    await goalsRepo.deleteGoal(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  setProDev: async (value) => {
    const next = await settingsRepo.updateSettings({ isProDev: value });
    set({ settings: next });
  },

  resetAllData: async () => {
    await cancelAllBillReminders();
    await resetAllDataInDb();
    set({
      settings: DEFAULT_SETTINGS,
      incomeSources: [],
      bills: [],
      goals: [],
      transactions: [],
    });
  },
}));

function upsertInList<T extends { id: string }>(list: T[], record: T): T[] {
  const index = list.findIndex((item) => item.id === record.id);
  if (index === -1) return [...list, record];
  const copy = [...list];
  copy[index] = record;
  return copy;
}
