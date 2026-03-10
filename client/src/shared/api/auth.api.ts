import { axiosInstance } from './axios';
import type { AuthResponse } from '../types';

export const authApi = {
  register: async (data: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
