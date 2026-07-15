import { apiClient } from '../config/api';
import type { UserRequest, UserResponse } from '../types/user';

const BASE_PATH = '/api/users';

export const userService = {
  async getAll(): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>(BASE_PATH);
    return response.data;
  },

  async getById(id: number): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  async create(data: UserRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(BASE_PATH, data);
    return response.data;
  },

  async update(id: number, data: UserRequest): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
