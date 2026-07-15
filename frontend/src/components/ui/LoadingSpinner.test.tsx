import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders the spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render a message when not provided', () => {
    render(<LoadingSpinner />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders the message when provided', () => {
    render(<LoadingSpinner message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies small size classes when size="sm"', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-4');
    expect(spinner?.className).toContain('w-4');
  });

  it('applies medium size classes when size="md"', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-8');
    expect(spinner?.className).toContain('w-8');
  });

  it('applies large size classes when size="lg"', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-12');
    expect(spinner?.className).toContain('w-12');
  });
});
