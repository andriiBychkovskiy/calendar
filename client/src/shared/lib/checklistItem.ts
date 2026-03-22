import type { ChecklistItem } from '@shared/types';

/** Expense row from options has `type: 'expense'`. Legacy rows may omit `type` but carry `amount`. */
export function isExpenseChecklistItem(item: ChecklistItem): boolean {
  if (item.type === 'expense') return true;
  if (item.type === 'task') return false;
  return item.amount != null;
}

export function isTaskChecklistItem(item: ChecklistItem): boolean {
  return !isExpenseChecklistItem(item);
}
