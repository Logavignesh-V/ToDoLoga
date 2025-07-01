import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Typography,
  Paper,
  Chip,
  Tooltip,
  Box,
  TextField
} from '@mui/material';
import { Delete, Edit, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const TodoList = ({ todos, onTodoUpdate, onTodoDelete, onEditTodo, showCompleted, modern }) => {
  const [filter, setFilter] = useState({
    due: 'all', // all, today, overdue
    priority: 'all', // all, low, medium, high
    status: 'all' // all, pending, in progress, completed
  });

  const handleToggle = async (todoId, currentStatus) => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.patch(
        `${API_BASE_URL}/api/todos/${todoId}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onTodoUpdate(response.data);
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`${API_BASE_URL}/api/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onTodoDelete(todoId);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDueToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const due = new Date(dateStr);
    return due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate();
  };

  const isOverdue = (dateStr, completed) => {
    if (!dateStr || completed) return false;
    const now = new Date();
    const due = new Date(dateStr);
    return due < now;
  };

  const filteredTodos = todos.filter(todo => {
    // Due filter
    if (filter.due === 'today' && !isDueToday(todo.dueDate)) return false;
    if (filter.due === 'overdue' && !isOverdue(todo.dueDate, todo.completed)) return false;
    // Priority filter
    if (filter.priority !== 'all' && todo.priority !== filter.priority) return false;
    // Status filter
    if (filter.status !== 'all' && todo.status !== filter.status) return false;
    return true;
  });

  if (filteredTodos.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: modern ? '#f3f4f6' : undefined }}>
        <Typography variant="h6" color="textSecondary">
          {showCompleted ? 'No completed tasks yet.' : 'No todos yet. Create your first todo!'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={modern ? 0 : 2} sx={{ p: modern ? 0 : 2, bgcolor: modern ? 'transparent' : undefined, boxShadow: modern ? 'none' : undefined }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Due"
          value={filter.due}
          onChange={e => setFilter(f => ({ ...f, due: e.target.value }))}
          size="small"
          SelectProps={{ native: true }}
        >
          <option value="all">All</option>
          <option value="today">Due Today</option>
          <option value="overdue">Overdue</option>
        </TextField>
        <TextField
          select
          label="Priority"
          value={filter.priority}
          onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
          size="small"
          SelectProps={{ native: true }}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </TextField>
        <TextField
          select
          label="Status"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          size="small"
          SelectProps={{ native: true }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </TextField>
      </Box>
      <List sx={{ width: '100%' }}>
        {filteredTodos.map((todo) => (
          <ListItem
            key={todo._id}
            divider
            sx={{
              mb: modern ? 2 : 0,
              borderRadius: modern ? 3 : 0,
              boxShadow: modern ? 2 : 0,
              bgcolor: modern ? (todo.completed ? '#e0f2f1' : '#fff') : undefined,
              transition: 'box-shadow 0.2s, background 0.2s',
              '&:hover': modern ? { boxShadow: 6, bgcolor: todo.completed ? '#b2dfdb' : '#f3f4f6' } : {}
            }}
          >
            <Tooltip title={todo.completed ? 'Completed' : 'Mark as complete'}>
              <Checkbox
                edge="start"
                checked={todo.completed}
                onChange={() => handleToggle(todo._id, todo.completed)}
                color={todo.completed ? 'success' : 'primary'}
                icon={<RadioButtonUnchecked />}
                checkedIcon={<CheckCircle />}
                sx={{ mr: 2 }}
                disabled={showCompleted}
              />
            </Tooltip>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                    fontWeight: 500,
                    fontSize: modern ? 18 : undefined
                  }}
                  component="span"
                >
                  {todo.title}
                </Typography>
              }
              secondary={
                <span>
                  {todo.description && (
                    <span style={{ display: 'block', color: '#666', marginBottom: 8 }}>
                      {todo.description}
                    </span>
                  )}
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={todo.completed ? 'Completed' : 'Pending'}
                      size="small"
                      color={todo.completed ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 12 }}
                    />
                    {todo.dueDate && (
                      <Chip
                        label={`Due: ${formatDate(todo.dueDate)}`}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: 12 }}
                      />
                    )}
                    <Chip
                      label={`Priority: ${todo.priority || 'medium'}`}
                      size="small"
                      color={todo.priority === 'high' ? 'error' : todo.priority === 'low' ? 'default' : 'primary'}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 12 }}
                    />
                    <Chip
                      label={`Status: ${todo.status || 'pending'}`}
                      size="small"
                      color={todo.status === 'completed' ? 'success' : todo.status === 'in progress' ? 'primary' : 'warning'}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 12 }}
                    />
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {formatDate(todo.createdAt)}
                    </span>
                  </span>
                </span>
              }
              secondaryTypographyProps={{ component: 'span' }}
            />
            {!showCompleted && (
              <ListItemSecondaryAction>
                <Tooltip title="Edit">
                  <IconButton
                    edge="end"
                    onClick={() => onEditTodo(todo)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(todo._id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TodoList; 