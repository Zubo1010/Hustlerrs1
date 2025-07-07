const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');
const Job = require('../models/Job');
const Message = require('../models/Message');

// Send a message (jobId in params)
router.post('/:jobId/message', protect, chatController.sendMessage);

// Get all messages for a job
router.get('/:jobId/messages', protect, async (req, res) => {
    try {
        const messages = await Message.find({ job: req.params.jobId })
            .populate('sender', 'fullName')
            .sort('createdAt');
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});

// Get chat-eligible jobs
router.get('/jobs', protect, async (req, res) => {
    try {
        console.log('Debug - Fetching jobs for user:', req.user._id);
        
        // Find jobs where the user is either the creator or the assigned hustler
        const jobs = await Job.find({
            $or: [
                { createdBy: req.user._id },
                { assignedTo: req.user._id }
            ]
        })
        .populate('createdBy', '_id fullName email')
        .populate('assignedTo', '_id fullName email')
        .sort('-updatedAt');

        console.log('Debug - Found jobs:', jobs.length);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching chat jobs:', error);
        res.status(500).json({ 
            message: 'Error fetching jobs', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
});

module.exports = router; 