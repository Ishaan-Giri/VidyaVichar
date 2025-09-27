const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// to be implemented
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const questionRoutes = require('./routes/questions');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidyavichara', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// to be implemented
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/questions', questionRoutes);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});