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
  try {
    const user = jwt.verify(token, JWT_SECRET);
    // Store user info in request object
    req.user = user;
    req.isAuthenticated = () => true; // Add isAuthenticated method for Stripe API
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
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

// Middleware specifically for admin routes
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin permissions required'
    });
  }
  
  next();
};

// Middleware specifically for vendor routes
const authorizeVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vendor permissions required'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeAdmin,
  authorizeVendor,
  JWT_SECRET
};
