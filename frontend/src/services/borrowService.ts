import { apiClient } from '../config/api';
import type { BorrowBookRequest, BorrowRecordResponse } from '../types/borrow';

const BASE_PATH = '/api/borrow-records';

export const borrowService = {
  async borrow(data: BorrowBookRequest): Promise<BorrowRecordResponse> {
    const response = await apiClient.post<BorrowRecordResponse>(`${BASE_PATH}/borrow`, data);
    return response.data;
  },

  async returnBook(borrowRecordId: number): Promise<BorrowRecordResponse> {
    const response = await apiClient.put<BorrowRecordResponse>(`${BASE_PATH}/${borrowRecordId}/return`);
    return response.data;
  },

  async getHistory(): Promise<BorrowRecordResponse[]> {
    const response = await apiClient.get<BorrowRecordResponse[]>(BASE_PATH);
    return response.data;
  },

  async getHistoryByUser(userId: number): Promise<BorrowRecordResponse[]> {
    const response = await apiClient.get<BorrowRecordResponse[]>(`${BASE_PATH}/users/${userId}`);
    return response.data;
  },
};
