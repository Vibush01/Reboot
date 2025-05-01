const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const GymReview = require('../models/GymReview');
const Member = require('../models/Member');
const Gym = require('../models/Gym');

// Submit a gym review (Member only)
router.post('/submit', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { rating, comment } = req.body;

    if (!rating || !comment || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating (1-5) and comment are required' });
    }

    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.gym) {
            return res.status(404).json({ message: 'Member not found or not associated with a gym' });
        }

        const existingReview = await GymReview.findOne({ gym: member.gym, member: req.user.id });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this gym' });
        }

        const review = new GymReview({
            gym: member.gym,
            member: req.user.id,
            rating,
            comment,
        });

        await review.save();
        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all gym reviews (Admin only)
router.get('/reviews', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const reviews = await GymReview.find()
            .populate('gym', 'gymName')
            .populate('member', 'name email')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a gym review (Admin only)
router.delete('/reviews/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const review = await GymReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get reviews for the member's gym (Member only)
router.get('/my-gym-reviews', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.gym) {
            return res.status(404).json({ message: 'Member not found or not associated with a gym' });
        }

        const reviews = await GymReview.find({ gym: member.gym })
            .populate('member', 'name email')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;