const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Utility to sanitize username (alphanumeric only)
function sanitizeUsername(username) {
    return username ? username.replace(/[^a-zA-Z0-9]/g, '') : 'user';
}

// Map fieldname to suffix
function getFileSuffix(fieldname) {
    if (fieldname === 'nidOrBirthCertificate') return 'NID';
    if (fieldname === 'studentId') return 'StudentID';
    if (fieldname === 'profilePicture') return 'ProfilePic';
    return 'File';
}

// Set up storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath;
        if (file.fieldname === 'profilePicture') {
            uploadPath = path.resolve(__dirname, '..', 'uploads', 'profile-pictures');
        } else {
            uploadPath = path.resolve(__dirname, '..', 'uploads');
        }
        
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        // Get username from req.body (may be 'name' or 'fullName')
        const username = req.body.name || req.body.fullName || 'user';
        const sanitized = sanitizeUsername(username);
        const suffix = getFileSuffix(file.fieldname);
        const timestamp = Date.now(); // Add timestamp to ensure uniqueness
        const ext = path.extname(file.originalname);
        cb(null, `${sanitized}${suffix}_${timestamp}${ext}`);
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Check mime type to ensure it's an image
    const isMimeTypeAllowed = file.mimetype.startsWith('image/');

    // Check file extension
    const allowedExtensions = /jpeg|jpg|png|gif/;
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    const isExtensionAllowed = allowedExtensions.test(fileExtension);

    if (isMimeTypeAllowed && isExtensionAllowed) {
        return cb(null, true);
    } else {
        return cb(new Error('Invalid file type. Only JPG, PNG, and GIF images are allowed.'));
    }
}

module.exports = { upload }; 