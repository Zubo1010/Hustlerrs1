const express = require('express');
const router = express.Router();
const hustlerApplicationController = require('../controllers/hustlerApplicationController');
const { upload } = require('../middleware/multer');

const multerUpload = upload.fields([
    { name: 'nidOrBirthCertificate', maxCount: 1 },
    { name: 'studentId', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
]);

router.post('/apply', (req, res, next) => {
    multerUpload(req, res, function (err) {
        if (err) {
            // A Multer error occurred when uploading.
            console.error("Multer error:", err);
            return res.status(400).json({ message: "File upload error: " + err.message });
        }
        // Everything went fine, proceed to the controller.
        next();
    })
}, hustlerApplicationController.apply);

router.get('/', hustlerApplicationController.getApplications);
router.put('/:id/approve', hustlerApplicationController.approveApplication);
router.put('/:id/reject', hustlerApplicationController.rejectApplication);

module.exports = router; 