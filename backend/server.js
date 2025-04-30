const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/auth');
const gymRoutes = require('./routes/gym');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and Cloudinary
connectDB();
configureCloudinary();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gym', gymRoutes);

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));