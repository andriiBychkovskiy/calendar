export interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
  type?: 'task' | 'expanse';
  optionId?: string;
  amount?: number;
}

export interface Task {
  _id: string;
  userId: string;
  dueDate: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  dueDate: string;
  checklist: Omit<ChecklistItem, '_id'>[];
}

export interface UpdateTaskPayload {
  dueDate?: string;
  checklist?: ChecklistItem[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type ProgressMap = Record<string, number>;

export type SmileyState = 'sad' | 'slightly' | 'neutral' | 'happy' | 'celebratory';

export const getSmileyState = (percentage: number): SmileyState => {
  if (percentage <= 10) return 'sad';
  if (percentage < 40) return 'slightly';
  if (percentage < 60) return 'neutral';
  if (percentage < 90) return 'happy';
  return 'celebratory';
};

// ─── Options ──────────────────────────────────────────────────────────────────

export interface TaskOption {
  id: string;
  value: string;
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: TaskOption[];
}

export interface TaskOptions {
  id: string;
  title: string;
  groups: TaskGroup[];
}

export interface ExpanseOption {
  id: string;
  value: string;
}

export interface ExpanseGroup {
  id: string;
  title: string;
  expanses: ExpanseOption[];
}

export interface ExpansesOptions {
  id: string;
  title: string;
  groups: ExpanseGroup[];
}
