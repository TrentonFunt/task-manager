import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskList from '../components/TaskList';
import type { Task } from '../types/Task';

const makeTask = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  description: `Description for ${id}`,
  category: 'Personal',
  priority: 'low',
  dueDate: '2025-12-25',
  completed: false,
  ...overrides,
});

describe('TaskList', () => {
  it('shows empty state when no tasks', () => {
    render(
      <TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByRole('status')).toHaveTextContent(/no tasks found/i);
    expect(screen.getByText(/create a new task/i)).toBeInTheDocument();
  });

  it('renders a list of tasks with proper roles', () => {
    const tasks = [makeTask('1'), makeTask('2'), makeTask('3')];
    render(
      <TaskList tasks={tasks} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument();
    const items = screen.getAllByRole('article');
    expect(items).toHaveLength(3);
    expect(screen.getByText(/task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
    expect(screen.getByText(/task 3/i)).toBeInTheDocument();
  });
});
