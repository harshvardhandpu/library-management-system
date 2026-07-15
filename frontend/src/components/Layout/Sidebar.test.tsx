import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

function renderSidebar(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders the brand name and subtitle', () => {
    renderSidebar();
    expect(screen.getByText('LibManage')).toBeInTheDocument();
    expect(screen.getByText('Library System')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Borrow Records')).toBeInTheDocument();
  });

  it('renders the footer with version', () => {
    renderSidebar();
    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
    expect(screen.getByText(/Placement Project/)).toBeInTheDocument();
  });

  it('highlights the active nav link based on current route', () => {
    renderSidebar('/books');
    const links = screen.getAllByRole('link');

    const dashboardLink = links.find((l) => l.textContent?.includes('Dashboard'));
    const booksLink = links.find((l) => l.textContent?.includes('Books'));

    // Dashboard is NOT active (we're on /books, and Dashboard is only active on exact /)
    expect(dashboardLink).not.toHaveClass('bg-sidebar-active');
    expect(dashboardLink).toHaveClass('text-primary-200');

    // Books IS active
    expect(booksLink).toHaveClass('bg-sidebar-active');
    expect(booksLink).toHaveClass('text-white');
  });

  it('sets Dashboard as active only on the exact root path', () => {
    renderSidebar('/');
    const links = screen.getAllByRole('link');
    const dashboardLink = links.find((l) => l.textContent?.includes('Dashboard'));
    expect(dashboardLink).toHaveClass('bg-sidebar-active');
  });

  it('does not mark Dashboard active on a sub-route that starts with /', () => {
    renderSidebar('/books');
    const links = screen.getAllByRole('link');
    const dashboardLink = links.find((l) => l.textContent?.includes('Dashboard'));
    expect(dashboardLink).not.toHaveClass('bg-sidebar-active');
  });

  it('renders all nav links with correct hrefs', () => {
    renderSidebar();
    const links = screen.getAllByRole('link');

    const dashboardLink = links.find((l) => l.textContent?.includes('Dashboard'));
    const booksLink = links.find((l) => l.textContent?.includes('Books'));
    const usersLink = links.find((l) => l.textContent?.includes('Users'));
    const borrowRecordsLink = links.find((l) => l.textContent?.includes('Borrow Records'));

    expect(dashboardLink).toHaveAttribute('href', '/');
    expect(booksLink).toHaveAttribute('href', '/books');
    expect(usersLink).toHaveAttribute('href', '/users');
    expect(borrowRecordsLink).toHaveAttribute('href', '/borrow-records');
  });

  it('applies hover styling to inactive nav links', () => {
    renderSidebar('/');
    const links = screen.getAllByRole('link');

    // On Dashboard route, Books should have inactive styling
    const booksLink = links.find((l) => l.textContent?.includes('Books'));
    expect(booksLink).toHaveClass('hover:bg-sidebar-hover');
    expect(booksLink).toHaveClass('hover:text-white');
  });

  it('renders SVG icons for each nav item', () => {
    renderSidebar();
    const svgs = document.querySelectorAll('svg');
    // 1 brand icon + 4 nav item icons = 5 SVGs
    expect(svgs.length).toBeGreaterThanOrEqual(5);
  });

  it('renders sidebar as a fixed element with correct width class', () => {
    const { container } = renderSidebar();
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-64');
    expect(aside).toHaveClass('fixed');
    expect(aside).toHaveClass('h-screen');
  });
});
