import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

const mockUsers = vi.hoisted(() => [
  { id: 1, name: 'Harsh', email: 'harsh@example.com', phone: '9876543210' },
  { id: 2, name: 'Alice', email: 'alice@example.com', phone: '9123456789' },
  { id: 3, name: 'Bob', email: 'bob@example.com', phone: '9988776655' },
]);

const mockBorrowRecords = vi.hoisted(() => [
  {
    id: 10, borrowDate: '2026-07-10T10:00:00', returnDate: null,
    status: 'BORROWED' as const, userId: 1, userName: 'Harsh',
    bookId: 2, bookTitle: 'Test Driven Development',
  },
  {
    id: 11, borrowDate: '2026-07-05T10:00:00', returnDate: '2026-07-12T10:00:00',
    status: 'RETURNED' as const, userId: 1, userName: 'Harsh',
    bookId: 1, bookTitle: 'Clean Code',
  },
]);

const mockGetAllUsers = vi.hoisted(() => vi.fn());
const mockCreateUser = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());
const mockDeleteUser = vi.hoisted(() => vi.fn());
const mockGetHistoryByUser = vi.hoisted(() => vi.fn());

vi.mock('../services/userService', () => ({
  userService: {
    getAll: mockGetAllUsers,
    create: mockCreateUser,
    update: mockUpdateUser,
    delete: mockDeleteUser,
  },
}));
vi.mock('../services/borrowService', () => ({
  borrowService: {
    getHistoryByUser: mockGetHistoryByUser,
  },
}));

import { UsersPage } from './Users';

