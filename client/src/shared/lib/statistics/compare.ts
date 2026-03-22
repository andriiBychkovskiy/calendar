import type { TaskOptionRow, ExpenseCategoryRow } from './types';
import { completionPercent } from './percentages';

export interface TaskOptionCompareRow {
  key: string;
  label: string;
  color: string;
  pctA: number;
  pctB: number;
  doneA: number;
  totalA: number;
  doneB: number;
  totalB: number;
}

export function mergeTaskOptionsForCompare(a: TaskOptionRow[], b: TaskOptionRow[]): TaskOptionCompareRow[] {
  const keys = new Set<string>([...a.map((x) => x.key), ...b.map((x) => x.key)]);
  return [...keys]
    .map((key) => {
      const ra = a.find((x) => x.key === key);
      const rb = b.find((x) => x.key === key);
      const totalA = ra?.total ?? 0;
      const totalB = rb?.total ?? 0;
      const doneA = ra?.done ?? 0;
      const doneB = rb?.done ?? 0;
      return {
        key,
        label: ra?.label ?? rb?.label ?? key,
        color: ra?.color ?? rb?.color ?? '#94A3B8',
        pctA: completionPercent(doneA, totalA),
        pctB: completionPercent(doneB, totalB),
        doneA,
        totalA,
        doneB,
        totalB,
      };
    })
    .sort((x, y) => Math.max(y.totalA, y.totalB) - Math.max(x.totalA, x.totalB));
}

export interface ExpenseCategoryCompareRow {
  key: string;
  label: string;
  color: string;
  amountA: number;
  amountB: number;
}

export function mergeExpenseCategoriesForCompare(
  a: ExpenseCategoryRow[],
  b: ExpenseCategoryRow[]
): ExpenseCategoryCompareRow[] {
  const keys = new Set<string>([...a.map((x) => x.key), ...b.map((x) => x.key)]);
  return [...keys]
    .map((key) => {
      const ra = a.find((x) => x.key === key);
      const rb = b.find((x) => x.key === key);
      return {
        key,
        label: ra?.label ?? rb?.label ?? key,
        color: ra?.color ?? rb?.color ?? '#94A3B8',
        amountA: ra?.amount ?? 0,
        amountB: rb?.amount ?? 0,
      };
    })
    .sort((x, y) => Math.max(y.amountA, y.amountB) - Math.max(x.amountA, x.amountB));
}
