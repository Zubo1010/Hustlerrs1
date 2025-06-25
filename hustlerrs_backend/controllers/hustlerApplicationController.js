const fs = require('fs');
const HustlerApplication = require('../models/HustlerApplication');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const path = require('path');

exports.apply = async (req, res) => {
    try {
        const { name, age, address, latitude, longitude, password, email, phone } = req.body;

        if (!req.files || !req.files.nidOrBirthCertificate || !req.files.studentId || !req.files.profilePicture) {
            return res.status(400).json({ message: 'Please upload all required documents.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const nidOrBirthCertificatePath = '/uploads/' + req.files.nidOrBirthCertificate[0].filename;
        const studentIdPath = '/uploads/' + req.files.studentId[0].filename;
        const profilePicturePath = '/uploads/' + req.files.profilePicture[0].filename;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newApplication = new HustlerApplication({
            name,
            age,
            address,
            latitude,
            longitude,
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
        const fs = require('fs');
        fs.writeFile('d:\\HUSTLERRS\\hustlerrs_backend\\error.log', `Error approving application: ${error.message}\n${error.stack}\n`, (err) => {
            if (err) console.error('Error writing to log file:', err);
        });
        console.error('Error approving application:', error);
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

        // Create a new user
        const { name, age, address, latitude, longitude, email, phone, profilePicture, password: hashedPassword } = application;

        // Generate a unique filename for the profile picture
        const timestamp = Date.now();
        const profilePictureExtension = profilePicture.split('.').pop();
        const newProfilePictureName = `profile-${timestamp}.${profilePictureExtension}`;
        const newProfilePicturePath = `/uploads/profile-pictures/${newProfilePictureName}`;

        // Construct the full paths
        const oldProfilePicturePath = path.join(__dirname, '../', profilePicture);
        const uploadsDir = path.join(__dirname, '../uploads/profile-pictures');

        //Ensure the profile-pictures directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const newProfilePictureFullPath = path.join(__dirname, '../', newProfilePicturePath);

        // Copy the profile picture to the new location
        fs.copyFile(oldProfilePicturePath, newProfilePictureFullPath, async  (err) => {
            if (err) {
                console.error('Error copying profile picture:', err);
                return res.status(500).json({ message: 'Error copying profile picture: ' + err.message });
            }

            const newUser = new User({
                fullName: name,
                email: email,
                password: hashedPassword,
                role: 'Hustler',
                phone: phone,
                age,
                location: address, // Use the application's address for the user's location
                profilePicture: newProfilePicturePath,
                // Only include coordinates if both latitude and longitude are valid numbers
                ...(typeof latitude === 'number' && typeof longitude === 'number' && {
                    coordinates: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                })
            });

            await newUser.save();
    
            await application.save();

            // TODO: Send email to the user with their login credentials

            res.json({ message: 'Application approved successfully' });
        });
        return;

        // TODO: Send email to the user with their login credentials

        res.json({ message: 'Application approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
