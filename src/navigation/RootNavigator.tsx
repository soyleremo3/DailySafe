import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ErrorState } from '../components/ErrorState';
import { BillFormScreen } from '../features/bills/BillFormScreen';
import { QuickEntryScreen } from '../features/entry/QuickEntryScreen';
import { GoalFormScreen } from '../features/planning/GoalFormScreen';
import { IncomeFormScreen } from '../features/settings/IncomeFormScreen';
import { PaywallScreen } from '../features/settings/PaywallScreen';
import { SimulatorScreen } from '../features/simulator/SimulatorScreen';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { MainTabs } from './MainTabs';
import { OnboardingNavigator } from './OnboardingNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingComplete = useAppStore((s) => s.settings.onboardingComplete);
  const hydrate = useAppStore((s) => s.hydrate);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    hydrate().catch((err) => setError(err instanceof Error ? err : new Error(String(err))));
  }, [hydrate]);

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ErrorState title="Couldn't load your data" message={error.message} onRetry={() => { setError(null); hydrate().catch((err) => setError(err)); }} />
      </View>
    );
  }

  if (!hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const themedHeader = {
    headerShown: true,
    headerStyle: { backgroundColor: theme.colors.backgroundElevated },
    headerTintColor: theme.colors.text,
    headerTitleStyle: { color: theme.colors.text },
    headerShadowVisible: false,
  } as const;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      <Stack.Group screenOptions={{ ...themedHeader, presentation: 'formSheet', sheetAllowedDetents: [0.75, 1] }}>
        <Stack.Screen name="QuickEntry" component={QuickEntryScreen} options={{ title: 'Add entry' }} />
      </Stack.Group>
      <Stack.Group screenOptions={{ ...themedHeader, presentation: 'modal' }}>
        <Stack.Screen name="Simulator" component={SimulatorScreen} options={{ title: 'Purchase simulator' }} />
        <Stack.Screen name="BillForm" component={BillFormScreen} options={{ title: 'Bill' }} />
        <Stack.Screen name="IncomeForm" component={IncomeFormScreen} options={{ title: 'Income' }} />
        <Stack.Screen name="GoalForm" component={GoalFormScreen} options={{ title: 'Goal' }} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'DailySafe Pro' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
