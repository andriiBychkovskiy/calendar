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
  hasEntriesMap: Record<string, boolean>;
  expensesMap: Record<string, number>;
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

// Returns undefined when there are no task items (only expanses or nothing)
const recalcProgressForDate = (tasks: Task[], dateKey: string): number | undefined => {
  const dayTasks = tasks.filter((t) => t.dueDate.split('T')[0] === dateKey);
  let total = 0;
  let completed = 0;
  for (const t of dayTasks) {
    const taskItems = t.checklist.filter((c) => c.type !== 'expanse');
    total += taskItems.length;
    completed += taskItems.filter((c) => c.completed).length;
  }
  if (total === 0) return undefined;
  return Math.round((completed / total) * 100);
};

const computeHasEntriesMap = (tasks: Task[]): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  for (const t of tasks) {
    map[t.dueDate.split('T')[0]] = true;
  }
  return map;
};

const computeExpensesMap = (tasks: Task[]): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const t of tasks) {
    const dateKey = t.dueDate.split('T')[0];
    const dayTotal = t.checklist
      .filter((c) => c.type === 'expanse')
      .reduce((sum, c) => sum + (c.amount ?? 0), 0);
    if (dayTotal > 0) {
      map[dateKey] = (map[dateKey] ?? 0) + dayTotal;
    }
  }
  return map;
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
  return { tasks, progressMap, hasEntriesMap: computeHasEntriesMap(tasks), expensesMap: computeExpensesMap(tasks) };
};

const now = new Date();
const initialMonth: MonthKey = { year: now.getFullYear(), month: now.getMonth() + 1 };

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  progressMap: {},
  hasEntriesMap: {},
  expensesMap: {},
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
        hasEntriesMap: { ...state.hasEntriesMap, ...computeHasEntriesMap(tasks) },
        expensesMap: { ...state.expensesMap, ...computeExpensesMap(tasks) },
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
      const newProgress = recalcProgressForDate(tasks, dateKey);
      const progressMap = { ...state.progressMap };
      if (newProgress !== undefined) {
        progressMap[dateKey] = newProgress;
      } else {
        delete progressMap[dateKey];
      }
      return {
        tasks,
        progressMap,
        hasEntriesMap: { ...state.hasEntriesMap, [dateKey]: true },
        expensesMap: computeExpensesMap(tasks),
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
      const newProgress = recalcProgressForDate(tasks, dateKey);
      const progressMap = { ...state.progressMap };
      if (newProgress !== undefined) {
        progressMap[dateKey] = newProgress;
      } else {
        delete progressMap[dateKey];
      }
      return { tasks, progressMap, expensesMap: computeExpensesMap(tasks) };
    });
  },

  removeTask: (id) => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t._id !== id);
      return {
        tasks,
        hasEntriesMap: computeHasEntriesMap(tasks),
        expensesMap: computeExpensesMap(tasks),
      };
    });
    get().silentRefetch();
  },
}));
