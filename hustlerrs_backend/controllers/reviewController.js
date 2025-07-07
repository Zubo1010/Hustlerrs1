const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const User = require('../models/Users');
const Message = require('../models/Message');
const Review = require('../models/Review');
const { getIo } = require('../socket');
const { createNotification } = require('./notificationController');

/**
 * @desc    Submit a review for a completed job, mark job as completed, and clear chat.
 * @route   POST /api/reviews/job/:jobId
 * @access  Private (Job Giver only)
 */
exports.submitReview = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { rating, comment, deleteMessages } = req.body;
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

    // Emit socket event to notify hustler
    getIo().to(`job_${jobId}`).emit('jobReviewed', {
        jobId,
        reviewerName: job.createdBy.name
    });

    res.status(201).json({ message: 'Review submitted successfully.' });
});

exports.createJobReview = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { rating, comment } = req.body;
        
        console.log('Debug - Request user:', req.user);
        console.log('Debug - Job ID:', jobId);
        
        // Get user ID from the authenticated request
        const reviewerId = req.user._id;

        // Find the job and populate necessary fields
        const job = await Job.findById(jobId)
            .populate({
                path: 'createdBy',
                select: '_id email fullName'
            })
            .populate({
                path: 'assignedTo',
                select: '_id email fullName'
            });

        console.log('Debug - Found job:', job);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!job.assignedTo) {
            return res.status(400).json({ message: 'No hustler has been assigned to this job' });
        }

        // Verify the reviewer is the job creator
        console.log('Debug - Comparing IDs:', {
            reviewerId: reviewerId.toString(),
            createdById: job.createdBy._id.toString()
        });

        if (job.createdBy._id.toString() !== reviewerId.toString()) {
            return res.status(403).json({ message: 'Only the job creator can leave a review' });
        }

        // Create the review
        const review = new Review({
            job: jobId,
            reviewer: reviewerId,
            reviewee: job.assignedTo._id,
            rating,
            comment
        });

        await review.save();

        // Update job status and review flag
        job.status = 'completed';
        job.isReviewed = true;
        await job.save();

        // Delete all messages for this job
        console.log('Debug - Deleting messages for job:', jobId);
        await Message.deleteMany({ job: jobId });

        // Create notification for the hustler
        await createNotification({
            recipient: job.assignedTo._id,
            type: 'REVIEW_RECEIVED',
            message: `You received a ${rating}-star review for job: ${job.title}`,
            relatedJob: jobId
        });

        // Update user's average rating
        const allReviews = await Review.find({ reviewee: job.assignedTo._id });
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await User.findByIdAndUpdate(job.assignedTo._id, {
            $set: { 
                averageRating,
                reviewCount: allReviews.length
            }
        });

        const populatedReview = await Review.findById(review._id)
            .populate('reviewer', 'fullName')
            .populate('reviewee', 'fullName')
            .populate('job', 'title');

        try {
            const io = getIo();
            
            // Notify both users to update their chat lists
            if (job.createdBy._id) {
                io.to(`user_${job.createdBy._id}`).emit('chatRemoved', { 
                    jobId,
                    message: 'Chat closed: Job completed and reviewed'
                });
            }
            
            if (job.assignedTo._id) {
                io.to(`user_${job.assignedTo._id}`).emit('chatRemoved', { 
                    jobId,
                    message: 'Chat closed: Job completed and reviewed'
                });
            }

            // Notify about job completion and review
            io.to(`job_${jobId}`).emit('jobCompleted', {
                jobId,
                message: 'Job has been completed and reviewed',
                review: populatedReview
            });
        } catch (socketError) {
            console.error('Socket notification error:', socketError);
            // Continue with the response even if socket notifications fail
        }

        res.status(201).json({
            message: 'Review created successfully',
            review: populatedReview
        });

    } catch (error) {
        console.error('Error in createJobReview:', error);
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
}; 