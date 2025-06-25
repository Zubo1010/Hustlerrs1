const User = require('../models/Users');
const Bid = require('../models/Bid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
}).single('profilePicture');

// Get logged-in user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').populate('completedJobsCount').populate('postedJobsCount');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile by ID
exports.getProfileById = asyncHandler(async (req, res) => {
  try {
    // Add a check for a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(404).json({ message: 'User not found (invalid ID format).' });
    }

    const viewingUser = await User.findById(req.user.userId);
    const profileToView = await User.findById(req.params.userId)
      .populate({
        path: 'reviews',
        populate: {
          path: 'jobGiver',
          select: 'fullName profilePicture',
        }
      })
      .populate('postedJobsCount')
      .populate('completedJobsCount');

    if (!profileToView) {
      return res.status(404).json({ message: 'User not found' });
    }

    // A user can always view their own profile
    if (req.user.userId === req.params.userId) {
      return res.json(profileToView);
    }

    // Job Giver profiles are public to logged-in users
    if (profileToView.role === 'Job Giver') {
      return res.json(profileToView);
    }

    // Logic for viewing a Hustler's profile
    if (profileToView.role === 'Hustler') {
      // Only Job Givers can view Hustler profiles under certain conditions
      if (viewingUser.role !== 'Job Giver') {
        return res.status(403).json({ message: "You are not authorized to view this profile." });
      }

      // Check if the Hustler has applied to any of the Job Giver's jobs
      const userBidsOnGiverJobs = await Bid.findOne({
        hustler: profileToView._id,
        job: { $in: await mongoose.model('Job').find({ createdBy: viewingUser._id }).distinct('_id') }
      });

      if (userBidsOnGiverJobs) {
        return res.json(profileToView);
      } else {
        return res.status(403).json({ message: "You can only view the profile of Hustlers who have applied to your jobs." });
      }
    }
    
    // Default deny
    return res.status(403).json({ message: 'You are not authorized to view this profile.' });

  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, location, bio, skills, businessName } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    
    // Role-specific updates
    const user = await User.findById(req.user.userId);
    if (user.role === 'Hustler') {
      if (skills) updateData.skills = skills;
    } else if (user.role === 'Job Giver') {
      if (businessName) updateData.businessName = businessName;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Store the URL path instead of the file system path
      const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { profilePicture: profilePicturePath },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
}; 