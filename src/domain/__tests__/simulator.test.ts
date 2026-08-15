import { simulatePurchase } from '../simulator';
import { SafeToSpendInput } from '../types';

const ASOF = new Date('2026-08-16T00:00:00.000Z');

function baseInput(overrides: Partial<SafeToSpendInput> = {}): SafeToSpendInput {
  return {
    asOf: ASOF,
    currentBalance: 1000,
    incomeSources: [{ id: 'i1', label: 'Salary', amount: 3000, frequency: 'monthly', anchorDate: '2026-08-30', active: true }],
    bills: [],
    goals: [],
    savingsTarget: { type: 'none' },
    ...overrides,
  };
}

describe('simulatePurchase', () => {
  it('classifies a small purchase as safe', () => {
    const result = simulatePurchase(baseInput(), 5);
    expect(result.verdict).toBe('safe');
    expect(result.after.isOverBudget).toBe(false);
  });

  it('classifies a purchase that eats most of the remaining buffer as tight', () => {
    const result = simulatePurchase(baseInput({ currentBalance: 100 }), 60);
    expect(['tight', 'unsafe']).toContain(result.verdict);
  });

  it('classifies a purchase that overdraws the window as unsafe', () => {
    const result = simulatePurchase(baseInput({ currentBalance: 50 }), 500);
    expect(result.verdict).toBe('unsafe');
    expect(result.after.isOverBudget).toBe(true);
  });

  it('reports the daily safe-to-spend drop caused by the purchase', () => {
    const result = simulatePurchase(baseInput({ currentBalance: 1400 }), 140);
    expect(result.dailyDrop).toBeGreaterThan(0);
    expect(result.before.dailySafeToSpend - result.after.dailySafeToSpend).toBeCloseTo(result.dailyDrop, 5);
  });
});
