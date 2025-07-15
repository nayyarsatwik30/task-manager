const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const { Op } = require('sequelize');

// GET /api/tasks - Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['created_at', 'DESC']] });
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
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
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.json({
      success: true,
      data: task
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
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    const newTask = await Task.create({
      title: title.trim(),
      description: description || null,
      status: status || 'pending',
      priority: priority || 'medium',
      due_date: due_date || null
    });
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
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
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      due_date: due_date !== undefined ? due_date : task.due_date
    });
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
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
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    await task.destroy();
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
    const tasks = await Task.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
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