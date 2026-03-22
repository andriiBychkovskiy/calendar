import { format } from 'date-fns';
import type { ChecklistItem, Task, TaskOptions } from '@shared/types';
import type { DateRange, TaskGroupRow, TaskOptionRow, TaskPeriodStats } from './types';
import { completionPercent } from './percentages';
import { isTaskChecklistItem } from '@shared/lib/checklistItem';
import { normalizeStatColor } from './colorVisibility';

export { normalizeStatColor as normalizeTaskStatColor } from './colorVisibility';

function dateKeyOfTask(t: Task): string {
  return t.dueDate.split('T')[0];
}

function inRange(dateKey: string, range: DateRange): boolean {
  const start = format(range.start, 'yyyy-MM-dd');
  const end = format(range.end, 'yyyy-MM-dd');
  return dateKey >= start && dateKey <= end;
}

export function filterTasksInRange(tasks: Task[], range: DateRange): Task[] {
  return tasks.filter((t) => inRange(dateKeyOfTask(t), range));
}

interface OptionMeta {
  label: string;
  color: string;
  groupId: string;
  groupTitle: string;
}

export function buildTaskOptionMeta(taskOptions: TaskOptions): Map<string, OptionMeta> {
  const map = new Map<string, OptionMeta>();
  for (const g of taskOptions.groups) {
    for (const opt of g.tasks) {
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

function optionKeyForItem(item: ChecklistItem): string {
  if (item.optionId) return item.optionId;
  return `__free:${item.text}`;
}

function metaForItem(item: ChecklistItem, lookup: Map<string, OptionMeta>): OptionMeta {
  if (item.optionId && lookup.has(item.optionId)) {
    return lookup.get(item.optionId) as OptionMeta;
  }
  return {
    label: item.text || 'Task',
    color: normalizeStatColor(item.color),
    groupId: '__other',
    groupTitle: 'Other',
  };
}

interface TaskRow {
  dateKey: string;
  item: ChecklistItem;
}

function collectTaskRows(tasks: Task[], range: DateRange): TaskRow[] {
  const rows: TaskRow[] = [];
  for (const t of filterTasksInRange(tasks, range)) {
    const dk = dateKeyOfTask(t);
    for (const c of t.checklist) {
      if (!isTaskChecklistItem(c)) continue;
      rows.push({ dateKey: dk, item: c });
    }
  }
  return rows;
}

export function aggregateTaskPeriod(
  tasks: Task[],
  taskOptions: TaskOptions,
  range: DateRange
): TaskPeriodStats {
  const lookup = buildTaskOptionMeta(taskOptions);
  const rows = collectTaskRows(tasks, range);

  let done = 0;
  const total = rows.length;
  for (const r of rows) {
    if (r.item.completed) done += 1;
  }

  const byOptionMap = new Map<string, { meta: OptionMeta; done: number; total: number }>();

  for (const r of rows) {
    const key = optionKeyForItem(r.item);
    const meta = metaForItem(r.item, lookup);
    const cur = byOptionMap.get(key) ?? { meta, done: 0, total: 0 };
    cur.total += 1;
    if (r.item.completed) cur.done += 1;
    byOptionMap.set(key, cur);
  }

  const byOption: TaskOptionRow[] = [...byOptionMap.entries()]
    .map(([key, v]) => ({
      key,
      label: v.meta.label,
      color: normalizeStatColor(v.meta.color),
      groupId: v.meta.groupId,
      groupTitle: v.meta.groupTitle,
      done: v.done,
      total: v.total,
      pct: completionPercent(v.done, v.total),
    }))
    .sort((a, b) => b.total - a.total);

  const groupMap = new Map<string, { groupId: string; title: string; done: number; total: number }>();
  for (const row of byOption) {
    const cur =
      groupMap.get(row.groupId) ?? {
        groupId: row.groupId,
        title: row.groupTitle,
        done: 0,
        total: 0,
      };
    cur.done += row.done;
    cur.total += row.total;
    groupMap.set(row.groupId, cur);
  }

  const byGroup: TaskGroupRow[] = [...groupMap.values()]
    .map((g) => ({
      groupId: g.groupId,
      title: g.title,
      done: g.done,
      total: g.total,
      pct: completionPercent(g.done, g.total),
    }))
    .sort((a, b) => b.total - a.total);

  return {
    overall: { done, total, pct: completionPercent(done, total) },
    byOption,
    byGroup,
  };
}
