import { useMemo } from 'react';
import { calculateSafeToSpend } from '../domain/safeToSpend';
import { SafeToSpendResult } from '../domain/types';
import { useAppStore } from './useAppStore';

export function useSafeToSpend(asOf: Date = new Date()): SafeToSpendResult {
  const currentBalance = useAppStore((s) => s.settings.currentBalance);
  const savingsTarget = useAppStore((s) => s.settings.savingsTarget);
  const incomeSources = useAppStore((s) => s.incomeSources);
  const bills = useAppStore((s) => s.bills);
  const goals = useAppStore((s) => s.goals);

  const asOfKey = asOf.toDateString();

  return useMemo(
    () =>
      calculateSafeToSpend({
        asOf,
        currentBalance,
        incomeSources,
        bills,
        goals,
        savingsTarget,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asOfKey, currentBalance, incomeSources, bills, goals, savingsTarget]
  );
}
