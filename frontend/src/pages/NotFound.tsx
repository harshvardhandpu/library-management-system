import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-6 text-surface-300">
        <FileQuestion className="h-24 w-24" strokeWidth={1} />
      </div>
      <h1 className="text-4xl font-bold text-surface-900">404</h1>
      <p className="mt-2 text-lg text-surface-500">Page not found</p>
      <p className="mt-1 text-sm text-surface-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
