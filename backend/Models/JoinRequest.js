const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['Member', 'Trainer'] },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' },
    membershipDuration: { type: String, enum: ['1 week', '1 month', '3 months', '6 months', '1 year'] }, // Removed default: null
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JoinRequest', joinRequestSchema);