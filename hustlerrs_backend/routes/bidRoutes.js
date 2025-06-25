const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBid,
  getJobBids,
  getHustlerBids,
  withdrawBid,
  updateBidStatus,
  getBidDetails
} = require('../controllers/bidController');

// Get all bids for a job
router.get('/job/:jobId', protect, getJobBids);

// Get all bids for the current hustler
router.get('/my-bids', protect, getHustlerBids);

// Create a new bid
router.post('/job/:jobId', protect, createBid);

// Withdraw a bid
router.put('/:bidId/withdraw', protect, withdrawBid);

// Update bid status (accept/reject)
router.put('/:bidId/status', protect, updateBidStatus);

// Get bid details
router.get('/:bidId', protect, getBidDetails);

module.exports = router;
