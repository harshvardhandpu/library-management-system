import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  Library,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/books', icon: BookOpen, label: 'Books' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/borrow-records', icon: ClipboardList, label: 'Borrow Records' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
          <Library className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">LibManage</h1>
          <p className="text-xs text-primary-300">Library System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? 'bg-sidebar-active text-white shadow-sm'
                  : 'text-primary-200 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-xs text-primary-300">
          v1.0.0 &middot; Placement Project
        </p>
      </div>
    </aside>
  );
}
