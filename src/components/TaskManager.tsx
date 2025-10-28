import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useTasks } from '../hooks/useTasks';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import ConfirmModal from './ConfirmModal';

/**
 * TaskManager Component - Main dashboard for managing tasks
 * 
 * Features:
 * - Real-time task synchronization with Firestore
 * - Multiple filter options (status, category, priority, search)
 * - Task CRUD operations with user feedback
 * - Responsive layout for all screen sizes
 * - Confirmation modals for destructive actions
 */
const TaskManager: React.FC = () => {
  const { tasks, loading, error: tasksError, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /**
   * Display a temporary notification message
   * @param {string} message - Message to display
   * @param {'success' | 'error'} type - Notification type for styling
   */
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    // Auto-dismiss after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut(auth);
      showNotification('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showNotification('Failed to logout. Please try again.', 'error');
    }
  };

  /**
   * Apply all active filters to the task list
   * Filters by: completion status, category, priority, and search query
   */
  const filteredTasks = tasks.filter((task) => {
    // Filter by completion status
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'active' && task.completed) return false;

    // Filter by category
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    // Filter by priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Filter by search query (searches in title and description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-xl text-gray-700'>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white animate-slide-in`}
          role='status'
          aria-live='polite'
        >
          {notification.message}
        </div>
      )}
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Task Manager</h1>
          <button
            onClick={() => setShowLogoutModal(true)}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors'
            aria-label='Logout from application'
          >
            Logout
          </button>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutModal}
        title='Logout'
        message='Are you sure you want to logout?'
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText='Logout'
        cancelText='Stay'
        confirmButtonClass='bg-red-500 hover:bg-red-700'
      />

      <main className='max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8'>
        {tasksError && (
          <div 
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
            role='alert'
            aria-live='assertive'
          >
            {tasksError}
          </div>
        )}
        <div className='mb-6 space-y-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <input
              type='text'
              placeholder='Search tasks...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
              aria-label='Search tasks by title or description'
            />
            <button
              onClick={() => setShowForm(true)}
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap'
              aria-label='Add new task'
            >
              + Add Task
            </button>
          </div>
          <div className='flex flex-col sm:flex-row gap-4'>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className='shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
              aria-label='Filter tasks by completion status'
            >
              <option value='all'>All Tasks</option>
              <option value='active'>Active</option>
              <option value='completed'>Completed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className='shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
              aria-label='Filter tasks by category'
            >
              <option value='all'>All Categories</option>
              <option value='Personal'>Personal</option>
              <option value='Work'>Work</option>
              <option value='Shopping'>Shopping</option>
              <option value='Health'>Health</option>
              <option value='Other'>Other</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className='shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
              aria-label='Filter tasks by priority level'
            >
              <option value='all'>All Priorities</option>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>
        </div>

        {showForm && (
          <TaskForm
            onSubmit={async (task) => {
              try {
                await addTask(task);
                setShowForm(false);
                showNotification('Task created successfully!', 'success');
              } catch (error) {
                console.error('Error adding task:', error);
                showNotification('Failed to create task. Please try again.', 'error');
              }
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <TaskList
          tasks={filteredTasks}
          onToggle={async (id, completed) => {
            try {
              await toggleTaskCompletion(id, !completed);
              showNotification(completed ? 'Task marked as incomplete' : 'Task completed!', 'success');
            } catch (error) {
              console.error('Error toggling task:', error);
              showNotification('Failed to update task. Please try again.', 'error');
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteTask(id);
              showNotification('Task deleted successfully!', 'success');
            } catch (error) {
              console.error('Error deleting task:', error);
              showNotification('Failed to delete task. Please try again.', 'error');
            }
          }}
          onEdit={async (id, updatedTask) => {
            try {
              await updateTask(id, updatedTask);
              showNotification('Task updated successfully!', 'success');
            } catch (error) {
              console.error('Error updating task:', error);
              showNotification('Failed to update task. Please try again.', 'error');
            }
          }}
        />
      </main>
    </div>
  );
};

export default TaskManager;
