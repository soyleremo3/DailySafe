import { EntryCategory } from '../domain/types';

export const EXPENSE_CATEGORIES: EntryCategory[] = [
  'food',
  'groceries',
  'transport',
  'housing',
  'utilities',
  'health',
  'shopping',
  'entertainment',
  'travel',
  'other',
];

export const CATEGORY_META: Record<EntryCategory, { label: string; icon: string }> = {
  food: { label: 'Food & Drink', icon: 'fast-food-outline' },
  groceries: { label: 'Groceries', icon: 'cart-outline' },
  transport: { label: 'Transport', icon: 'car-outline' },
  housing: { label: 'Housing', icon: 'home-outline' },
  utilities: { label: 'Utilities', icon: 'flash-outline' },
  health: { label: 'Health', icon: 'medkit-outline' },
  shopping: { label: 'Shopping', icon: 'bag-handle-outline' },
  entertainment: { label: 'Entertainment', icon: 'game-controller-outline' },
  travel: { label: 'Travel', icon: 'airplane-outline' },
  income: { label: 'Income', icon: 'trending-up-outline' },
  savings: { label: 'Savings', icon: 'wallet-outline' },
  other: { label: 'Other', icon: 'ellipsis-horizontal-outline' },
};
