const express = require('express');
const router = express.Router();
const { createShift, getShifts, deleteShift } = require('../controllers/shiftController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyAdmin, createShift);
router.get('/', verifyToken, getShifts);
router.delete('/:id', verifyToken, deleteShift);

module.exports = router;
