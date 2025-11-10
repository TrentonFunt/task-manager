import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
    onCancel = vi.fn();
  });

  const renderForm = () => render(<TaskForm onSubmit={onSubmit} onCancel={onCancel} />);

  it('validates required fields and shows error messages', async () => {
    renderForm();
    const title = screen.getByLabelText(/title/i) as HTMLInputElement;
    const desc = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const submit = screen.getByRole('button', { name: /create new task/i });

    // Try to submit with empty fields
    fireEvent.click(submit);
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();

    // Too short values
    fireEvent.change(title, { target: { value: 'ab' } });
    fireEvent.change(desc, { target: { value: 'too short' } });
    fireEvent.click(submit);
    expect(await screen.findByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/description must be at least 10 characters/i)).toBeInTheDocument();
  });

  it('submits valid form, calls onSubmit with values, and resets form', async () => {
    renderForm();
    const title = screen.getByLabelText(/title/i) as HTMLInputElement;
    const desc = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const category = screen.getByLabelText(/category/i) as HTMLSelectElement;
    const priority = screen.getByLabelText(/priority/i) as HTMLSelectElement;
    const dueDate = screen.getByLabelText(/due date/i) as HTMLInputElement;
    const submit = screen.getByRole('button', { name: /create new task/i });

    fireEvent.change(title, { target: { value: 'New Task' } });
    fireEvent.change(desc, { target: { value: 'This is a brand new valid task description' } });
    fireEvent.change(category, { target: { value: 'Work' } });
    fireEvent.change(priority, { target: { value: 'high' } });
    fireEvent.change(dueDate, { target: { value: '2025-12-31' } });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'This is a brand new valid task description',
        category: 'Work',
        priority: 'high',
        dueDate: '2025-12-31',
      });
    });

    // After successful submit, form resets
    expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe('');
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('Personal');
    expect((screen.getByLabelText(/priority/i) as HTMLSelectElement).value).toBe('medium');
    // Due date resets to today; assert it is non-empty
    expect((screen.getByLabelText(/due date/i) as HTMLInputElement).value).not.toBe('');
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel task creation/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
