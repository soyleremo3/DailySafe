import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, formatISO, isAfter, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';
import { ISODate, RecurrenceFrequency } from './types';

export function toISODate(date: Date): ISODate {
  return formatISO(startOfDay(date), { representation: 'date' });
}

export function fromISODate(value: ISODate): Date {
  return startOfDay(parseISO(value));
}

export function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(startOfDay(to), startOfDay(from));
}

function step(date: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(date, 1);
    case 'biweekly':
      return addWeeks(date, 2);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    case 'once':
      return date;
  }
}

const MAX_ITERATIONS = 2000;

/**
 * Next occurrence of a recurring anchor date on or after `from`.
 * Returns null for a `once` item whose anchor has already passed `from`.
 */
export function nextOccurrenceOnOrAfter(anchor: Date, frequency: RecurrenceFrequency, from: Date): Date | null {
  const anchorDay = startOfDay(anchor);
  const fromDay = startOfDay(from);

  if (frequency === 'once') {
    return isBefore(anchorDay, fromDay) ? null : anchorDay;
  }

  if (!isBefore(anchorDay, fromDay)) {
    return anchorDay;
  }

  let current = anchorDay;
  let iterations = 0;
  while (isBefore(current, fromDay) && iterations < MAX_ITERATIONS) {
    current = step(current, frequency);
    iterations += 1;
  }
  return current;
}

/**
 * All occurrences of a recurring anchor date within [start, end], inclusive.
 */
export function occurrencesInRange(anchor: Date, frequency: RecurrenceFrequency, start: Date, end: Date): Date[] {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  const results: Date[] = [];

  let current = nextOccurrenceOnOrAfter(anchor, frequency, startDay);
  if (!current) return results;

  let iterations = 0;
  while (current && (isBefore(current, endDay) || isEqual(current, endDay)) && iterations < MAX_ITERATIONS) {
    results.push(current);
    if (frequency === 'once') break;
    current = step(current, frequency);
    iterations += 1;
  }
  return results;
}

export function isAfterOrEqual(a: Date, b: Date): boolean {
  return isAfter(a, b) || isEqual(a, b);
}

export { addDays };
