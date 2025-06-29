const fsPromises = require('fs').promises;

const HustlerApplication = require('../models/HustlerApplication');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const path = require('path');

exports.apply = async (req, res) => {
    try {
        const {
            name,
            age,
            address,
            latitude,
            longitude,
            password,
            email,
            phone,
            division,
            district,
            upazila
        } = req.body;

        if (!req.files || !req.files.nidOrBirthCertificate || !req.files.studentId || !req.files.profilePicture) {
            return res.status(400).json({ message: 'Please upload all required documents.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const nidOrBirthCertificatePath = '/uploads/' + req.files.nidOrBirthCertificate[0].filename;
        const studentIdPath = '/uploads/' + req.files.studentId[0].filename;
        const profilePicturePath = '/uploads/' + req.files.profilePicture[0].filename;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newApplication = new HustlerApplication({
            name,
            age,
            address,
            latitude,
            longitude,
            division,
            district,
            upazila,
            email,
            phone,
            nidOrBirthCertificate: nidOrBirthCertificatePath,
            studentId: studentIdPath,
            profilePicture: profilePicturePath,
            password: hashedPassword,
        });

        await newApplication.save();

        res.status(201).json({ message: 'Application submitted successfully. We will review it within 24 hours.' });
    } catch (error) {
        console.error('Error in apply function:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getApplications = async (req, res) => {
    try {
        const applications = await HustlerApplication.find({ status: 'pending' });
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.approveApplication = async (req, res) => {
    try {
      const application = await HustlerApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
  
      application.status = 'approved';
  
      const {
        name,
        age,
        address,
        latitude,
        longitude,
        email,
        phone,
        profilePicture,
        password: hashedPassword,
        division,
        district,
        upazila,
      } = application;
  
      const timestamp = Date.now();
      const profilePictureExtension = profilePicture.split('.').pop();
      const newProfilePictureName = `profile-${timestamp}.${profilePictureExtension}`;
      const newProfilePicturePath = `/uploads/profile-pictures/${newProfilePictureName}`;
  
      const oldProfilePicturePath = path.join(__dirname, '../', profilePicture);
      const uploadsDir = path.join(__dirname, '../uploads/profile-pictures');
  
      // Ensure uploads directory exists
      await fsPromises.mkdir(uploadsDir, { recursive: true });
  
      const newProfilePictureFullPath = path.join(__dirname, '../', newProfilePicturePath);
  
      // Check if old profile picture exists before copying
      try {
        await fsPromises.access(oldProfilePicturePath);
      } catch (err) {
        console.error('Old profile picture does not exist:', err);
        return res.status(500).json({ message: 'Original profile picture file not found.' });
      }
  
      // Copy the profile picture file
      await fsPromises.copyFile(oldProfilePicturePath, newProfilePictureFullPath);
  
      // Create the new User
      const newUser = new User({
        fullName: name,
        email: email,
        password: hashedPassword,
        role: 'Hustler',
        phone: phone,
        age,
        division,
        district,
        upazila,
        address,
        profilePicture: newProfilePicturePath,
      });
  
      await newUser.save();
      await application.save();
  
      return res.json({ message: 'Application approved successfully' });
    } catch (error) {
      console.error('Error in approveApplication:', error);
      return res.status(500).json({ message: 'Server error: ' + error.message });
    }
  };
exports.rejectApplication = async (req, res) => {
    try {
        const application = await HustlerApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = 'rejected';
        await application.save();

        res.json({ message: 'Application rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
