import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set) => ({
      taskOptions: initialTaskOptions,
      expansesOptions: initialExpansesOptions,
      currency: 'USD',

      setCurrency: (code) => set({ currency: code }),

      addTaskGroup: (group) =>
        set((state) => ({
          taskOptions: {
            ...state.taskOptions,
            groups: [...state.taskOptions.groups, group],
          },
        })),

      updateTaskGroup: (groupId, title) =>
        set((state) => ({
          taskOptions: {
            ...state.taskOptions,
            groups: state.taskOptions.groups.map((g) =>
              g.id === groupId ? { ...g, title } : g
            ),
          },
        })),

      removeTaskGroup: (groupId) =>
        set((state) => ({
          taskOptions: {
            ...state.taskOptions,
            groups: state.taskOptions.groups.filter((g) => g.id !== groupId),
          },
        })),

      addTaskOption: (groupId, task) =>
        set((state) => ({
          taskOptions: {
            ...state.taskOptions,
            groups: state.taskOptions.groups.map((g) =>
              g.id === groupId ? { ...g, tasks: [...g.tasks, task] } : g
            ),
          },
        })),

      updateTaskOption: (groupId, taskId, value) =>
        set((state) => ({
          taskOptions: {
            ...state.taskOptions,
            groups: state.taskOptions.groups.map((g) =>
              g.id !== groupId
                ? g
                : { ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, value } : t)) }
            ),
          },
        })),

      removeTaskOption: (groupId, taskId) =>
        set((state) => ({
          taskOptions: {
            ...state.taskOptions,
            groups: state.taskOptions.groups.map((g) =>
              g.id !== groupId
                ? g
                : { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }
            ),
          },
        })),

      addExpanseGroup: (group) =>
        set((state) => ({
          expansesOptions: {
            ...state.expansesOptions,
            groups: [...state.expansesOptions.groups, group],
          },
        })),

      updateExpanseGroup: (groupId, title) =>
        set((state) => ({
          expansesOptions: {
            ...state.expansesOptions,
            groups: state.expansesOptions.groups.map((g) =>
              g.id === groupId ? { ...g, title } : g
            ),
          },
        })),

      removeExpanseGroup: (groupId) =>
        set((state) => ({
          expansesOptions: {
            ...state.expansesOptions,
            groups: state.expansesOptions.groups.filter((g) => g.id !== groupId),
          },
        })),

      addExpanseOption: (groupId, expanse) =>
        set((state) => ({
          expansesOptions: {
            ...state.expansesOptions,
            groups: state.expansesOptions.groups.map((g) =>
              g.id === groupId ? { ...g, expanses: [...g.expanses, expanse] } : g
            ),
          },
        })),

      updateExpanseOption: (groupId, expanseId, value) =>
        set((state) => ({
          expansesOptions: {
            ...state.expansesOptions,
            groups: state.expansesOptions.groups.map((g) =>
              g.id !== groupId
                ? g
                : {
                    ...g,
                    expanses: g.expanses.map((e) =>
                      e.id === expanseId ? { ...e, value } : e
                    ),
                  }
            ),
          },
        })),

      removeExpanseOption: (groupId, expanseId) =>
        set((state) => ({
          expansesOptions: {
            ...state.expansesOptions,
            groups: state.expansesOptions.groups.map((g) =>
              g.id !== groupId
                ? g
                : { ...g, expanses: g.expanses.filter((e) => e.id !== expanseId) }
            ),
          },
        })),
    }),
    { name: 'calendar-options' }
  )
);
