const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const protect = async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Debug - Decoded token:', decoded);

            // Get user from token
            const user = await User.findById(decoded.userId).select('-password');
            console.log('Debug - Found user:', user);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Attach the full user object to the request
            req.user = user;
            next();
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized', error: error.message });
    }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.error('User or role not found:', req.user);
      return res.status(401).json({ message: 'User role not found' });
    }
    if (!roles.includes(req.user.role)) {
      console.error('User role not authorized:', req.user.role);
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this resource` });
    }
    next();
  };
};

module.exports = { protect, authorizeRole };
