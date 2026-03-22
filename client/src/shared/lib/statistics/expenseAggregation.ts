import { eachDayOfInterval, eachMonthOfInterval, format } from 'date-fns';
import type { ChecklistItem, Task, ExpensesOptions } from '@shared/types';
import type { DateRange, StatisticsPeriod, ExpenseCategoryRow, ExpenseGroupRow, ExpensePeriodStats } from './types';
import { sharePercent } from './percentages';
import { isExpenseChecklistItem } from '@shared/lib/checklistItem';
import { filterTasksInRange } from './taskAggregation';
import { normalizeStatColor } from './colorVisibility';

export { normalizeStatColor as normalizeExpenseStatColor } from './colorVisibility';

function dateKeyOfTask(t: Task): string {
  return t.dueDate.split('T')[0];
}

interface ExpenseMeta {
  label: string;
  color: string;
  groupId: string;
  groupTitle: string;
}

export function buildExpenseOptionMeta(expensesOptions: ExpensesOptions): Map<string, ExpenseMeta> {
  const map = new Map<string, ExpenseMeta>();
  for (const g of expensesOptions.groups) {
    for (const opt of g.expenses) {
      map.set(opt.id, {
        label: opt.value,
        color: normalizeStatColor(opt.color),
        groupId: g.id,
        groupTitle: g.title,
      });
    }
  }
  return map;
}

function optionKeyForExpense(item: ChecklistItem): string {
  if (item.optionId) return item.optionId;
  return `__free:${item.text}`;
}

function metaForExpense(item: ChecklistItem, lookup: Map<string, ExpenseMeta>): ExpenseMeta {
  if (item.optionId && lookup.has(item.optionId)) {
    return lookup.get(item.optionId) as ExpenseMeta;
  }
  return {
    label: item.text || 'Expense',
    color: normalizeStatColor(item.color),
    groupId: '__other',
    groupTitle: 'Other',
  };
}

interface ExpenseRow {
  dateKey: string;
  item: ChecklistItem;
  amount: number;
}

function collectExpenseRows(tasks: Task[], range: DateRange): ExpenseRow[] {
  const rows: ExpenseRow[] = [];
  for (const t of filterTasksInRange(tasks, range)) {
    const dk = dateKeyOfTask(t);
    for (const c of t.checklist) {
      if (!isExpenseChecklistItem(c)) continue;
      const amount = c.amount ?? 0;
      if (amount <= 0) continue;
      rows.push({ dateKey: dk, item: c, amount });
    }
  }
  return rows;
}

function bucketMeta(
  period: StatisticsPeriod,
  range: DateRange
): { label: string; dateKey: string }[] {
  if (period === 'year') {
    return eachMonthOfInterval({ start: range.start, end: range.end }).map((d) => ({
      label: format(d, 'MMM'),
      dateKey: format(d, 'yyyy-MM'),
    }));
  }
  return eachDayOfInterval({ start: range.start, end: range.end }).map((d) => ({
    label: period === 'week' ? format(d, 'EEE') : format(d, 'd'),
    dateKey: format(d, 'yyyy-MM-dd'),
  }));
}

function rowsInExpenseBucket(rows: ExpenseRow[], bucketKey: string, period: StatisticsPeriod): ExpenseRow[] {
  if (period === 'year') {
    return rows.filter((r) => r.dateKey.slice(0, 7) === bucketKey);
  }
  return rows.filter((r) => r.dateKey === bucketKey);
}


export function aggregateExpensePeriod(
  tasks: Task[],
  expensesOptions: ExpensesOptions,
  period: StatisticsPeriod,
  range: DateRange
): ExpensePeriodStats {
  const lookup = buildExpenseOptionMeta(expensesOptions);
  const rows = collectExpenseRows(tasks, range);

  const totalSpent = rows.reduce((s, r) => s + r.amount, 0);

  const catMap = new Map<string, { meta: ExpenseMeta; amount: number }>();
  for (const r of rows) {
    const key = optionKeyForExpense(r.item);
    const meta = metaForExpense(r.item, lookup);
    const cur = catMap.get(key) ?? { meta, amount: 0 };
    cur.amount += r.amount;
    catMap.set(key, cur);
  }

  const byCategory: ExpenseCategoryRow[] = [...catMap.entries()]
    .map(([key, v]) => ({
      key,
      label: v.meta.label,
      color: normalizeStatColor(v.meta.color),
      groupTitle: v.meta.groupTitle,
      amount: v.amount,
      pctOfTotal: sharePercent(v.amount, totalSpent),
    }))
    .sort((a, b) => b.amount - a.amount);

  const groupMap = new Map<string, { groupId: string; title: string; amount: number }>();
  for (const row of byCategory) {
    const meta = catMap.get(row.key)?.meta;
    const gid = meta?.groupId ?? '__other';
    const title = meta?.groupTitle ?? 'Other';
    const cur = groupMap.get(gid) ?? { groupId: gid, title, amount: 0 };
    cur.amount += row.amount;
    groupMap.set(gid, cur);
  }

  const byGroup: ExpenseGroupRow[] = [...groupMap.values()]
    .map((g) => ({
      groupId: g.groupId,
      title: g.title,
      amount: g.amount,
      pctOfTotal: sharePercent(g.amount, totalSpent),
    }))
    .sort((a, b) => b.amount - a.amount);

  const bucketsMeta = bucketMeta(period, range);
  const bucketTotals = bucketsMeta.map((b) => {
    const br = rowsInExpenseBucket(rows, b.dateKey, period);
    const amount = br.reduce((s, x) => s + x.amount, 0);
    return { label: b.label, dateKey: b.dateKey, amount };
  });

  return {
    totalSpent,
    byCategory,
    byGroup,
    bucketTotals,
  };
}
