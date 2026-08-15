import { projectGoal, projectGoals } from '../goalProjection';
import { Goal } from '../types';

const ASOF = new Date('2026-08-16T00:00:00.000Z');

function goal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    label: 'Vacation',
    kind: 'big_expense',
    targetAmount: 1200,
    savedAmount: 0,
    targetDate: '2026-09-15',
    active: true,
    ...overrides,
  };
}

describe('projectGoal', () => {
  it('computes daily and monthly contribution needed to hit the target on time', () => {
    const projection = projectGoal(goal(), ASOF);
    expect(projection.daysUntilTarget).toBe(30);
    expect(projection.dailyContribution).toBeCloseTo(40, 5);
    expect(projection.monthlyContribution).toBeCloseTo(1200, 5);
  });

  it('accounts for amount already saved', () => {
    const projection = projectGoal(goal({ savedAmount: 200 }), ASOF);
    expect(projection.remaining).toBe(1000);
    expect(projection.progress).toBeCloseTo(200 / 1200, 5);
  });

  it('flags an overdue goal and clamps days to a minimum of one', () => {
    const projection = projectGoal(goal({ targetDate: '2026-08-01' }), ASOF);
    expect(projection.isOverdue).toBe(true);
    expect(projection.daysUntilTarget).toBe(1);
  });

  it('reports zero contribution once the goal is fully funded', () => {
    const projection = projectGoal(goal({ savedAmount: 1200 }), ASOF);
    expect(projection.remaining).toBe(0);
    expect(projection.dailyContribution).toBe(0);
    expect(projection.progress).toBe(1);
  });
});

describe('projectGoals', () => {
  it('filters inactive goals and sorts by soonest target date', () => {
    const goals = [
      goal({ id: 'g2', targetDate: '2026-12-01', active: true }),
      goal({ id: 'g3', active: false }),
      goal({ id: 'g1', targetDate: '2026-09-01', active: true }),
    ];
    const result = projectGoals(goals, ASOF);
    expect(result.map((p) => p.goal.id)).toEqual(['g1', 'g2']);
  });
});
