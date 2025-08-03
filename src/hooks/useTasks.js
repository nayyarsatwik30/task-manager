import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.getAllTasks();
      setTasks(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new task
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      // Include user email in task data for email notification
      const taskDataWithEmail = {
        ...taskData,
        userEmail: userEmail,
        emailNotifications: localStorage.getItem('emailNotifications') !== 'false'
      };
      
      const response = await taskAPI.createTask(taskDataWithEmail);
      setTasks(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      // Include user email in task data for email notification
      const taskDataWithEmail = {
        ...taskData,
        userEmail: userEmail,
        emailNotifications: localStorage.getItem('emailNotifications') !== 'false'
      };
      
      const response = await taskAPI.updateTask(id, taskDataWithEmail);
      setTasks(prev => prev.map(task => 
        task.id === id ? response.data : task
      ));
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tasks by status
  const getTasksByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.getTasksByStatus(status);
      return response.data || [];
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks by status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    clearError,
  };
};

