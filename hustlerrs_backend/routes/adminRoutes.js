const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/adminController');

// All routes in this file are protected and for admins only
router.use(protect, authorizeRole(['Admin']));

router.get('/dashboard', getDashboardStats);

module.exports = router; 