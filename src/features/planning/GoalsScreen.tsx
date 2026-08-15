import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { projectGoals } from '../../domain/goalProjection';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { GoalListItem } from './components/GoalListItem';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function GoalsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const goals = useAppStore((s) => s.goals);
  const currency = useAppStore((s) => s.settings.currency);

  const projections = useMemo(() => projectGoals(goals, new Date()), [goals]);

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold as any, marginBottom: 4 }}>
        Goals & big expenses
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginBottom: 20 }}>
        DailySafe sets aside a little from every pay period so these don&apos;t blow your budget when they arrive.
      </Text>

      {projections.length === 0 ? (
        <EmptyState
          icon="rocket-outline"
          title="No goals yet"
          message="Planning a trip, a new laptop, or building an emergency fund? Add it here."
          actionLabel="Add a goal"
          onAction={() => navigation.navigate('GoalForm', undefined)}
        />
      ) : (
        projections.map((projection) => (
          <GoalListItem
            key={projection.goal.id}
            projection={projection}
            currency={currency}
            onPress={() => navigation.navigate('GoalForm', { goalId: projection.goal.id })}
          />
        ))
      )}

      <Fab accessibilityLabel="Add goal" onPress={() => navigation.navigate('GoalForm', undefined)} />
    </Screen>
  );
}
