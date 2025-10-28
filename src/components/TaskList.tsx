import React from 'react';
import type { Task } from '../types/Task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updatedTask: Partial<Task>) => void;
}

/**
 * TaskList component displays tasks in a responsive grid layout
 * Shows empty state message when no tasks are available
 * Renders TaskCard components for each task with all CRUD operations
 */
const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete, onEdit }) => {
  if (tasks.length === 0) {
    return (
      <div className='text-center py-12' role='status' aria-live='polite'>
        <p className='text-gray-500 text-xl'>No tasks found</p>
        <p className='text-gray-400 mt-2'>Create a new task to get started!</p>
      </div>
    );
  }

  return (
    <div 
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      role='list'
      aria-label='Task list'
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default TaskList;
