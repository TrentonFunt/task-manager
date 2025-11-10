import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskList from '../components/TaskList';

describe('TaskList', () => {
  it('shows empty state when no tasks', () => {
    render(
      <TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByRole('status')).toHaveTextContent(/no tasks found/i);
    expect(screen.getByText(/create a new task/i)).toBeInTheDocument();
  });
});
