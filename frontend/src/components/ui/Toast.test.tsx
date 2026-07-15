import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('does not render when toast is null', () => {
    const { container } = render(<Toast toast={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success toast with message', () => {
    render(
      <Toast
        toast={{ type: 'success', message: 'Operation successful!' }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
  });

  it('renders error toast with message', () => {
    render(
      <Toast
        toast={{ type: 'error', message: 'Something went wrong' }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('applies success styling for success type', () => {
    render(
      <Toast
        toast={{ type: 'success', message: 'Done!' }}
        onClose={vi.fn()}
      />
    );
    const container = screen.getByText('Done!').parentElement;
    expect(container?.className).toContain('emerald');
  });

  it('applies error styling for error type', () => {
    render(
      <Toast
        toast={{ type: 'error', message: 'Failed!' }}
        onClose={vi.fn()}
      />
    );
    const container = screen.getByText('Failed!').parentElement;
    expect(container?.className).toContain('red');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Toast
        toast={{ type: 'success', message: 'Dismiss me' }}
        onClose={onClose}
      />
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after 5 seconds', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <Toast
        toast={{ type: 'success', message: 'Auto dismiss' }}
        onClose={onClose}
      />
    );
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
