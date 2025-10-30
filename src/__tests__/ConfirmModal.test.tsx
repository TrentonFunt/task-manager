import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../components/ConfirmModal';

describe('ConfirmModal', () => {
  it('does not render when closed', () => {
    render(
      <ConfirmModal isOpen={false} title="Title" message="Msg" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with custom texts and triggers handlers', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText="Proceed"
        cancelText="Nope"
        confirmButtonClass="bg-blue-500"
      />
    );

    const dialog = screen.getByRole('dialog', { name: /delete item/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /nope and close dialog/i }));
    expect(onCancel).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /proceed action/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
