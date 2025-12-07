const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    date: {
        type: String,
        required: [true, 'Date is required'],
        match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    }
}, { timestamps: true });

shiftSchema.pre('save', function () {
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    const duration = end - start;
    const fourHours = 4 * 60 * 60 * 1000;

    if (duration <= 0) {
        const err = new Error('End time must be after start time');
        err.name = 'ValidationError';
        throw err;
    }

    if (duration < fourHours) {
        const hrs = (duration / 3600000).toFixed(1);
        const err = new Error(`Shift must be at least 4 hours (got ${hrs}h)`);
        err.name = 'ValidationError';
        throw err;
    }
});

shiftSchema.index({ userId: 1, date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Shift', shiftSchema);
