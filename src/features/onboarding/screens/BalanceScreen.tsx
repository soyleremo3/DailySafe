import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { getCurrencyInfo } from '../../../domain/currencies';
import { OnboardingStackParamList } from '../../../navigation/types';
import { TextField } from '../../../components/TextField';
import { useOnboarding } from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Balance'>;

export function BalanceScreen({ navigation }: Props) {
  const { draft, setCurrentBalance } = useOnboarding();
  const symbol = getCurrencyInfo(draft.currency).symbol;
  const isValid = draft.currentBalance.trim().length > 0 && !Number.isNaN(Number(draft.currentBalance));

  return (
    <OnboardingLayout
      step={3}
      totalSteps={6}
      title="How much do you have available right now?"
      subtitle="Your current spendable balance — checking account, cash, whatever you'd actually spend from today."
      primaryLabel="Continue"
      primaryDisabled={!isValid}
      onPrimary={() => navigation.navigate('Income')}
    >
      <TextField
        label="Available balance"
        value={draft.currentBalance}
        onChangeText={setCurrentBalance}
        placeholder="0.00"
        keyboardType="decimal-pad"
        prefix={symbol}
        autoFocus
      />
    </OnboardingLayout>
  );
}
