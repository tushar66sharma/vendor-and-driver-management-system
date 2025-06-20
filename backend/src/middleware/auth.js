// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure path is correct

module.exports = async function(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token)
    return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch role and region from DB
    const user = await User.findById(decoded.userId).select('role region');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    req.user = {
      userId: decoded.userId,
      role: user.role,
      region: user.region,
      customPermissions: user.customPermissions || []
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
