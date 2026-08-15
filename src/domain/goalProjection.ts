import { daysBetween } from './date';
import { roundMoney } from './money';
import { Goal } from './types';

export interface GoalProjection {
  goal: Goal;
  remaining: number;
  daysUntilTarget: number;
  dailyContribution: number;
  monthlyContribution: number;
  isOverdue: boolean;
  progress: number;
}

export function projectGoal(goal: Goal, asOf: Date): GoalProjection {
  const targetDate = new Date(goal.targetDate);
  const remaining = Math.max(0, roundMoney(goal.targetAmount - goal.savedAmount));
  const rawDays = daysBetween(asOf, targetDate);
  const isOverdue = rawDays < 0;
  const daysUntilTarget = Math.max(1, rawDays);
  const dailyContribution = remaining > 0 ? roundMoney(remaining / daysUntilTarget) : 0;

  return {
    goal,
    remaining,
    daysUntilTarget,
    dailyContribution,
    monthlyContribution: roundMoney(dailyContribution * 30),
    isOverdue,
    progress: goal.targetAmount > 0 ? Math.min(1, goal.savedAmount / goal.targetAmount) : 0,
  };
}

export function projectGoals(goals: Goal[], asOf: Date): GoalProjection[] {
  return goals
    .filter((g) => g.active)
    .map((g) => projectGoal(g, asOf))
    .sort((a, b) => a.goal.targetDate.localeCompare(b.goal.targetDate));
}
