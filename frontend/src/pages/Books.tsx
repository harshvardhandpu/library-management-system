import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  X,
} from 'lucide-react';
import { bookService } from '../services/bookService';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Toast, type ToastData } from '../components/ui/Toast';
import { extractErrorMessage, extractValidationErrors } from '../config/api';
import type { BookResponse, BookFormData } from '../types/book';

const emptyForm: BookFormData = { title: '', author: '', isbn: '', quantity: 1 };

export function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookResponse | null>(null);
  const [formData, setFormData] = useState<BookFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastData | null>(null);

  const loadBooks = useCallback(async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Handle URL params for add action
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase())
  );

  function openAddModal() {
    setEditingBook(null);
    setFormData(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(book: BookResponse) {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBook(null);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) || 0 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      if (editingBook) {
        await bookService.update(editingBook.id, formData);
        setToast({ type: 'success', message: 'Book updated successfully' });
      } else {
        await bookService.create(formData);
        setToast({ type: 'success', message: 'Book added successfully' });
      }
      closeModal();
      await loadBooks();
    } catch (err) {
      const validationErrors = extractValidationErrors(err);
      if (validationErrors) {
        setFormErrors(validationErrors);
      } else {
        setToast({ type: 'error', message: extractErrorMessage(err) });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book: BookResponse) {
    if (!window.confirm(`Delete "${book.title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await bookService.delete(book.id);
      setToast({ type: 'success', message: 'Book deleted successfully' });
      await loadBooks();
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    }
  }

  if (loading) return <LoadingSpinner message="Loading books..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Books</h1>
          <p className="mt-1 text-sm text-surface-500">
            {books.length} book{books.length !== 1 ? 's' : ''} in the library
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-surface-300 bg-white py-2.5 pl-10 pr-4 text-sm text-surface-900 placeholder-surface-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Books Table */}
      {filteredBooks.length === 0 ? (
        search ? (
          <EmptyState
            title="No books found"
            description={`No results for "${search}". Try a different search term.`}
          />
        ) : (
          <EmptyState
            title="No books yet"
            description="Get started by adding your first book."
            icon={<BookOpen className="h-16 w-16" strokeWidth={1} />}
          />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Title
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Author
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 sm:table-cell">
                    ISBN
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Total
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Available
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="transition-colors hover:bg-surface-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-surface-900">{book.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-surface-600">{book.author}</p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <code className="text-xs text-surface-500">{book.isbn}</code>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-surface-600">{book.quantity}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                          book.availableQuantity > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            book.availableQuantity > 0 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        {book.availableQuantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(book)}
                          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600"
                          title="Edit book"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book)}
                          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-red-600"
                          title="Delete book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 ${
                formErrors.title
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
              placeholder="Enter book title"
            />
            {formErrors.title && (
              <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 ${
                formErrors.author
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
              placeholder="Enter author name"
            />
            {formErrors.author && (
              <p className="mt-1 text-xs text-red-500">{formErrors.author}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 ${
                formErrors.isbn
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
              placeholder="Enter ISBN"
            />
            {formErrors.isbn && (
              <p className="mt-1 text-xs text-red-500">{formErrors.isbn}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min={1}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 ${
                formErrors.quantity
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
            {formErrors.quantity && (
              <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
