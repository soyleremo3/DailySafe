import { calculateSafeToSpend } from '../safeToSpend';
import { Bill, Goal, IncomeSource, SafeToSpendInput } from '../types';

const ASOF = new Date('2026-08-16T00:00:00.000Z');

function baseInput(overrides: Partial<SafeToSpendInput> = {}): SafeToSpendInput {
  return {
    asOf: ASOF,
    currentBalance: 1000,
    incomeSources: [],
    bills: [],
    goals: [],
    savingsTarget: { type: 'none' },
    ...overrides,
  };
}

function income(overrides: Partial<IncomeSource> = {}): IncomeSource {
  return {
    id: 'income-1',
    label: 'Salary',
    amount: 3000,
    frequency: 'monthly',
    anchorDate: '2026-08-01',
    active: true,
    ...overrides,
  };
}

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: 'bill-1',
    label: 'Rent',
    amount: 100,
    frequency: 'monthly',
    anchorDate: '2026-08-20',
    category: 'housing',
    reminderDaysBefore: 3,
    remindersEnabled: true,
    active: true,
    ...overrides,
  };
}

function goal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    label: 'New laptop',
    kind: 'big_expense',
    targetAmount: 900,
    savedAmount: 0,
    targetDate: '2026-09-15',
    active: true,
    ...overrides,
  };
}

describe('calculateSafeToSpend', () => {
  it('falls back to a 30-day window when no income source is configured', () => {
    const result = calculateSafeToSpend(baseInput());
    expect(result.periodLabel).toBe('next 30 days');
    expect(result.daysRemaining).toBe(30);
  });

  it('uses the soonest upcoming payday as the window end when income is configured', () => {
    const result = calculateSafeToSpend(baseInput({ incomeSources: [income({ anchorDate: '2026-09-01' })] }));
    expect(result.periodLabel).toBe('until payday');
    expect(result.periodEnd).toBe('2026-09-01');
    expect(result.daysRemaining).toBe(16);
  });

  it('divides available balance evenly across the remaining days', () => {
    const result = calculateSafeToSpend(
      baseInput({ currentBalance: 300, incomeSources: [income({ anchorDate: '2026-08-26' })] })
    );
    expect(result.daysRemaining).toBe(10);
    expect(result.dailySafeToSpend).toBeCloseTo(30, 5);
  });

  it('reserves upcoming bills that fall within the window', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 500,
        incomeSources: [income({ anchorDate: '2026-08-30' })],
        bills: [bill({ amount: 200, anchorDate: '2026-08-20' })],
      })
    );
    expect(result.reservedForBills).toBe(200);
    expect(result.availableToAllocate).toBe(300);
  });

  it('counts multiple occurrences of a recurring bill inside a long window', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 1000,
        bills: [bill({ amount: 25, frequency: 'weekly', anchorDate: '2026-08-01' })],
      })
    );
    // 30-day fallback window from 2026-08-16 -> weekly bill anchored 08-01 recurs on
    // 08-22 and 08-29 and 09-05 within range (inclusive endpoints).
    expect(result.reservedForBills).toBeGreaterThan(0);
    expect(result.upcomingBills.length).toBeGreaterThanOrEqual(3);
  });

  it('ignores inactive bills and goals', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 500,
        bills: [bill({ amount: 200, active: false })],
        goals: [goal({ targetAmount: 100, active: false })],
      })
    );
    expect(result.reservedForBills).toBe(0);
    expect(result.reservedForGoals).toBe(0);
  });

  it('spreads a big-expense goal reservation across the days until its target date', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 1000,
        goals: [goal({ targetAmount: 300, targetDate: '2026-09-15' })],
      })
    );
    // 30-day fallback window; goal due in 30 days too (asOf 08-16 -> target 09-15).
    expect(result.reservedForGoals).toBeGreaterThan(0);
    expect(result.reservedForGoals).toBeLessThanOrEqual(300);
  });

  it('reserves the full remaining goal amount when its target date falls inside the window', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 1000,
        goals: [goal({ targetAmount: 300, targetDate: '2026-08-18' })],
      })
    );
    expect(result.reservedForGoals).toBe(300);
  });

  it('applies a monthly savings target prorated across the window', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 1000,
        incomeSources: [income({ anchorDate: '2026-08-26' })],
        savingsTarget: { type: 'monthly', amount: 300 },
      })
    );
    expect(result.daysRemaining).toBe(10);
    expect(result.reservedForSavings).toBeCloseTo((300 / 30) * 10, 5);
  });

  it('flags an over-budget window and clamps daily safe-to-spend at zero', () => {
    const result = calculateSafeToSpend(
      baseInput({
        currentBalance: 100,
        incomeSources: [income({ anchorDate: '2026-08-26' })],
        bills: [bill({ amount: 500, anchorDate: '2026-08-20' })],
      })
    );
    expect(result.isOverBudget).toBe(true);
    expect(result.overBudgetAmount).toBe(400);
    expect(result.dailySafeToSpend).toBe(0);
  });

  it('never returns a negative daily safe-to-spend value', () => {
    const result = calculateSafeToSpend(
      baseInput({ currentBalance: 0, bills: [bill({ amount: 50 })] })
    );
    expect(result.dailySafeToSpend).toBeGreaterThanOrEqual(0);
  });

  it('computes weekly safe-to-spend as daily times the shorter of 7 days or days remaining', () => {
    const shortWindow = calculateSafeToSpend(
      baseInput({ currentBalance: 300, incomeSources: [income({ anchorDate: '2026-08-19' })] })
    );
    expect(shortWindow.daysRemaining).toBe(3);
    expect(shortWindow.weeklySafeToSpend).toBeCloseTo(shortWindow.dailySafeToSpend * 3, 5);

    const longWindow = calculateSafeToSpend(baseInput({ currentBalance: 700 }));
    expect(longWindow.weeklySafeToSpend).toBeCloseTo(longWindow.dailySafeToSpend * 7, 5);
  });
});
