import { describe, it, expect, vi, beforeEach } from 'vitest';
import { borrowService } from './borrowService';
import type { BorrowRecordResponse } from '../types/borrow';

const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
  AxiosError: class AxiosError extends Error {
    response: any;
    constructor(m?: string) { super(m); this.name = 'AxiosError'; }
  },
}));

describe('borrowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRecords: BorrowRecordResponse[] = [
    {
      id: 1,
      borrowDate: '2026-07-15T10:00:00',
      returnDate: null,
      status: 'BORROWED',
      userId: 2,
      userName: 'Test User',
      bookId: 2,
      bookTitle: 'Test Book',
    },
    {
      id: 2,
      borrowDate: '2026-07-14T10:00:00',
      returnDate: '2026-07-15T10:00:00',
      status: 'RETURNED',
      userId: 1,
      userName: 'Harsh',
      bookId: 1,
      bookTitle: 'Clean Code',
    },
  ];

  describe('borrow', () => {
    it('borrows a book successfully', async () => {
      const borrowData = { userId: 1, bookId: 1 };
      const expectedRecord: BorrowRecordResponse = {
        id: 3,
        borrowDate: new Date().toISOString(),
        returnDate: null,
        status: 'BORROWED',
        userId: 1,
        userName: 'Harsh',
        bookId: 1,
        bookTitle: 'Clean Code',
      };
      mockAxiosInstance.post.mockResolvedValue({ data: expectedRecord });

      const result = await borrowService.borrow(borrowData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/borrow-records/borrow', borrowData);
      expect(result.status).toBe('BORROWED');
      expect(result.bookTitle).toBe('Clean Code');
    });

    it('throws error when borrowing fails', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Book not available'));

      await expect(borrowService.borrow({ userId: 1, bookId: 1 })).rejects.toThrow('Book not available');
    });
  });

  describe('returnBook', () => {
    it('returns a book successfully', async () => {
      const returnedRecord: BorrowRecordResponse = {
        id: 1,
        borrowDate: '2026-07-15T10:00:00',
        returnDate: new Date().toISOString(),
        status: 'RETURNED',
        userId: 2,
        userName: 'Test User',
        bookId: 2,
        bookTitle: 'Test Book',
      };
      mockAxiosInstance.put.mockResolvedValue({ data: returnedRecord });

      const result = await borrowService.returnBook(1);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/borrow-records/1/return');
      expect(result.status).toBe('RETURNED');
      expect(result.returnDate).not.toBeNull();
    });
  });

  describe('getHistory', () => {
    it('fetches all borrow records', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockRecords });

      const result = await borrowService.getHistory();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/borrow-records');
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no records exist', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await borrowService.getHistory();

      expect(result).toEqual([]);
    });
  });

  describe('getHistoryByUser', () => {
    it("fetches a user's borrow history", async () => {
      const userRecords = [mockRecords[1]];
      mockAxiosInstance.get.mockResolvedValue({ data: userRecords });

      const result = await borrowService.getHistoryByUser(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/borrow-records/users/1');
      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe('Harsh');
    });
  });
});
