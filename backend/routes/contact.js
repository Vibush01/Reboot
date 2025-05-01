const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ContactMessage = require('../models/ContactMessage');

// Submit a contact message (Public)
router.post('/submit', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const contactMessage = new ContactMessage({
            name,
            email,
            phone,
            subject,
            message,
        });

        await contactMessage.save();
        res.status(201).json({ message: 'Contact message submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all contact messages (Admin only)
router.get('/messages', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a contact message (Admin only)
router.delete('/messages/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.deleteOne();
        res.json({ message: 'Contact message deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;