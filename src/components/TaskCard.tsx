import React, { useState } from 'react';
import type { Task } from '../types/Task';
import ConfirmModal from './ConfirmModal';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updatedTask: Partial<Task>) => void;
}

/**
 * TaskCard component displays individual task with inline editing capabilities
 * Features: Toggle completion status, inline edit mode, delete with confirmation, priority-based styling
 * Supports validation with error messages and loading states for all async operations
 */
const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /**
   * Validates task fields before saving
   * @returns {boolean} - True if all validation passes, false otherwise
   */
  const validateTask = () => {
    const newErrors: { [key: string]: string } = {};

    if (!editedTask.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (editedTask.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!editedTask.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (editedTask.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Saves edited task data to Firestore
   * Shows saving state and handles errors
   */
  const handleSave = async () => {
    if (!validateTask()) {
      return;
    }

    setIsSaving(true);
    try {
      await onEdit(task.id, editedTask);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Cancels editing and reverts to original task data
   */
  const handleCancel = () => {
    setEditedTask(task);
    setErrors({});
    setIsEditing(false);
  };

  /**
   * Deletes task from Firestore after confirmation
   * Shows deleting state and handles errors
   */
  const handleDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Returns Tailwind CSS classes based on task priority
   * @param {string} priority - Task priority level (low/medium/high)
   * @returns {string} - Tailwind CSS class names for background and border colors
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-500';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500';
      case 'low':
        return 'bg-green-100 border-green-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  if (isEditing) {
    return (
      <div className='bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500'>
        <div className='mb-2'>
          <input
            type='text'
            value={editedTask.title}
            onChange={(e) => {
              setEditedTask({ ...editedTask, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            className={`w-full mb-2 p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
            placeholder='Title'
            disabled={isSaving}
            aria-label='Task title'
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id='title-error' className='text-red-500 text-xs italic' role='alert'>
              {errors.title}
            </p>
          )}
        </div>
        <div className='mb-2'>
          <textarea
            value={editedTask.description}
            onChange={(e) => {
              setEditedTask({ ...editedTask, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            className={`w-full mb-2 p-2 border rounded ${errors.description ? 'border-red-500' : ''}`}
            placeholder='Description'
            rows={3}
            disabled={isSaving}
            aria-label='Task description'
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id='description-error' className='text-red-500 text-xs italic' role='alert'>
              {errors.description}
            </p>
          )}
        </div>
        <div className='flex gap-2 mb-2'>
          <select
            value={editedTask.priority}
            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
            className='flex-1 p-2 border rounded'
            disabled={isSaving}
            aria-label='Task priority'
          >
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
          </select>
          <input
            type='date'
            value={editedTask.dueDate}
            onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
            className='flex-1 p-2 border rounded'
            disabled={isSaving}
            aria-label='Due date'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            aria-label={isSaving ? 'Saving task changes' : 'Save task changes'}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className='flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            aria-label='Cancel editing'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 rounded-lg shadow-md border-l-4 ${getPriorityColor(task.priority)} ${task.completed ? 'opacity-60' : ''}`}
      role='article'
      aria-label={`Task: ${task.title}`}
    >
      <div className='flex justify-between items-start mb-2'>
        <h3 className={`text-lg font-bold ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </h3>
        <span 
          className={`px-2 py-1 text-xs font-semibold rounded ${task.priority === 'high' ? 'bg-red-500 text-white' : task.priority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}
          aria-label={`Priority: ${task.priority}`}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>
      <p className={`text-gray-600 mb-3 ${task.completed ? 'line-through' : ''}`}>
        {task.description}
      </p>
      <div className='flex justify-between items-center mb-3'>
        <span className='text-sm text-gray-500' aria-label={`Due date: ${new Date(task.dueDate).toLocaleDateString()}`}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </span>
        <span className='text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded' aria-label={`Category: ${task.category}`}>
          {task.category}
        </span>
      </div>
      <div className='flex gap-2'>
        <button
          onClick={() => onToggle(task.id, task.completed)}
          className={`flex-1 ${task.completed ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-2 px-4 rounded transition-colors`}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {task.completed ? '↩ Undo' : '✓ Complete'}
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className='flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors'
          title='Edit task'
          aria-label='Edit task'
        >
          ✎ Edit
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className='flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          title='Delete task'
          aria-label={isDeleting ? 'Deleting task' : 'Delete task'}
        >
          {isDeleting ? 'Deleting...' : '🗑 Delete'}
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title='Delete Task'
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText='Delete'
        cancelText='Cancel'
        confirmButtonClass='bg-red-500 hover:bg-red-700'
      />
    </div>
  );
};

export default TaskCard;
