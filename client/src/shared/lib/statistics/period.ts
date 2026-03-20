import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';
import type { ComparePreset, DateRange, StatisticsPeriod } from './types';

export function getPeriodRange(period: StatisticsPeriod, anchor: Date): DateRange {
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(anchor, { weekStartsOn: 0 }),
        end: endOfWeek(anchor, { weekStartsOn: 0 }),
      };
    case 'month':
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
    case 'year':
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
    default: {
      const _exhaustive: never = period;
      return _exhaustive;
    }
  }
}

/** Anchor date for the comparison period (same week/month/year span, shifted). */
export function getCompareAnchor(anchor: Date, period: StatisticsPeriod, preset: ComparePreset): Date {
  if (preset === 'previous') {
    switch (period) {
      case 'week':
        return subWeeks(anchor, 1);
      case 'month':
        return subMonths(anchor, 1);
      case 'year':
        return subYears(anchor, 1);
      default: {
        const _e: never = period;
        return _e;
      }
    }
  }
  return subYears(anchor, 1);
}

export function formatRangeLabel(range: DateRange): string {
  const a = range.start.getTime();
  const b = range.end.getTime();
  if (a === b) return range.start.toLocaleDateString();
  return `${range.start.toLocaleDateString()} – ${range.end.toLocaleDateString()}`;
}
