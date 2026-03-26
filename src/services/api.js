// Create base URL from environment or default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://task-manager-back-emez.onrender.com/api';

// Helper function for fetch requests
async function fetchWithHandling(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

// Task API methods
export const taskAPI = {
  // Get all tasks
  getAllTasks: async () => {
    const userEmail = localStorage.getItem('userEmail');
    return fetchWithHandling(`${API_BASE_URL}/tasks?userEmail=${encodeURIComponent(userEmail)}`);
  },

  // Get task by ID
  getTaskById: async (id) => {
    return fetchWithHandling(`${API_BASE_URL}/tasks/${id}`);
  },

  // Create new task
  createTask: async (taskData) => {
    return fetchWithHandling(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  // Update task
  updateTask: async (id, taskData) => {
    return fetchWithHandling(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  // Delete task
  deleteTask: async (id) => {
    const userEmail = localStorage.getItem('userEmail');
    return fetchWithHandling(`${API_BASE_URL}/tasks/${id}?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE'
    });
  },

  // Get tasks by status
  getTasksByStatus: async (status) => {
    return fetchWithHandling(`${API_BASE_URL}/tasks/status/${status}`);
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    if (!response.ok) throw new Error('Backend server is not responding');
    return data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default taskAPI; 