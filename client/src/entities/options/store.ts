import { create } from 'zustand';
import { optionsApi } from '@shared/api/options.api';
import type {
  TaskOptions,
  ExpensesOptions,
  TaskGroup,
  TaskOption,
  ExpenseGroup,
  ExpenseOption,
} from '@shared/types';

const initialTaskOptions: TaskOptions = {
  id: 'task-options',
  title: 'Task Options',
  groups: [],
};

const initialExpensesOptions: ExpensesOptions = {
  id: 'expenses-options',
  title: 'Expenses Options',
  groups: [],
};

interface OptionsState {
  taskOptions: TaskOptions;
  expensesOptions: ExpensesOptions;
  currency: string;
  tasksIsTextColored: boolean;
  expensesIsTextColored: boolean;
  isLoading: boolean;
  saveError: boolean;
  loadOptions: () => Promise<void>;
  setCurrency: (code: string) => void;
  setTasksIsTextColored: (value: boolean) => void;
  setExpensesIsTextColored: (value: boolean) => void;
  addTaskGroup: (group: TaskGroup) => void;
  updateTaskGroup: (groupId: string, title: string) => void;
  removeTaskGroup: (groupId: string) => void;
  addTaskOption: (groupId: string, task: TaskOption) => void;
  updateTaskOption: (groupId: string, taskId: string, value: string) => void;
  updateTaskOptionColor: (groupId: string, taskId: string, color: string) => void;
  removeTaskOption: (groupId: string, taskId: string) => void;
  addExpenseGroup: (group: ExpenseGroup) => void;
  updateExpenseGroup: (groupId: string, title: string) => void;
  removeExpenseGroup: (groupId: string) => void;
  addExpenseOption: (groupId: string, expense: ExpenseOption) => void;
  updateExpenseOption: (groupId: string, expenseId: string, value: string) => void;
  updateExpenseOptionColor: (groupId: string, expenseId: string, color: string) => void;
  removeExpenseOption: (groupId: string, expenseId: string) => void;
}

const saveToServer = (get: () => OptionsState, set: (partial: Partial<OptionsState>) => void) => {
  const { taskOptions, expensesOptions, currency, tasksIsTextColored, expensesIsTextColored } = get();
  optionsApi
    .updateOptions({ taskGroups: taskOptions.groups, expenseGroups: expensesOptions.groups, currency, tasksIsTextColored, expensesIsTextColored })
    .then(() => set({ saveError: false }))
    .catch(() => set({ saveError: true }));
};

export const useOptionsStore = create<OptionsState>()((set, get) => ({
  taskOptions: initialTaskOptions,
  expensesOptions: initialExpensesOptions,
  currency: 'USD',
  tasksIsTextColored: false,
  expensesIsTextColored: false,
  isLoading: false,
  saveError: false,

  loadOptions: async () => {
    set({ isLoading: true });
    try {
      const { taskGroups, expenseGroups, currency, tasksIsTextColored, expensesIsTextColored } = await optionsApi.getOptions();
      set({
        taskOptions: { ...initialTaskOptions, groups: taskGroups },
        expensesOptions: { ...initialExpensesOptions, groups: expenseGroups },
        currency,
        tasksIsTextColored: tasksIsTextColored ?? false,
        expensesIsTextColored: expensesIsTextColored ?? false,
      });
    } catch (err) {
      console.error('Failed to load options:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setTasksIsTextColored: (value) => {
    set({ tasksIsTextColored: value });
    saveToServer(get, set);
  },

  setExpensesIsTextColored: (value) => {
    set({ expensesIsTextColored: value });
    saveToServer(get, set);
  },

  setCurrency: (code) => {
    set({ currency: code });
    saveToServer(get, set);
  },

  addTaskGroup: (group) => {
    set((state) => ({
      taskOptions: { ...state.taskOptions, groups: [...state.taskOptions.groups, group] },
    }));
    saveToServer(get, set);
  },

  updateTaskGroup: (groupId, title) => {
    set((state) => ({
      taskOptions: {
        ...state.taskOptions,
        groups: state.taskOptions.groups.map((g) => (g.id === groupId ? { ...g, title } : g)),
      },
    }));
    saveToServer(get, set);
  },

  removeTaskGroup: (groupId) => {
    set((state) => ({
      taskOptions: {
        ...state.taskOptions,
        groups: state.taskOptions.groups.filter((g) => g.id !== groupId),
      },
    }));
    saveToServer(get, set);
  },

  addTaskOption: (groupId, task) => {
    set((state) => ({
      taskOptions: {
        ...state.taskOptions,
        groups: state.taskOptions.groups.map((g) =>
          g.id === groupId ? { ...g, tasks: [...g.tasks, task] } : g
        ),
      },
    }));
    saveToServer(get, set);
  },

  updateTaskOption: (groupId, taskId, value) => {
    set((state) => ({
      taskOptions: {
        ...state.taskOptions,
        groups: state.taskOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, value } : t)) }
        ),
      },
    }));
    saveToServer(get, set);
  },

  updateTaskOptionColor: (groupId, taskId, color) => {
    set((state) => ({
      taskOptions: {
        ...state.taskOptions,
        groups: state.taskOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, color } : t)) }
        ),
      },
    }));
    saveToServer(get, set);
  },

  removeTaskOption: (groupId, taskId) => {
    set((state) => ({
      taskOptions: {
        ...state.taskOptions,
        groups: state.taskOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }
        ),
      },
    }));
    saveToServer(get, set);
  },

  addExpenseGroup: (group) => {
    set((state) => ({
      expensesOptions: { ...state.expensesOptions, groups: [...state.expensesOptions.groups, group] },
    }));
    saveToServer(get, set);
  },

  updateExpenseGroup: (groupId, title) => {
    set((state) => ({
      expensesOptions: {
        ...state.expensesOptions,
        groups: state.expensesOptions.groups.map((g) => (g.id === groupId ? { ...g, title } : g)),
      },
    }));
    saveToServer(get, set);
  },

  removeExpenseGroup: (groupId) => {
    set((state) => ({
      expensesOptions: {
        ...state.expensesOptions,
        groups: state.expensesOptions.groups.filter((g) => g.id !== groupId),
      },
    }));
    saveToServer(get, set);
  },

  addExpenseOption: (groupId, expense) => {
    set((state) => ({
      expensesOptions: {
        ...state.expensesOptions,
        groups: state.expensesOptions.groups.map((g) =>
          g.id === groupId ? { ...g, expenses: [...g.expenses, expense] } : g
        ),
      },
    }));
    saveToServer(get, set);
  },

  updateExpenseOption: (groupId, expenseId, value) => {
    set((state) => ({
      expensesOptions: {
        ...state.expensesOptions,
        groups: state.expensesOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, expenses: g.expenses.map((e) => (e.id === expenseId ? { ...e, value } : e)) }
        ),
      },
    }));
    saveToServer(get, set);
  },

  updateExpenseOptionColor: (groupId, expenseId, color) => {
    set((state) => ({
      expensesOptions: {
        ...state.expensesOptions,
        groups: state.expensesOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, expenses: g.expenses.map((e) => (e.id === expenseId ? { ...e, color } : e)) }
        ),
      },
    }));
    saveToServer(get, set);
  },

  removeExpenseOption: (groupId, expenseId) => {
    set((state) => ({
      expensesOptions: {
        ...state.expensesOptions,
        groups: state.expensesOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) }
        ),
      },
    }));
    saveToServer(get, set);
  },
}));
