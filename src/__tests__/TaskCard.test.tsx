import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskCard from '../components/TaskCard';
import type { Task } from '../types/Task';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: 'Write tests',
  description: 'Write comprehensive unit tests for components',
  category: 'engineering',
  priority: 'medium',
  dueDate: '2025-12-25',
  completed: false,
  ...overrides,
});

describe('TaskCard', () => {
  let onToggle: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;
  let onEdit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggle = vi.fn();
    onDelete = vi.fn().mockResolvedValue(undefined);
    onEdit = vi.fn().mockResolvedValue(undefined);
  });

  it('renders task info: title, description, priority, due date, category', () => {
    const task = makeTask();
    render(
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    expect(screen.getByRole('article', { name: new RegExp(`Task: ${task.title}`, 'i') })).toBeInTheDocument();
    expect(screen.getByText(task.description)).toBeInTheDocument();
    // Priority badge
    expect(screen.getByLabelText(/priority: medium/i)).toBeInTheDocument();
    // Due date label (do not assert exact format, just presence)
    expect(screen.getByLabelText(/due date:/i)).toBeInTheDocument();
    // Category chip
    expect(screen.getByLabelText(/category: engineering/i)).toBeInTheDocument();
  });

  it('calls onToggle with current completion state when clicking complete/undo', () => {
    const task = makeTask({ completed: false });
    render(
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    const toggleBtn = screen.getByRole('button', { name: /mark task as complete/i });
    expect(toggleBtn).toHaveTextContent('✓ Complete');
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith(task.id, false);
  });

  it('shows edit form and validates fields', async () => {
    const task = makeTask();
    render(
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit task/i }));

    const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/task description/i) as HTMLTextAreaElement;

    // Trigger validation errors
    fireEvent.change(titleInput, { target: { value: 'ab' } });
    fireEvent.change(descInput, { target: { value: 'too short' } });
    fireEvent.click(screen.getByRole('button', { name: /save task changes/i }));

    expect(await screen.findByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/description must be at least 10 characters/i)).toBeInTheDocument();
  });

  it('saves valid edits and calls onEdit with updated fields', async () => {
    const task = makeTask();
    render(
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit task/i }));

    const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/task description/i) as HTMLTextAreaElement;
    const prioritySelect = screen.getByLabelText(/task priority/i) as HTMLSelectElement;
    const dateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Updated title' } });
    fireEvent.change(descInput, { target: { value: 'This is an updated valid description' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(dateInput, { target: { value: '2025-12-31' } });

    fireEvent.click(screen.getByRole('button', { name: /save task changes/i }));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith('t1', expect.objectContaining({
        title: 'Updated title',
        description: 'This is an updated valid description',
        priority: 'high',
        dueDate: '2025-12-31',
      }));
    });
  });

  it('cancel in edit mode restores original values and exits edit mode', async () => {
    const task = makeTask();
    render(
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit task/i }));
    const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Temp change' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel editing/i }));

    // Back to read mode
    expect(screen.getByRole('article', { name: /task: write tests/i })).toBeInTheDocument();
  });

  it('delete flow opens modal, cancel closes, confirm calls onDelete with loading state', async () => {
    const task = makeTask();
    render(
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /delete task/i }));
    // Modal visible
    expect(screen.getByRole('dialog', { name: /delete task/i })).toBeInTheDocument();
    // Cancel closes
    fireEvent.click(screen.getByRole('button', { name: /cancel and close dialog/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /delete task/i })).not.toBeInTheDocument();
    });

    // Reopen and confirm
    fireEvent.click(screen.getByRole('button', { name: /delete task/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete action/i }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('t1');
    });
  });
});
