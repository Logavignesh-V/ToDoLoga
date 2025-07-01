import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { Google, Logout, CheckCircle, AddCircleOutline, Close, Facebook, GitHub } from '@mui/icons-material';
import axios from 'axios';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt'));
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showActive, setShowActive] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTodos();
      decodeToken();
    }
  }, [token]);

  const decodeToken = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      showSnackbar('Error loading todos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${API_BASE_URL}/auth/google`,
      '_blank',
      'width=500,height=600'
    );

    window.addEventListener('message', (event) => {
      if (event.origin !== API_BASE_URL) return;
      if (event.data.token) {
        setToken(event.data.token);
        localStorage.setItem('jwt', event.data.token);
        popup.close();
        showSnackbar('Successfully logged in!', 'success');
      }
    });
  };

  const handleFacebookLogin = () => {
    const popup = window.open(
      `${API_BASE_URL}/auth/facebook`,
      '_blank',
      'width=500,height=600'
    );

    window.addEventListener('message', (event) => {
      if (event.origin !== API_BASE_URL) return;
      if (event.data.token) {
        setToken(event.data.token);
        localStorage.setItem('jwt', event.data.token);
        popup.close();
        showSnackbar('Successfully logged in!', 'success');
      }
    });
  };

  const handleGitHubLogin = () => {
    const popup = window.open(
      `${API_BASE_URL}/auth/github`,
      '_blank',
      'width=500,height=600'
    );

    window.addEventListener('message', (event) => {
      if (event.origin !== API_BASE_URL) return;
      if (event.data.token) {
        setToken(event.data.token);
        localStorage.setItem('jwt', event.data.token);
        popup.close();
        showSnackbar('Successfully logged in!', 'success');
      }
    });
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTodos([]);
    localStorage.removeItem('jwt');
    showSnackbar('Logged out successfully', 'info');
  };

  const handleTodoCreated = (newTodo) => {
    setTodos([newTodo, ...todos]);
    showSnackbar('Todo created successfully!', 'success');
    setAddDialogOpen(false);
  };

  const handleTodoUpdated = (updatedTodo) => {
    setTodos(todos.map(todo =>
      todo._id === updatedTodo._id ? updatedTodo : todo
    ));
    showSnackbar('Todo updated successfully!', 'success');
  };

  const handleTodoDelete = (todoId) => {
    setTodos(todos.filter(todo => todo._id !== todoId));
    showSnackbar('Todo deleted successfully!', 'success');
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setAddDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setAddDialogOpen(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              textAlign: 'center',
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              Todo App
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              sx={{ px: 4, py: 1.5, mb: 2, width: '100%' }}
            >
              Sign in with Google
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<Facebook />}
              onClick={handleFacebookLogin}
              sx={{ px: 4, py: 1.5, mb: 2, width: '100%', bgcolor: '#1877f2', '&:hover': { bgcolor: '#145db2' } }}
            >
              Sign in with Facebook
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<GitHub />}
              onClick={handleGitHubLogin}
              sx={{ px: 4, py: 1.5, width: '100%', bgcolor: '#24292f', '&:hover': { bgcolor: '#1b1f23' } }}
            >
              Sign in with GitHub
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', color: '#7fbcff', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(90deg, #7fbcff 0%, #1e90ff 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            <CheckCircle sx={{ mr: 1, color: 'white' }} /> Todo App
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                avatar={<Avatar>{user.name?.[0] || user.email?.[0]}</Avatar>}
                label={user.name || user.email}
                variant="outlined"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'white' }}
              />
              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ fontWeight: 600 }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 1100,
            minHeight: 600,
            borderRadius: 5,
            display: 'flex',
            overflow: 'hidden',
            boxShadow: 10,
            bgcolor: 'rgba(30, 30, 50, 0.95)',
            color: '#7fbcff'
          }}
        >
          {/* Left Panel */}
          <Box sx={{ width: { xs: '100%', md: 320 }, p: 2, bgcolor: '#f5f3ff', borderRight: '2px solid #6e6e6e' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => { setEditingTodo(null); setAddDialogOpen(true); }}
                startIcon={<AddCircleOutline />}
                sx={{ fontWeight: 'bold' }}
              >
                Add Task
              </Button>
              <Button
                variant={showActive ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => {
                  setShowActive(true);
                  setShowCompleted(false);
                }}
              >
                View Active Tasks
              </Button>
              <Button
                variant={showCompleted ? 'contained' : 'outlined'}
                color="success"
                onClick={() => {
                  setShowCompleted(true);
                  setShowActive(false);
                }}
              >
                View Completed Tasks
              </Button>
            </Box>
          </Box>

          {/* Right Panel */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: showActive || showCompleted ? 'flex-start' : 'center',
              bgcolor: 'transparent',
              color: '#7fbcff',
              borderRight: '2px solid #6e6e6e'
            }}
          >
            {showActive && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#b6e0fe' }}>
                  Active Tasks
                </Typography>
                <TodoList
                  todos={activeTodos}
                  onTodoUpdate={handleTodoUpdated}
                  onTodoDelete={handleTodoDelete}
                  onEditTodo={handleEditTodo}
                  modern
                />
              </>
            )}
            {showCompleted && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#a3e635' }}>
                  Completed Tasks
                </Typography>
                <TodoList
                  todos={completedTodos}
                  onTodoUpdate={handleTodoUpdated}
                  onTodoDelete={handleTodoDelete}
                  onEditTodo={handleEditTodo}
                  showCompleted
                  modern
                />
              </>
            )}
            {!showActive && !showCompleted && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mt: 2, color: '#b6e0fe' }}>
                  Select "Active Tasks" or "Completed Tasks" to view your tasks
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Add Task Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingTodo ? 'Edit Task' : 'Add New Task'}
          <IconButton onClick={handleCancelEdit}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TodoForm
            onTodoCreated={handleTodoCreated}
            onTodoUpdated={handleTodoUpdated}
            editingTodo={editingTodo}
            onCancelEdit={handleCancelEdit}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
