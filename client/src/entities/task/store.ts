import { create } from 'zustand';
import type { Task, ProgressMap } from '@shared/types';
import { taskApi } from '@shared/api/task.api';

interface TaskState {
  tasks: Task[];
  progressMap: ProgressMap;
  loading: boolean;
  error: string | null;
  currentYear: number;
  currentMonth: number;
  setMonth: (year: number, month: number) => void;
  fetchTasks: () => Promise<void>;
  silentRefetch: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  patchTask: (task: Task) => void;
  removeTask: (id: string) => void;
}

const recalcProgressForDate = (tasks: Task[], dateKey: string): number => {
  const dayTasks = tasks.filter((t) => t.dueDate.split('T')[0] === dateKey);
  let total = 0;
  let completed = 0;
  for (const t of dayTasks) {
    if (t.checklist.length === 0) {
      total += 1;
    } else {
      total += t.checklist.length;
      completed += t.checklist.filter((c) => c.completed).length;
    }
  }
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const now = new Date();

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  progressMap: {},
  loading: false,
  error: null,
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,

  setMonth: (year, month) => {
    set({ currentYear: year, currentMonth: month });
    get().fetchTasks();
  },

  fetchTasks: async () => {
    const { currentYear, currentMonth } = get();
    set({ loading: true, error: null });
    try {
      const [tasks, progressMap] = await Promise.all([
        taskApi.getTasks(currentYear, currentMonth),
        taskApi.getProgress(currentYear, currentMonth),
      ]);
      set({ tasks, progressMap, loading: false });
    } catch (err) {
      set({ error: 'Failed to load tasks', loading: false });
      console.error(err);
    }
  },

  silentRefetch: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const [tasks, progressMap] = await Promise.all([
        taskApi.getTasks(currentYear, currentMonth),
        taskApi.getProgress(currentYear, currentMonth),
      ]);
      set({ tasks, progressMap });
    } catch (err) {
      console.error(err);
    }
  },

  addTask: (task) => {
    set((state) => {
      const tasks = [...state.tasks, task];
      const dateKey = task.dueDate.split('T')[0];
      return {
        tasks,
        progressMap: {
          ...state.progressMap,
          [dateKey]: recalcProgressForDate(tasks, dateKey),
        },
      };
    });
    get().silentRefetch();
  },

  updateTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
    }));
    get().silentRefetch();
  },

  patchTask: (task) => {
    set((state) => {
      const tasks = state.tasks.map((t) => (t._id === task._id ? task : t));
      const dateKey = task.dueDate.split('T')[0];
      return {
        tasks,
        progressMap: {
          ...state.progressMap,
          [dateKey]: recalcProgressForDate(tasks, dateKey),
        },
      };
    });
  },

  removeTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
    get().silentRefetch();
  },
}));
