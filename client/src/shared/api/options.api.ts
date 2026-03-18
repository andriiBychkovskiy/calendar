import { axiosInstance } from './axios';
import type { TaskGroup, ExpenseGroup } from '../types';

export interface ServerOptions {
  taskGroups: TaskGroup[];
  expenseGroups: ExpenseGroup[];
  currency: string;
  tasksIsTextColored: boolean;
  expensesIsTextColored: boolean;
}

export const optionsApi = {
  getOptions: async (): Promise<ServerOptions> => {
    const res = await axiosInstance.get<ServerOptions>('/options');
    return res.data;
  },

  updateOptions: async (payload: ServerOptions): Promise<void> => {
    await axiosInstance.put('/options', payload);
  },
};
