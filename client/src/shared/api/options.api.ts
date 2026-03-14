import { axiosInstance } from './axios';
import type { TaskGroup, ExpanseGroup } from '../types';

export interface ServerOptions {
  taskGroups: TaskGroup[];
  expanseGroups: ExpanseGroup[];
  currency: string;
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
