import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(
      <EmptyState
        title="No data found"
        description="Try adjusting your search."
      />
    );
    expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState title="No data found" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders the default Inbox icon when no custom icon is provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a custom icon when provided', () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    const { container } = render(
      <EmptyState title="Empty" icon={<CustomIcon />} />
    );
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
  });
});
