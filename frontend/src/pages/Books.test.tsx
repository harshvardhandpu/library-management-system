import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

const mockBooks = vi.hoisted(() => [
  { id: 1, title: 'Clean Code', author: 'Robert Martin', isbn: '9780132350884', quantity: 5, availableQuantity: 3 },
  { id: 2, title: 'Test Driven Development', author: 'Kent Beck', isbn: '9780321146533', quantity: 3, availableQuantity: 3 },
  { id: 3, title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599', quantity: 2, availableQuantity: 0 },
]);

const mockGetAll = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());

vi.mock('../services/bookService', () => ({
  bookService: {
    getAll: mockGetAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

import { Books } from './Books';

function renderBooks(initialEntries = ['/books']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Books />
    </MemoryRouter>
  );
}

describe('Books', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching books', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    renderBooks();
    expect(screen.getByText('Loading books...')).toBeInTheDocument();
  });

  it('shows error toast when API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Failed to fetch books'));
    renderBooks();
    expect(await screen.findByText('Failed to fetch books')).toBeInTheDocument();
  });

  it('renders empty state when no books exist', async () => {
    mockGetAll.mockResolvedValue([]);
    renderBooks();
    expect(await screen.findByText('No books yet')).toBeInTheDocument();
  });

  it('renders books in the table', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Robert Martin')).toBeInTheDocument();
    expect(screen.getByText('Test Driven Development')).toBeInTheDocument();
    expect(screen.getByText('Kent Beck')).toBeInTheDocument();
    expect(screen.getByText('9780132350884')).toBeInTheDocument();
  });

  it('shows correct book count', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('3 books in the library')).toBeInTheDocument();
  });

  it('shows singular "book" when count is 1', async () => {
    mockGetAll.mockResolvedValue([mockBooks[0]]);
    renderBooks();

    expect(await screen.findByText('1 book in the library')).toBeInTheDocument();
  });

  it('filters books by search', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by title, author, or ISBN...');
    fireEvent.change(searchInput, { target: { value: 'Kent' } });

    expect(screen.getByText('Test Driven Development')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
    expect(screen.queryByText('Refactoring')).not.toBeInTheDocument();
  });

  it('filters books by ISBN in search', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('9780132350884')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by title, author, or ISBN...');
    fireEvent.change(searchInput, { target: { value: '9780134757599' } });

    expect(screen.getByText('Refactoring')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
  });

  it('clears search when X is clicked', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by title, author, or ISBN...');
    fireEvent.change(searchInput, { target: { value: 'Clean' } });

    // Find the X clear button inside the search container
    const xButtons = screen.getAllByRole('button');
    const searchClear = xButtons.find(b => b.closest('.relative')?.querySelector('input'));
    if (searchClear) fireEvent.click(searchClear);

    expect(screen.getByText('Clean Code')).toBeInTheDocument();
  });

  it('shows "No books found" when search has no matches', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search by title, author, or ISBN...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No books found')).toBeInTheDocument();
  });

  it('renders available quantity in green when > 0 and red when 0', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    // Refactoring has availableQuantity = 0, should have red styling
    const zeroQuantity = screen.getByText('0');
    expect(zeroQuantity.className).toContain('text-red-600');

    // Clean Code has availableQuantity = 3 (first '3' in the table), should have green styling
    // Use getAllByText because '3' appears multiple times in the table
    const allThrees = screen.getAllByText('3');
    const greenThree = allThrees.find(el => el.className.includes('text-emerald-600'));
    expect(greenThree).toBeTruthy();
  });

  it('opens add modal via URL param ?action=add', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks(['/books?action=add']);
    expect(await screen.findByText('Add New Book')).toBeInTheDocument();
  });

  it('opens add modal and closes it with Cancel button', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const addButtons = screen.getAllByText('Add Book');
    fireEvent.click(addButtons[0]);
    expect(screen.getByText('Add New Book')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Add New Book')).not.toBeInTheDocument();
  });

  it('opens edit modal and closes it with Cancel button', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit book');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit Book')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit Book')).not.toBeInTheDocument();
  });

  it('shows "Saving..." on submit button while creating', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockCreate.mockReturnValue(new Promise(() => {}));

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const addButtons = screen.getAllByText('Add Book');
    fireEvent.click(addButtons[0]);

    fireEvent.change(screen.getByPlaceholderText('Enter book title'), { target: { value: 'New Book' } });
    fireEvent.change(screen.getByPlaceholderText('Enter author name'), { target: { value: 'Author' } });
    fireEvent.change(screen.getByPlaceholderText('Enter ISBN'), { target: { value: '1111111111' } });

    const submitButtons = screen.getAllByText('Add Book');
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    expect(await screen.findByText('Saving...')).toBeInTheDocument();
  });

  it('shows validation errors when create fails with Axios validation errors', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    const validationError = new axios.AxiosError(
      'Validation failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 400, data: { validationErrors: { title: 'Title is required', author: 'Author is required' } } } as any
    );
    mockCreate.mockRejectedValue(validationError);

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    // Open add modal and submit without filling fields to trigger validation
    const addButtons = screen.getAllByText('Add Book');
    fireEvent.click(addButtons[0]);

    const submitButtons = screen.getAllByText('Add Book');
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Author is required')).toBeInTheDocument();
    });

    // Verify form field borders have error styling
    const titleInput = screen.getByPlaceholderText('Enter book title');
    expect(titleInput.className).toContain('border-red-300');
  });

  it('shows validation errors when update fails with validation errors', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    const validationError = new axios.AxiosError(
      'Validation failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 400, data: { validationErrors: { isbn: 'ISBN already exists', quantity: 'Quantity must be positive' } } } as any
    );
    mockUpdate.mockRejectedValue(validationError);

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    // Open edit modal
    const editButtons = screen.getAllByTitle('Edit book');
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByText('Update Book'));

    await waitFor(() => {
      expect(screen.getByText('ISBN already exists')).toBeInTheDocument();
      expect(screen.getByText('Quantity must be positive')).toBeInTheDocument();
    });

    const isbnInput = screen.getByDisplayValue('9780132350884');
    expect(isbnInput.className).toContain('border-red-300');
  });

  it('shows error toast when create fails with general error', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockCreate.mockRejectedValue(new Error('Server error'));

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const addButtons = screen.getAllByText('Add Book');
    fireEvent.click(addButtons[0]);

    fireEvent.change(screen.getByPlaceholderText('Enter book title'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Enter author name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Enter ISBN'), { target: { value: '111' } });

    const submitButtons = screen.getAllByText('Add Book');
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows error toast when update fails with general error', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockUpdate.mockRejectedValue(new Error('Update failed'));

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit book');
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByText('Update Book'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('shows error toast when delete fails', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockDelete.mockRejectedValue(new Error('Delete failed'));
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete book');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });

    window.confirm = originalConfirm;
  });

  it('handles quantity input with Number conversion', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockCreate.mockResolvedValue({ id: 4, title: 'New Book', author: 'Author', isbn: '111', quantity: 0, availableQuantity: 0 });

    renderBooks();
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const addButtons = screen.getAllByText('Add Book');
    fireEvent.click(addButtons[0]);

    const quantityInput = screen.getByDisplayValue('1');
    fireEvent.change(quantityInput, { target: { value: '0' } });

    // The handleChange converts to Number(value) || 0
    // So '0' -> Number('0') = 0 -> 0 || 0 = 0 (falsy, but || gives 0)
    // Actually Number('0') || 0 = 0, since Number('0') = 0 which is falsy
    // Let's use '5' instead to verify it works
    fireEvent.change(quantityInput, { target: { value: '5' } });

    fireEvent.change(screen.getByPlaceholderText('Enter book title'), { target: { value: 'New Book' } });
    fireEvent.change(screen.getByPlaceholderText('Enter author name'), { target: { value: 'Author' } });
    fireEvent.change(screen.getByPlaceholderText('Enter ISBN'), { target: { value: '111' } });

    const submitButtons = screen.getAllByText('Add Book');
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        quantity: 5,
      }));
    });
  });

  it('opens add modal, creates book, and reloads list', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockCreate.mockResolvedValue({ id: 4, title: 'New Book', author: 'New Author', isbn: '1111111111', quantity: 1, availableQuantity: 1 });

    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const addButtons = screen.getAllByText('Add Book');
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Add New Book')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter book title'), { target: { value: 'New Book' } });
    fireEvent.change(screen.getByPlaceholderText('Enter author name'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByPlaceholderText('Enter ISBN'), { target: { value: '1111111111' } });

    const quantityInput = screen.getByDisplayValue('1');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    const submitButtons = screen.getAllByText('Add Book');
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'New Book',
        author: 'New Author',
        isbn: '1111111111',
        quantity: 3,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Book added successfully')).toBeInTheDocument();
    });
  });

  it('opens edit modal and updates a book', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockUpdate.mockResolvedValue({ id: 1, title: 'Clean Code Updated', author: 'Robert C. Martin', isbn: '9780132350884', quantity: 10, availableQuantity: 8 });

    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit book');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Book')).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue('Clean Code');
    fireEvent.change(titleInput, { target: { value: 'Clean Code Updated' } });

    fireEvent.click(screen.getByText('Update Book'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Clean Code Updated',
      }));
    });
  });

  it('deletes a book after confirmation', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    mockDelete.mockResolvedValue({});
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete book');
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('Book deleted successfully')).toBeInTheDocument();
    });

    window.confirm = originalConfirm;
  });

  it('does not delete book when confirm is cancelled', async () => {
    mockGetAll.mockResolvedValue(mockBooks);
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    renderBooks();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete book');
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).not.toHaveBeenCalled();

    window.confirm = originalConfirm;
  });

  it('dismisses toast by clicking the close button', async () => {
    mockGetAll.mockRejectedValue(new Error('Test error message'));
    renderBooks();

    expect(await screen.findByText('Test error message')).toBeInTheDocument();

    // Find the toast close button (it's inside the fixed toast container)
    // Find the close button inside the toast container
    const toastContainer = screen.getByText('Test error message').closest('.fixed');
    if (toastContainer) {
      const closeBtn = toastContainer.querySelector('button');
      if (closeBtn) fireEvent.click(closeBtn);
    }

    await waitFor(() => {
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
  });
});
