const Notification = require('../models/Notification');
const Job = require('../models/Job');
const User = require('../models/Users');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    console.log('Getting notifications for user:', req.user);
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'fullName profilePicture')
      .populate('job', 'title')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    console.log('Marking notification as read:', req.params.id);
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    console.log('Marking all notifications as read for user:', req.user._id);
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    // console.log('Getting unread count for user:', req.user);

    if (!req.user || !req.user._id) {
      // console.error('User or user._id is missing:', req.user);
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    // console.log('Unread count:', count);
    res.json({ count });
  } catch (error) {
    // console.error('Error in getUnreadCount:', error);
    res.status(500).json({ message: 'Error getting unread count', error: error.message });
  }
};

// Create a notification (helper function to be used by other controllers)
exports.createNotification = async ({ recipient, sender, job, type, price = null }) => {
  try {
    console.log('Creating notification:', { recipient, sender, job, type, price });
    const jobDoc = await Job.findById(job);
    const senderDoc = await User.findById(sender);
    
    if (!jobDoc || !senderDoc) {
      console.error('Job or sender not found:', { job, sender });
      return null;
    }

    let message = '';
    switch (type) {
      case 'job_application':
        message = `${senderDoc.fullName} has applied for your job "${jobDoc.title}"`;
        break;
      case 'bid_placed':
        message = `${senderDoc.fullName} has placed a bid of ৳${price} on your job "${jobDoc.title}"`;
        break;
      case 'bid_accepted':
        message = `Your bid of ৳${price} has been accepted for the job "${jobDoc.title}"`;
        break;
      case 'bid_rejected':
        message = `Your bid for the job "${jobDoc.title}" has been rejected`;
        break;
      default:
        message = 'New notification';
    }

    const notification = new Notification({
      recipient,
      sender,
      job,
      type,
      message,
      price
    });

    await notification.save();
    console.log('Notification created successfully:', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}; 