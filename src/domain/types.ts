export type ISODate = string;

export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'once';

export type EntryCategory =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'health'
  | 'shopping'
  | 'entertainment'
  | 'travel'
  | 'income'
  | 'savings'
  | 'other';

export interface IncomeSource {
  id: string;
  label: string;
  amount: number;
  frequency: RecurrenceFrequency;
  /** First/reference occurrence date, ISO (yyyy-MM-dd). Used to project future paydays. */
  anchorDate: ISODate;
  active: boolean;
}

export interface Bill {
  id: string;
  label: string;
  amount: number;
  frequency: RecurrenceFrequency;
  anchorDate: ISODate;
  category: EntryCategory;
  reminderDaysBefore: number;
  remindersEnabled: boolean;
  active: boolean;
}

export type GoalKind = 'big_expense' | 'savings';

export interface Goal {
  id: string;
  label: string;
  kind: GoalKind;
  targetAmount: number;
  /** Amount already set aside outside of the running balance (rare in MVP, defaults 0). */
  savedAmount: number;
  targetDate: ISODate;
  active: boolean;
}

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: ISODate;
  category: EntryCategory;
  note: string;
  createdAt: string;
}

export type SavingsTarget = { type: 'none' } | { type: 'monthly'; amount: number };

export type ThemeModeSetting = 'light' | 'dark' | 'system';

export interface AppSettings {
  currency: string;
  currentBalance: number;
  savingsTarget: SavingsTarget;
  onboardingComplete: boolean;
  themeMode: ThemeModeSetting;
  weekStartsOn: 0 | 1;
  isProDev: boolean;
}

export interface SafeToSpendInput {
  asOf: Date;
  currentBalance: number;
  incomeSources: IncomeSource[];
  bills: Bill[];
  goals: Goal[];
  savingsTarget: SavingsTarget;
}

export interface SafeToSpendResult {
  asOf: ISODate;
  periodEnd: ISODate;
  periodLabel: 'until payday' | 'next 30 days';
  daysRemaining: number;
  currentBalance: number;
  reservedForBills: number;
  reservedForGoals: number;
  reservedForSavings: number;
  totalReserved: number;
  availableToAllocate: number;
  dailySafeToSpend: number;
  weeklySafeToSpend: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  upcomingBills: { bill: Bill; date: ISODate; amount: number }[];
}

export type AffordVerdict = 'safe' | 'tight' | 'unsafe';

export interface AffordResult {
  verdict: AffordVerdict;
  amount: number;
  before: SafeToSpendResult;
  after: SafeToSpendResult;
  dailyDrop: number;
  message: string;
}
