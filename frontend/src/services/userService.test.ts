import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './userService';
import type { UserResponse } from '../types/user';

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

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUsers: UserResponse[] = [
    { id: 1, name: 'Harsh', email: 'harsh@example.com', phone: '9876543210' },
    { id: 2, name: 'Test User', email: 'test@example.com', phone: '9999999999' },
  ];

  const mockUser: UserResponse = mockUsers[0];

  describe('getAll', () => {
    it('fetches all users successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users');
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no users exist', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await userService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('fetches a single user by ID', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getById(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users/1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('creates a user successfully', async () => {
      const newUser = { name: 'New User', email: 'new@example.com', phone: '1111111111' };
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 3, ...newUser } });

      const result = await userService.create(newUser);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/users', newUser);
      expect(result.id).toBe(3);
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('update', () => {
    it('updates a user successfully', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com', phone: '5555555555' };
      mockAxiosInstance.put.mockResolvedValue({ data: { id: 1, ...updateData } });

      const result = await userService.update(1, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/users/1', updateData);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('deletes a user successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await userService.delete(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/users/1');
    });
  });
});
