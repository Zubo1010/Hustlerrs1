const mongoose = require('mongoose');

const HustlerApplicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    nidOrBirthCertificate: {
        type: String, // Path to the uploaded image
        required: true,
    },
    studentId: {
        type: String, // Path to the uploaded image
        required: true,
    },
    profilePicture: {
        type: String, // Path to the uploaded image
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('HustlerApplication', HustlerApplicationSchema); 