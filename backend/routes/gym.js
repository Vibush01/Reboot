const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const JoinRequest = require('../models/JoinRequest');
const EventLog = require('../models/EventLog');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all gyms (for Members/Trainers to browse)
router.get('/', async (req, res) => {
    try {
        const gyms = await Gym.find().select('-password');

        // Log page view event if user is authenticated
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userModelMap = {
                admin: 'Admin',
                gym: 'Gym',
                trainer: 'Trainer',
                member: 'Member',
            };
            const eventLog = new EventLog({
                event: 'Page View',
                page: '/gyms',
                user: decoded.id,
                userModel: userModelMap[decoded.role],
                details: `${userModelMap[decoded.role]} viewed gym list`,
            });
            await eventLog.save();
        }

        res.json(gyms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Send join request (Member/Trainer)
router.post('/join/:gymId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gym = await Gym.findById(req.params.gymId);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const userModel = req.user.role === 'member' ? Member : Trainer;
        const user = await userModel.findById(req.user.id);
        if (user.gym) {
            return res.status(400).json({ message: 'You are already in a gym' });
        }

        const existingRequest = await JoinRequest.findOne({
            user: req.user.id,
            gym: req.params.gymId,
            status: 'pending',
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this gym' });
        }

        let membershipDuration;
        if (req.user.role === 'member') {
            membershipDuration = req.body.membershipDuration;
            if (!membershipDuration) {
                return res.status(400).json({ message: 'Membership duration is required for members' });
            }
            const validDurations = ['1 week', '1 month', '3 months', '6 months', '1 year'];
            if (!validDurations.includes(membershipDuration)) {
                return res.status(400).json({ message: 'Invalid membership duration' });
            }
        }

        const joinRequestData = {
            user: req.user.id,
            userModel: req.user.role === 'member' ? 'Member' : 'Trainer',
            gym: req.params.gymId,
        };

        if (req.user.role === 'member') {
            joinRequestData.membershipDuration = membershipDuration;
        }

        const joinRequest = new JoinRequest(joinRequestData);

        await joinRequest.save();
        gym.joinRequests.push(joinRequest._id);
        await gym.save();

        // Log the join request event
        const eventLog = new EventLog({
            event: 'Join Request',
            page: `/gym/${req.params.gymId}`,
            user: req.user.id,
            userModel: req.user.role === 'member' ? 'Member' : 'Trainer',
            details: `${req.user.role === 'member' ? 'Member' : 'Trainer'} sent join request to gym ${gym.gymName}`,
        });
        await eventLog.save();

        res.status(201).json({ message: 'Join request sent', joinRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update gym details (including photo upload/delete)
router.put('/update', authMiddleware, upload.array('photos', 5), async (req, res) => {
    if (req.user.role !== 'gym') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gym = await Gym.findById(req.user.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const { gymName, address, ownerName, ownerEmail, membershipPlans, deletePhotos } = req.body;

        if (gymName) gym.gymName = gymName;
        if (address) gym.address = address;
        if (ownerName) gym.ownerName = ownerName;
        if (ownerEmail) gym.ownerEmail = ownerEmail;
        if (membershipPlans) gym.membershipPlans = JSON.parse(membershipPlans);

        if (deletePhotos) {
            const photosToDelete = JSON.parse(deletePhotos);
            for (const photoUrl of photosToDelete) {
                const publicId = photoUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`gym_photos/${publicId}`);
                gym.photos = gym.photos.filter((photo) => photo !== photoUrl);
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'gym_photos' },
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                })
            );
            const uploadedPhotos = await Promise.all(uploadPromises);
            gym.photos.push(...uploadedPhotos);
        }

        await gym.save();

        // Log the gym update event
        const eventLog = new EventLog({
            event: 'Gym Update',
            page: '/update-gym',
            user: req.user.id,
            userModel: 'Gym',
            details: `Gym ${gym.gymName} updated details`,
        });
        await eventLog.save();

        res.json({ message: 'Gym updated', gym });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get join requests (Gym and Trainers)
router.get('/requests', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        let gym;
        if (req.user.role === 'gym') {
            gym = await Gym.findById(req.user.id).populate({
                path: 'joinRequests',
                populate: { path: 'user', select: 'name email' },
            });
        } else {
            const trainer = await Trainer.findById(req.user.id);
            if (!trainer || !trainer.gym) {
                return res.status(404).json({ message: 'Trainer not found or not associated with a gym' });
            }
            gym = await Gym.findById(trainer.gym).populate({
                path: 'joinRequests',
                populate: { path: 'user', select: 'name email' },
            });
        }

        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const pendingRequests = Array.isArray(gym.joinRequests)
            ? gym.joinRequests.filter((req) => req && req.status === 'pending')
            : [];

        // Trainers can only see Member requests
        if (req.user.role === 'trainer') {
            return res.json(pendingRequests.filter((req) => req.userModel === 'Member'));
        }

        res.json(pendingRequests);
    } catch (error) {
        console.error('Error in /requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept join request (Gym and Trainers)
router.post('/requests/:requestId/accept', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const joinRequest = await JoinRequest.findById(req.params.requestId).populate('user');
        if (!joinRequest || joinRequest.status !== 'pending') {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        let gym;
        if (req.user.role === 'gym') {
            gym = await Gym.findById(req.user.id);
        } else {
            const trainer = await Trainer.findById(req.user.id);
            if (!trainer || !trainer.gym) {
                return res.status(404).json({ message: 'Trainer not found or not associated with a gym' });
            }
            gym = await Gym.findById(trainer.gym);
            // Trainers can only accept Member requests
            if (joinRequest.userModel !== 'Member') {
                return res.status(403).json({ message: 'Trainers can only manage Member join requests' });
            }
        }

        if (joinRequest.gym.toString() !== gym._id.toString()) {
            return res.status(403).json({ message: 'Request does not belong to this gym' });
        }

        joinRequest.status = 'accepted';
        await joinRequest.save();

        const userModel = joinRequest.userModel === 'Member' ? Member : Trainer;
        const user = await userModel.findById(joinRequest.user._id);
        user.gym = gym._id;

        if (joinRequest.userModel === 'Member') {
            const duration = joinRequest.membershipDuration;
            const startDate = new Date();
            let endDate;
            switch (duration) {
                case '1 week':
                    endDate = new Date(startDate.setDate(startDate.getDate() + 7));
                    break;
                case '1 month':
                    endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
                    break;
                case '3 months':
                    endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
                    break;
                case '6 months':
                    endDate = new Date(startDate.setMonth(startDate.getMonth() + 6));
                    break;
                case '1 year':
                    endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
                    break;
            }
            user.membership = { duration, startDate: new Date(), endDate };
            gym.members.push(user._id);
        } else {
            gym.trainers.push(user._id);
        }

        await user.save();
        await gym.save();

        // Log the join request acceptance event
        const eventLog = new EventLog({
            event: 'Join Request Accepted',
            page: '/gym-dashboard',
            user: req.user.id,
            userModel: req.user.role === 'gym' ? 'Gym' : 'Trainer',
            details: `${req.user.role === 'gym' ? 'Gym' : 'Trainer'} accepted join request from ${joinRequest.userModel} ${joinRequest.user.name}`,
        });
        await eventLog.save();

        res.json({ message: 'Request accepted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Deny join request (Gym and Trainers)
router.post('/requests/:requestId/deny', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const joinRequest = await JoinRequest.findById(req.params.requestId);
        if (!joinRequest || joinRequest.status !== 'pending') {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        let gym;
        if (req.user.role === 'gym') {
            gym = await Gym.findById(req.user.id);
        } else {
            const trainer = await Trainer.findById(req.user.id);
            if (!trainer || !trainer.gym) {
                return res.status(404).json({ message: 'Trainer not found or not associated with a gym' });
            }
            gym = await Gym.findById(trainer.gym);
            if (joinRequest.userModel !== 'Member') {
                return res.status(403).json({ message: 'Trainers can only manage Member join requests' });
            }
        }

        if (joinRequest.gym.toString() !== gym._id.toString()) {
            return res.status(403).json({ message: 'Request does not belong to this gym' });
        }

        joinRequest.status = 'denied';
        await joinRequest.save();

        // Log the join request denial event
        const eventLog = new EventLog({
            event: 'Join Request Denied',
            page: '/gym-dashboard',
            user: req.user.id,
            userModel: req.user.role === 'gym' ? 'Gym' : 'Trainer',
            details: `${req.user.role === 'gym' ? 'Gym' : 'Trainer'} denied join request from ${joinRequest.userModel}`,
        });
        await eventLog.save();

        res.json({ message: 'Request denied' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get specific gym details (MUST BE AFTER /requests routes)
router.get('/:id', async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id)
            .select('-password')
            .populate('members', 'name email')
            .populate('trainers', 'name email');
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        // Log page view event if user is authenticated
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userModelMap = {
                admin: 'Admin',
                gym: 'Gym',
                trainer: 'Trainer',
                member: 'Member',
            };
            const eventLog = new EventLog({
                event: 'Page View',
                page: `/gym/${req.params.id}`,
                user: decoded.id,
                userModel: userModelMap[decoded.role],
                details: `${userModelMap[decoded.role]} viewed gym ${gym.gymName}`,
            });
            await eventLog.save();
        }

        res.json(gym);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;