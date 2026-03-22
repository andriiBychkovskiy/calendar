export type StatisticsPeriod = 'week' | 'month' | 'year';

export type StatisticsViewMode = 'chart' | 'list';

/** Second period relative to primary anchor */
export type ComparePreset = 'previous' | 'previousYear';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TaskOptionRow {
  key: string;
  label: string;
  color: string;
  groupId: string;
  groupTitle: string;
  done: number;
  total: number;
  pct: number;
}

export interface TaskGroupRow {
  groupId: string;
  title: string;
  done: number;
  total: number;
  pct: number;
}

export interface TaskPeriodStats {
  overall: { done: number; total: number; pct: number };
  byOption: TaskOptionRow[];
  byGroup: TaskGroupRow[];
}

export interface ExpenseCategoryRow {
  key: string;
  label: string;
  color: string;
  groupTitle: string;
  amount: number;
  pctOfTotal: number;
}

export interface ExpenseGroupRow {
  groupId: string;
  title: string;
  amount: number;
  pctOfTotal: number;
}

export interface ExpensePeriodStats {
  totalSpent: number;
  byCategory: ExpenseCategoryRow[];
  byGroup: ExpenseGroupRow[];
  /** For time series: bucket label -> total */
  bucketTotals: { label: string; dateKey: string; amount: number }[];
}
