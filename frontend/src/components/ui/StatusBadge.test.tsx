import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders "Borrowed" for BORROWED status', () => {
    render(<StatusBadge status="BORROWED" />);
    expect(screen.getByText('Borrowed')).toBeInTheDocument();
  });

  it('renders "Returned" for RETURNED status', () => {
    render(<StatusBadge status="RETURNED" />);
    expect(screen.getByText('Returned')).toBeInTheDocument();
  });

  it('applies amber styling for BORROWED status', () => {
    render(<StatusBadge status="BORROWED" />);
    const badge = screen.getByText('Borrowed');
    expect(badge.className).toContain('amber');
  });

  it('applies emerald styling for RETURNED status', () => {
    render(<StatusBadge status="RETURNED" />);
    const badge = screen.getByText('Returned');
    expect(badge.className).toContain('emerald');
  });

  it('renders a status dot indicator', () => {
    const { container } = render(<StatusBadge status="BORROWED" />);
    const dots = container.querySelectorAll('span span');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });
});
