const express = require('express');
const router = express.Router();
const {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    applyForJob,
    getMyApplications,
    updateJobStatus,
    acceptBid,
    rejectBid,
    getJobApplications,
    acceptJob
} = require('../controllers/jobController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Public route to get all jobs with filters
router.get('/', getAllJobs);

// Job Giver routes
router.post('/', protect, authorizeRole(['Job Giver']), createJob);
router.get('/my-jobs', protect, authorizeRole(['Job Giver']), getMyJobs);

// Hustler routes
router.post('/:id/apply', protect, authorizeRole(['Hustler']), applyForJob);
router.get('/my-applications', protect, authorizeRole(['Hustler']), getMyApplications);

// General protected routes
router.get('/:id', protect, getJobById);
router.put('/:id/status', protect, authorizeRole(['Job Giver']), updateJobStatus);

// Route to get all applications for a job (Job Giver only)
router.get('/:id/applications', protect, authorizeRole(['Job Giver']), getJobApplications);

// Bid management routes (must be initiated by job giver)
router.put('/:jobId/bids/:bidId/accept', protect, authorizeRole(['Job Giver']), acceptBid);
router.put('/:jobId/bids/:bidId/reject', protect, authorizeRole(['Job Giver']), rejectBid);

// Accept a job
router.post('/:jobId/accept', protect, acceptJob);

module.exports = router;
