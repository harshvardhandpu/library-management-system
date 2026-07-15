import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    // Backdrop is the first child div with absolute positioning
    const backdrop = document.querySelector('.fixed.inset-0.z-50 > div');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders children inside the modal', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <div data-testid="child">Child element</div>
      </Modal>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('does not call onClose for non-Escape keys', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies sm size class when size="sm"', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test" size="sm">
        <p>Content</p>
      </Modal>
    );
    const modalContent = document.querySelector('.relative.w-full');
    expect(modalContent?.className).toContain('max-w-md');
  });

  it('applies lg size class when size="lg"', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test" size="lg">
        <p>Content</p>
      </Modal>
    );
    const modalContent = document.querySelector('.relative.w-full');
    expect(modalContent?.className).toContain('max-w-2xl');
  });
});
