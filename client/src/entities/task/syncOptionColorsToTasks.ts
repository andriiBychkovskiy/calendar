import type { ChecklistItem, Task } from '@shared/types';
import { isTaskChecklistItem } from '@shared/lib/checklistItem';
import { taskApi } from '@shared/api/task.api';
import { useTaskStore } from './store';

function normalizeOptionColor(color: string | undefined): string | undefined {
  const t = color?.trim();
  return t ? t : undefined;
}

function patchChecklistItemsByOptionId(
  checklist: ChecklistItem[],
  optionId: string,
  nextColor: string | undefined,
  match: (item: ChecklistItem) => boolean
): ChecklistItem[] | null {
  let changed = false;
  const next = checklist.map((item) => {
    if (!match(item)) return item;
    if (item.optionId !== optionId) return item;
    const prev = item.color ?? undefined;
    if (prev === nextColor) return item;
    changed = true;
    if (nextColor === undefined) {
      const { color: _drop, ...rest } = item;
      return rest;
    }
    return { ...item, color: nextColor };
  });
  return changed ? next : null;
}

/**
 * Updates `color` on all loaded task documents for checklist items linked to this task option.
 */
export async function syncTaskOptionColorToLoadedTasks(
  optionId: string,
  color: string | undefined
): Promise<void> {
  const nextColor = normalizeOptionColor(color);
  const { tasks, patchTask } = useTaskStore.getState();

  for (const task of tasks) {
    const nextChecklist = patchChecklistItemsByOptionId(
      task.checklist,
      optionId,
      nextColor,
      (item) => isTaskChecklistItem(item)
    );
    if (!nextChecklist) continue;

    try {
      const updated: Task = await taskApi.updateTask(task._id, { checklist: nextChecklist });
      patchTask(updated);
    } catch (err) {
      console.error('syncTaskOptionColorToLoadedTasks failed', task._id, err);
    }
  }
}

/**
 * Updates `color` on all loaded task documents for checklist items linked to this expense option.
 * Match is by `optionId` only — task/expense template ids are distinct UUIDs; strict `type === 'expense'`
 * missed legacy rows where `type` was omitted after save/load.
 */
export async function syncExpenseOptionColorToLoadedTasks(
  optionId: string,
  color: string | undefined
): Promise<void> {
  const nextColor = normalizeOptionColor(color);
  const { tasks, patchTask } = useTaskStore.getState();

  for (const task of tasks) {
    const nextChecklist = patchChecklistItemsByOptionId(
      task.checklist,
      optionId,
      nextColor,
      () => true
    );
    if (!nextChecklist) continue;

    try {
      const updated: Task = await taskApi.updateTask(task._id, { checklist: nextChecklist });
      patchTask(updated);
    } catch (err) {
      console.error('syncExpenseOptionColorToLoadedTasks failed', task._id, err);
    }
  }
}

/**
 * Clears colors for many task options in one pass per loaded task.
 * Parallel per-option syncs race: each reads the same task snapshot and the last patch wins.
 */
export async function syncClearTaskOptionColorsBatch(optionIds: readonly string[]): Promise<void> {
  if (optionIds.length === 0) return;
  const idSet = new Set(optionIds);
  const { tasks, patchTask } = useTaskStore.getState();

  for (const task of tasks) {
    let changed = false;
    const nextChecklist = task.checklist.map((item) => {
      if (!isTaskChecklistItem(item) || !item.optionId || !idSet.has(item.optionId)) return item;
      if (normalizeOptionColor(item.color) === undefined) return item;
      changed = true;
      const { color: _c, ...rest } = item;
      return rest;
    });
    if (!changed) continue;

    try {
      const updated: Task = await taskApi.updateTask(task._id, { checklist: nextChecklist });
      patchTask(updated);
    } catch (err) {
      console.error('syncClearTaskOptionColorsBatch failed', task._id, err);
    }
  }
}

/** Same as {@link syncClearTaskOptionColorsBatch} for expense option ids (match by optionId only). */
export async function syncClearExpenseOptionColorsBatch(optionIds: readonly string[]): Promise<void> {
  if (optionIds.length === 0) return;
  const idSet = new Set(optionIds);
  const { tasks, patchTask } = useTaskStore.getState();

  for (const task of tasks) {
    let changed = false;
    const nextChecklist = task.checklist.map((item) => {
      if (!item.optionId || !idSet.has(item.optionId)) return item;
      if (normalizeOptionColor(item.color) === undefined) return item;
      changed = true;
      const { color: _c, ...rest } = item;
      return rest;
    });
    if (!changed) continue;

    try {
      const updated: Task = await taskApi.updateTask(task._id, { checklist: nextChecklist });
      patchTask(updated);
    } catch (err) {
      console.error('syncClearExpenseOptionColorsBatch failed', task._id, err);
    }
  }
}
