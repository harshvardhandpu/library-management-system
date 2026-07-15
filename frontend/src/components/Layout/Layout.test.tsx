import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';

function renderLayout(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div data-testid="outlet-content">Dashboard Page</div>} />
          <Route path="books" element={<div data-testid="outlet-content">Books Page</div>} />
          <Route path="users" element={<div data-testid="outlet-content">Users Page</div>} />
          <Route path="borrow-records" element={<div data-testid="outlet-content">Borrow Records Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('renders the Sidebar by default', () => {
    renderLayout();
    expect(screen.getByText('LibManage')).toBeInTheDocument();
    // "Dashboard" appears in both sidebar nav and navbar breadcrumb
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(2);
  });

  it('renders the Navbar', () => {
    renderLayout();
    expect(screen.getByText('API Connected')).toBeInTheDocument();
  });

  it('renders child route content via Outlet', () => {
    renderLayout();
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('Dashboard Page');
  });

  it('renders different Outlet content for different routes', () => {
    renderLayout('/books');
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('Books Page');
  });

  it('maps the root path to "Dashboard" page title', () => {
    renderLayout('/');
    // "Dashboard" appears in sidebar nav and navbar breadcrumb
    const dashboards = screen.getAllByText('Dashboard');
    expect(dashboards.length).toBeGreaterThanOrEqual(2);
  });

  it('maps /books to "Books" page title', () => {
    renderLayout('/books');
    // The Sidebar also shows "Books" nav link, so there are multiple "Books" texts
    const allBooks = screen.getAllByText('Books');
    expect(allBooks.length).toBeGreaterThanOrEqual(2);
  });

  it('maps /users to "Users" page title', () => {
    renderLayout('/users');
    const allUsers = screen.getAllByText('Users');
    expect(allUsers.length).toBeGreaterThanOrEqual(2);
  });

  it('maps /borrow-records to "Borrow Records" page title', () => {
    renderLayout('/borrow-records');
    const allBorrowRecords = screen.getAllByText('Borrow Records');
    expect(allBorrowRecords.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the hamburger menu button (visible on mobile)', () => {
    renderLayout();
    const buttons = screen.getAllByRole('button');
    // The Navbar has a toggle button
    const menuButton = buttons.find((b) => b.className.includes('lg:hidden'));
    expect(menuButton).toBeInTheDocument();
  });

  it('shows the mobile overlay when sidebar is toggled open', () => {
    renderLayout();
    // Initially no overlay
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();

    // Click the menu button to open sidebar
    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find((b) => b.className.includes('lg:hidden'))!;
    fireEvent.click(menuButton);

    // Overlay should appear
    const overlay = screen.getByTestId('sidebar-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('fixed');
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('bg-black/50');
    expect(overlay).toHaveClass('lg:hidden');
  });

  it('closes sidebar when overlay is clicked', () => {
    renderLayout();

    // Open sidebar
    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find((b) => b.className.includes('lg:hidden'))!;
    fireEvent.click(menuButton);

    // Overlay should be visible
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();

    // Click the overlay to close
    fireEvent.click(screen.getByTestId('sidebar-overlay'));

    // Overlay should disappear
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });

  it('toggles sidebar state on consecutive menu button clicks', () => {
    renderLayout();

    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find((b) => b.className.includes('lg:hidden'))!;

    // First click - opens sidebar
    fireEvent.click(menuButton);
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();

    // Second click - closes sidebar
    fireEvent.click(menuButton);
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });

  it('applies translate-x-0 class to sidebar container when open', () => {
    renderLayout();

    // Find the sidebar container (the div wrapping the sidebar)
    const sidebarContainer = document.querySelector('.fixed.inset-y-0.left-0.z-40');
    expect(sidebarContainer).toBeInTheDocument();

    // Initially sidebar is hidden on mobile (translate-x-full when sidebarOpen is false)
    expect(sidebarContainer!.className).toContain('-translate-x-full');

    // Open sidebar
    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find((b) => b.className.includes('lg:hidden'))!;
    fireEvent.click(menuButton);

    // Sidebar should be visible
    expect(sidebarContainer!.className).toContain('translate-x-0');
  });

  it('always shows sidebar on large screens via lg:translate-x-0', () => {
    renderLayout();
    const sidebarContainer = document.querySelector('.fixed.inset-y-0.left-0.z-40');
    expect(sidebarContainer!.className).toContain('lg:translate-x-0');
  });

  it('renders the main content area with padding', () => {
    const { container } = renderLayout();
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-1');
    expect(main).toHaveClass('p-6');
  });

  it('applies lg:pl-64 to the content wrapper for sidebar space', () => {
    const { container } = renderLayout();
    // The flex container wrapping Navbar and main
    const contentWrapper = container.querySelector('.flex.flex-1.flex-col');
    expect(contentWrapper).toHaveClass('lg:pl-64');
  });
});
