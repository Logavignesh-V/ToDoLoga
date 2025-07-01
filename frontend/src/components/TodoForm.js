import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const TodoForm = ({ onTodoCreated, onTodoUpdated, editingTodo, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setDueDate(editingTodo.dueDate ? editingTodo.dueDate.substring(0, 16) : '');
      setPriority(editingTodo.priority || 'medium');
      setStatus(editingTodo.status || 'pending');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setStatus('pending');
    }
  }, [editingTodo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingTodo) {
        // Update existing todo
        const todoData = { title: title.trim() };
        if (description.trim()) {
          todoData.description = description.trim();
        }
        if (dueDate) todoData.dueDate = dueDate;
        if (priority) todoData.priority = priority;
        if (status) todoData.status = status;
        const response = await axios.put(
          `${API_BASE_URL}/api/todos/${editingTodo._id}`,
          todoData,
          { headers }
        );
        onTodoUpdated(response.data);
        onCancelEdit();
      } else {
        // Create new todo
        const todoData = { title: title.trim() };
        if (description.trim()) {
          todoData.description = description.trim();
        }
        if (dueDate) todoData.dueDate = dueDate;
        if (priority) todoData.priority = priority;
        if (status) todoData.status = status;
        const response = await axios.post(
          `${API_BASE_URL}/api/todos`,
          todoData,
          { headers }
        );
        onTodoCreated(response.data);
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('medium');
        setStatus('pending');
      }
    } catch (error) {
      let msg = 'Error saving todo.';
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      setError(msg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onCancelEdit();
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {editingTodo ? 'Edit Todo' : 'Add New Todo'}
        </Typography>
        {editingTodo && (
          <IconButton onClick={handleCancel} size="small">
            <Close />
          </IconButton>
        )}
      </Box>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Todo Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          placeholder="What needs to be done?"
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
          placeholder="Add more details..."
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label="Due Date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />
        
        <TextField
          select
          fullWidth
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          margin="normal"
          SelectProps={{ native: true }}
          disabled={loading}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </TextField>
        
        <TextField
          select
          fullWidth
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
          SelectProps={{ native: true }}
          disabled={loading}
        >
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </TextField>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Add />}
            disabled={loading || !title.trim()}
            sx={{ minWidth: 120 }}
          >
            {editingTodo ? 'Update' : 'Add Todo'}
          </Button>
          
          {editingTodo && (
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Box>
      </form>
      <Snackbar open={showError} autoHideDuration={4000} onClose={handleCloseError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TodoForm; 