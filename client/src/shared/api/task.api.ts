import { axiosInstance } from './axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload, ProgressMap } from '../types';

export const taskApi = {
  getTasks: async (year: number, month: number): Promise<Task[]> => {
    const res = await axiosInstance.get<Task[]>('/tasks', {
      params: { year, month },
    });
    return res.data;
  },

  getProgress: async (year: number, month: number): Promise<ProgressMap> => {
    const res = await axiosInstance.get<ProgressMap>('/tasks/progress', {
      params: { year, month },
    });
    return res.data;
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const res = await axiosInstance.post<Task>('/tasks', payload);
    return res.data;
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const res = await axiosInstance.put<Task>(`/tasks/${id}`, payload);
    return res.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },
};
