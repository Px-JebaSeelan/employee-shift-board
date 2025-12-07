const Shift = require('../models/Shift');
const mongoose = require('mongoose');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function parseTime(str) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

async function createShift(req, res) {
    try {
        const { userId, date, startTime, endTime } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid employee selection required' });
        }

        if (!date || !dateRegex.test(date)) {
            return res.status(400).json({ message: 'Valid date required (YYYY-MM-DD)' });
        }

        const start = parseTime(startTime);
        const end = parseTime(endTime);

        if (!start || !end) {
            return res.status(400).json({ message: 'Valid start and end times required' });
        }

        const duration = end - start;
        if (duration <= 0) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        const minDuration = 4 * 60 * 60 * 1000;
        if (duration < minDuration) {
            const hrs = (duration / 3600000).toFixed(1);
            return res.status(400).json({ message: `Shift must be at least 4 hours (currently ${hrs}h)` });
        }

        const maxDuration = 12 * 60 * 60 * 1000;
        if (duration > maxDuration) {
            return res.status(400).json({ message: 'Shift cannot exceed 12 hours' });
        }

        const overlap = await Shift.findOne({
            userId,
            date,
            startTime: { $lt: end },
            endTime: { $gt: start }
        });

        if (overlap) {
            return res.status(409).json({ message: 'This overlaps with an existing shift' });
        }

        const shift = new Shift({ userId, date, startTime: start, endTime: end });
        await shift.save();

        const populated = await Shift.findById(shift._id)
            .populate('userId', 'name email employeeCode')
            .lean();

        res.status(201).json({ message: 'Shift created', shift: populated });
    } catch (err) {
        console.error('[SHIFT] Create failed:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Could not create shift' });
    }
}

async function getShifts(req, res) {
    try {
        const { date } = req.query;
        const filter = {};

        if (date) {
            if (!dateRegex.test(date)) {
                return res.status(400).json({ message: 'Invalid date format' });
            }
            filter.date = date;
        }

        if (req.user.role !== 'admin') {
            filter.userId = req.user.userId;
        }

        const shifts = await Shift.find(filter)
            .populate('userId', 'name email employeeCode')
            .sort({ date: 1, startTime: 1 })
            .lean();

        res.json({ shifts });
    } catch (err) {
        console.error('[SHIFT] Get failed:', err.message);
        res.status(500).json({ message: 'Could not fetch shifts' });
    }
}

async function deleteShift(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid shift ID' });
        }

        const shift = await Shift.findById(id);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        const isOwner = shift.userId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this shift' });
        }

        await Shift.findByIdAndDelete(id);
        res.json({ message: 'Shift deleted' });
    } catch (err) {
        console.error('[SHIFT] Delete failed:', err.message);
        res.status(500).json({ message: 'Could not delete shift' });
    }
}

module.exports = { createShift, getShifts, deleteShift };
