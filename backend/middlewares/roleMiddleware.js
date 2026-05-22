// middlewares/roleMiddleware.js
const { ROLES } = require('../config/constants');

/**
 * Middleware to check if the logged-in user has the required role.
 * ALWAYS put this AFTER your token verification middleware.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Failsafe: Ensure req.user exists (set by your verifyToken middleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: User not found in request' 
      });
    }

    // Check if the user's role is in the array of permitted roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have permission to perform this action' 
      });
    }

    next(); // They have clearance, proceed to the controller!
  };
};

module.exports = { authorizeRoles };