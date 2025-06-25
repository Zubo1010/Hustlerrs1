// routes/users.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware').protect;
const User = require('../models/Users');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const mongoose = require('mongoose');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics for dashboard
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let stats = {};

    if (user.role === 'Hustler') {
      // Stats for hustlers
      const totalApplications = await Job.countDocuments({
        applicants: userId,
        status: { $in: ['open', 'in-progress'] }
      });

      const pendingApplications = await Job.countDocuments({
        applicants: userId,
        status: 'open'
      });

      const completedJobs = await Job.countDocuments({
        assignedTo: userId,
        status: { $in: ['in-progress', 'completed'] }
      });

      // Calculate weekly earnings (mock data for now)
      const weeklyEarnings = Math.floor(Math.random() * 1000) + 200;

      stats = {
        totalApplications,
        pendingApplications,
        completedJobs,
        weeklyEarnings,
        // Add other stats if needed, e.g., totalEarnings, averageRating
        totalEarnings: Math.floor(Math.random() * 5000),
        averageRating: (Math.random() * (5 - 4) + 4).toFixed(1)
      };
    } else {
      // Stats for job givers
      const openJobs = await Job.countDocuments({
        createdBy: userId,
        status: 'open'
      });

      // *** Fix: use 'new' when creating ObjectId instance ***
      const totalApplicantsResult = await Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: { $size: '$applicants' } } } }
      ]);
      const totalApplicants = totalApplicantsResult.length > 0 ? totalApplicantsResult[0].total : 0;

      const hiredWorkers = await Job.countDocuments({
        createdBy: userId,
        status: 'completed'
      });

      // Calculate monthly jobs posted
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const monthlyJobs = await Job.countDocuments({
        createdBy: userId,
        createdAt: { $gte: oneMonthAgo }
      });

      stats = {
        openJobs,
        totalApplicants,
        hiredWorkers,
        monthlyJobs,
        // Add other stats if needed, e.g., satisfactionRate
        satisfactionRate: (Math.random() * (100 - 90) + 90).toFixed(0) + '%'
      };
    }

    res.json(stats);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
