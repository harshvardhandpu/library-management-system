import { Menu, Library } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  title: string;
}

export function Navbar({ onToggleSidebar, title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-surface-200 bg-white px-6">
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 text-sm text-surface-500">
        <Library className="h-4 w-4" />
        <span>/</span>
        <span className="font-medium text-surface-900">{title}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-primary-700">API Connected</span>
        </div>
      </div>
    </header>
  );
}
