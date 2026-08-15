import { addDays, daysBetween, nextOccurrenceOnOrAfter, occurrencesInRange, toISODate } from './date';
import { roundMoney } from './money';
import { Bill, Goal, IncomeSource, SafeToSpendInput, SafeToSpendResult, SavingsTarget } from './types';

const FALLBACK_WINDOW_DAYS = 30;

/**
 * Determines the horizon safe-to-spend is calculated over: the soonest
 * upcoming payday across all active income sources, or a rolling 30-day
 * window when no income source is configured yet.
 */
function resolvePeriodEnd(asOf: Date, incomeSources: IncomeSource[]): { periodEnd: Date; label: SafeToSpendResult['periodLabel'] } {
  const activeSources = incomeSources.filter((s) => s.active);
  if (activeSources.length === 0) {
    return { periodEnd: addDays(asOf, FALLBACK_WINDOW_DAYS), label: 'next 30 days' };
  }

  const dayAfter = addDays(asOf, 1);
  let soonest: Date | null = null;
  for (const source of activeSources) {
    const anchor = new Date(source.anchorDate);
    const next = nextOccurrenceOnOrAfter(anchor, source.frequency, dayAfter);
    if (next && (!soonest || next < soonest)) {
      soonest = next;
    }
  }

  if (!soonest) {
    return { periodEnd: addDays(asOf, FALLBACK_WINDOW_DAYS), label: 'next 30 days' };
  }
  return { periodEnd: soonest, label: 'until payday' };
}

function reservedForBillsInWindow(bills: Bill[], asOf: Date, periodEnd: Date): { total: number; upcoming: SafeToSpendResult['upcomingBills'] } {
  const upcoming: SafeToSpendResult['upcomingBills'] = [];
  let total = 0;

  for (const bill of bills) {
    if (!bill.active) continue;
    const anchor = new Date(bill.anchorDate);
    const occurrences = occurrencesInRange(anchor, bill.frequency, asOf, periodEnd);
    for (const date of occurrences) {
      total += bill.amount;
      upcoming.push({ bill, date: toISODate(date), amount: bill.amount });
    }
  }

  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  return { total: roundMoney(total), upcoming };
}

function reservedForGoalsInWindow(goals: Goal[], asOf: Date, periodEnd: Date): number {
  const periodDays = Math.max(1, daysBetween(asOf, periodEnd));
  let total = 0;

  for (const goal of goals) {
    if (!goal.active) continue;
    const targetDate = new Date(goal.targetDate);
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
    if (remaining <= 0) continue;

    if (targetDate <= periodEnd) {
      // Due within this window: the full remaining amount must be set aside.
      total += remaining;
      continue;
    }

    const daysUntilTarget = Math.max(1, daysBetween(asOf, targetDate));
    const dailyReserve = remaining / daysUntilTarget;
    total += Math.min(remaining, dailyReserve * periodDays);
  }

  return roundMoney(total);
}

function reservedForSavingsInWindow(savingsTarget: SavingsTarget, periodDays: number): number {
  if (savingsTarget.type === 'none') return 0;
  const dailySavings = savingsTarget.amount / 30;
  return roundMoney(dailySavings * periodDays);
}

export function calculateSafeToSpend(input: SafeToSpendInput): SafeToSpendResult {
  const { asOf, currentBalance, incomeSources, bills, goals, savingsTarget } = input;
  const { periodEnd, label } = resolvePeriodEnd(asOf, incomeSources);
  const daysRemaining = Math.max(1, daysBetween(asOf, periodEnd));

  const { total: reservedForBills, upcoming: upcomingBills } = reservedForBillsInWindow(bills, asOf, periodEnd);
  const reservedForGoals = reservedForGoalsInWindow(goals, asOf, periodEnd);
  const reservedForSavings = reservedForSavingsInWindow(savingsTarget, daysRemaining);
  const totalReserved = roundMoney(reservedForBills + reservedForGoals + reservedForSavings);

  const availableToAllocate = roundMoney(currentBalance - totalReserved);
  const isOverBudget = availableToAllocate < 0;
  const overBudgetAmount = isOverBudget ? roundMoney(Math.abs(availableToAllocate)) : 0;

  const dailySafeToSpend = roundMoney(Math.max(0, availableToAllocate) / daysRemaining);
  const weeklySafeToSpend = roundMoney(dailySafeToSpend * Math.min(7, daysRemaining));

  return {
    asOf: toISODate(asOf),
    periodEnd: toISODate(periodEnd),
    periodLabel: label,
    daysRemaining,
    currentBalance: roundMoney(currentBalance),
    reservedForBills,
    reservedForGoals,
    reservedForSavings,
    totalReserved,
    availableToAllocate,
    dailySafeToSpend,
    weeklySafeToSpend,
    isOverBudget,
    overBudgetAmount,
    upcomingBills,
  };
}
