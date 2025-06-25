const Message = require('../models/Message');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

// Send a message (only if hustler is accepted for the job)
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
    if (!acceptedBid) return res.status(403).json({ message: 'No accepted hustler for this job' });

    // Only jobGiver and accepted hustler can chat
    const allowedUsers = [job.createdBy.toString(), acceptedBid.hustler.toString()];
    if (!allowedUsers.includes(senderId.toString()) || !allowedUsers.includes(receiverId.toString())) {
      return res.status(403).json({ message: 'Not authorized to chat for this job' });
    }

    const message = await Message.create({
      job: jobId,
      hustler: acceptedBid.hustler,
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
    if (!acceptedBid) return res.status(403).json({ message: 'No accepted hustler for this job' });

    // Only jobGiver and accepted hustler can view
    const allowedUsers = [job.createdBy.toString(), acceptedBid.hustler.toString()];
    if (!allowedUsers.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view messages for this job' });
    }

    const messages = await Message.find({ job: jobId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

exports.getChatJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    let jobs = [];
    if (userRole === 'Job Giver') {
      // Jobs created by this user with an accepted hustler
      jobs = await Job.find({ createdBy: userId, status: 'in-progress', assignedTo: { $ne: null } })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');
    } else if (userRole === 'Hustler') {
      // Jobs where this user is the accepted hustler
      jobs = await Job.find({ assignedTo: userId, status: 'in-progress' })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');
    }
    // Format for frontend
    const chatJobs = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      createdBy: job.createdBy,
      acceptedHustler: job.assignedTo
    }));
    res.json(chatJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat jobs', error: error.message });
  }
}; 