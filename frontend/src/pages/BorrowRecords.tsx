import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  ClipboardList,
  BookOpen,
  Users,
  Search,
  X,
} from 'lucide-react';
import { borrowService } from '../services/borrowService';
import { bookService } from '../services/bookService';
import { userService } from '../services/userService';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Toast, type ToastData } from '../components/ui/Toast';
import { extractErrorMessage } from '../config/api';
import type { BorrowRecordResponse } from '../types/borrow';
import type { BookResponse } from '../types/book';
import type { UserResponse } from '../types/user';

export function BorrowRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastData | null>(null);

  // Borrow modal state
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      const [data, usersData] = await Promise.all([
        borrowService.getHistory(),
        userService.getAll(),
      ]);
      setRecords(data);
      setUsers(usersData);
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle URL params for borrow action
  useEffect(() => {
    if (searchParams.get('action') === 'borrow') {
      openBorrowModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const filteredRecords = records.filter(
    (record) =>
      record.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      record.userName.toLowerCase().includes(search.toLowerCase())
  );

  async function openBorrowModal() {
    setBorrowModalOpen(true);
    setSelectedBookId('');
    setSelectedUserId('');
    try {
      const booksData = await bookService.getAll();
      setBooks(booksData.filter((b) => b.availableQuantity > 0));
      setAvailableUsers(users);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load form data' });
    }
  }

  async function handleBorrow(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookId || !selectedUserId) return;

    setBorrowing(true);
    try {
      await borrowService.borrow({
        userId: Number(selectedUserId),
        bookId: Number(selectedBookId),
      });
      setToast({ type: 'success', message: 'Book borrowed successfully' });
      setBorrowModalOpen(false);
      await loadRecords();
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setBorrowing(false);
    }
  }

  async function handleReturn(recordId: number) {
    try {
      await borrowService.returnBook(recordId);
      setToast({ type: 'success', message: 'Book returned successfully' });
      await loadRecords();
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    }
  }

  const activeRecords = records.filter((r) => r.status === 'BORROWED');
  const returnedRecords = records.filter((r) => r.status === 'RETURNED');

  if (loading) return <LoadingSpinner message="Loading borrow records..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Borrow Records</h1>
          <p className="mt-1 text-sm text-surface-500">
            {activeRecords.length} active borrow{activeRecords.length !== 1 ? 's' : ''} ·{' '}
            {records.length} total record{records.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openBorrowModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Borrow Book
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{activeRecords.length}</p>
              <p className="text-xs text-surface-500">Currently Borrowed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{returnedRecords.length}</p>
              <p className="text-xs text-surface-500">Returned</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{users.length}</p>
              <p className="text-xs text-surface-500">Library Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search by book title or user name..."
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

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        search ? (
          <EmptyState
            title="No records found"
            description={`No results for "${search}". Try a different search term.`}
          />
        ) : (
          <EmptyState
            title="No borrow records yet"
            description="Borrow a book to get started."
            icon={<ClipboardList className="h-16 w-16" strokeWidth={1} />}
          />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Book
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Borrower
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 sm:table-cell">
                    Borrow Date
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 md:table-cell">
                    Return Date
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="transition-colors hover:bg-surface-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-surface-900">
                        {record.bookTitle}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-surface-600">{record.userName}</p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <p className="text-sm text-surface-600">
                        {new Date(record.borrowDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <p className="text-sm text-surface-600">
                        {record.returnDate
                          ? new Date(record.returnDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {record.status === 'BORROWED' && (
                        <button
                          onClick={() => handleReturn(record.id)}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      <Modal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        title="Borrow a Book"
        size="md"
      >
        <form onSubmit={handleBorrow} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Select User <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Select Book <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              required
              className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Choose a book...</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} — {book.availableQuantity} available
                </option>
              ))}
            </select>
            {books.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">
                No books are currently available for borrowing.
              </p>
            )}
          </div>

          {selectedBookId && selectedUserId && (
            <div className="rounded-lg bg-surface-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
                Borrow Summary
              </h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>
                  <span className="font-medium">User:</span>{' '}
                  {availableUsers.find((u) => u.id === Number(selectedUserId))?.name}
                </p>
                <p>
                  <span className="font-medium">Book:</span>{' '}
                  {books.find((b) => b.id === Number(selectedBookId))?.title}
                </p>
                <p>
                  <span className="font-medium">Borrow Date:</span>{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setBorrowModalOpen(false)}
              className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={borrowing || !selectedBookId || !selectedUserId}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {borrowing ? 'Processing...' : 'Confirm Borrow'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
