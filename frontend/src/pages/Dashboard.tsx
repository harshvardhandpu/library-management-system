import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  ClipboardList,
  BookMarked,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { userService } from '../services/userService';
import { borrowService } from '../services/borrowService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { BookResponse } from '../types/book';
import type { BorrowRecordResponse } from '../types/borrow';

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeBorrows: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    availableBooks: 0,
    totalUsers: 0,
    activeBorrows: 0,
  });
  const [recentRecords, setRecentRecords] = useState<BorrowRecordResponse[]>([]);
  const [recentBooks, setRecentBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [booksRes, usersRes, recordsRes] = await Promise.all([
          bookService.getAll(),
          userService.getAll(),
          borrowService.getHistory(),
        ]);

        const totalBooks = booksRes.length;
        const availableBooks = booksRes.reduce((sum, b) => sum + b.availableQuantity, 0);
        const activeBorrows = recordsRes.filter((r) => r.status === 'BORROWED').length;

        setStats({
          totalBooks,
          availableBooks,
          totalUsers: usersRes.length,
          activeBorrows,
        });

        setRecentRecords(recordsRes.slice(0, 5));
        setRecentBooks(booksRes.slice(0, 3));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="mt-1 text-sm text-red-500">
          Make sure the backend server is running on port 8080.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      link: '/books',
    },
    {
      label: 'Available Copies',
      value: stats.availableBooks,
      icon: BookMarked,
      color: 'bg-emerald-50 text-emerald-600',
      link: '/books',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-violet-50 text-violet-600',
      link: '/users',
    },
    {
      label: 'Active Borrows',
      value: stats.activeBorrows,
      icon: ClipboardList,
      color: 'bg-amber-50 text-amber-600',
      link: '/borrow-records',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="card-hover rounded-xl border border-surface-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="mt-1 text-sm text-surface-500">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-surface-200 bg-white">
          <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-surface-900">Recent Activity</h2>
            <Link
              to="/borrow-records"
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentRecords.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-surface-300" strokeWidth={1.5} />
              <p className="mt-2 text-sm text-surface-500">No borrow activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {record.bookTitle}
                    </p>
                    <p className="text-xs text-surface-500">{record.userName}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <StatusBadge status={record.status} />
                    <span className="text-xs text-surface-400">
                      {new Date(record.borrowDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Library Status */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-xl border border-surface-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-surface-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/books?action=add"
                className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 p-4 transition-colors hover:bg-surface-50"
              >
                <BookOpen className="h-5 w-5 text-primary-600" />
                <span className="text-xs font-medium text-surface-700">Add Book</span>
              </Link>
              <Link
                to="/users?action=add"
                className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 p-4 transition-colors hover:bg-surface-50"
              >
                <Users className="h-5 w-5 text-violet-600" />
                <span className="text-xs font-medium text-surface-700">Add User</span>
              </Link>
              <Link
                to="/borrow-records?action=borrow"
                className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 p-4 transition-colors hover:bg-surface-50"
              >
                <ClipboardList className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium text-surface-700">Borrow Book</span>
              </Link>
              <Link
                to="/borrow-records"
                className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 p-4 transition-colors hover:bg-surface-50"
              >
                <BookMarked className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-medium text-surface-700">Return Book</span>
              </Link>
            </div>
          </div>

          {/* Library Books Preview */}
          <div className="rounded-xl border border-surface-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-surface-900">Library Books</h2>
              <Link
                to="/books"
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
            {recentBooks.length === 0 ? (
              <p className="mt-3 text-sm text-surface-500">No books in library</p>
            ) : (
              <div className="mt-3 space-y-3">
                {recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-surface-900">{book.title}</p>
                      <p className="text-xs text-surface-500">{book.author}</p>
                    </div>
                    <div className="ml-3 text-right">
                      <p className="text-sm font-semibold text-surface-900">{book.availableQuantity}</p>
                      <p className="text-xs text-surface-400">available</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
