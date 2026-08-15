import React, { createContext, useContext, useState } from 'react';
import { EntryCategory, RecurrenceFrequency } from '../../domain/types';
import { useAppStore } from '../../store/useAppStore';

export interface DraftIncomeSource {
  label: string;
  amount: string;
  frequency: RecurrenceFrequency;
  anchorDate: string;
}

export interface DraftBill {
  label: string;
  amount: string;
  frequency: RecurrenceFrequency;
  anchorDate: string;
  category: EntryCategory;
}

interface OnboardingDraft {
  currency: string;
  currentBalance: string;
  incomeSources: DraftIncomeSource[];
  bills: DraftBill[];
  savingsTargetType: 'none' | 'monthly';
  savingsTargetAmount: string;
}

interface OnboardingContextValue {
  draft: OnboardingDraft;
  setCurrency: (currency: string) => void;
  setCurrentBalance: (value: string) => void;
  addIncomeSource: (source: DraftIncomeSource) => void;
  removeIncomeSource: (index: number) => void;
  addBill: (bill: DraftBill) => void;
  removeBill: (index: number) => void;
  setSavingsTarget: (type: 'none' | 'monthly', amount: string) => void;
  commit: () => Promise<void>;
}

const initialDraft: OnboardingDraft = {
  currency: 'USD',
  currentBalance: '',
  incomeSources: [],
  bills: [],
  savingsTargetType: 'none',
  savingsTargetAmount: '',
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const upsertIncomeSource = useAppStore((s) => s.upsertIncomeSource);
  const upsertBill = useAppStore((s) => s.upsertBill);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const value: OnboardingContextValue = {
    draft,
    setCurrency: (currency) => setDraft((d) => ({ ...d, currency })),
    setCurrentBalance: (currentBalance) => setDraft((d) => ({ ...d, currentBalance })),
    addIncomeSource: (source) => setDraft((d) => ({ ...d, incomeSources: [...d.incomeSources, source] })),
    removeIncomeSource: (index) =>
      setDraft((d) => ({ ...d, incomeSources: d.incomeSources.filter((_, i) => i !== index) })),
    addBill: (bill) => setDraft((d) => ({ ...d, bills: [...d.bills, bill] })),
    removeBill: (index) => setDraft((d) => ({ ...d, bills: d.bills.filter((_, i) => i !== index) })),
    setSavingsTarget: (savingsTargetType, savingsTargetAmount) =>
      setDraft((d) => ({ ...d, savingsTargetType, savingsTargetAmount })),
    commit: async () => {
      await updateSettings({
        currency: draft.currency,
        currentBalance: Number(draft.currentBalance) || 0,
        savingsTarget:
          draft.savingsTargetType === 'monthly'
            ? { type: 'monthly', amount: Number(draft.savingsTargetAmount) || 0 }
            : { type: 'none' },
      });
      for (const source of draft.incomeSources) {
        await upsertIncomeSource({
          label: source.label,
          amount: Number(source.amount) || 0,
          frequency: source.frequency,
          anchorDate: source.anchorDate,
          active: true,
        });
      }
      for (const bill of draft.bills) {
        await upsertBill({
          label: bill.label,
          amount: Number(bill.amount) || 0,
          frequency: bill.frequency,
          anchorDate: bill.anchorDate,
          category: bill.category,
          reminderDaysBefore: 3,
          remindersEnabled: true,
          active: true,
        });
      }
      await completeOnboarding();
    },
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
