export interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
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
