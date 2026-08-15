import { useAppStore } from '../store/useAppStore';
import { FREE_LIMITS } from '../constants/entitlements';

export function useEntitlement() {
  const isPro = useAppStore((s) => s.settings.isProDev);
  const setProDev = useAppStore((s) => s.setProDev);

  return {
    isPro,
    limits: FREE_LIMITS,
    setDevProOverride: setProDev,
    canAddBill: (currentCount: number) => isPro || currentCount < FREE_LIMITS.maxBills,
    canAddGoal: (currentCount: number) => isPro || currentCount < FREE_LIMITS.maxGoals,
    canAddIncomeSource: (currentCount: number) => isPro || currentCount < FREE_LIMITS.maxIncomeSources,
  };
}
