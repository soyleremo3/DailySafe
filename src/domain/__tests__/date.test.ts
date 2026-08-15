import { daysBetween, nextOccurrenceOnOrAfter, occurrencesInRange, toISODate } from '../date';

describe('nextOccurrenceOnOrAfter', () => {
  it('returns the anchor date itself when it is already on or after "from"', () => {
    const result = nextOccurrenceOnOrAfter(new Date('2026-09-01'), 'monthly', new Date('2026-08-16'));
    expect(toISODate(result!)).toBe('2026-09-01');
  });

  it('advances a monthly anchor forward month by month past "from"', () => {
    const result = nextOccurrenceOnOrAfter(new Date('2026-01-05'), 'monthly', new Date('2026-08-16'));
    expect(toISODate(result!)).toBe('2026-09-05');
  });

  it('advances a weekly anchor forward week by week', () => {
    const result = nextOccurrenceOnOrAfter(new Date('2026-08-01'), 'weekly', new Date('2026-08-16'));
    expect(toISODate(result!)).toBe('2026-08-22');
  });

  it('returns null for a one-off item whose date has already passed', () => {
    const result = nextOccurrenceOnOrAfter(new Date('2026-01-01'), 'once', new Date('2026-08-16'));
    expect(result).toBeNull();
  });
});

describe('occurrencesInRange', () => {
  it('lists every weekly occurrence within an inclusive range', () => {
    const results = occurrencesInRange(new Date('2026-08-01'), 'weekly', new Date('2026-08-16'), new Date('2026-09-05'));
    expect(results.map(toISODate)).toEqual(['2026-08-22', '2026-08-29', '2026-09-05']);
  });

  it('returns an empty array when no occurrence falls in range', () => {
    const results = occurrencesInRange(new Date('2026-01-01'), 'monthly', new Date('2026-08-17'), new Date('2026-08-19'));
    expect(results).toEqual([]);
  });

  it('returns a single entry for a one-off item that falls inside the range', () => {
    const results = occurrencesInRange(new Date('2026-08-20'), 'once', new Date('2026-08-16'), new Date('2026-09-01'));
    expect(results.map(toISODate)).toEqual(['2026-08-20']);
  });
});

describe('daysBetween', () => {
  it('computes whole calendar days between two dates', () => {
    expect(daysBetween(new Date('2026-08-16'), new Date('2026-08-26'))).toBe(10);
  });

  it('returns zero for the same day', () => {
    expect(daysBetween(new Date('2026-08-16T03:00:00'), new Date('2026-08-16T22:00:00'))).toBe(0);
  });
});
