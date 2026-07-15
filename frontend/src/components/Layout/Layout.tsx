import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/books': 'Books',
  '/users': 'Users',
  '/borrow-records': 'Borrow Records',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Library Management';

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
