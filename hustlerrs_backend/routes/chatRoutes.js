const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Send a message (jobId in params)
router.post('/:jobId/message', protect, chatController.sendMessage);

// Get all messages for a job
router.get('/:jobId/messages', protect, chatController.getMessages);

// Get chat-eligible jobs
router.get('/jobs', protect, chatController.getChatJobs);

module.exports = router; 