function renderUsers(initialEntries = ['/users']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <UsersPage />
    </MemoryRouter>
  );
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching users', () => {
    mockGetAllUsers.mockReturnValue(new Promise(() => {}));
    renderUsers();
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('shows error toast when API fails', async () => {
    mockGetAllUsers.mockRejectedValue(new Error('Failed to fetch users'));
    renderUsers();
    expect(await screen.findByText('Failed to fetch users')).toBeInTheDocument();
  });

  it('renders empty state when no users exist', async () => {
    mockGetAllUsers.mockResolvedValue([]);
    renderUsers();
    expect(await screen.findByText('No users yet')).toBeInTheDocument();
  });

  it('renders users in the table', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });

  it('shows correct user count', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('3 registered users')).toBeInTheDocument();
  });

  it('shows singular "user" when count is 1', async () => {
    mockGetAllUsers.mockResolvedValue([mockUsers[0]]);
    renderUsers();

    expect(await screen.findByText('1 registered user')).toBeInTheDocument();
  });

  it('filters users by search (name)', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Harsh')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('filters users by search (email)', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...');
    fireEvent.change(searchInput, { target: { value: 'bob@example.com' } });

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Harsh')).not.toBeInTheDocument();
  });

  it('filters users by search (phone)', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...');
    fireEvent.change(searchInput, { target: { value: '9123456789' } });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Harsh')).not.toBeInTheDocument();
  });

  it('shows "No users found" when search has no matches', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('opens add modal via URL param ?action=add', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers(['/users?action=add']);
    expect(await screen.findByText('Register New User')).toBeInTheDocument();
  });

  it('opens add modal and closes it with Cancel button', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add User'));
    expect(screen.getByText('Register New User')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Register New User')).not.toBeInTheDocument();
  });

  it('opens edit modal and closes it with Cancel button', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
  });

  it('shows "Saving..." on submit button while creating', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockCreateUser.mockReturnValue(new Promise(() => {}));

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add User'));

    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByPlaceholderText('email@example.com'), { target: { value: 'charlie@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('+1234567890'), { target: { value: '9111111111' } });

    fireEvent.click(screen.getByText('Register User'));

    expect(await screen.findByText('Saving...')).toBeInTheDocument();
  });

  it('shows validation errors when create fails with Axios validation errors', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    const validationError = new axios.AxiosError(
      'Validation failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 400, data: { validationErrors: { email: 'Email already in use', name: 'Name is required' } } } as any
    );
    mockCreateUser.mockRejectedValue(validationError);

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add User'));

    fireEvent.click(screen.getByText('Register User'));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Enter full name');
    expect(nameInput.className).toContain('border-red-300');
  });

  it('shows validation errors when update fails with validation errors', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    const validationError = new axios.AxiosError(
      'Validation failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 400, data: { validationErrors: { phone: 'Invalid phone number' } } } as any
    );
    mockUpdateUser.mockRejectedValue(validationError);

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByText('Update User'));

    await waitFor(() => {
      expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
    });

    const phoneInput = screen.getByDisplayValue('9876543210');
    expect(phoneInput.className).toContain('border-red-300');
  });

  it('shows error toast when create fails with general error', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockCreateUser.mockRejectedValue(new Error('Server error'));

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add User'));

    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('email@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('+1234567890'), { target: { value: '1111111111' } });

    fireEvent.click(screen.getByText('Register User'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows error toast when update fails with general error', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockUpdateUser.mockRejectedValue(new Error('Update failed'));

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByText('Update User'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('shows error toast when delete fails', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockDeleteUser.mockRejectedValue(new Error('Delete failed'));
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete user');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });

    window.confirm = originalConfirm;
  });

  it('shows empty state in user details when no borrow history (and modal can be dismissed)', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistoryByUser.mockResolvedValue([]);

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Harsh'));
    expect(await screen.findByText('No borrow history')).toBeInTheDocument();

    // Verify modal title is shown
    expect(screen.getByText('Borrow History: Harsh')).toBeInTheDocument();

    // Close by clicking the modal backdrop (the div with onClick={onClose})
    const modalBackdrop = document.querySelector('.fixed.inset-0.z-50 > div:first-child');
    if (modalBackdrop) {
      fireEvent.click(modalBackdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('Borrow History: Harsh')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when borrow history API fails', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistoryByUser.mockRejectedValue(new Error('Failed'));

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const nameLink = screen.getByText('Harsh');
    fireEvent.click(nameLink);

    // Should fall back to empty state when API fails
    expect(await screen.findByText('No borrow history')).toBeInTheDocument();
  });

  it('opens user details modal with borrow history (BORROWED and RETURNED)', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistoryByUser.mockResolvedValue(mockBorrowRecords);

    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const nameLink = screen.getByText('Harsh');
    fireEvent.click(nameLink);

    expect(await screen.findByText('Borrow History: Harsh')).toBeInTheDocument();
    expect(screen.getByText('Test Driven Development')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();

    // Check status badges in the details modal
    const borrowedBadges = screen.getAllByText('Borrowed');
    expect(borrowedBadges.length).toBeGreaterThanOrEqual(1);
    const returnedBadges = screen.getAllByText('Returned');
    expect(returnedBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state in user details when no borrow history', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockGetHistoryByUser.mockResolvedValue([]);

    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const nameLink = screen.getByText('Harsh');
    fireEvent.click(nameLink);

    expect(await screen.findByText('No borrow history')).toBeInTheDocument();
  });

  it('opens add modal and creates a user', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockCreateUser.mockResolvedValue({ id: 4, name: 'Charlie', email: 'charlie@example.com', phone: '9111111111' });

    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add User'));

    expect(screen.getByText('Register New User')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByPlaceholderText('email@example.com'), { target: { value: 'charlie@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('+1234567890'), { target: { value: '9111111111' } });

    fireEvent.click(screen.getByText('Register User'));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        name: 'Charlie',
        email: 'charlie@example.com',
        phone: '9111111111',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('User registered successfully')).toBeInTheDocument();
    });
  });

  it('opens edit modal and updates a user', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockUpdateUser.mockResolvedValue({ id: 1, name: 'Harsh Updated', email: 'harsh@example.com', phone: '9876543210' });

    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit User')).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Harsh');
    fireEvent.change(nameInput, { target: { value: 'Harsh Updated' } });

    fireEvent.click(screen.getByText('Update User'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Harsh Updated',
      }));
    });
  });

  it('deletes a user after confirmation', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    mockDeleteUser.mockResolvedValue({});
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete user');
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteUser).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('User deleted successfully')).toBeInTheDocument();
    });

    window.confirm = originalConfirm;
  });

  it('does not delete user when confirm is cancelled', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    renderUsers();
    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete user');
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteUser).not.toHaveBeenCalled();

    window.confirm = originalConfirm;
  });

  it('clears search when X is clicked', async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    renderUsers();

    expect(await screen.findByText('Harsh')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Harsh')).not.toBeInTheDocument();

    // Click the clear search button
    const searchContainer = searchInput.closest('.relative');
    if (searchContainer) {
      const clearBtn = searchContainer.querySelector('button');
      if (clearBtn) fireEvent.click(clearBtn);
    }

    expect(screen.getByText('Harsh')).toBeInTheDocument();
  });

  it('dismisses toast by clicking the close button', async () => {
    mockGetAllUsers.mockRejectedValue(new Error('Test user error'));
    renderUsers();

    expect(await screen.findByText('Test user error')).toBeInTheDocument();

    const toastContainer = screen.getByText('Test user error').closest('.fixed');
    if (toastContainer) {
      const closeBtn = toastContainer.querySelector('button');
      if (closeBtn) fireEvent.click(closeBtn);
    }

    await waitFor(() => {
      expect(screen.queryByText('Test user error')).not.toBeInTheDocument();
    });
  });
});
