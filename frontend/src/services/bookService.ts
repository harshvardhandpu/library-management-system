import { apiClient } from '../config/api';
import type { BookRequest, BookResponse } from '../types/book';

const BASE_PATH = '/api/books';

export const bookService = {
  async getAll(): Promise<BookResponse[]> {
    const response = await apiClient.get<BookResponse[]>(BASE_PATH);
    return response.data;
  },

  async getById(id: number): Promise<BookResponse> {
    const response = await apiClient.get<BookResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  async create(data: BookRequest): Promise<BookResponse> {
    const response = await apiClient.post<BookResponse>(BASE_PATH, data);
    return response.data;
  },

  async update(id: number, data: BookRequest): Promise<BookResponse> {
    const response = await apiClient.put<BookResponse>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
