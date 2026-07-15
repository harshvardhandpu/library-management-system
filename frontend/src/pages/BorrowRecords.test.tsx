import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockRecords = vi.hoisted(() => [
  {
    id: 1, borrowDate: '2026-07-15T10:00:00', returnDate: null,
    status: 'BORROWED' as const, userId: 2, userName: 'Alice',
    bookId: 2, bookTitle: 'Test Driven Development',
  },
  {
    id: 2, borrowDate: '2026-07-10T10:00:00', returnDate: '2026-07-14T10:00:00',
    status: 'RETURNED' as const, userId: 1, userName: 'Harsh',
    bookId: 1, bookTitle: 'Clean Code',
  },
  {
    id: 3, borrowDate: '2026-07-12T10:00:00', returnDate: null,
    status: 'BORROWED' as const, userId: 1, userName: 'Harsh',
    bookId: 3, bookTitle: 'Refactoring',
  },
]);

const mockUsers = vi.hoisted(() => [
  { id: 1, name: 'Harsh', email: 'harsh@example.com', phone: '9876543210' },
  { id: 2, name: 'Alice', email: 'alice@example.com', phone: '9123456789' },
]);

const mockBooks = vi.hoisted(() => [
  { id: 1, title: 'Clean Code', author: 'Robert Martin', isbn: '9780132350884', quantity: 5, availableQuantity: 5 },
  { id: 2, title: 'Test Driven Development', author: 'Kent Beck', isbn: '9780321146533', quantity: 3, availableQuantity: 2 },
]);

const mockGetHistory = vi.hoisted(() => vi.fn());
const mockGetAllUsers = vi.hoisted(() => vi.fn());
const mockGetAllBooks = vi.hoisted(() => vi.fn());
const mockBorrow = vi.hoisted(() => vi.fn());
const mockReturnBook = vi.hoisted(() => vi.fn());

vi.mock('../services/borrowService', () => ({
  borrowService: {
    getHistory: mockGetHistory,
    borrow: mockBorrow,
    returnBook: mockReturnBook,
  },
}));
vi.mock('../services/userService', () => ({
  userService: { getAll: mockGetAllUsers },
}));
vi.mock('../services/bookService', () => ({
  bookService: { getAll: mockGetAllBooks },
}));

import { BorrowRecords } from './BorrowRecords';

function renderBorrowRecords(initialEntries = ['/borrow-records']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <BorrowRecords />
    </MemoryRouter>
  );
}

