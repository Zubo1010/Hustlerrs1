const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { createJobReview } = require('../controllers/reviewController');

// @route   POST /api/reviews/job/:jobId
// @desc    Submit a review for a job
// @access  Private (Job Giver only)
router.post('/job/:jobId', protect, authorizeRole(['Job Giver']), createJobReview);

module.exports = router; 