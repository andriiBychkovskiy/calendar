export type {
  StatisticsPeriod,
  StatisticsViewMode,
  ComparePreset,
  DateRange,
  TaskOptionRow,
  TaskGroupRow,
  TaskPeriodStats,
  ExpenseCategoryRow,
  ExpenseGroupRow,
  ExpensePeriodStats,
} from './types';
export { completionPercent, sharePercent } from './percentages';
export { getPeriodRange, getCompareAnchor, formatRangeLabel } from './period';
export { normalizeStatColor } from './colorVisibility';
export {
  filterTasksInRange,
  buildTaskOptionMeta,
  aggregateTaskPeriod,
  normalizeTaskStatColor,
} from './taskAggregation';
export {
  buildExpenseOptionMeta,
  aggregateExpensePeriod,
  normalizeExpenseStatColor,
} from './expenseAggregation';
export {
  mergeTaskOptionsForCompare,
  mergeExpenseCategoriesForCompare,
  type TaskOptionCompareRow,
  type ExpenseCategoryCompareRow,
} from './compare';
