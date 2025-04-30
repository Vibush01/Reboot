const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutSchedule = require('../models/WorkoutSchedule');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const Gym = require('../models/Gym');

// Create a workout plan (Trainer only)
router.post('/workout-plans', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { memberId, title, description, exercises } = req.body;

    if (!memberId || !title || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ message: 'Member ID, title, and exercises are required' });
    }

    try {
        const trainer = await Trainer.findById(req.user.id);
        if (!trainer || !trainer.gym) {
            return res.status(404).json({ message: 'Trainer not found or not associated with a gym' });
        }

        const member = await Member.findById(memberId);
        if (!member || member.gym.toString() !== trainer.gym.toString()) {
            return res.status(404).json({ message: 'Member not found or not in the same gym' });
        }

        const workoutPlan = new WorkoutPlan({
            trainer: req.user.id,
            member: memberId,
            gym: trainer.gym,
            title,
            description,
            exercises,
        });

        await workoutPlan.save();
        res.status(201).json({ message: 'Workout plan created', workoutPlan });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all workout plans created by the trainer
router.get('/workout-plans', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const workoutPlans = await WorkoutPlan.find({ trainer: req.user.id })
            .populate('member', 'name email')
            .sort({ createdAt: -1 });
        res.json(workoutPlans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a workout plan (Trainer only)
router.put('/workout-plans/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, exercises } = req.body;

    if (!title || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ message: 'Title and exercises are required' });
    }

    try {
        const workoutPlan = await WorkoutPlan.findById(req.params.id);
        if (!workoutPlan) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        if (workoutPlan.trainer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this workout plan' });
        }

        workoutPlan.title = title;
        workoutPlan.description = description;
        workoutPlan.exercises = exercises;
        workoutPlan.updatedAt = Date.now();

        await workoutPlan.save();
        res.json({ message: 'Workout plan updated', workoutPlan });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a workout plan (Trainer only)
router.delete('/workout-plans/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const workoutPlan = await WorkoutPlan.findById(req.params.id);
        if (!workoutPlan) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        if (workoutPlan.trainer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this workout plan' });
        }

        // Delete associated schedules
        await WorkoutSchedule.deleteMany({ workoutPlan: req.params.id });

        await workoutPlan.deleteOne();
        res.json({ message: 'Workout plan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Schedule a workout session (Trainer only)
router.post('/schedules', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { workoutPlanId, memberId, dateTime } = req.body;

    if (!workoutPlanId || !memberId || !dateTime) {
        return res.status(400).json({ message: 'Workout plan ID, member ID, and date/time are required' });
    }

    try {
        const trainer = await Trainer.findById(req.user.id);
        if (!trainer || !trainer.gym) {
            return res.status(404).json({ message: 'Trainer not found or not associated with a gym' });
        }

        const member = await Member.findById(memberId);
        if (!member || member.gym.toString() !== trainer.gym.toString()) {
            return res.status(404).json({ message: 'Member not found or not in the same gym' });
        }

        const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
        if (!workoutPlan || workoutPlan.trainer.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Workout plan not found or not created by this trainer' });
        }

        const workoutSchedule = new WorkoutSchedule({
            trainer: req.user.id,
            member: memberId,
            gym: trainer.gym,
            workoutPlan: workoutPlanId,
            dateTime: new Date(dateTime),
        });

        await workoutSchedule.save();
        res.status(201).json({ message: 'Workout session scheduled', workoutSchedule });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all schedules created by the trainer
router.get('/schedules', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const schedules = await WorkoutSchedule.find({ trainer: req.user.id })
            .populate('member', 'name email')
            .populate('workoutPlan', 'title')
            .sort({ dateTime: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a workout schedule (Trainer only)
router.put('/schedules/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { dateTime } = req.body;

    if (!dateTime) {
        return res.status(400).json({ message: 'Date and time are required' });
    }

    try {
        const workoutSchedule = await WorkoutSchedule.findById(req.params.id);
        if (!workoutSchedule) {
            return res.status(404).json({ message: 'Workout schedule not found' });
        }

        if (workoutSchedule.trainer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this schedule' });
        }

        workoutSchedule.dateTime = new Date(dateTime);
        await workoutSchedule.save();

        res.json({ message: 'Workout schedule updated', workoutSchedule });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a workout schedule (Trainer only)
router.delete('/schedules/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const workoutSchedule = await WorkoutSchedule.findById(req.params.id);
        if (!workoutSchedule) {
            return res.status(404).json({ message: 'Workout schedule not found' });
        }

        if (workoutSchedule.trainer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this schedule' });
        }

        await workoutSchedule.deleteOne();
        res.json({ message: 'Workout schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get workout plans for a Member
router.get('/member/workout-plans', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const workoutPlans = await WorkoutPlan.find({ member: req.user.id })
            .populate('trainer', 'name email')
            .sort({ createdAt: -1 });
        res.json(workoutPlans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get workout schedules for a Member
router.get('/member/schedules', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const schedules = await WorkoutSchedule.find({ member: req.user.id })
            .populate('trainer', 'name email')
            .populate('workoutPlan', 'title description exercises')
            .sort({ dateTime: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;