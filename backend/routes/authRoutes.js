const express = require('express');
const router = express.Router();
const { login, signup, getEmployees } = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/signup', signup);
router.get('/employees', verifyToken, verifyAdmin, getEmployees);

module.exports = router;
