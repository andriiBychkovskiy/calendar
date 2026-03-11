import { create } from 'zustand';
import type { Task, ProgressMap } from '@shared/types';
import { taskApi } from '@shared/api/task.api';

interface MonthKey {
  year: number;
  month: number;
}

interface TaskState {
  tasks: Task[];
  progressMap: ProgressMap;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadedMonths: MonthKey[];
  fetchTasks: () => Promise<void>;
  appendNextMonth: () => Promise<void>;
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

const fetchMonthData = async (year: number, month: number) => {
  return Promise.all([
    taskApi.getTasks(year, month),
    taskApi.getProgress(year, month),
  ]);
};

const mergeMonthResults = (results: [Task[], ProgressMap][]) => {
  const tasks = results.flatMap(([monthTasks]) => monthTasks);
  const progressMap = results.reduce<ProgressMap>(
    (acc, [, monthProgress]) => ({ ...acc, ...monthProgress }),
    {}
  );
  return { tasks, progressMap };
};

const now = new Date();
const initialMonth: MonthKey = { year: now.getFullYear(), month: now.getMonth() + 1 };

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  progressMap: {},
  loading: false,
  loadingMore: false,
  error: null,
  loadedMonths: [initialMonth],

  fetchTasks: async () => {
    const { loadedMonths } = get();
    set({ loading: true, error: null });
    try {
      const results = await Promise.all(
        loadedMonths.map(({ year, month }) => fetchMonthData(year, month))
      );
      set({ ...mergeMonthResults(results), loading: false });
    } catch (err) {
      set({ error: 'Failed to load tasks', loading: false });
      console.error(err);
    }
  },

  appendNextMonth: async () => {
    const { loadedMonths, loadingMore } = get();
    if (loadingMore) return;

    const last = loadedMonths[loadedMonths.length - 1];
    const nextDate = new Date(last.year, last.month, 1);
    const nextMonth: MonthKey = { year: nextDate.getFullYear(), month: nextDate.getMonth() + 1 };

    set({ loadingMore: true });
    try {
      const [tasks, progressMap] = await fetchMonthData(nextMonth.year, nextMonth.month);
      set((state) => ({
        loadedMonths: [...state.loadedMonths, nextMonth],
        tasks: [...state.tasks, ...tasks],
        progressMap: { ...state.progressMap, ...progressMap },
        loadingMore: false,
      }));
    } catch (err) {
      set({ loadingMore: false });
      console.error(err);
    }
  },

  silentRefetch: async () => {
    const { loadedMonths } = get();
    try {
      const results = await Promise.all(
        loadedMonths.map(({ year, month }) => fetchMonthData(year, month))
      );
      set(mergeMonthResults(results));
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
