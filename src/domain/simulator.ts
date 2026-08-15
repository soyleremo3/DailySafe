import { calculateSafeToSpend } from './safeToSpend';
import { AffordResult, AffordVerdict, SafeToSpendInput } from './types';
import { roundMoney } from './money';

/**
 * Simulates the effect of an immediate hypothetical purchase on the current
 * safe-to-spend window. The purchase is modeled as reducing the live balance
 * right now, then the window is recalculated with the same commitments.
 */
export function simulatePurchase(input: SafeToSpendInput, amount: number): AffordResult {
  const before = calculateSafeToSpend(input);
  const after = calculateSafeToSpend({ ...input, currentBalance: input.currentBalance - amount });

  const dailyDrop = roundMoney(before.dailySafeToSpend - after.dailySafeToSpend);
  const verdict = classifyVerdict(before, after);

  return {
    verdict,
    amount: roundMoney(amount),
    before,
    after,
    dailyDrop,
    message: buildMessage(verdict, after),
  };
}

function classifyVerdict(before: ReturnType<typeof calculateSafeToSpend>, after: ReturnType<typeof calculateSafeToSpend>): AffordVerdict {
  if (after.isOverBudget) return 'unsafe';
  if (before.dailySafeToSpend <= 0) {
    return after.dailySafeToSpend > 0 ? 'tight' : 'unsafe';
  }
  const remainingRatio = after.dailySafeToSpend / before.dailySafeToSpend;
  if (remainingRatio < 0.5) return 'tight';
  return 'safe';
}

function buildMessage(verdict: AffordVerdict, after: ReturnType<typeof calculateSafeToSpend>): string {
  switch (verdict) {
    case 'safe':
      return `You'd still be on track. About ${after.dailySafeToSpend.toFixed(2)}/day left until ${after.periodLabel}.`;
    case 'tight':
      return `It fits, but it eats deep into your buffer for the rest of ${after.periodLabel === 'until payday' ? 'this pay period' : 'the next 30 days'}.`;
    case 'unsafe':
      return after.isOverBudget
        ? `This would put you ${Math.abs(after.availableToAllocate).toFixed(2)} over what's safe to commit.`
        : `This would leave nothing safe to spend for the rest of the period.`;
  }
}
