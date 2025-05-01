const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
    event: { type: String, required: true }, // e.g., "Login", "Register"
    page: { type: String }, // e.g., "N/A", "/gyms"
    user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['Admin', 'Gym', 'Trainer', 'Member'] },
    details: { type: String }, // e.g., "Admin logged in"
    createdAt: { type: Date, default: Date.now },
});

// Middleware to keep only the latest 20 events
eventLogSchema.post('save', async function (doc) {
    try {
        const count = await mongoose.model('EventLog').countDocuments();
        if (count > 20) {
            const oldestEvents = await mongoose.model('EventLog')
                .find()
                .sort({ createdAt: 1 })
                .limit(count - 20);
            const idsToDelete = oldestEvents.map(event => event._id);
            await mongoose.model('EventLog').deleteMany({ _id: { $in: idsToDelete } });
        }
    } catch (error) {
        console.error('Error in event log cleanup:', error);
    }
});

module.exports = mongoose.model('EventLog', eventLogSchema);