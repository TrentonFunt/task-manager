import React, { useState } from 'react';
import type { Task } from '../types/Task';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'completed'>) => void;
  onCancel: () => void;
}

/**
 * TaskForm component for creating new tasks
 * Features: Form validation with inline error messages, required field indicators, loading states
 * Validates title (min 3 chars), description (min 10 chars), and due date
 */
const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates all form fields before submission
   * @returns {boolean} - True if all validations pass, false otherwise
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission with validation
   * Creates new task and resets form on success
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate
      });
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
      <h2 className='text-2xl font-bold mb-4'>Create New Task</h2>
      <form onSubmit={handleSubmit} aria-label='New task form'>
        <div className='mb-4'>
          <label htmlFor='task-title' className='block text-gray-700 text-sm font-bold mb-2'>
            Title <span className='text-red-500' aria-label='required'>*</span>
          </label>
          <input
            id='task-title'
            type='text'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.title ? 'border-red-500' : ''}`}
            placeholder='Enter task title'
            disabled={isSubmitting}
            aria-required='true'
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id='title-error' className='text-red-500 text-xs italic mt-1' role='alert'>
              {errors.title}
            </p>
          )}
        </div>
        <div className='mb-4'>
          <label htmlFor='task-description' className='block text-gray-700 text-sm font-bold mb-2'>
            Description <span className='text-red-500' aria-label='required'>*</span>
          </label>
          <textarea
            id='task-description'
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : ''}`}
            rows={3}
            placeholder='Enter task description'
            disabled={isSubmitting}
            aria-required='true'
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id='description-error' className='text-red-500 text-xs italic mt-1' role='alert'>
              {errors.description}
            </p>
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div>
            <label htmlFor='task-category' className='block text-gray-700 text-sm font-bold mb-2'>
              Category
            </label>
            <select
              id='task-category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              disabled={isSubmitting}
            >
              <option value='Personal'>Personal</option>
              <option value='Work'>Work</option>
              <option value='Shopping'>Shopping</option>
              <option value='Health'>Health</option>
              <option value='Other'>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor='task-priority' className='block text-gray-700 text-sm font-bold mb-2'>
              Priority
            </label>
            <select
              id='task-priority'
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              disabled={isSubmitting}
            >
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>
          <div>
            <label htmlFor='task-duedate' className='block text-gray-700 text-sm font-bold mb-2'>
              Due Date <span className='text-red-500' aria-label='required'>*</span>
            </label>
            <input
              id='task-duedate'
              type='date'
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
              }}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dueDate ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
              aria-required='true'
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? 'duedate-error' : undefined}
            />
            {errors.dueDate && (
              <p id='duedate-error' className='text-red-500 text-xs italic mt-1' role='alert'>
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>
        <div className='flex gap-4'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            aria-label={isSubmitting ? 'Creating task' : 'Create new task'}
          >
            {isSubmitting ? 'Creating Task...' : 'Create Task'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            aria-label='Cancel task creation'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
