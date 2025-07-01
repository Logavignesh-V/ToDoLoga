const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Validation schema
const todoSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  description: Joi.string().max(500).optional(),
  dueDate: Joi.date().optional().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('pending', 'in progress', 'completed').optional(),
  completed: Joi.boolean().optional()
});

// Get all todos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all todos for testing (admin/debug)
router.get('/all', auth, async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new todo
router.post('/', auth, async (req, res) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, dueDate, priority, status } = req.body;
    const todo = new Todo({
      title,
      description,
      dueDate,
      priority,
      status,
      user: req.user._id
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a todo
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const { title, description, completed, dueDate, priority, status } = req.body;
    todo.title = title;
    todo.description = description;
    if (completed !== undefined) {
      todo.completed = completed;
    }
    if (dueDate !== undefined) {
      todo.dueDate = dueDate;
    }
    if (priority !== undefined) {
      todo.priority = priority;
    }
    if (status !== undefined) {
      todo.status = status;
    }

    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle todo completion status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 