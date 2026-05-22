const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerValidators, loginValidators } = require('../validators/authValidators');

// POST /api/auth/register
router.post('/register', registerValidators, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginValidators, validate, authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout  (protected — must be logged in to log out)
router.post('/logout', protect, authController.logout);

// GET /api/auth/me
router.get('/me', protect, authController.getMe);

module.exports = router;
