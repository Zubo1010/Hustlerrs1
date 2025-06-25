const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
  
    const token = authHeader.split(' ')[1]; // Bearer <token>
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach user info to request object
      req.user = decoded;
  
      next(); // pass control to next middleware or route
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
  const protect = async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
        // console.log('Token received:', token);
  
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Token decoded:', decoded);
  
        const user = await User.findById(decoded.userId).select('-password');
        // console.log('User found:', user);
  
        if (!user) {
          // console.error('User not found for id:', decoded.userId);
          return res.status(401).json({ message: 'User not found' });
        }
  
        req.user = user;
        next();
      } catch (err) {
        // console.error('Auth middleware error:', err);
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      // console.error('No token provided');
      return res.status(401).json({ message: 'Not authorized, no token' });
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
