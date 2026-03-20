import type { TaskBucketPoint, TaskOptionRow, ExpenseCategoryRow, ExpensePeriodStats } from './types';
import { completionPercent } from './percentages';

export interface TaskComparePoint {
  label: string;
  pctA: number;
  pctB: number;
  doneA: number;
  totalA: number;
  doneB: number;
  totalB: number;
}

export function mergeTaskCompletionCompare(a: TaskBucketPoint[], b: TaskBucketPoint[]): TaskComparePoint[] {
  const n = Math.max(a.length, b.length);
  const out: TaskComparePoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const pa = a[i];
    const pb = b[i];
    out.push({
      label: pa?.label ?? pb?.label ?? String(i + 1),
      pctA: pa?.pct ?? 0,
      pctB: pb?.pct ?? 0,
      doneA: pa?.done ?? 0,
      totalA: pa?.total ?? 0,
      doneB: pb?.done ?? 0,
      totalB: pb?.total ?? 0,
    });
  }
  return out;
}

export interface ExpenseComparePoint {
  label: string;
  amountA: number;
  amountB: number;
}

export function mergeExpenseBucketsCompare(
  a: ExpensePeriodStats['bucketTotals'],
  b: ExpensePeriodStats['bucketTotals']
): ExpenseComparePoint[] {
  const n = Math.max(a.length, b.length);
  const out: ExpenseComparePoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const pa = a[i];
    const pb = b[i];
    out.push({
      label: pa?.label ?? pb?.label ?? String(i + 1),
      amountA: pa?.amount ?? 0,
      amountB: pb?.amount ?? 0,
    });
  }
  return out;
}

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
