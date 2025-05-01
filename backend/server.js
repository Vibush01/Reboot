const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/auth');
const gymRoutes = require('./routes/gym');
const memberRoutes = require('./routes/member');
const chatRoutes = require('./routes/chat');
const trainerRoutes = require('./routes/trainer');
const adminRoutes = require('./routes/admin');
const { createServer } = require('http');
const { Server } = require('socket.io');
const ChatMessage = require('./models/ChatMessage');

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and Cloudinary
connectDB();
configureCloudinary();

// Make io accessible to routes
app.set('socketio', io);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a gym room
    socket.on('joinGym', (gymId) => {
        socket.join(gymId);
        console.log(`User ${socket.id} joined gym ${gymId}`);
    });

    // Handle chat messages
    socket.on('sendMessage', async (messageData) => {
        const { senderId, senderModel, receiverId, receiverModel, gymId, message } = messageData;

        try {
            const chatMessage = new ChatMessage({
                sender: senderId,
                senderModel,
                receiver: receiverId,
                receiverModel,
                gym: gymId,
                message,
            });

            await chatMessage.save();

            // Emit the message to both sender and receiver
            io.to(gymId).emit('message', chatMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));