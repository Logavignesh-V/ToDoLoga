const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
require('./auth/passport');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

connectDB();

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

app.use('/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
  res.send('Todo App Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});