import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockBooks = vi.hoisted(() => [
  { id: 1, title: 'Clean Code', author: 'Robert Martin', isbn: '9780132350884', quantity: 5, availableQuantity: 3 },
  { id: 2, title: 'Test Book', author: 'Test Author', isbn: '9990000001', quantity: 2, availableQuantity: 2 },
]);

const mockUsers = vi.hoisted(() => [
  { id: 1, name: 'Harsh', email: 'harsh@example.com', phone: '9876543210' },
  { id: 2, name: 'Test User', email: 'test@example.com', phone: '9999999999' },
]);

const mockRecords = vi.hoisted(() => [
  {
    id: 1, borrowDate: '2026-07-15T10:00:00', returnDate: null,
    status: 'BORROWED' as const, userId: 2, userName: 'Test User',
    bookId: 2, bookTitle: 'Test Book',
  },
  {
    id: 2, borrowDate: '2026-07-14T10:00:00', returnDate: '2026-07-15T10:00:00',
    status: 'RETURNED' as const, userId: 1, userName: 'Harsh',
    bookId: 1, bookTitle: 'Clean Code',
  },
]);

const mockGetAllBooks = vi.hoisted(() => vi.fn());
const mockGetAllUsers = vi.hoisted(() => vi.fn());
const mockGetHistory = vi.hoisted(() => vi.fn());

vi.mock('../services/bookService', () => ({
  bookService: { getAll: mockGetAllBooks },
}));
vi.mock('../services/userService', () => ({
  userService: { getAll: mockGetAllUsers },
}));
vi.mock('../services/borrowService', () => ({
  borrowService: { getHistory: mockGetHistory },
}));

import { Dashboard } from './Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while data is being fetched', async () => {
    mockGetAllBooks.mockReturnValue(new Promise(() => {})); // never resolves
    mockGetAllUsers.mockReturnValue(new Promise(() => {}));
    mockGetHistory.mockReturnValue(new Promise(() => {}));

    renderDashboard();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays error message when API calls fail', async () => {
    mockGetAllBooks.mockRejectedValue(new Error('Network error'));
    mockGetAllUsers.mockRejectedValue(new Error('Network error'));
    mockGetHistory.mockRejectedValue(new Error('Network error'));

    renderDashboard();
    expect(await screen.findByText('Failed to load dashboard data')).toBeInTheDocument();
    expect(screen.getByText(/Make sure the backend server is running/)).toBeInTheDocument();
  });

  it('renders stat cards with correct values', async () => {
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistory.mockResolvedValue(mockRecords);

    renderDashboard();

    expect(await screen.findByText('Total Books')).toBeInTheDocument();
    expect(screen.getByText('Available Copies')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Borrows')).toBeInTheDocument();
    // Stat values: totalBooks=2, availableBooks=3+2=5, totalUsers=2, activeBorrows=1
    const statValues = screen.getAllByText('2');
    expect(statValues.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows recent activity with borrow records', async () => {
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistory.mockResolvedValue(mockRecords);

    renderDashboard();

    expect(await screen.findByText('Recent Activity')).toBeInTheDocument();
    // Book titles appear in both recent activity and library books section
    const testBookElements = screen.getAllByText('Test Book');
    expect(testBookElements.length).toBeGreaterThanOrEqual(1);
    const cleanCodeElements = screen.getAllByText('Clean Code');
    expect(cleanCodeElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "No borrow activity yet" when there are no records', async () => {
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistory.mockResolvedValue([]);

    renderDashboard();

    expect(await screen.findByText('No borrow activity yet')).toBeInTheDocument();
  });

  it('renders quick action links', async () => {
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistory.mockResolvedValue(mockRecords);

    renderDashboard();

    expect(await screen.findByText('Add Book')).toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByText('Borrow Book')).toBeInTheDocument();
    expect(screen.getByText('Return Book')).toBeInTheDocument();
  });

  it('shows library books preview', async () => {
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistory.mockResolvedValue(mockRecords);

    renderDashboard();

    expect(await screen.findByText('Library Books')).toBeInTheDocument();
    const cleanCodeElements = screen.getAllByText('Clean Code');
    expect(cleanCodeElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Robert Martin')).toBeInTheDocument();
  });

  it('shows "No books in library" when no books exist', async () => {
    mockGetAllBooks.mockResolvedValue([]);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistory.mockResolvedValue([]);

    renderDashboard();

    expect(await screen.findByText('No books in library')).toBeInTheDocument();
  });
});
