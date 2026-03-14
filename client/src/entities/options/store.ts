import { create } from 'zustand';
import { optionsApi } from '@shared/api/options.api';
import type {
  TaskOptions,
  ExpansesOptions,
  TaskGroup,
  TaskOption,
  ExpanseGroup,
  ExpanseOption,
} from '@shared/types';

const initialTaskOptions: TaskOptions = {
  id: 'task-options',
  title: 'Task Options',
  groups: [],
};

const initialExpansesOptions: ExpansesOptions = {
  id: 'expanses-options',
  title: 'Expanses Options',
  groups: [],
};

interface OptionsState {
  taskOptions: TaskOptions;
  expansesOptions: ExpansesOptions;
  currency: string;
  isLoading: boolean;
  saveError: boolean;
  loadOptions: () => Promise<void>;
  setCurrency: (code: string) => void;
  addTaskGroup: (group: TaskGroup) => void;
  updateTaskGroup: (groupId: string, title: string) => void;
  removeTaskGroup: (groupId: string) => void;
  addTaskOption: (groupId: string, task: TaskOption) => void;
  updateTaskOption: (groupId: string, taskId: string, value: string) => void;
  removeTaskOption: (groupId: string, taskId: string) => void;
  addExpanseGroup: (group: ExpanseGroup) => void;
  updateExpanseGroup: (groupId: string, title: string) => void;
  removeExpanseGroup: (groupId: string) => void;
  addExpanseOption: (groupId: string, expanse: ExpanseOption) => void;
  updateExpanseOption: (groupId: string, expanseId: string, value: string) => void;
  removeExpanseOption: (groupId: string, expanseId: string) => void;
}

const saveToServer = (get: () => OptionsState, set: (partial: Partial<OptionsState>) => void) => {
  const { taskOptions, expansesOptions, currency } = get();
  optionsApi
    .updateOptions({ taskGroups: taskOptions.groups, expanseGroups: expansesOptions.groups, currency })
    .then(() => set({ saveError: false }))
    .catch(() => set({ saveError: true }));
};

export const useOptionsStore = create<OptionsState>()((set, get) => ({
  taskOptions: initialTaskOptions,
  expansesOptions: initialExpansesOptions,
  currency: 'USD',
  isLoading: false,
  saveError: false,

  loadOptions: async () => {
    set({ isLoading: true });
    try {
      const { taskGroups, expanseGroups, currency } = await optionsApi.getOptions();
      set({
        taskOptions: { ...initialTaskOptions, groups: taskGroups },
        expansesOptions: { ...initialExpansesOptions, groups: expanseGroups },
        currency,
      });
    } catch (err) {
      console.error('Failed to load options:', err);
    } finally {
      set({ isLoading: false });
    }
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

  addExpanseGroup: (group) => {
    set((state) => ({
      expansesOptions: { ...state.expansesOptions, groups: [...state.expansesOptions.groups, group] },
    }));
    saveToServer(get, set);
  },

  updateExpanseGroup: (groupId, title) => {
    set((state) => ({
      expansesOptions: {
        ...state.expansesOptions,
        groups: state.expansesOptions.groups.map((g) => (g.id === groupId ? { ...g, title } : g)),
      },
    }));
    saveToServer(get, set);
  },

  removeExpanseGroup: (groupId) => {
    set((state) => ({
      expansesOptions: {
        ...state.expansesOptions,
        groups: state.expansesOptions.groups.filter((g) => g.id !== groupId),
      },
    }));
    saveToServer(get, set);
  },

  addExpanseOption: (groupId, expanse) => {
    set((state) => ({
      expansesOptions: {
        ...state.expansesOptions,
        groups: state.expansesOptions.groups.map((g) =>
          g.id === groupId ? { ...g, expanses: [...g.expanses, expanse] } : g
        ),
      },
    }));
    saveToServer(get, set);
  },

  updateExpanseOption: (groupId, expanseId, value) => {
    set((state) => ({
      expansesOptions: {
        ...state.expansesOptions,
        groups: state.expansesOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, expanses: g.expanses.map((e) => (e.id === expanseId ? { ...e, value } : e)) }
        ),
      },
    }));
    saveToServer(get, set);
  },

  removeExpanseOption: (groupId, expanseId) => {
    set((state) => ({
      expansesOptions: {
        ...state.expansesOptions,
        groups: state.expansesOptions.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, expanses: g.expanses.filter((e) => e.id !== expanseId) }
        ),
      },
    }));
    saveToServer(get, set);
  },
}));
