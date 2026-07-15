import type { BorrowStatus } from '../../types/borrow';

interface StatusBadgeProps {
  status: BorrowStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isBorrowed = status === 'BORROWED';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isBorrowed
          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isBorrowed ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />
      {isBorrowed ? 'Borrowed' : 'Returned'}
    </span>
  );
}
