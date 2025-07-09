const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/tasks - Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// GET /api/tasks/:id - Fetch single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [
        title.trim(),
        description || null,
        status || 'pending',
        priority || 'medium',
        due_date || null
      ]
    );
    
    // Fetch the newly created task
    const [newTask] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask[0]
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;
    
    // Check if task exists
    const [existingTask] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    
    if (existingTask.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Update task
    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?',
      [
        title || existingTask[0].title,
        description !== undefined ? description : existingTask[0].description,
        status || existingTask[0].status,
        priority || existingTask[0].priority,
        due_date || existingTask[0].due_date,
        id
      ]
    );
    
    // Fetch updated task
    const [updatedTask] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const [existingTask] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    
    if (existingTask.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Delete task
    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// GET /api/tasks/status/:status - Get tasks by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'in-progress', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in-progress, completed'
      });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks by status',
      error: error.message
    });
  }
});

module.exports = router; 