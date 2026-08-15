import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { OnboardingProvider } from '../features/onboarding/OnboardingContext';
import { BalanceScreen } from '../features/onboarding/screens/BalanceScreen';
import { BillsScreen } from '../features/onboarding/screens/BillsScreen';
import { CurrencyScreen } from '../features/onboarding/screens/CurrencyScreen';
import { IncomeScreen } from '../features/onboarding/screens/IncomeScreen';
import { ReviewScreen } from '../features/onboarding/screens/ReviewScreen';
import { SavingsGoalScreen } from '../features/onboarding/screens/SavingsGoalScreen';
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Currency" component={CurrencyScreen} />
        <Stack.Screen name="Balance" component={BalanceScreen} />
        <Stack.Screen name="Income" component={IncomeScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="SavingsGoal" component={SavingsGoalScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
