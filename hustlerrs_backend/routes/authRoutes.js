const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');


//////////////////////////////////// Register AUTH /////////////////////////////////////////////////////////////

router.post('/register', registerUser);


//////////////////////////////////// LOGIN AUTH /////////////////////////////////////////////////////////////
router.post('/login', loginUser);

//////////////////////////////////// GET CURRENT USER /////////////////////////////////////////////////////////////
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
