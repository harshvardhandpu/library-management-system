import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Users as UsersIcon, X } from 'lucide-react';
import { userService } from '../services/userService';
import { borrowService } from '../services/borrowService';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Toast, type ToastData } from '../components/ui/Toast';
import { extractErrorMessage, extractValidationErrors } from '../config/api';
import type { UserResponse, UserFormData } from '../types/user';
import type { BorrowRecordResponse } from '../types/borrow';

const emptyForm: UserFormData = { name: '', email: '', phone: '' };

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [userRecords, setUserRecords] = useState<BorrowRecordResponse[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle URL params for add action
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)
  );

  function openAddModal() {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(user: UserResponse) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  async function openDetails(user: UserResponse) {
    setSelectedUser(user);
    setDetailsOpen(true);
    setRecordsLoading(true);
    try {
      const records = await borrowService.getHistoryByUser(user.id);
      setUserRecords(records);
    } catch (err) {
      setUserRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        setToast({ type: 'success', message: 'User updated successfully' });
      } else {
        await userService.create(formData);
        setToast({ type: 'success', message: 'User registered successfully' });
      }
      closeModal();
      await loadUsers();
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

  async function handleDelete(user: UserResponse) {
    if (!window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await userService.delete(user.id);
      setToast({ type: 'success', message: 'User deleted successfully' });
      await loadUsers();
    } catch (err) {
      setToast({ type: 'error', message: extractErrorMessage(err) });
    }
  }

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Users</h1>
          <p className="mt-1 text-sm text-surface-500">
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
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

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        search ? (
          <EmptyState
            title="No users found"
            description={`No results for "${search}". Try a different search term.`}
          />
        ) : (
          <EmptyState
            title="No users yet"
            description="Register your first library user to get started."
            icon={<UsersIcon className="h-16 w-16" strokeWidth={1} />}
          />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Email
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 sm:table-cell">
                    Phone
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-surface-50">
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetails(user)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {user.name}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-surface-600">{user.email}</p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <p className="text-sm text-surface-500">{user.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-red-600"
                          title="Delete user"
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
        title={editingUser ? 'Edit User' : 'Register New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 ${
                formErrors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
              placeholder="Enter full name"
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 ${
                formErrors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
              placeholder="email@example.com"
            />
            {formErrors.email && (
              <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 ${
                formErrors.phone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
              placeholder="+1234567890"
            />
            {formErrors.phone && (
              <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
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
              {saving ? 'Saving...' : editingUser ? 'Update User' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={`Borrow History: ${selectedUser?.name || ''}`}
        size="lg"
      >
        {recordsLoading ? (
          <LoadingSpinner size="sm" message="Loading borrow history..." />
        ) : userRecords.length === 0 ? (
          <EmptyState
            title="No borrow history"
            description="This user hasn't borrowed any books yet."
          />
        ) : (
          <div className="space-y-3">
            {userRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-surface-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    {record.bookTitle}
                  </p>
                  <p className="text-xs text-surface-500">
                    Borrowed: {new Date(record.borrowDate).toLocaleDateString()}
                    {record.returnDate &&
                      ` | Returned: ${new Date(record.returnDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    record.status === 'BORROWED'
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      record.status === 'BORROWED' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  {record.status === 'BORROWED' ? 'Borrowed' : 'Returned'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
