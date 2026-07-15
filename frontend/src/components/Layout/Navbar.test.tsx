import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the title prop', () => {
    render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders different titles', () => {
    const { rerender } = render(<Navbar onToggleSidebar={() => {}} title="Books" />);
    expect(screen.getByText('Books')).toBeInTheDocument();

    rerender(<Navbar onToggleSidebar={() => {}} title="Users" />);
    expect(screen.getByText('Users')).toBeInTheDocument();

    rerender(<Navbar onToggleSidebar={() => {}} title="Borrow Records" />);
    expect(screen.getByText('Borrow Records')).toBeInTheDocument();
  });

  it('renders the Library icon in breadcrumb', () => {
    render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the breadcrumb separator (/)', () => {
    render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    // There's a "/" text node between the icon and title
    const container = screen.getByText('Dashboard').closest('header')!;
    expect(container.textContent).toContain('/');
  });

  it('renders the API Connected status badge', () => {
    render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    expect(screen.getByText('API Connected')).toBeInTheDocument();
  });

  it('renders a pulsing dot in the API status badge', () => {
    render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    const badge = screen.getByText('API Connected').closest('div')!;
    const dot = badge.querySelector('span');
    expect(dot).toHaveClass('animate-pulse');
    expect(dot).toHaveClass('bg-emerald-500');
    expect(dot).toHaveClass('rounded-full');
  });

  it('calls onToggleSidebar when the hamburger menu button is clicked', () => {
    const onToggle = vi.fn();
    render(<Navbar onToggleSidebar={onToggle} title="Dashboard" />);

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(onToggle).toHaveBeenCalledTimes(1);

    fireEvent.click(menuButton);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('hides the hamburger button on large screens (lg:hidden)', () => {
    render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    const menuButton = screen.getByRole('button');
    expect(menuButton.className).toContain('lg:hidden');
  });

  it('renders a sticky header with correct height', () => {
    const { container } = render(<Navbar onToggleSidebar={() => {}} title="Dashboard" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('h-16');
    expect(header).toHaveClass('top-0');
  });
});
