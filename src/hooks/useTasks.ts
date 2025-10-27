import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Task } from '../types/Task';
import { useAuth } from './useAuth';

/**
 * Custom hook to manage tasks with real-time Firestore synchronization
 * 
 * Features:
 * - Real-time updates via Firestore listeners
 * - User-specific task filtering
 * - CRUD operations with error handling
 * 
 * @returns {Object} Task management utilities
 * @returns {Task[]} tasks - Array of user's tasks
 * @returns {boolean} loading - True while fetching initial data
 * @returns {string | null} error - Error message if fetch fails
 * @returns {Function} addTask - Create a new task
 * @returns {Function} updateTask - Update an existing task
 * @returns {Function} deleteTask - Delete a task
 * @returns {Function} toggleTaskCompletion - Toggle task completion status
 */
export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear tasks if user is not authenticated
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setError(null);
    
    // Create query to fetch only the current user's tasks
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    
    // Set up real-time listener for task updates
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        // Transform Firestore documents to Task objects
        const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please refresh the page.');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or when user changes
    return unsubscribe;
  }, [user]);

  /**
   * Add a new task to Firestore
   * @param {Omit<Task, 'id' | 'completed' | 'userId'>} task - Task data without id, completed, and userId
   * @throws {Error} If user is not authenticated or operation fails
   */
  const addTask = async (task: Omit<Task, 'id' | 'completed' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addDoc(collection(db, 'tasks'), { ...task, completed: false, userId: user.uid });
    } catch (err) {
      console.error('Error adding task:', err);
      throw new Error('Failed to add task');
    }
  };

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Partial<Task>} updatedTask - Fields to update
   * @throws {Error} If operation fails
   */
  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    try {
      const taskDoc = doc(db, 'tasks', id);
      await updateDoc(taskDoc, updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error('Failed to update task');
    }
  };

  /**
   * Delete a task from Firestore
   * @param {string} id - Task ID to delete
   * @throws {Error} If operation fails
   */
  const deleteTask = async (id: string) => {
    try {
      const taskDoc = doc(db, 'tasks', id);
      await deleteDoc(taskDoc);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw new Error('Failed to delete task');
    }
  };

  /**
   * Toggle task completion status
   * @param {string} id - Task ID
   * @param {boolean} completed - New completion status
   * @throws {Error} If operation fails
   */
  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      const taskDoc = doc(db, 'tasks', id);
      await updateDoc(taskDoc, { completed });
    } catch (err) {
      console.error('Error toggling task completion:', err);
      throw new Error('Failed to update task status');
    }
  };

  return { tasks, loading, error, addTask, updateTask, deleteTask, toggleTaskCompletion };
};
