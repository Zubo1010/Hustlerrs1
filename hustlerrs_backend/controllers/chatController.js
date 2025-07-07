const Message = require('../models/Message');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

// Send a message (only if hustler is assigned to the job)
exports.sendMessage = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { text, receiverId } = req.body;
    const senderId = req.user._id;

    // Find job and check if sender/receiver are allowed
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Find accepted bid for this job
    const acceptedBid = await Bid.findOne({ job: jobId, status: 'accepted' });
    if (!acceptedBid) return res.status(403).json({ message: 'No assigned hustler for this job' });

    // Only jobGiver and assigned hustler can chat
    const allowedUsers = [job.createdBy.toString(), job.assignedTo.toString()];
    if (!allowedUsers.includes(senderId.toString()) || !allowedUsers.includes(receiverId.toString())) {
      return res.status(403).json({ message: 'Not authorized to chat for this job' });
    }

    const message = await Message.create({
      job: jobId,
      hustler: job.assignedTo,
      jobGiver: job.createdBy,
      sender: senderId,
      receiver: receiverId,
      text
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get all messages for a job between jobGiver and hustler
exports.getMessages = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Find accepted bid for this job
    const acceptedBid = await Bid.findOne({ job: jobId, status: 'accepted' });
    if (!acceptedBid) return res.status(403).json({ message: 'No assigned hustler for this job' });

    // Only jobGiver and assigned hustler can view
    const allowedUsers = [job.createdBy.toString(), job.assignedTo.toString()];
    if (!allowedUsers.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view messages for this job' });
    }

    const messages = await Message.find({ job: jobId })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

exports.getChatJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find jobs where the user is either the creator or the assigned hustler
    const jobs = await Job.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })
    .populate('createdBy', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .sort('-updatedAt');

    console.log('Debug - Found jobs for user:', userId);
    console.log('Debug - Number of jobs found:', jobs.length);
    
    res.json(jobs);
  } catch (error) {
    console.error('Error in getChatJobs:', error);
    res.status(500).json({ 
      message: 'Error fetching chat jobs', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
}; 