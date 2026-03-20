export type {
  StatisticsPeriod,
  StatisticsViewMode,
  ComparePreset,
  DateRange,
  TaskBucketPoint,
  TaskOptionRow,
  TaskGroupRow,
  TaskPeriodStats,
  ExpenseCategoryRow,
  ExpenseGroupRow,
  ExpensePeriodStats,
} from './types';
export { completionPercent, sharePercent } from './percentages';
export { getPeriodRange, getCompareAnchor, formatRangeLabel } from './period';
export { filterTasksInRange, buildTaskOptionMeta, aggregateTaskPeriod } from './taskAggregation';
export { buildExpenseOptionMeta, aggregateExpensePeriod } from './expenseAggregation';
export {
  mergeTaskCompletionCompare,
  mergeExpenseBucketsCompare,
  mergeTaskOptionsForCompare,
  mergeExpenseCategoriesForCompare,
  type TaskComparePoint,
  type ExpenseComparePoint,
  type TaskOptionCompareRow,
  type ExpenseCategoryCompareRow,
} from './compare';
