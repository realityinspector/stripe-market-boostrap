const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'marketplace_jwt_secret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Store user info in request object
    req.user = user;
    next();
  });
};

// Middleware to check user role
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
