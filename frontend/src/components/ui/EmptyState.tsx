import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 text-surface-300">
        {icon || <Inbox className="h-16 w-16" strokeWidth={1} />}
      </div>
      <h3 className="text-lg font-semibold text-surface-700">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-surface-500">{description}</p>
      )}
    </div>
  );
}
