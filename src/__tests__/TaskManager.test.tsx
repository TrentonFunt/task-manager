import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskManager from '../components/TaskManager';
import type { Task } from '../types/Task';

// Mock useTasks hook
const mockUseTasks = vi.fn();
vi.mock('../hooks/useTasks', () => ({
  useTasks: () => mockUseTasks(),
}));

// Mock Firebase signOut
const mockSignOut = vi.fn().mockResolvedValue(undefined);
vi.mock('firebase/auth', () => ({
  signOut: () => mockSignOut(),
}));

// Mock Firebase config auth
vi.mock('../firebase/config', () => ({
  auth: {},
}));

// Optionally stub TaskForm to simplify add flow (invokes onSubmit immediately)
vi.mock('../components/TaskForm', () => ({
  default: ({ onSubmit, onCancel }: { onSubmit: (t: { title: string; description: string; category: string; priority: 'low' | 'medium' | 'high'; dueDate: string }) => void; onCancel: () => void }) => (
    <div>
      <button onClick={() => onSubmit({ title: 'A', description: 'A valid description', category: 'Work', priority: 'high', dueDate: '2025-12-31' })}>
        __submit_mock__
      </button>
      <button onClick={onCancel}>__cancel_mock__</button>
    </div>
  ),
}));

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id || Math.random().toString(36).slice(2),
  title: 'Task',
  description: 'Some description',
  category: 'Personal',
  priority: 'medium',
  dueDate: '2025-12-25',
  completed: false,
  ...overrides,
});

const baseReturn = () => ({
  tasks: [] as Task[],
  loading: false,
  error: null as string | null,
  addTask: vi.fn().mockResolvedValue(undefined),
  updateTask: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  toggleTaskCompletion: vi.fn().mockResolvedValue(undefined),
});

describe('TaskManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when loading is true', () => {
    const ret = baseReturn();
    ret.loading = true;
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it('shows error message when tasksError is present', () => {
    const ret = baseReturn();
    ret.error = 'Failed to load tasks.';
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load tasks/i);
  });

  it('filters tasks by completion status', () => {
    const ret = baseReturn();
    ret.tasks = [
      makeTask({ id: '1', title: 'A', completed: false }),
      makeTask({ id: '2', title: 'B', completed: true }),
    ];
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    // Default shows all
    expect(screen.getAllByRole('article')).toHaveLength(2);

    // Select completed
    fireEvent.change(screen.getByLabelText(/filter tasks by completion status/i), {
      target: { value: 'completed' },
    });
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/b/i)).toBeInTheDocument();
  });

  it('can add a task and shows a success notification', async () => {
    const ret = baseReturn();
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    // Open form
    fireEvent.click(screen.getByRole('button', { name: /add new task/i }));

    // Our mocked TaskForm has a button that calls onSubmit
    fireEvent.click(screen.getByText('__submit_mock__'));

    await waitFor(() => {
      expect(ret.addTask).toHaveBeenCalled();
      expect(screen.getByText(/task created successfully/i)).toBeInTheDocument();
    });
  });

  it('logout flow triggers signOut and shows success notification', async () => {
    const ret = baseReturn();
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    fireEvent.click(screen.getByRole('button', { name: /logout from application/i }));
    // Confirm modal visible
    expect(screen.getByRole('dialog', { name: /logout/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /logout action/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(screen.getByText(/logged out successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error notification when logout fails', async () => {
    const ret = baseReturn();
    mockUseTasks.mockReturnValue(ret);
    mockSignOut.mockRejectedValueOnce(new Error('Network error'));
    render(<TaskManager />);

    fireEvent.click(screen.getByRole('button', { name: /logout from application/i }));
    fireEvent.click(screen.getByRole('button', { name: /logout action/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to logout/i)).toBeInTheDocument();
    });
  });

  it('cancelling logout modal closes it without signing out', async () => {
    const ret = baseReturn();
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    fireEvent.click(screen.getByRole('button', { name: /logout from application/i }));
    expect(screen.getByRole('dialog', { name: /logout/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /stay/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /logout/i })).not.toBeInTheDocument();
    });
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('filters tasks by category', () => {
    const ret = baseReturn();
    ret.tasks = [
      makeTask({ id: '1', title: 'Work Task', category: 'Work' }),
      makeTask({ id: '2', title: 'Personal Task', category: 'Personal' }),
    ];
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    expect(screen.getAllByRole('article')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText(/filter tasks by category/i), {
      target: { value: 'Work' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/work task/i)).toBeInTheDocument();
  });

  it('filters tasks by priority', () => {
    const ret = baseReturn();
    ret.tasks = [
      makeTask({ id: '1', title: 'High Priority', priority: 'high' }),
      makeTask({ id: '2', title: 'Low Priority', priority: 'low' }),
    ];
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    expect(screen.getAllByRole('article')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText(/filter tasks by priority level/i), {
      target: { value: 'high' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/high priority/i)).toBeInTheDocument();
  });

  it('filters tasks by search query', () => {
    const ret = baseReturn();
    ret.tasks = [
      makeTask({ id: '1', title: 'Buy groceries', description: 'Milk and bread' }),
      makeTask({ id: '2', title: 'Write report', description: 'Q4 analysis' }),
    ];
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    expect(screen.getAllByRole('article')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText(/search tasks/i), {
      target: { value: 'groceries' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/buy groceries/i)).toBeInTheDocument();
  });

  it('shows error notification when addTask fails', async () => {
    const ret = baseReturn();
    ret.addTask.mockRejectedValueOnce(new Error('Firestore error'));
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    fireEvent.click(screen.getByRole('button', { name: /add new task/i }));
    fireEvent.click(screen.getByText('__submit_mock__'));

    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });

  it('canceling task form closes it without adding task', async () => {
    const ret = baseReturn();
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    fireEvent.click(screen.getByRole('button', { name: /add new task/i }));
    expect(screen.getByText('__submit_mock__')).toBeInTheDocument();

    fireEvent.click(screen.getByText('__cancel_mock__'));

    await waitFor(() => {
      expect(screen.queryByText('__submit_mock__')).not.toBeInTheDocument();
    });
    expect(ret.addTask).not.toHaveBeenCalled();
  });

  it('shows success notification when toggling task completion', async () => {
    const ret = baseReturn();
    ret.tasks = [makeTask({ id: '1', title: 'Task', completed: false })];
    mockUseTasks.mockReturnValue(ret);
    render(<TaskManager />);

    // Find and click the complete button
    const completeButton = screen.getByRole('button', { name: /mark task as complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(ret.toggleTaskCompletion).toHaveBeenCalledWith('1', true);
      expect(screen.getByText(/task completed/i)).toBeInTheDocument();
    });
  });


});
