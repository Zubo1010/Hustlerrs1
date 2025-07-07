const express = require('express');
const router = express.Router();
const { createJobReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Route to submit a review for a job
router.post('/job/:jobId', protect, createJobReview);

module.exports = router; 