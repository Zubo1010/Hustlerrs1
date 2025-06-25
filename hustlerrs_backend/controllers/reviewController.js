const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const User = require('../models/Users');
const Message = require('../models/Message');

/**
 * @desc    Submit a review for a completed job, mark job as completed, and clear chat.
 * @route   POST /api/reviews/job/:jobId
 * @access  Private (Job Giver only)
 */
exports.submitReview = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { rating, comment } = req.body;
    const jobGiverId = req.user._id;

    const job = await Job.findById(jobId);

    // --- Validation Checks ---
    if (!job) {
        res.status(404);
        throw new Error('Job not found.');
    }
    if (!job.createdBy.equals(jobGiverId)) {
        res.status(403);
        throw new Error('You are not authorized to review this job.');
    }
    if (job.status !== 'in-progress') {
        res.status(400);
        throw new Error('This job is not in a state that can be reviewed.');
    }
    if (job.isReviewed) {
        res.status(400);
        throw new Error('A review has already been submitted for this job.');
    }

    const hustlerId = job.assignedTo;
    if (!hustlerId) {
        res.status(400);
        throw new Error('No hustler is assigned to this job.');
    }

    // --- Create and Save Review ---
    const hustler = await User.findById(hustlerId);
    if (!hustler) {
        res.status(404);
        throw new Error('Assigned hustler not found.');
    }

    const review = {
        rating,
        comment,
        job: jobId,
        jobGiver: jobGiverId,
    };

    hustler.reviews.push(review);
    await hustler.save();
    
    // --- Finalize Job and Clean Up ---
    job.status = 'completed';
    job.isReviewed = true;
    await job.save();

    await Message.deleteMany({ job: jobId });

    res.status(201).json({ message: 'Review submitted successfully.' });
}); 