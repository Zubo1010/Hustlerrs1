const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/Users');
const { createNotification } = require('./notificationController');

// Get all bids for a job
exports.getJobBids = async (req, res) => {
  try {
    const bids = await Bid.find({ job: req.params.jobId })
      .populate('hustler', 'name email profilePicture')
      .populate('job', 'timeCommitment priceType fixedPrice minPrice maxPrice')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids', error: error.message });
  }
};

// Get all bids for a hustler
exports.getHustlerBids = async (req, res) => {
  try {
    const bids = await Bid.find({ hustler: req.user._id })
      .populate('job', 'title description status')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids', error: error.message });
  }
};

// Create a new bid
exports.createBid = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { price, notes } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.createdBy.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot bid on your own job' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'Job is not accepting applications' });
    }

    // Check if hustler has already applied
    const existingBid = await Bid.findOne({ job: jobId, hustler: req.user._id });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create bid
    const bid = new Bid({
      job: jobId,
      hustler: req.user._id,
      price,
      notes,
      statusHistory: [{
        status: 'pending',
        changedAt: Date.now(),
        changedBy: req.user._id,
        reason: 'Initial application'
      }]
    });

    await bid.save();

    // Add bid to job
    job.bids.push(bid._id);
    await job.save();

    // Create notification for job creator
    await createNotification({
      recipient: job.createdBy,
      sender: req.user._id,
      job: jobId,
      type: 'job_application',
      price
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error creating bid', error: error.message });
  }
};

// Withdraw a bid
exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.hustler.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this bid' });
    }

    await bid.withdraw();

    // Create notification for job creator
    await createNotification({
      recipient: bid.job.createdBy,
      sender: req.user._id,
      job: bid.job,
      type: 'bid_withdrawn'
    });

    res.json({ message: 'Bid withdrawn successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing bid', error: error.message });
  }
};

// Update bid status (accept/reject)
exports.updateBidStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const bid = await Bid.findById(req.params.bidId).populate('hustler', 'name email');
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Get job to verify job creator
    const job = await Job.findById(bid.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this bid' });
    }

    await bid.updateStatus(status, req.user._id, reason);

    // If bid is accepted, update job status and reject other bids
    if (status === 'accepted') {
      job.status = 'in-progress';
      job.assignedTo = bid.hustler._id; // Use the populated hustler's ID
      await job.save();

      // Reject all other pending bids for this job
      const otherBids = await Bid.find({ job: bid.job, status: 'pending', _id: { $ne: bid._id } });
      for (const otherBid of otherBids) {
        await otherBid.updateStatus('rejected', req.user._id, 'Another applicant was selected.');
        // Optionally, send notifications for rejected bids too
        await createNotification({
            recipient: otherBid.hustler,
            sender: req.user._id,
            job: otherBid.job,
            type: 'bid_rejected',
            price: otherBid.price
        });
      }
    }

    // Create notification for the hustler whose bid status was updated
    await createNotification({
      recipient: bid.hustler,
      sender: req.user._id,
      job: bid.job,
      type: status === 'accepted' ? 'bid_accepted' : 'bid_rejected',
      price: bid.price
    });

    res.json({ message: 'Bid status updated successfully', bid });
  } catch (error) {
    console.error('Error updating bid status:', error);
    res.status(500).json({ message: 'Error updating bid status', error: error.message });
  }
};

// Get bid details
exports.getBidDetails = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('hustler', 'name email profilePicture')
      .populate('job', 'title description status');
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bid details', error: error.message });
  }
};
