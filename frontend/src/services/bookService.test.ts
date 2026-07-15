import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookService } from './bookService';
import type { BookResponse } from '../types/book';

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

describe('bookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBooks: BookResponse[] = [
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert Martin',
      isbn: '9780132350884',
      quantity: 5,
      availableQuantity: 3,
    },
    {
      id: 2,
      title: 'Test Book',
      author: 'Test Author',
      isbn: '9990000001',
      quantity: 2,
      availableQuantity: 2,
    },
  ];

  const mockBook: BookResponse = mockBooks[0];

  describe('getAll', () => {
    it('fetches all books successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockBooks });

      const result = await bookService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/books');
      expect(result).toEqual(mockBooks);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no books exist', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await bookService.getAll();

      expect(result).toEqual([]);
    });

    it('throws error when API fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(bookService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('fetches a single book by ID', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockBook });

      const result = await bookService.getById(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/books/1');
      expect(result).toEqual(mockBook);
    });
  });

  describe('create', () => {
    it('creates a book successfully', async () => {
      const newBook = { title: 'New Book', author: 'New Author', isbn: '1234567890', quantity: 1 };
      const createdBook = { id: 3, ...newBook, availableQuantity: 1 };
      mockAxiosInstance.post.mockResolvedValue({ data: createdBook });

      const result = await bookService.create(newBook);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/books', newBook);
      expect(result.id).toBe(3);
      expect(result.title).toBe('New Book');
    });
  });

  describe('update', () => {
    it('updates a book successfully', async () => {
      const updateData = { title: 'Updated Title', author: 'Updated Author', isbn: '9780132350884', quantity: 10 };
      mockAxiosInstance.put.mockResolvedValue({ data: { id: 1, ...updateData, availableQuantity: 10 } });

      const result = await bookService.update(1, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/books/1', updateData);
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('deletes a book successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await bookService.delete(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/books/1');
    });

    it('throws error when delete fails', async () => {
      mockAxiosInstance.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(bookService.delete(1)).rejects.toThrow('Delete failed');
    });
  });
});
