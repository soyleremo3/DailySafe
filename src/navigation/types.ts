import { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Currency: undefined;
  Balance: undefined;
  Income: undefined;
  Bills: undefined;
  SavingsGoal: undefined;
  Review: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Bills: undefined;
  Goals: undefined;
  Insights: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  QuickEntry: { type?: 'expense' | 'income' } | undefined;
  Simulator: undefined;
  BillForm: { billId?: string } | undefined;
  IncomeForm: { incomeId?: string } | undefined;
  GoalForm: { goalId?: string } | undefined;
  Paywall: { feature?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required by react-navigation's typed-navigation recipe
    interface RootParamList extends RootStackParamList {}
  }
}
