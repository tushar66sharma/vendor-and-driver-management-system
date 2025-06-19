const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users: list all users with permissions
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName email role customPermissions');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PATCH /api/users/:id/permissions: update a user's permissions
router.patch('/:id/permissions', async (req, res) => {
  try {
    const { customPermissions } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { customPermissions },
      { new: true, select: 'firstName lastName email role customPermissions' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update permissions' });
  }
});

module.exports = router;