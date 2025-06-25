const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, profileController.getProfile);

// Get user profile by ID
router.get('/:userId', auth, profileController.getProfileById);

// Update user profile
router.put('/', auth, profileController.updateProfile);

// Upload profile picture
router.post('/upload-picture', auth, profileController.uploadProfilePicture);

// Get nearby hustlers (for Job Givers)
router.get('/nearby-hustlers', auth, profileController.getNearbyHustlers);

module.exports = router; 