describe('BorrowRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching records', () => {
    mockGetHistory.mockReturnValue(new Promise(() => {}));
    mockGetAllUsers.mockReturnValue(new Promise(() => {}));
    renderBorrowRecords();
    expect(screen.getByText('Loading borrow records...')).toBeInTheDocument();
  });

  it('shows error toast when API fails', async () => {
    mockGetHistory.mockRejectedValue(new Error('Failed to load records'));
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();
    expect(await screen.findByText('Failed to load records')).toBeInTheDocument();
  });

  it('renders empty state when no records exist', async () => {
    mockGetHistory.mockResolvedValue([]);
    mockGetAllUsers.mockResolvedValue([]);
    renderBorrowRecords();
    expect(await screen.findByText('No borrow records yet')).toBeInTheDocument();
    expect(screen.getByText('Borrow a book to get started.')).toBeInTheDocument();
  });

  it('renders borrow records in the table', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Refactoring')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    const harshElements = screen.getAllByText('Harsh');
    expect(harshElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows summary cards with correct counts', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Currently Borrowed')).toBeInTheDocument();
    // 'Returned' appears in summary card AND in status badges
    const returnedElements = screen.getAllByText('Returned');
    expect(returnedElements.length).toBeGreaterThanOrEqual(1);
    // Summary card values
    const twoElements = screen.getAllByText('2');
    expect(twoElements.length).toBeGreaterThanOrEqual(1);
    const oneElements = screen.getAllByText('1');
    expect(oneElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows header with active and total count', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('2 active borrows · 3 total records')).toBeInTheDocument();
  });

  it('shows singular active/total labels when count is 1', async () => {
    const singleActiveRecord = [mockRecords[0]]; // Only 1 BORROWED record
    mockGetHistory.mockResolvedValue(singleActiveRecord);
    mockGetAllUsers.mockResolvedValue([mockUsers[1]]);
    renderBorrowRecords();

    expect(await screen.findByText('1 active borrow · 1 total record')).toBeInTheDocument();
  });

  it('shows Return button for borrowed records', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();
    const returnButtons = screen.getAllByText('Return');
    expect(returnButtons).toHaveLength(2); // Two BORROWED records
  });

  it('does not show Return button for returned records', async () => {
    const returnedOnly = [mockRecords[1]]; // Only the RETURNED record
    mockGetHistory.mockResolvedValue(returnedOnly);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
    expect(screen.queryByText('Return')).not.toBeInTheDocument();
  });

  it('shows dash for records without return date', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    // "—" (em dash) appears in the Return Date column for unreturned books
    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThanOrEqual(1);
  });

  it('filters records by search (book title)', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by book title or user name...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Test Driven Development')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
    expect(screen.queryByText('Refactoring')).not.toBeInTheDocument();
  });

  it('filters records by search (user name)', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by book title or user name...');
    fireEvent.change(searchInput, { target: { value: 'Refactoring' } });

    expect(screen.getByText('Refactoring')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Driven Development')).not.toBeInTheDocument();
  });

  it('shows "No records found" when search has no matches', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by book title or user name...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('clears search when X is clicked', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderBorrowRecords();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by book title or user name...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Find the X clear button in the search container
    const searchClear = document.querySelector('.relative input')?.closest('.relative')?.querySelector('button');
    if (searchClear) fireEvent.click(searchClear);

    expect(screen.getByText('Clean Code')).toBeInTheDocument();
  });

  it('returns a book when Return button is clicked', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockReturnBook.mockResolvedValue({});

    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    const returnButtons = screen.getAllByText('Return');
    fireEvent.click(returnButtons[0]);

    expect(mockReturnBook).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('Book returned successfully')).toBeInTheDocument();
    });
  });

  it('shows error toast when return fails', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockReturnBook.mockRejectedValue(new Error('Return failed'));

    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    const returnButtons = screen.getAllByText('Return');
    fireEvent.click(returnButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Return failed')).toBeInTheDocument();
    });
  });

  it('opens borrow modal and borrows a book', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockBorrow.mockResolvedValue({ id: 4, status: 'BORROWED' });

    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    await user.click(screen.getByText('Borrow Book'));

    expect(screen.getByText('Borrow a Book')).toBeInTheDocument();

    const comboboxes = screen.getAllByRole('combobox');
    await user.selectOptions(comboboxes[0], '1'); // User: Harsh
    await user.selectOptions(comboboxes[1], '1'); // Book: Clean Code

    expect(await screen.findByText('Borrow Summary')).toBeInTheDocument();

    await user.click(screen.getByText('Confirm Borrow'));

    await waitFor(() => {
      expect(mockBorrow).toHaveBeenCalledWith({
        userId: 1,
        bookId: 1,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Book borrowed successfully')).toBeInTheDocument();
    });
  });

  it('shows error toast when borrow fails', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockBorrow.mockRejectedValue(new Error('Borrow failed'));

    renderBorrowRecords();

    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    await user.click(screen.getByText('Borrow Book'));

    const comboboxes = screen.getAllByRole('combobox');
    await user.selectOptions(comboboxes[0], '1');
    await user.selectOptions(comboboxes[1], '1');

    await user.click(screen.getByText('Confirm Borrow'));

    await waitFor(() => {
      expect(screen.getByText('Borrow failed')).toBeInTheDocument();
    });
  });

  it('opens borrow modal via URL param ?action=borrow', async () => {
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockResolvedValue(mockBooks);
    renderBorrowRecords(['/borrow-records?action=borrow']);
    expect(await screen.findByText('Borrow a Book')).toBeInTheDocument();
  });

  it('closes borrow modal with Cancel button', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockResolvedValue(mockBooks);

    renderBorrowRecords();
    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    await user.click(screen.getByText('Borrow Book'));
    expect(await screen.findByText('Borrow a Book')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText('Borrow a Book')).not.toBeInTheDocument();
    });
  });

  it('shows "Processing..." on borrow button while submitting', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockResolvedValue(mockRecords);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockResolvedValue(mockBooks);
    mockBorrow.mockReturnValue(new Promise(() => {}));

    renderBorrowRecords();
    expect(await screen.findByText('Test Driven Development')).toBeInTheDocument();

    await user.click(screen.getByText('Borrow Book'));

    const comboboxes = screen.getAllByRole('combobox');
    await user.selectOptions(comboboxes[0], '1'); // Select user
    await user.selectOptions(comboboxes[1], '1'); // Select book

    // Borrow summary should confirm selections
    expect(await screen.findByText('Borrow Summary')).toBeInTheDocument();

    // Click Confirm Borrow - this triggers handleBorrow which hangs (mock never resolves)
    await user.click(screen.getByText('Confirm Borrow'));

    expect(await screen.findByText('Processing...')).toBeInTheDocument();
  });

  it('shows message when no books are available for borrowing', async () => {
    mockGetHistory.mockResolvedValue([]);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockResolvedValue([]); // No available books

    renderBorrowRecords();

    expect(await screen.findByText('No borrow records yet')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Borrow Book'));

    expect(await screen.findByText('No books are currently available for borrowing.')).toBeInTheDocument();
  });

  it('shows error toast when borrow modal fails to load books', async () => {
    mockGetHistory.mockResolvedValue([]);
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetAllBooks.mockRejectedValue(new Error('Failed to load books'));

    renderBorrowRecords();
    expect(await screen.findByText('No borrow records yet')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Borrow Book'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load form data')).toBeInTheDocument();
    });
  });

  it('dismisses toast by clicking the close button', async () => {
    mockGetHistory.mockRejectedValue(new Error('Test borrow error'));
    mockGetAllUsers.mockResolvedValue(mockUsers);

    renderBorrowRecords();
    expect(await screen.findByText('Test borrow error')).toBeInTheDocument();

    const toastContainer = screen.getByText('Test borrow error').closest('.fixed');
    if (toastContainer) {
      const closeBtn = toastContainer.querySelector('button');
      if (closeBtn) fireEvent.click(closeBtn);
    }

    await waitFor(() => {
      expect(screen.queryByText('Test borrow error')).not.toBeInTheDocument();
    });
  });
});
