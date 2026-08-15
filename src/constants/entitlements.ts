export const FREE_LIMITS = {
  maxBills: 3,
  maxGoals: 1,
  maxIncomeSources: 1,
  insightsHistoryMonths: 1,
} as const;

export const PRO_FEATURES = [
  'Unlimited bills & subscriptions',
  'Unlimited savings & big-expense goals',
  'Multiple income sources',
  'Full insights history & trends',
  'Custom app icon & extra themes',
] as const;
