const asyncHandler = require('express-async-handler');
const User = require('../models/Users');
const Job = require('../models/Job');

/**
 * @desc    Get dashboard stats for admin
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();

    res.json({
        message: `Welcome, Admin ${req.user.fullName}!`,
        stats: {
            totalUsers,
            totalJobs,
        }
    });
}); 