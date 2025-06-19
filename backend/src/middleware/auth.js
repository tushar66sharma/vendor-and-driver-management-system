// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Expect header Authorization: "Bearer <token>"
  const header = req.header('Authorization') || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) 
    return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info (userId & role) to req
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
